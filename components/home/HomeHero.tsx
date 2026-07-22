"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { RESUME_PDF_FILENAME, RESUME_PDF_PATH } from "components/global-const"
import { SignalField } from "./SignalField"

gsap.registerPlugin(ScrollTrigger)

export function HomeHero() {
  const rootRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const roleRef = useRef<HTMLParagraphElement>(null)
  const lineRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [collapse, setCollapse] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.fromTo(
        titleRef.current,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, clearProps: "filter" }
      )
        .fromTo(
          roleRef.current,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.55"
        )
        .fromTo(
          lineRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.45"
        )
        .fromTo(
          ctaRef.current,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.35"
        )

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => setCollapse(self.progress),
      })

      gsap.to(root.querySelector("[data-hero-content]"), {
        y: -60,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(51,65,85,0.45)_0%,rgba(15,23,42,0.2)_45%,rgba(15,23,42,0.95)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.2)_0%,rgba(15,23,42,0)_40%,rgba(15,23,42,0.85)_100%)]" />

      <SignalField collapse={collapse} />

      <div
        data-hero-content
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-slate-400">
          Seattle · Full Stack
        </p>
        <h1
          ref={titleRef}
          className="text-5xl font-medium tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Hi, I&apos;m Rus
        </h1>
        <p
          ref={roleRef}
          className="mt-4 text-2xl tracking-tight text-green-100 sm:text-3xl md:text-4xl"
        >
          Full Stack Engineer
        </p>
        <p
          ref={lineRef}
          className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
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
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-slate-600/80 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-green-100/80" />
        </div>
      </div>
    </section>
  )
}
