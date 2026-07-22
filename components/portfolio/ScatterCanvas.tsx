"use client"

import { useEffect, useRef } from "react"

type Props = {
  points: Float64Array // [x,y] * n
  count: number
  accent?: string
  dim?: boolean
}

/** Canvas scatter — virtualized draw for filtered shopper cohorts. */
export function ScatterCanvas({ points, count, accent = "#BFFF10", dim = false }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const w = parent.clientWidth
    const h = parent.clientHeight || 280
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // Axes gutter
    const pad = 28
    const plotW = w - pad * 2
    const plotH = h - pad * 2

    ctx.strokeStyle = "rgba(71, 85, 105, 0.5)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad, pad)
    ctx.lineTo(pad, h - pad)
    ctx.lineTo(w - pad, h - pad)
    ctx.stroke()

    ctx.fillStyle = "rgba(148, 163, 184, 0.7)"
    ctx.font = "10px ui-monospace, monospace"
    ctx.fillText("spend →", w - pad - 48, h - 10)
    ctx.save()
    ctx.translate(12, h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("retention", 0, 0)
    ctx.restore()

    if (count === 0) {
      ctx.fillStyle = "rgba(148, 163, 184, 0.6)"
      ctx.fillText("No points above threshold", pad + 8, h / 2)
      return
    }

    // Domain from data
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (let i = 0; i < count; i++) {
      const x = points[i * 2] ?? 0
      const y = points[i * 2 + 1] ?? 0
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    if (maxX === minX) maxX = minX + 1
    if (maxY === minY) maxY = minY + 0.01

    const alpha = dim ? 0.25 : 0.55
    ctx.fillStyle = accent.startsWith("#")
      ? hexToRgba(accent, alpha)
      : accent

    // Subsample draw if huge
    const step = count > 12000 ? Math.ceil(count / 12000) : 1
    for (let i = 0; i < count; i += step) {
      const px = points[i * 2] ?? 0
      const py = points[i * 2 + 1] ?? 0
      const x = pad + ((px - minX) / (maxX - minX)) * plotW
      const y = h - pad - ((py - minY) / (maxY - minY)) * plotH
      ctx.beginPath()
      ctx.arc(x, y, dim ? 1.1 : 1.35, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points, count, accent, dim])

  return <canvas ref={ref} className="size-full" aria-label="Shopper scatter plot" />
}

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}
