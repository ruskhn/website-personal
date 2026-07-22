import gsap from "gsap"

const DEFAULT_CHARS = "01<>$#@*&ABCDEFGHIJKLMNOPQRSTUVWXYZ"

type ScrambleOptions = {
  duration?: number
  chars?: string
  revealDelay?: number
  ease?: string
}

/** DIY ScrambleText (Club plugin alternative) — decode into final copy. */
export function scrambleTo(
  el: HTMLElement,
  finalText: string,
  { duration = 1.35, chars = DEFAULT_CHARS, revealDelay = 0.12, ease = "none" }: ScrambleOptions = {}
) {
  const state = { t: 0 }
  return gsap.to(state, {
    t: 1,
    duration,
    ease,
    onUpdate: () => {
      const revealStart = revealDelay
      const revealProgress = Math.max(0, (state.t - revealStart) / (1 - revealStart || 1))
      const revealCount = Math.floor(revealProgress * finalText.length)
      let out = ""
      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i]
        if (ch === " " || ch === "·" || ch === "—") {
          out += ch
          continue
        }
        out += i < revealCount ? ch : chars[Math.floor(Math.random() * chars.length)]
      }
      el.textContent = out
    },
    onComplete: () => {
      el.textContent = finalText
    },
  })
}

/** Wrap each character for stagger / glitch. Preserves spaces. */
export function splitChars(el: HTMLElement) {
  const text = el.textContent ?? ""
  el.setAttribute("aria-label", text)
  el.innerHTML = ""
  const chars: HTMLSpanElement[] = []

  ;[...text].forEach((ch) => {
    const span = document.createElement("span")
    span.className = "hero-char inline-block will-change-transform"
    span.setAttribute("aria-hidden", "true")
    if (ch === " ") {
      span.innerHTML = "&nbsp;"
      span.style.width = "0.28em"
    } else {
      span.textContent = ch
    }
    el.appendChild(span)
    chars.push(span)
  })

  return chars
}
