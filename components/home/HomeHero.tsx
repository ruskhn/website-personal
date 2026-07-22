"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"
import { RESUME_PDF_FILENAME, RESUME_PDF_PATH } from "components/global-const"
import { SignalField, type SignalFieldHandle } from "./SignalField"
import { scrambleTo, splitChars } from "./textFx"

gsap.registerPlugin(ScrollTrigger)

const ROLE = "Full Stack Engineer"
const EYEBROW = "Seattle · Full Stack"

export function HomeHero() {
  const rootRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const roleRef = useRef<HTMLParagraphElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const lineRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const glitchRef = useRef<HTMLDivElement>(null)
  const turbRef = useRef<SVGFETurbulenceElement>(null)
  const dispRef = useRef<SVGFEDisplacementMapElement>(null)
  const fieldRef = useRef<SignalFieldHandle>(null)
  const collapseRef = useRef(0)

  useEffect(() => {
    const root = rootRef.current
    const title = titleRef.current
    const role = roleRef.current
    if (!root || !title || !role) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const chars = splitChars(title)

    if (reduced) {
      title.removeAttribute("style")
      role.textContent = ROLE
      return
    }

    // Seed scrambled role immediately
    role.textContent = "████████████████████"

    const ctx = gsap.context(() => {
      const titleWrap = title.parentElement
      const turb = { freq: 0.04, scale: 36 }
      const applyLiquid = () => {
        turbRef.current?.setAttribute("baseFrequency", String(turb.freq))
        dispRef.current?.setAttribute("scale", String(turb.scale))
      }
      applyLiquid()

      const rgbGhosts = root.querySelectorAll<HTMLElement>("[data-rgb-ghost]")
      gsap.set(rgbGhosts, { opacity: 0 })

      // Char storm entrance — no per-letter CSS filter (expensive)
      gsap.set(chars, {
        opacity: 0,
        y: () => gsap.utils.random(-120, 120),
        x: () => gsap.utils.random(-160, 160),
        rotate: () => gsap.utils.random(-40, 40),
        scale: () => gsap.utils.random(0.35, 1.8),
      })

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } })

      // Liquid melt only during entrance, then remove SVG filter entirely
      tl.to(
        turb,
        {
          freq: 0.006,
          scale: 0,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: applyLiquid,
          onComplete: () => {
            if (titleWrap) titleWrap.style.filter = "none"
          },
        },
        0
      )

      tl.to(
        chars,
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 1.05,
          stagger: {
            each: 0.03,
            from: "random",
          },
          ease: "back.out(1.5)",
          onComplete: () => {
            chars.forEach((c) => {
              c.style.willChange = "auto"
            })
          },
        },
        0.12
      )

      // Chromatic glitch flash
      tl.fromTo(
        glitchRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.08,
          yoyo: true,
          repeat: 5,
          ease: "steps(1)",
        },
        0.5
      )
      tl.fromTo(
        rgbGhosts,
        { opacity: 0 },
        { opacity: 0.55, duration: 0.08, yoyo: true, repeat: 5, ease: "steps(1)" },
        0.5
      )

      tl.add(() => {
        scrambleTo(role, ROLE, {
          duration: 1.35,
          chars: "01<>$#@*&ABCDEFXYZ/",
          revealDelay: 0.15,
        })
      }, 0.8)

      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: -12, letterSpacing: "0.55em" },
        { opacity: 1, y: 0, letterSpacing: "0.35em", duration: 0.7 },
        0.35
      )

      tl.fromTo(
        lineRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.75 },
        1.2
      )

      tl.fromTo(
        ctaRef.current ? Array.from(ctaRef.current.children) : [],
        { opacity: 0, y: 20, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.55, ease: "power3.out" },
        1.4
      )

      // Scroll collapse — transforms only (no live blur filter)
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          collapseRef.current = self.progress
        },
      })

      gsap.to(root.querySelector("[data-hero-content]"), {
        y: -70,
        opacity: 0.25,
        scale: 0.94,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
    }, root)

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a, button")) return
      fieldRef.current?.blast(e.clientX, e.clientY)

      gsap.fromTo(
        chars,
        { x: () => gsap.utils.random(-8, 8), color: "#BFFF10" },
        {
          x: 0,
          color: "#ffffff",
          duration: 0.35,
          stagger: 0.01,
          ease: "power3.out",
        }
      )
      gsap.fromTo(glitchRef.current, { opacity: 0.9 }, { opacity: 0, duration: 0.25 })
      const rgbGhosts = root.querySelectorAll<HTMLElement>("[data-rgb-ghost]")
      gsap.fromTo(rgbGhosts, { opacity: 0.7 }, { opacity: 0, duration: 0.3 })
    }
    root.addEventListener("pointerdown", onPointerDown)

    return () => {
      root.removeEventListener("pointerdown", onPointerDown)
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-svh w-full cursor-crosshair items-center justify-center overflow-hidden"
    >
      {/* SVG liquid distortion (Codrops-style displacement) */}
      <svg className="pointer-events-none absolute size-0" aria-hidden="true">
        <defs>
          <filter id="hero-liquid" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="2"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale="36"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(51,65,85,0.45)_0%,rgba(15,23,42,0.2)_45%,rgba(15,23,42,0.95)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.2)_0%,rgba(15,23,42,0)_40%,rgba(15,23,42,0.85)_100%)]" />

      <SignalField ref={fieldRef} collapseRef={collapseRef} />

      {/* Chromatic aberration overlay */}
      <div
        ref={glitchRef}
        className="pointer-events-none absolute inset-0 z-[5] opacity-0 mix-blend-screen"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,0,80,0.08), transparent 40%, rgba(0,255,200,0.08))",
        }}
      />

      <div
        data-hero-content
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        <p
          ref={eyebrowRef}
          className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-slate-400 opacity-0"
        >
          {EYEBROW}
        </p>

        <div className="relative" style={{ filter: "url(#hero-liquid)" }}>
          <h1
            ref={titleRef}
            className="text-5xl font-medium tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Hi, I&apos;m Rus
          </h1>
          {/* Ghost layers for RGB split flash */}
          <h1
            data-rgb-ghost
            className="pointer-events-none absolute inset-0 -translate-x-1 text-5xl font-medium tracking-tight text-red-500/40 mix-blend-screen opacity-0 sm:text-6xl md:text-7xl lg:text-8xl"
            aria-hidden="true"
          >
            Hi, I&apos;m Rus
          </h1>
          <h1
            data-rgb-ghost
            className="pointer-events-none absolute inset-0 translate-x-1 text-5xl font-medium tracking-tight text-cyan-400/40 mix-blend-screen opacity-0 sm:text-6xl md:text-7xl lg:text-8xl"
            aria-hidden="true"
          >
            Hi, I&apos;m Rus
          </h1>
        </div>

        <p
          ref={roleRef}
          className="mt-4 min-h-[1.2em] font-mono text-2xl tracking-tight text-green-100 sm:text-3xl md:text-4xl"
        >
          {ROLE}
        </p>

        <p
          ref={lineRef}
          className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 opacity-0 sm:text-lg"
        >
          Building UI systems, data visualizations, and scalable platforms that turn complexity into
          measurable impact.
        </p>

        <div ref={ctaRef} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#impact"
            className="rounded-full border border-green-100/40 bg-green-100/10 px-6 py-3 text-sm font-medium text-green-100 transition hover:bg-green-100/20"
          >
            See the impact
          </a>
          <a
            href={RESUME_PDF_PATH}
            download={RESUME_PDF_FILENAME}
            className="rounded-full border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-400 hover:text-white"
          >
            Download resume
          </a>
        </div>

        <p className="mt-8 hidden text-[10px] uppercase tracking-[0.35em] text-slate-600 md:block">
          Click to detonate the field
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-slate-600/80 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-green-100/80" />
        </div>
      </div>
    </section>
  )
}
