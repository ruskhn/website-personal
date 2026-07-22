"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { CodeSample } from "./CodeSample"
import {
  hybridSuggest,
  naiveLlmSuggest,
  streamBatches,
  type KeywordSuggestion,
} from "./keywordEngine"

const SEEDS = ["running shoes", "wireless earbuds", "protein powder", "office chair"] as const

const CODE_NAIVE = `
// ❌ "Just add AI" — ungrounded LLM expansion
async function suggestKeywords(seed: string) {
  const prompt = \`Suggest Amazon keywords for: \${seed}\`
  const raw = await openai.chat(prompt) // creative, but commercially noisy
  return raw.map((text) => ({ text, confidence: 0.5 }))
  // Failure mode: "shoe lace tutorial", weak CTR, blown API spend
}
`

const CODE_HYBRID = `
// ✅ Hybrid: rank → embed/RAG expand → validate (Drive)
async function suggestKeywords(seed: string, history: CampaignRow[]) {
  // 1) Gradient boosting / LambdaRank on historical CTR/ROAS
  const ranked = rankKeywords(history, seed) // LightGBM-style

  // 2) Embed winners → semantic expand (RAG), not open-ended chat
  const neighbors = await vectorSearch(embed(ranked), { k: 40 })

  // 3) LLM expands grounded neighbors only
  const draft = await llmExpand(neighbors)

  // 4) Rules + brand-safety validation before UI
  return validateCommercial(draft)
}
// Impact: +19% ad performance, −37% ad spend, $100K+ revenue
`

const CODE_UI = `
// Progressive batches — UI never blocks on 1000+ suggestions
const useKeywordGeneration = (seed: string) => {
  const [rows, setRows] = useState<KeywordSuggestion[]>([])
  const [generating, setGenerating] = useState(false)

  const run = async () => {
    setGenerating(true)
    setRows([])
    const { suggestions } = hybridSuggest(seed)
    for await (const batch of streamBatches(suggestions, 10)) {
      setRows((prev) => [...prev, ...batch])
      await new Promise((r) => setTimeout(r, 0)) // breathe for paint
    }
    setGenerating(false)
  }
  return { rows, generating, run }
}
`

