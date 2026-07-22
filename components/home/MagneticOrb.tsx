"use client"

import gsap from "gsap"
import { useEffect, useRef } from "react"

/** Lime magnetic cursor with trailing ring pulses — Trionn-style presence. */
export function MagneticOrb() {
  const orbRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const orb = orbRef.current
    const ring = ringRef.current
    if (!orb || !ring) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || window.matchMedia("(pointer: coarse)").matches) {
      orb.style.display = "none"
      ring.style.display = "none"
      return
    }

    const xTo = gsap.quickTo(orb, "x", { duration: 0.4, ease: "power3.out" })
    const yTo = gsap.quickTo(orb, "y", { duration: 0.4, ease: "power3.out" })
    const rxTo = gsap.quickTo(ring, "x", { duration: 0.65, ease: "power3.out" })
    const ryTo = gsap.quickTo(ring, "y", { duration: 0.65, ease: "power3.out" })

    gsap.set([orb, ring], { xPercent: -50, yPercent: -50, force3D: true })

    let queued = false
    let cx = 0
    let cy = 0
    const onMove = (e: PointerEvent) => {
      cx = e.clientX
      cy = e.clientY
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        xTo(cx)
        yTo(cy)
        rxTo(cx)
        ryTo(cy)
      })
    }

    const onDown = () => {
      gsap.to(orb, { scale: 0.55, duration: 0.15 })
      gsap.fromTo(
        ring,
        { scale: 0.6, opacity: 0.7 },
        { scale: 2.4, opacity: 0, duration: 0.55, ease: "power2.out" }
      )
    }

    const onUp = () => {
      gsap.to(orb, { scale: 1, duration: 0.35, ease: "elastic.out(1, 0.45)" })
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerdown", onDown, { passive: true })
    window.addEventListener("pointerup", onUp, { passive: true })

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
    }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden size-12 rounded-full border border-green-100/50 md:block"
        aria-hidden="true"
      />
      <div
        ref={orbRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden size-3 rounded-full bg-green-100 shadow-[0_0_24px_rgba(191,255,16,0.85)] mix-blend-screen md:block"
        aria-hidden="true"
      />
    </>
  )
}
