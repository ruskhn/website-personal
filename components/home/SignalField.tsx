"use client"

import { forwardRef, type MutableRefObject, useEffect, useImperativeHandle, useRef } from "react"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  pulse: number
  accent: boolean
  trail: number
}

export type SignalFieldHandle = {
  blast: (clientX: number, clientY: number) => void
}

type SignalFieldProps = {
  className?: string
  collapseRef?: MutableRefObject<number>
}

const ACCENT = "#BFFF10"
const NODE = "rgba(226, 232, 240, 0.55)"
const NODE_ACCENT = "rgba(191, 255, 16, 0.9)"

function particleBudget(width: number, height: number) {
  const area = width * height
  const isCoarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  const isSmall = width < 768
  if (isCoarse || isSmall) return Math.min(70, Math.floor(area / 22000))
  return Math.min(110, Math.floor(area / 16000))
}

function devicePixelCap() {
  const raw = window.devicePixelRatio || 1
  const isCoarse = window.matchMedia("(pointer: coarse)").matches
  if (isCoarse || window.innerWidth < 768) return Math.min(raw, 1.25)
  return Math.min(raw, 1.5)
}

export const SignalField = forwardRef<SignalFieldHandle, SignalFieldProps>(function SignalField(
  { className = "", collapseRef: externalCollapse },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const internalCollapse = useRef(0)
  const collapseRef = externalCollapse ?? internalCollapse
  const mouseRef = useRef({ x: -9999, y: -9999, active: false })
  const shockRef = useRef({ x: 0, y: 0, t: 0, power: 0 })
  const rafRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const runningRef = useRef(false)

  useImperativeHandle(ref, () => ({
    blast: (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      shockRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        t: 1,
        power: 1,
      }

      for (const p of particlesRef.current) {
        const dx = p.x - shockRef.current.x
        const dy = p.y - shockRef.current.y
        const distSq = dx * dx + dy * dy || 1
        const dist = Math.sqrt(distSq)
        const force = Math.min(18, 2200 / dist)
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
        p.trail = 1
        if (dist < 160) p.accent = true
      }
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true })
    if (!ctx) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let width = 0
    let height = 0
    let dpr = 1
    let linkDist = 120
    let linkDistSq = linkDist * linkDist
    let resizeTimer = 0
    let vignette: CanvasGradient | null = null
    let visible = true
    let pageVisible = document.visibilityState === "visible"

    // Spatial hash for neighbor links — avoids full O(n²)
    let cellSize = 120
    const grid = new Map<number, number[]>()

    const cellKey = (cx: number, cy: number) => cx * 73856093 + cy * 19349663

    const rebuildGrid = (particles: Particle[]) => {
      grid.clear()
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (!p) continue
        const cx = (p.x / cellSize) | 0
        const cy = (p.y / cellSize) | 0
        const key = cellKey(cx, cy)
        const bucket = grid.get(key)
        if (bucket) bucket.push(i)
        else grid.set(key, [i])
      }
    }

    const seed = () => {
      const count = particleBudget(width, height)
      particlesRef.current = Array.from({ length: count }, () => {
        const accent = Math.random() > 0.88
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: accent ? 1.6 + Math.random() * 1.2 : 0.7 + Math.random() * 1.1,
          pulse: Math.random() * Math.PI * 2,
          accent,
          trail: 0,
        }
      })
    }

    const buildVignette = () => {
      const cx = width * 0.5
      const cy = height * 0.42
      vignette = ctx.createRadialGradient(
        cx,
        cy,
        Math.min(width, height) * 0.08,
        cx,
        cy,
        Math.min(width, height) * 0.55
      )
      vignette.addColorStop(0, "rgba(15, 23, 42, 0.12)")
      vignette.addColorStop(1, "rgba(15, 23, 42, 0)")
    }

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      dpr = devicePixelCap()
      width = parent.clientWidth
      height = parent.clientHeight
      linkDist = Math.min(120, width * 0.11)
      linkDistSq = linkDist * linkDist
      cellSize = Math.max(80, linkDist)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
      buildVignette()
    }

    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 120)
    }

    let moveQueued = false
    let lastMoveX = 0
    let lastMoveY = 0
    const onMove = (e: PointerEvent) => {
      lastMoveX = e.clientX
      lastMoveY = e.clientY
      if (moveQueued) return
      moveQueued = true
      requestAnimationFrame(() => {
        moveQueued = false
        const rect = canvas.getBoundingClientRect()
        mouseRef.current.x = lastMoveX - rect.left
        mouseRef.current.y = lastMoveY - rect.top
        mouseRef.current.active = true
      })
    }

    const onLeave = () => {
      mouseRef.current.active = false
    }

    resize()
    window.addEventListener("resize", onResize, { passive: true })
    window.addEventListener("pointermove", onMove, { passive: true })

    const stop = () => {
      runningRef.current = false
      cancelAnimationFrame(rafRef.current)
    }

    const tick = () => {
      if (!runningRef.current) return
      drawFrame(
        ctx,
        width,
        height,
        particlesRef.current,
        mouseRef.current,
        shockRef.current,
        collapseRef.current,
        linkDistSq,
        linkDist,
        grid,
        cellSize,
        cellKey,
        rebuildGrid,
        vignette
      )
      if (shockRef.current.t > 0) {
        shockRef.current.t = Math.max(0, shockRef.current.t - 0.018)
        shockRef.current.power = shockRef.current.t
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    const start = () => {
      if (runningRef.current || reducedMotion || !visible || !pageVisible) return
      runningRef.current = true
      rafRef.current = requestAnimationFrame(tick)
    }

    const syncRunState = () => {
      if (visible && pageVisible && !reducedMotion) start()
      else stop()
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        visible = entry.isIntersecting && entry.intersectionRatio > 0.02
        syncRunState()
      },
      { threshold: [0, 0.02, 0.1] }
    )
    io.observe(canvas)

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible"
      syncRunState()
    }
    document.addEventListener("visibilitychange", onVisibility)

    if (reducedMotion) {
      drawFrame(
        ctx,
        width,
        height,
        particlesRef.current,
        mouseRef.current,
        shockRef.current,
        0,
        linkDistSq,
        linkDist,
        grid,
        cellSize,
        cellKey,
        rebuildGrid,
        vignette,
        true
      )
    } else {
      start()
    }

    return () => {
      stop()
      window.clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("visibilitychange", onVisibility)
      io.disconnect()
      void onLeave
    }
  }, [collapseRef])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
      aria-hidden="true"
    />
  )
})

