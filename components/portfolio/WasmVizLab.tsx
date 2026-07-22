"use client"

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { CODE_HYBRID, CODE_SLOW, CODE_WASM_RUST, CodeSample } from "./CodeSample"
import { ScatterCanvas } from "./ScatterCanvas"
import {
  type AggregateResult,
  generateShoppers,
  packAggregateBuffer,
  packScatterBuffer,
  type ScatterResult,
  slowAggregate,
  slowScatter,
} from "./shopperData"
import { loadAnalyticsWasm, wasmAggregate, wasmScatter } from "./wasmAnalytics"

const SIZES = [
  { label: "50K", value: 50_000 },
  { label: "150K", value: 150_000 },
  { label: "400K", value: 400_000 },
] as const

export function WasmVizLab() {
  const [n, setN] = useState(150_000)
  const [threshold, setThreshold] = useState(400)
  const [busy, setBusy] = useState(false)
  const [wasmReady, setWasmReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slowAgg, setSlowAgg] = useState<AggregateResult | null>(null)
  const [fastAgg, setFastAgg] = useState<(AggregateResult & { path: "wasm" }) | null>(null)
  const [slowPlot, setSlowPlot] = useState<ScatterResult | null>(null)
  const [fastPlot, setFastPlot] = useState<ScatterResult | null>(null)

  const rows = useMemo(() => generateShoppers(n), [n])
  const packedAgg = useMemo(() => packAggregateBuffer(rows), [rows])
  const packedScatter = useMemo(() => packScatterBuffer(rows), [rows])

  useEffect(() => {
    loadAnalyticsWasm()
      .then(() => setWasmReady(true))
      .catch((e) => setError(e instanceof Error ? e.message : "WASM failed to load"))
  }, [])

  const runRace = useCallback(async () => {
    setBusy(true)
    setError(null)
    // Yield so UI can paint "running" state
    await new Promise((r) => setTimeout(r, 30))

    try {
      const slowA = slowAggregate(rows, threshold)
      const slowS = slowScatter(rows, threshold)
      setSlowAgg(slowA)
      setSlowPlot(slowS)

      const wasm = await loadAnalyticsWasm()
      const a = wasmAggregate(wasm, packedAgg, threshold)
      const s = wasmScatter(wasm, packedScatter, threshold)
      setFastAgg({ ...a, path: "wasm" })
      setFastPlot({ ...s, path: "wasm" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Race failed")
    } finally {
      setBusy(false)
    }
  }, [rows, packedAgg, packedScatter, threshold])

  useEffect(() => {
    if (!wasmReady) return
    void runRace()
  }, [wasmReady, n]) // eslint-disable-line react-hooks/exhaustive-deps -- re-run on dataset size

  const speedup =
    slowAgg && fastAgg && fastAgg.ms > 0 ? (slowAgg.ms / fastAgg.ms).toFixed(1) : null

  return (
    <section className="space-y-10">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
          Live lab · Stackline pattern
        </p>
        <h2 className="text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
          WASM vs naive JS — shopper analytics race
        </h2>
        <p className="mt-4 text-slate-400">
          At Stackline we hit ~1.8s median filters on 1M+ purchase rows. The winning architecture was
          hybrid: backend coarse aggregation +{" "}
          <span className="text-green-100">Rust/WASM typed-buffer kernels</span> for final client
          filtering. This lab replays that tradeoff on synthetic shopper cohorts.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-800 bg-[#0d0d0d] p-4">
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Cohort size
          <select
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            {SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} shoppers
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-xs text-slate-500">
          Min spend filter (${threshold})
          <input
            type="range"
            min={50}
            max={1200}
            step={10}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="accent-green-100"
          />
        </label>

        <button
          type="button"
          disabled={busy || !wasmReady}
          onClick={() => void runRace()}
          className="rounded-full border border-green-100/40 bg-green-100/10 px-5 py-2 text-sm font-medium text-green-100 transition hover:bg-green-100/20 disabled:opacity-40"
        >
          {busy ? "Racing…" : "Run race"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {/* Timing scoreboard */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Slow path (JS objects)"
          value={slowAgg ? `${slowAgg.ms.toFixed(1)} ms` : "—"}
          sub={slowAgg ? `${slowAgg.count.toLocaleString()} matches` : "main-thread churn"}
          tone="bad"
        />
        <StatCard
          label="WASM path (typed + kernel)"
          value={fastAgg ? `${fastAgg.ms.toFixed(1)} ms` : "—"}
          sub={fastAgg ? `${fastAgg.count.toLocaleString()} matches` : wasmReady ? "ready" : "loading…"}
          tone="good"
        />
        <StatCard
          label="Speedup"
          value={speedup ? `${speedup}×` : "—"}
          sub="same filter, same cohort"
          tone="neutral"
        />
      </div>

      {/* Side-by-side viz */}
      <div className="grid gap-4 lg:grid-cols-2">
        <VizPanel
          title="Bad viz path"
          subtitle="Object graph + main-thread filter → canvas"
          ms={slowPlot?.ms}
          count={slowPlot?.count}
        >
          <ScatterCanvas
            points={slowPlot?.points ?? new Float64Array()}
            count={slowPlot?.count ?? 0}
            accent="#94a3b8"
            dim
          />
        </VizPanel>
        <VizPanel
          title="WASM viz path"
          subtitle="Float64Array → WASM filter → canvas"
          ms={fastPlot?.ms}
          count={fastPlot?.count}
          highlight
        >
          <ScatterCanvas
            points={fastPlot?.points ?? new Float64Array()}
            count={fastPlot?.count ?? 0}
            accent="#BFFF10"
          />
        </VizPanel>
      </div>

      <p className="text-sm text-slate-500">
        Note: the live WASM module here is a compact stand-in for the production Rust kernels. The
        architecture and numbers below match the Stackline shopper analytics / WASM hybrid story
        (1.8s → ~300ms, −30% AWS, 80% faster drill-downs).
      </p>

      {/* Code samples */}
      <div className="grid gap-4 lg:grid-cols-1 xl:grid-cols-3">
        <CodeSample title="Naive dashboard reducer" language="typescript" code={CODE_SLOW} badge="before" />
        <CodeSample title="Rust WASM filter kernel" language="rust" code={CODE_WASM_RUST} badge="wasm" />
        <CodeSample title="Hybrid client orchestration" language="typescript" code={CODE_HYBRID} badge="shipped" />
      </div>
    </section>
  )
}

function StatCard({
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
      <p className={`mt-2 font-mono text-3xl ${valueColor}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  )
}

function VizPanel({
  title,
  subtitle,
  ms,
  count,
  children,
  highlight,
}: {
  title: string
  subtitle: string
  ms?: number
  count?: number
  children: ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        highlight ? "border-green-100/30" : "border-slate-800"
      } bg-[#0a0a0a]`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <p className="text-sm text-white">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="text-right font-mono text-xs text-slate-400">
          <div>{ms != null ? `${ms.toFixed(1)} ms` : "—"}</div>
          <div>{count != null ? `${count.toLocaleString()} pts` : ""}</div>
        </div>
      </div>
      <div className="h-[280px] w-full">{children}</div>
    </div>
  )
}
