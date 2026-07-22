"use client"

import Image from "next/image"
import { WasmVizLab } from "./WasmVizLab"
import { LlmKeywordLab } from "./LlmKeywordLab"

export function PortfolioExperience() {
  return (
    <div className="mx-auto max-w-6xl space-y-24 px-4 pb-24 pt-8 md:px-6">
      <header className="max-w-3xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
          Portfolio
        </p>
        <h1 className="text-4xl tracking-tight text-white sm:text-5xl">
          Systems you can feel — not just screenshots.
        </h1>
        <p className="mt-4 text-slate-400">
          Interactive labs from Stackline systems work — WASM shopper analytics, hybrid LLM keyword
          generation — plus MapTask.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <a
            href="#wasm-lab"
            className="rounded-full border border-slate-700 px-4 py-2 text-slate-300 hover:border-green-100/40 hover:text-green-100"
          >
            WASM race
          </a>
          <a
            href="#llm-lab"
            className="rounded-full border border-slate-700 px-4 py-2 text-slate-300 hover:border-green-100/40 hover:text-green-100"
          >
            LLM workbench
          </a>
        </div>
      </header>

      <div id="wasm-lab">
        <WasmVizLab />
      </div>

      <LlmKeywordLab />

      <section className="space-y-6 border-t border-slate-800 pt-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
            Shipped product
          </p>
          <a
            className="group inline-flex items-center gap-3"
            target="_blank"
            href="https://maptask.ruslan.guru"
            rel="noopener noreferrer"
          >
            <h2 className="text-3xl text-white transition group-hover:text-green-100 sm:text-4xl">
              MapTask
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 30 30"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M23.75 15L6.25 15M23.75 15L16.25 22.5M23.75 15L16.25 7.5"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:stroke-green-100"
              />
            </svg>
          </a>
          <p className="mt-4 text-slate-400">
            Geo-aware task coordination for retail, construction, energy, and field ops — secure
            assignment, location context, and transparent handoffs.
          </p>
        </div>

        <Image
          src="/images/portfolio/p2.png"
          alt="MapTask product screenshot"
          width={1900}
          height={916}
          className="h-auto w-full rounded-2xl border border-slate-800"
          priority
        />
      </section>
    </div>
  )
}
