"use client"

type Props = {
  title: string
  language?: string
  code: string
  badge?: string
}

export function CodeSample({ title, language = "typescript", code, badge }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{language}</span>
          <span className="text-sm text-slate-300">{title}</span>
        </div>
        {badge ? (
          <span className="rounded-full border border-green-100/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-green-100">
            {badge}
          </span>
        ) : null}
      </div>
      <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed text-slate-300 sm:text-xs">
        <code>{code.trim()}</code>
      </pre>
    </div>
  )
}

export const CODE_SLOW = `
// ❌ Slow path — object churn on the main thread
function aggregateShoppers(rows: Shopper[], minSpend: number) {
  // Multiple full passes + allocations (classic dashboard footgun)
  return rows
    .filter((r) => r.spend >= minSpend)
    .map((r) => ({ ...r, label: r.retailer + ":" + r.channel }))
    .reduce(
      (acc, r) => {
        acc.count++
        acc.sumSpend += r.spend
        acc.sumRetention += r.retention
        return acc
      },
      { count: 0, sumSpend: 0, sumRetention: 0 }
    )
}
// Stackline baseline on ~1M rows: ~1.8s median
`

export const CODE_WASM_RUST = `
// ✅ Rust → WASM kernel (Stackline filter step)
#[no_mangle]
pub extern "C" fn filter_scatter(
    input: *const f64,  // [x, y, spend] * n
    len: usize,
    threshold: f64,
    output: *mut f64,   // compacted [x, y] *
) -> u32 {
    let mut kept = 0usize;
    unsafe {
        for i in 0..len {
            let base = i * 3;
            let spend = *input.add(base + 2);
            if spend >= threshold {
                *output.add(kept * 2) = *input.add(base);
                *output.add(kept * 2 + 1) = *input.add(base + 1);
                kept += 1;
            }
        }
    }
    kept as u32
}
`

export const CODE_HYBRID = `
// ✅ Hybrid path — backend aggregates, WASM finishes client-side
async function loadCohort(companyId: string, range: DateRange) {
  // 1) Server does coarse aggregation (cuts payload ~10–50×)
  const page = await api.getAggregatedCohort(companyId, range)

  // 2) Pack into typed buffers (no object graph on hot path)
  const packed = packScatterBuffer(page.rows) // Float64Array

  // 3) WASM filters / transforms off the expensive JS object path
  const wasm = await loadAnalyticsWasm()
  const { points, count, ms } = wasmScatter(wasm, packed, threshold)

  // 4) Canvas draws only the filtered cohort (virtualized)
  return { points, count, computeMs: ms }
}
// Result: 1.8s → ~300ms compute, −30% AWS cost from smaller payloads
`
