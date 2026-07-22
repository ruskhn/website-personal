export type WasmAnalytics = {
  memory: WebAssembly.Memory
  aggregateAbove: (ptr: number, len: number, threshold: number, outPtr: number) => number
  filterScatter: (inPtr: number, len: number, threshold: number, outPtr: number) => number
}

let cached: Promise<WasmAnalytics> | null = null

export function loadAnalyticsWasm(): Promise<WasmAnalytics> {
  if (cached) return cached

  cached = (async () => {
    const res = await fetch("/wasm/analytics.wasm")
    const bytes = await res.arrayBuffer()
    const { instance } = await WebAssembly.instantiate(bytes, {})
    const exports = instance.exports as {
      memory: WebAssembly.Memory
      aggregate_above: (ptr: number, len: number, threshold: number, out: number) => number
      filter_scatter: (inPtr: number, len: number, threshold: number, out: number) => number
    }

    return {
      memory: exports.memory,
      aggregateAbove: exports.aggregate_above,
      filterScatter: exports.filter_scatter,
    }
  })()

  return cached
}

function ensureBytes(memory: WebAssembly.Memory, bytes: number) {
  const pagesNeeded = Math.ceil(bytes / 65536)
  const current = memory.buffer.byteLength / 65536
  if (pagesNeeded > current) memory.grow(pagesNeeded - current)
}

/** FAST PATH — typed buffer + WASM kernel (Stackline hybrid pattern). */
export function wasmAggregate(
  wasm: WasmAnalytics,
  packed: Float64Array,
  threshold: number
): { count: number; sumSpend: number; sumRetention: number; ms: number } {
  const t0 = performance.now()
  const dataBytes = packed.byteLength
  const outOffset = dataBytes
  ensureBytes(wasm.memory, outOffset + 16)

  const mem = new Float64Array(wasm.memory.buffer)
  mem.set(packed, 0)

  const count = wasm.aggregateAbove(0, packed.length / 2, threshold, outOffset)
  const view = new Float64Array(wasm.memory.buffer, outOffset, 2)

  return {
    count,
    sumSpend: view[0],
    sumRetention: view[1],
    ms: performance.now() - t0,
  }
}

export function wasmScatter(
  wasm: WasmAnalytics,
  packed: Float64Array,
  threshold: number
): { points: Float64Array; count: number; ms: number } {
  const t0 = performance.now()
  const n = packed.length / 3
  const inBytes = packed.byteLength
  const outOffset = inBytes
  // worst case: all points kept → n * 16 bytes
  ensureBytes(wasm.memory, outOffset + n * 16)

  const memF64 = new Float64Array(wasm.memory.buffer)
  memF64.set(packed, 0)

  const count = wasm.filterScatter(0, n, threshold, outOffset)
  const points = new Float64Array(wasm.memory.buffer, outOffset, count * 2).slice()

  return {
    points,
    count,
    ms: performance.now() - t0,
  }
}