export function LlmKeywordLab() {
  const [seed, setSeed] = useState<string>(SEEDS[0])
  const [custom, setCustom] = useState("")
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<"naive" | "hybrid">("hybrid")
  const [rows, setRows] = useState<KeywordSuggestion[]>([])
  const [naiveMeta, setNaiveMeta] = useState<{ ms: number; relevantRate: number } | null>(null)
  const [hybridMeta, setHybridMeta] = useState<{
    ms: number
    relevantRate: number
    rankedSeeds: string[]
  } | null>(null)
  const abortRef = useRef(0)

  const activeSeed = custom.trim() || seed

  const scoreboard = useMemo(() => {
    if (!naiveMeta || !hybridMeta) return null
    const relevanceLift = ((hybridMeta.relevantRate - naiveMeta.relevantRate) * 100).toFixed(0)
    const latency = naiveMeta.ms > 0 ? (naiveMeta.ms / hybridMeta.ms).toFixed(1) : "—"
    return { relevanceLift, latency }
  }, [naiveMeta, hybridMeta])

  const run = useCallback(
    async (nextMode: "naive" | "hybrid") => {
      const token = ++abortRef.current
      setBusy(true)
      setMode(nextMode)
      setRows([])

      const naive = naiveLlmSuggest(activeSeed, 48)
      const hybrid = hybridSuggest(activeSeed, 48)
      setNaiveMeta({ ms: naive.ms, relevantRate: naive.relevantRate })
      setHybridMeta({
        ms: hybrid.ms,
        relevantRate: hybrid.relevantRate,
        rankedSeeds: hybrid.rankedSeeds,
      })

      const source = nextMode === "naive" ? naive.suggestions : hybrid.suggestions

      for await (const batch of streamBatches(source, 8, nextMode === "naive" ? 55 : 35)) {
        if (token !== abortRef.current) return
        setRows((prev) => [
          ...prev,
          ...batch.map((b) => ({ ...b, status: "ready" as const })),
        ])
      }

      if (token === abortRef.current) setBusy(false)
    },
    [activeSeed]
  )

  const approve = (idx: number) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, status: "approved" } : r)))
  }
  const reject = (idx: number) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, status: "rejected" } : r)))
  }

  const relevantShown = rows.filter((r) => r.commerciallyRelevant).length
  const noiseShown = rows.length - relevantShown

  return (
    <section id="llm-lab" className="space-y-10 border-t border-slate-800 pt-16">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
          Live lab · Stackline Drive
        </p>
        <h2 className="text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
          LLM keyword workbench — hybrid beats “just add AI”
        </h2>
        <p className="mt-4 text-slate-400">
          Ambiguous ask: <span className="text-slate-300">“Can we use AI for keywords?”</span> Pure
          LLM suggestions drifted into semantically related but commercially useless terms. The
          shipped system ranked historical winners, expanded with grounded generation, then
          validated — unlocking{" "}
          <span className="text-green-100">+19% ad performance</span> and{" "}
          <span className="text-green-100">−37% ad spend</span>.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-800 bg-[#0d0d0d] p-4">
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Campaign seed (Disclaimer: Illustrative only. Not Stackline data.)
          <select
            value={seed}
            onChange={(e) => {
              setSeed(e.target.value)
              setCustom("")
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            {SEEDS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={busy}
          onClick={() => void run("naive")}
          className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-slate-400 disabled:opacity-40"
        >
          Run naive LLM
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run("hybrid")}
          className="rounded-full border border-green-100/40 bg-green-100/10 px-4 py-2 text-sm font-medium text-green-100 hover:bg-green-100/20 disabled:opacity-40"
        >
          {busy && mode === "hybrid" ? "Generating…" : "Run hybrid AI"}
        </button>
      </div>

      {/* Scoreboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetaCard
          label="Naive LLM"
          value={naiveMeta ? `${naiveMeta.ms.toFixed(0)} ms` : "—"}
          sub={
            naiveMeta
              ? `${(naiveMeta.relevantRate * 100).toFixed(0)}% commercially relevant`
              : "ungrounded expansion"
          }
          tone="bad"
        />
        <MetaCard
          label="Hybrid rank + LLM"
          value={hybridMeta ? `${hybridMeta.ms.toFixed(0)} ms` : "—"}
          sub={
            hybridMeta
              ? `${(hybridMeta.relevantRate * 100).toFixed(0)}% commercially relevant`
              : "rank → expand → validate"
          }
          tone="good"
        />
        <MetaCard
          label="Relevance lift"
          value={scoreboard ? `+${scoreboard.relevanceLift} pts` : "—"}
          sub="hybrid vs naive on this seed"
          tone="neutral"
        />
        <MetaCard
          label="Shipped impact"
          value="+19% / −37%"
          sub="ad performance / ad spend (Drive)"
          tone="good"
        />
      </div>

      {hybridMeta?.rankedSeeds?.length ? (
        <p className="text-sm text-slate-500">
          Ranked seed grounding:{" "}
          <span className="text-slate-300">{hybridMeta.rankedSeeds.join(" · ")}</span>
        </p>
      ) : null}

      {/* Progressive list */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a0a0a]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
          <div>
            <p className="text-sm text-white">
              Streaming suggestions{" "}
              <span className="text-slate-500">
                ({mode === "hybrid" ? "hybrid" : "naive"} · {rows.length} rows)
              </span>
            </p>
            <p className="text-xs text-slate-500">
              Batched reveal · approve/reject · {relevantShown} relevant · {noiseShown} noise
            </p>
          </div>
          {busy ? (
            <span className="animate-pulse text-xs uppercase tracking-wider text-green-100">
              generating
            </span>
          ) : null}
        </div>

        <div className="max-h-[420px] overflow-auto">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col />
              <col className="w-[5.5rem]" />
              <col className="w-[4.5rem]" />
              <col className="w-[4rem]" />
              <col className="w-[8.5rem]" />
            </colgroup>
            <thead className="sticky top-0 bg-[#0a0a0a] text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Keyword</th>
                <th className="px-2 py-2 font-medium">CTR est.</th>
                <th className="px-2 py-2 font-medium">Conf.</th>
                <th className="px-2 py-2 font-medium">Flag</th>
                <th className="px-4 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-600">
                    Run a path to stream keyword suggestions
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={`${r.text}-${i}`}
                    className={`border-t border-slate-800/80 ${
                      r.status === "rejected"
                        ? "opacity-40"
                        : r.status === "approved"
                          ? "bg-green-100/5"
                          : ""
                    }`}
                  >
                    <td className="truncate px-4 py-2 font-mono text-xs text-slate-200 sm:text-sm" title={r.text}>
                      {r.text}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-xs text-slate-400">
                      {r.estimatedCTR.toFixed(2)}%
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-xs text-slate-400">
                      {(r.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="whitespace-nowrap px-2 py-2">
                      {r.commerciallyRelevant ? (
                        <span className="text-xs text-green-100">ok</span>
                      ) : (
                        <span className="text-xs text-amber-400">drift</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => approve(i)}
                          className="text-xs text-green-100 hover:underline"
                        >
                          approve
                        </button>
                        <button
                          type="button"
                          onClick={() => reject(i)}
                          className="text-xs text-slate-500 hover:text-slate-300"
                        >
                          reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CodeSample title="Naive LLM-only" language="typescript" code={CODE_NAIVE} badge="before" />
        <CodeSample title="Hybrid rank + RAG expand" language="typescript" code={CODE_HYBRID} badge="shipped" />
        <CodeSample title="Progressive UI batches" language="typescript" code={CODE_UI} badge="fe" />
      </div>
    </section>
  )
}

function MetaCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone: "bad" | "good" | "neutral"
}) {
  const valueColor =
    tone === "good" ? "text-green-100" : tone === "bad" ? "text-slate-300" : "text-white"
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d0d0d] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={`mt-2 font-mono text-2xl sm:text-3xl ${valueColor}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  )
}
