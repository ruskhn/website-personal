export type KeywordSuggestion = {
  text: string
  confidence: number
  estimatedCTR: number
  competition: number
  commerciallyRelevant: boolean
  source: "llm-only" | "hybrid"
  status: "pending" | "ready" | "approved" | "rejected"
}

type HistPattern = {
  seed: string
  winners: string[]
  /** proxy for LightGBM / LambdaRank score from historical ROAS */
  lift: number
}

/** Historical “campaign winners” — stand-in for ranking-model training data. */
const HISTORY: HistPattern[] = [
  {
    seed: "running shoes",
    winners: ["trail running shoes men", "neutral running sneakers", "marathon racing flats"],
    lift: 0.92,
  },
  {
    seed: "wireless earbuds",
    winners: ["anc wireless earbuds", "workout earbuds sweatproof", "buds with charging case"],
    lift: 0.88,
  },
  {
    seed: "protein powder",
    winners: ["whey isolate protein", "plant protein powder unsweetened", "casein night protein"],
    lift: 0.85,
  },
  {
    seed: "office chair",
    winners: ["ergonomic mesh office chair", "lumbar support desk chair", "adjustable armrest chair"],
    lift: 0.8,
  },
]

const SEMANTIC_NEIGHBORS: Record<string, string[]> = {
  running: ["trail", "marathon", "jogging", "athletic", "road"],
  shoes: ["sneakers", "footwear", "trainers", "flats"],
  wireless: ["bluetooth", "true wireless", "anc"],
  earbuds: ["buds", "earphones", "headphones"],
  protein: ["whey", "isolate", "plant", "casein"],
  powder: ["supplement", "shake", "mix"],
  office: ["desk", "ergonomic", "home office"],
  chair: ["seat", "mesh chair", "task chair"],
}

/** Commercially irrelevant “pure LLM” drift — semantically related, weak ROAS. */
const LLM_DRIFT = [
  "shoe lace tying tutorial",
  "history of marathon running",
  "earbuds for meditation podcasts",
  "protein folding biology lecture",
  "chair yoga for beginners",
  "amazon rainforest documentary",
  "wallet share theory essay",
]

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

function hashStr(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function expandSemantic(seed: string, rand: () => number, count: number): string[] {
  const tokens = tokenize(seed)
  const out: string[] = []
  const pool: string[] = []

  for (const t of tokens) {
    const neighbors = SEMANTIC_NEIGHBORS[t] || [t]
    pool.push(...neighbors)
  }

  for (let i = 0; i < count; i++) {
    const a = pool[(rand() * pool.length) | 0] || tokens[0] || "product"
    const b = pool[(rand() * pool.length) | 0] || tokens[1] || "buy"
    const longTail = rand() > 0.45 ? ` ${["men", "women", "sale", "2024", "best"][(rand() * 5) | 0]}` : ""
    out.push(`${a} ${b}${longTail}`.replace(/\s+/g, " ").trim())
  }
  return out
}

/**
 * ❌ Naive “just call the LLM” path —
 * creative semantic expansion with no commercial ranking → drift + noise.
 */
export function naiveLlmSuggest(seed: string, total = 48): {
  suggestions: KeywordSuggestion[]
  ms: number
  relevantRate: number
} {
  const t0 = performance.now()
  const rand = mulberry(hashStr(seed + ":naive"))
  const creative = expandSemantic(seed, rand, total)

  // Inject drift (pure-LLM failure mode from the Drive story)
  const driftCount = Math.max(6, Math.floor(total * 0.28))
  for (let i = 0; i < driftCount; i++) {
    creative[(rand() * creative.length) | 0] = LLM_DRIFT[(rand() * LLM_DRIFT.length) | 0]
  }

  const suggestions = creative.map((text, i) => {
    const commerciallyRelevant = !LLM_DRIFT.includes(text) && !/tutorial|history|biology|yoga|documentary|essay/i.test(text)
    const confidence = 0.35 + rand() * 0.55
    return {
      text,
      confidence,
      estimatedCTR: commerciallyRelevant ? 0.8 + rand() * 1.8 : 0.05 + rand() * 0.25,
      competition: 0.3 + rand() * 0.7,
      commerciallyRelevant,
      source: "llm-only" as const,
      status: i < 8 ? ("ready" as const) : ("pending" as const),
    }
  })

  const relevant = suggestions.filter((s) => s.commerciallyRelevant).length
  return {
    suggestions,
    ms: performance.now() - t0 + 180 + rand() * 120, // simulate slower “uncached LLM” feel
    relevantRate: relevant / suggestions.length,
  }
}

/**
 * ✅ Hybrid path — rank historical winners → expand → validate
 * (LightGBM-style ranking + LLM expansion + rules), matching Drive.
 */
export function hybridSuggest(seed: string, total = 48): {
  suggestions: KeywordSuggestion[]
  ms: number
  relevantRate: number
  rankedSeeds: string[]
} {
  const t0 = performance.now()
  const rand = mulberry(hashStr(seed + ":hybrid"))
  const tokens = new Set(tokenize(seed))

  // 1) Ranking model stand-in: score historical patterns by token overlap + lift
  const ranked = [...HISTORY]
    .map((h) => {
      const overlap = tokenize(h.seed).filter((t) => tokens.has(t)).length
      const score = overlap * 2 + h.lift + (h.seed === seed.toLowerCase() ? 1 : 0)
      return { ...h, score }
    })
    .sort((a, b) => b.score - a.score)

  const top = ranked[0]
  const rankedSeeds = top && top.score > 0 ? top.winners : expandSemantic(seed, rand, 3)

  // 2) LLM expansion grounded on ranked seeds (not open-ended drift)
  const expanded: string[] = [...rankedSeeds]
  for (const base of rankedSeeds) {
    expanded.push(...expandSemantic(base, rand, 4))
  }
  while (expanded.length < total) {
    expanded.push(...expandSemantic(seed, rand, 4))
  }

  // 3) Validation layer — category rules / brand-safety stand-in
  const filtered = expanded
    .filter((t) => !LLM_DRIFT.some((d) => t.includes(d.slice(0, 12))))
    .filter((t) => !/tutorial|history|biology|yoga|documentary|essay/i.test(t))
    .slice(0, total)

  const suggestions = filtered.map((text, i) => {
    const longTailBonus = text.split(" ").length >= 3 ? 0.15 : 0
    const confidence = Math.min(0.98, 0.62 + longTailBonus + rand() * 0.25)
    return {
      text,
      confidence,
      estimatedCTR: 1.2 + rand() * 2.4 + longTailBonus,
      competition: 0.2 + rand() * 0.55,
      commerciallyRelevant: true,
      source: "hybrid" as const,
      status: i < 8 ? ("ready" as const) : ("pending" as const),
    }
  })

  return {
    suggestions,
    ms: performance.now() - t0 + 45 + rand() * 40, // cached patterns + cheaper expansion
    relevantRate: 1,
    rankedSeeds,
  }
}

/** Progressive batch reveal — keeps UI responsive while “generating”. */
export async function* streamBatches<T>(
  items: T[],
  batchSize: number,
  delayMs = 40
): AsyncGenerator<T[]> {
  for (let i = 0; i < items.length; i += batchSize) {
    yield items.slice(i, i + batchSize)
    await new Promise((r) => setTimeout(r, delayMs))
  }
}
