export type ShopperPoint = {
  id: number
  retailer: string
  channel: string
  spend: number
  retention: number
  x: number
  y: number
}

export type AggregateResult = {
  count: number
  sumSpend: number
  sumRetention: number
  ms: number
  path: "slow" | "wasm"
}

export type ScatterResult = {
  points: Float64Array // [x,y] * n
  count: number
  ms: number
  path: "slow" | "wasm"
}

const RETAILERS = ["Amazon", "Walmart", "Target", "Costco", "Instacart"]
const CHANNELS = ["Online", "In-store", "App", "Marketplace"]

/** Generate a synthetic shopper cohort (stand-in for 1M+ retail rows). */
export function generateShoppers(n: number, seed = 42): ShopperPoint[] {
  let s = seed
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }

  const out: ShopperPoint[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const spend = Math.pow(rand(), 1.7) * 2400
    const retention = Math.min(0.98, 0.15 + spend / 3200 + (rand() - 0.5) * 0.25)
    out[i] = {
      id: i,
      retailer: RETAILERS[(rand() * RETAILERS.length) | 0] ?? "Amazon",
      channel: CHANNELS[(rand() * CHANNELS.length) | 0] ?? "Online",
      spend,
      retention,
      x: spend,
      y: retention,
    }
  }
  return out
}

/** Pack [spend, retention] pairs for WASM aggregate kernel. */
export function packAggregateBuffer(rows: ShopperPoint[]): Float64Array {
  const buf = new Float64Array(rows.length * 2)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue
    buf[i * 2] = row.spend
    buf[i * 2 + 1] = row.retention
  }
  return buf
}

/** Pack [x, y, spend] triples for WASM scatter filter. */
export function packScatterBuffer(rows: ShopperPoint[]): Float64Array {
  const buf = new Float64Array(rows.length * 3)
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    if (!r) continue
    buf[i * 3] = r.x
    buf[i * 3 + 1] = r.y
    buf[i * 3 + 2] = r.spend
  }
  return buf
}

/**
 * BAD PATH — main-thread object churn.
 * Intentionally wasteful (property access, string labels, allocations)
 * without freezing the tab on 400K rows.
 */
export function slowAggregate(rows: ShopperPoint[], threshold: number): AggregateResult {
  const t0 = performance.now()
  let count = 0
  let sumSpend = 0
  let sumRetention = 0

  // Extra work proportional to size, but capped so demos stay interactive
  const passes = rows.length > 200_000 ? 1 : 2

  for (let pass = 0; pass < passes; pass++) {
    count = 0
    sumSpend = 0
    sumRetention = 0
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row) continue
      const label = row.retailer + ":" + row.channel
      if (row.spend >= threshold && label.length > 3) {
        count++
        sumSpend += row.spend
        sumRetention += row.retention
        // Accidental allocation pattern (dashboard footgun)
        if ((i & 31) === 0) {
          void { id: row.id, spend: row.spend, pass }
        }
      }
    }
  }

  return {
    count,
    sumSpend,
    sumRetention,
    ms: performance.now() - t0,
    path: "slow",
  }
}

export function slowScatter(rows: ShopperPoint[], threshold: number): ScatterResult {
  const t0 = performance.now()
  const kept: number[] = []
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    if (!r) continue
    if (r.spend >= threshold) {
      kept.push(r.x, r.y)
    }
  }
  // Extra filter/map churn (common React dashboard pattern)
  if (rows.length <= 200_000) {
    void rows.filter((r) => r.spend >= threshold).map((r) => [r.x, r.y])
  }

  return {
    points: Float64Array.from(kept),
    count: kept.length / 2,
    ms: performance.now() - t0,
    path: "slow",
  }
}
