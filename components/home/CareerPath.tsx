"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const CHAPTERS = [
  {
    company: "Twisted-Rope",
    role: "Software Engineer",
    dates: "Aug 2020 – May 2022",
    place: "Remote, NY",
    highlights: [
      "Interactive D3 reporting that cut audit prep by ~10 hrs/week",
      "AWS S3/CloudFront migration saving $10K monthly",
      "Next.js internal tooling for Accenture (+25% efficiency)",
    ],
  },
  {
    company: "Stackline",
    role: "Software Engineer II",
    dates: "May 2022 – Feb 2025",
    place: "Seattle, WA",
    highlights: [
      "Led a team of 3 on an internal OS for brands (React, GraphQL, Node)",
      "WASM + Highcharts dashboards: 80% faster over 1M+ records",
      "LLM tooling & AWS optimization: −37% ops cost, 80% of savings goals in 2 weeks",
    ],
  },
  {
    company: "Pepper",
    role: "Senior Software Engineer I",
    dates: "Feb 2025 – Present",
    place: "Seattle, WA",
    highlights: [
      "Merchandising & promo frameworks: +15–25% engagement, +8–12% conversion",
      "Mobile storefront perf: −30–45% load time on low-end devices",
      "Grafana + Rootly observability: −30–50% alert noise, −25–35% MTTR",
    ],
  },
]

export function CareerPath() {
  const sectionRef = useRef<HTMLElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const progressRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const path = pathRef.current
    const progress = progressRef.current
    if (!section || !path || !progress) return

    const length = path.getTotalLength()
    progress.style.strokeDasharray = `${length}`
    progress.style.strokeDashoffset = `${length}`

    const ctx = gsap.context(() => {
      gsap.to(progress, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.6,
        },
      })

      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((el, i) => {
        gsap.from(el, {
          x: i % 2 === 0 ? -48 : 48,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        })

        gsap.from(el.querySelector("[data-dot]"), {
          scale: 0,
          duration: 0.5,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="relative mx-auto max-w-5xl overflow-hidden px-6 pb-32 pt-8"
    >
      <div className="mb-16 max-w-2xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
          Career path
        </p>
        <h2 className="text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
          A scrubbed line through the work.
        </h2>
        <p className="mt-4 text-slate-400">
          From D3 reporting systems to senior platform work — scroll to draw the path.
        </p>
      </div>

      <div className="relative">
        {/* Desktop spine */}
        <svg
          className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-24 -translate-x-1/2 md:block"
          viewBox="0 0 96 1200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            d="M48 0 V1200"
            fill="none"
            stroke="rgba(71, 85, 105, 0.5)"
            strokeWidth="2"
          />
          <path
            ref={progressRef}
            d="M48 0 V1200"
            fill="none"
            stroke="#BFFF10"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <ol className="space-y-16 md:space-y-24">
          {CHAPTERS.map((chapter, i) => {
            const left = i % 2 === 0
            return (
              <li
                key={chapter.company}
                data-chapter
                className={`relative grid items-center gap-6 md:grid-cols-2 ${
                  left ? "" : "md:[&>*:first-child]:col-start-2"
                }`}
              >
                <div
                  className={`relative rounded-def border border-slate-800/90 bg-[#0d0d0d]/90 p-6 md:p-8 ${
                    left ? "md:mr-10 md:text-right" : "md:ml-10"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-green-100/80">
                    {chapter.dates}
                  </p>
                  <h3 className="mt-2 text-2xl text-white md:text-3xl">{chapter.company}</h3>
                  <p className="mt-1 text-slate-300">
                    {chapter.role} · {chapter.place}
                  </p>
                  <ul
                    className={`mt-5 space-y-2 text-sm leading-relaxed text-slate-400 ${
                      left ? "md:ml-auto" : ""
                    }`}
                  >
                    {chapter.highlights.map((h) => (
                      <li key={h} className="flex gap-2 md:justify-start">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-100/70" />
                        <span className={left ? "md:text-right" : ""}>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  data-dot
                  className="absolute left-1/2 top-8 z-10 hidden h-4 w-4 -translate-x-1/2 rounded-full border-2 border-green-100 bg-slate-900 shadow-[0_0_20px_rgba(191,255,16,0.45)] md:block"
                  aria-hidden="true"
                />
              </li>
            )
          })}
        </ol>

        <div className="mt-20 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">You are here</p>
          <p className="mt-2 text-2xl text-green-100">Pepper · Senior Software Engineer</p>
        </div>
      </div>
    </section>
  )
}
