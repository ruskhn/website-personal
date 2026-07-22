"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  pulse: number
  accent: boolean
}

type SignalFieldProps = {
  className?: string
  /** 0–1: how tightly particles gather toward center (scroll-driven) */
  collapse?: number
}

const ACCENT = "#BFFF10"
const LINK = "rgba(191, 255, 16, 0.18)"
const NODE = "rgba(226, 232, 240, 0.55)"
const NODE_ACCENT = "rgba(191, 255, 16, 0.85)"

export function SignalField({ className = "", collapse = 0 }: SignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const collapseRef = useRef(collapse)
  const mouseRef = useRef({ x: -9999, y: -9999, active: false })
  const rafRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    collapseRef.current = collapse
  }, [collapse])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let width = 0
    let height = 0
    let dpr = 1

    const seed = () => {
      const count = Math.min(140, Math.floor((width * height) / 14000))
      particlesRef.current = Array.from({ length: count }, () => {
        const accent = Math.random() > 0.88
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: accent ? 1.8 + Math.random() * 1.4 : 0.8 + Math.random() * 1.2,
          pulse: Math.random() * Math.PI * 2,
          accent,
        }
      })
    }

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      mouseRef.current.active = true
    }

    const onLeave = () => {
      mouseRef.current.active = false
    }

    resize()
    window.addEventListener("resize", resize)
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerleave", onLeave)

    if (reducedMotion) {
      // Static constellation — one paint
      drawFrame(ctx, width, height, particlesRef.current, mouseRef.current, 0, true)
      return () => {
        window.removeEventListener("resize", resize)
        canvas.removeEventListener("pointermove", onMove)
        canvas.removeEventListener("pointerleave", onLeave)
      }
    }

    const tick = () => {
      drawFrame(ctx, width, height, particlesRef.current, mouseRef.current, collapseRef.current, false)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  )
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  particles: Particle[],
  mouse: { x: number; y: number; active: boolean },
  collapse: number,
  staticOnly: boolean
) {
  ctx.clearRect(0, 0, width, height)

  const cx = width * 0.5
  const cy = height * 0.42
  const linkDist = Math.min(130, width * 0.12)
  const pull = collapse * collapse

  for (const p of particles) {
    if (!staticOnly) {
      p.pulse += 0.02
      p.x += p.vx
      p.y += p.vy

      // Soft walls
      if (p.x < 0 || p.x > width) p.vx *= -1
      if (p.y < 0 || p.y > height) p.vy *= -1

      // Cursor magnetism
      if (mouse.active) {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.hypot(dx, dy) || 1
        if (dist < 180) {
          const f = ((180 - dist) / 180) * 0.045
          p.vx += dx * f * 0.02
          p.vy += dy * f * 0.02
        }
      }

      // Scroll collapse toward center
      if (pull > 0.01) {
        p.vx += (cx - p.x) * 0.0025 * pull
        p.vy += (cy - p.y) * 0.0025 * pull
      }

      // Dampen
      p.vx *= 0.992
      p.vy *= 0.992
      const speed = Math.hypot(p.vx, p.vy)
      if (speed > 1.6) {
        p.vx = (p.vx / speed) * 1.6
        p.vy = (p.vy / speed) * 1.6
      }
    }
  }

  // Links
  ctx.lineWidth = 1
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i]
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.hypot(dx, dy)
      if (dist < linkDist) {
        const alpha = (1 - dist / linkDist) * (0.35 + pull * 0.4)
        ctx.strokeStyle = a.accent || b.accent ? `rgba(191, 255, 16, ${alpha * 0.55})` : `rgba(148, 163, 184, ${alpha * 0.35})`
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }

  // Nodes
  for (const p of particles) {
    const glow = 0.65 + Math.sin(p.pulse) * 0.35
    ctx.beginPath()
    ctx.fillStyle = p.accent ? NODE_ACCENT : NODE
    ctx.globalAlpha = glow
    ctx.arc(p.x, p.y, p.r * (1 + pull * 0.4), 0, Math.PI * 2)
    ctx.fill()

    if (p.accent) {
      ctx.beginPath()
      ctx.globalAlpha = 0.15 * glow
      ctx.fillStyle = ACCENT
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  // Soft vignette wash so text stays readable
  const grad = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.1, cx, cy, Math.min(width, height) * 0.55)
  grad.addColorStop(0, "rgba(15, 23, 42, 0.15)")
  grad.addColorStop(1, "rgba(15, 23, 42, 0)")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  void LINK
}