function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  particles: Particle[],
  mouse: { x: number; y: number; active: boolean },
  shock: { x: number; y: number; t: number; power: number },
  collapse: number,
  linkDistSq: number,
  linkDist: number,
  grid: Map<number, number[]>,
  cellSize: number,
  cellKey: (cx: number, cy: number) => number,
  rebuildGrid: (particles: Particle[]) => void,
  vignette: CanvasGradient | null,
  staticOnly = false
) {
  // Hard clear is cheaper than perpetual trail wash on large canvases
  ctx.clearRect(0, 0, width, height)

  const cx = width * 0.5
  const cy = height * 0.42
  const pull = collapse * collapse
  const mouseActive = mouse.active
  const mx = mouse.x
  const my = mouse.y
  const mouseRangeSq = 220 * 220

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    if (!p || staticOnly) continue
    p.pulse += 0.025
    p.x += p.vx
    p.y += p.vy
    if (p.trail > 0) p.trail = Math.max(0, p.trail - 0.02)

    if (p.x < 0 || p.x > width) p.vx *= -1
    if (p.y < 0 || p.y > height) p.vy *= -1
    p.x = p.x < 0 ? 0 : p.x > width ? width : p.x
    p.y = p.y < 0 ? 0 : p.y > height ? height : p.y

    if (mouseActive) {
      const dx = mx - p.x
      const dy = my - p.y
      const distSq = dx * dx + dy * dy
      if (distSq < mouseRangeSq && distSq > 0.01) {
        const dist = Math.sqrt(distSq)
        const f = ((220 - dist) / 220) * 0.08
        p.vx += dx * f * 0.015 - dy * f * 0.012
        p.vy += dy * f * 0.015 + dx * f * 0.012
      }
    }

    if (pull > 0.01) {
      p.vx += (cx - p.x) * 0.003 * pull
      p.vy += (cy - p.y) * 0.003 * pull
    }

    p.vx *= 0.985
    p.vy *= 0.985
    const speedSq = p.vx * p.vx + p.vy * p.vy
    const maxSq = 4.2 * 4.2
    if (speedSq > maxSq) {
      const speed = Math.sqrt(speedSq)
      p.vx = (p.vx / speed) * 4.2
      p.vy = (p.vy / speed) * 4.2
    }
  }

  if (shock.t > 0.01) {
    const radius = (1 - shock.t) * Math.min(width, height) * 0.55
    ctx.beginPath()
    ctx.strokeStyle = `rgba(191, 255, 16, ${shock.t * 0.65})`
    ctx.lineWidth = 2 + shock.t * 4
    ctx.arc(shock.x, shock.y, radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  rebuildGrid(particles)

  // Single neighbor pass → two batched strokes
  const muted = new Path2D()
  const accent = new Path2D()
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i]
    if (!a) continue
    const acx = (a.x / cellSize) | 0
    const acy = (a.y / cellSize) | 0
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const bucket = grid.get(cellKey(acx + ox, acy + oy))
        if (!bucket) continue
        for (let b = 0; b < bucket.length; b++) {
          const j = bucket[b]
          if (j === undefined || j <= i) continue
          const other = particles[j]
          if (!other) continue
          const dx = a.x - other.x
          const dy = a.y - other.y
          const distSq = dx * dx + dy * dy
          if (distSq >= linkDistSq) continue
          const path = a.accent || other.accent || a.trail > 0.15 || other.trail > 0.15 ? accent : muted
          path.moveTo(a.x, a.y)
          path.lineTo(other.x, other.y)
        }
      }
    }
  }
  ctx.lineWidth = 1
  ctx.strokeStyle = "rgba(148, 163, 184, 0.22)"
  ctx.stroke(muted)
  ctx.strokeStyle = "rgba(191, 255, 16, 0.28)"
  ctx.stroke(accent)

  // Nodes — skip expensive glow halos except accents / trails
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    if (!p) continue
    const glow = 0.7 + Math.sin(p.pulse) * 0.3
    const size = p.r * (1 + pull * 0.4 + p.trail * 1.5)
    ctx.beginPath()
    ctx.globalAlpha = glow
    ctx.fillStyle = p.accent || p.trail > 0.2 ? NODE_ACCENT : NODE
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
    ctx.fill()

    if (p.accent) {
      ctx.beginPath()
      ctx.globalAlpha = 0.14 * glow
      ctx.fillStyle = ACCENT
      ctx.arc(p.x, p.y, size * 3.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  if (vignette) {
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, width, height)
  }
}
