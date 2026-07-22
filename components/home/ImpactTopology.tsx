"use client"

import * as d3 from "d3"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useMemo, useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

type Metric = {
  id: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  label: string
  group: string
}

const METRICS: Metric[] = [
  { id: "years", value: 6, suffix: "", label: "Years shipping product", group: "career" },
  { id: "engagement", value: 25, suffix: "%", prefix: "+", label: "Engagement lift (Pepper)", group: "pepper" },
  { id: "perf", value: 45, suffix: "%", prefix: "−", label: "Faster mobile load times", group: "pepper" },
  { id: "aws", value: 10, prefix: "$", suffix: "K", label: "Monthly AWS savings", group: "infra" },
  { id: "wasm", value: 80, suffix: "%", prefix: "−", label: "Faster 1M+ record drill-downs", group: "stackline" },
  { id: "ops", value: 37, suffix: "%", prefix: "−", label: "Operational cost reduction", group: "stackline" },
]

type SimNode = d3.SimulationNodeDatum & {
  id: string
  metric: Metric
  r: number
}

type SimLink = d3.SimulationLinkDatum<SimNode> & {
  source: string | SimNode
  target: string | SimNode
}

export function ImpactTopology() {
  const sectionRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const links = useMemo(
    () => [
      { source: "years", target: "engagement" },
      { source: "years", target: "perf" },
      { source: "years", target: "aws" },
      { source: "engagement", target: "perf" },
      { source: "aws", target: "ops" },
      { source: "wasm", target: "ops" },
      { source: "wasm", target: "years" },
      { source: "perf", target: "wasm" },
    ],
    []
  )

  useEffect(() => {
    const section = sectionRef.current
    const svg = svgRef.current
    const cardsEl = cardsRef.current
    if (!section || !svg || !cardsEl) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const measure = () => {
      const rect = svg.getBoundingClientRect()
      return {
        width: Math.max(320, rect.width || section.clientWidth),
        height: Math.max(360, rect.height || Math.min(560, window.innerHeight * 0.55)),
      }
    }
    let { width, height } = measure()

    const nodes: SimNode[] = METRICS.map((metric) => ({
      id: metric.id,
      metric,
      r: 28 + Math.min(metric.value, 80) * 0.18,
    }))

    const linkData: SimLink[] = links.map((l) => ({ ...l }))

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(linkData)
          .id((d) => d.id)
          .distance(110)
          .strength(0.55)
      )
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<SimNode>().radius((d) => d.r + 18))
      .alpha(1)

    const root = d3.select(svg)
    root.selectAll("*").remove()
    root.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", "100%")

    const gLinks = root.append("g").attr("class", "links")
    const gNodes = root.append("g").attr("class", "nodes")

    const linkSel = gLinks
      .selectAll("line")
      .data(linkData)
      .join("line")
      .attr("stroke", "rgba(191, 255, 16, 0.22)")
      .attr("stroke-width", 1.25)

    const nodeSel = gNodes
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.25).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on("drag", (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    nodeSel
      .append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", "rgba(17, 17, 17, 0.92)")
      .attr("stroke", "rgba(191, 255, 16, 0.55)")
      .attr("stroke-width", 1.5)

    nodeSel
      .append("circle")
      .attr("r", (d) => d.r * 0.35)
      .attr("fill", "rgba(191, 255, 16, 0.35)")
      .attr("class", "pulse-core")

    nodeSel
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#BFFF10")
      .attr("font-size", 13)
      .attr("font-weight", 500)
      .text((d) => formatShort(d.metric))

    simulation.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0)

      nodeSel.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    // Card number counters — fire once cards are meaningfully visible
    const counters = cardsEl.querySelectorAll<HTMLElement>("[data-count]")
    let counted = false
    const runCounters = () => {
      if (counted) return
      counted = true
      counters.forEach((el) => {
        const target = Number(el.dataset.count || 0)
        const prefix = el.dataset.prefix || ""
        const suffix = el.dataset.suffix || ""
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: reducedMotion ? 0.01 : 1.4,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(obj.v)}${suffix}`
          },
        })
      })
    }

    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: section, start: "top 75%" },
      })

      // Topology densifies lightly; cards reveal on scroll (no sim restart every frame)
      gsap.set(cardsEl, { opacity: 0, y: 36 })
      let lastCharge = -280
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 65%",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          const nextCharge = -280 + p * 180
          // Only nudge the force when charge meaningfully changes
          if (Math.abs(nextCharge - lastCharge) > 12) {
            lastCharge = nextCharge
            simulation.force("charge", d3.forceManyBody().strength(nextCharge))
            if (simulation.alpha() < 0.12) simulation.alpha(0.12).restart()
          }
          gsap.set(svg, { opacity: 1 - p * 0.55, scale: 1 - p * 0.06 })
          gsap.set(cardsEl, { opacity: Math.min(1, p * 1.6), y: (1 - Math.min(1, p * 1.6)) * 36 })
          if (p > 0.25) runCounters()
        },
      })

      ScrollTrigger.create({
        trigger: cardsEl,
        start: "top 90%",
        once: true,
        onEnter: runCounters,
      })

      // Pause force layout when section leaves the viewport
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          if (simulation.alpha() < 0.05) simulation.alpha(0.08).restart()
        },
        onLeave: () => simulation.stop(),
        onEnterBack: () => simulation.alpha(0.08).restart(),
        onLeaveBack: () => simulation.stop(),
      })

      // Settle quickly — no infinite pulse tweens
      simulation.alphaDecay(0.04)
      simulation.on("end", () => simulation.stop())
    }, section)

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        ;({ width, height } = measure())
        root.attr("viewBox", `0 0 ${width} ${height}`)
        simulation.force("center", d3.forceCenter(width / 2, height / 2))
        simulation.alpha(0.35).restart()
      }, 150)
    }
    window.addEventListener("resize", onResize, { passive: true })

    return () => {
      simulation.stop()
      window.clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
      ctx.revert()
    }
  }, [links])

  return (
    <section
      id="impact"
      ref={sectionRef}
      className="relative mx-auto max-w-5xl px-6 py-24 md:py-32"
    >
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
          Impact topology
        </p>
        <h2 ref={titleRef} className="text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
          Outcomes connected as a system — not a list of buzzwords.
        </h2>
        <p className="mt-4 text-slate-400">
          Drag the nodes. Scroll to collapse the network into measurable results from Pepper,
          Stackline, and Twisted-Rope.
        </p>
      </div>

      <div className="relative mb-10 overflow-hidden rounded-def border border-slate-800/60 bg-[#0a0a0a]/40">
        <svg
          ref={svgRef}
          className="relative z-0 block h-[min(55vh,560px)] w-full touch-none"
          role="img"
          aria-label="Interactive impact network graph"
        />
      </div>

      <div ref={cardsRef} className="relative z-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {METRICS.map((m) => (
          <article
            key={m.id}
            className="min-h-[140px] content-center rounded-def border border-slate-800/80 bg-[#111111] px-4 py-5 text-center"
          >
            <p
              className="mb-3 text-3xl text-green-100 md:text-4xl"
              data-count={m.value}
              data-prefix={m.prefix || ""}
              data-suffix={m.suffix || ""}
            >
              0
            </p>
            <p className="text-sm text-slate-400 md:text-base">{m.label}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function formatShort(m: Metric) {
  return `${m.prefix || ""}${m.value}${m.suffix || ""}`
}
