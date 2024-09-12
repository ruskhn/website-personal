"use client"
import { useState, useEffect, ChangeEvent } from "react"

const TypingSpeedTest: React.FC = () => {
  const sampleText: string = "The quick brown fox jumps over the lazy dog."
  const [text, setText] = useState<string>("")
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [wpm, setWpm] = useState<number>(0)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (startTime && text.length) {
      const elapsedTime: number = (new Date().getTime() - startTime.getTime()) / 60000
      const wordsTyped: number = text.trim().split(/\s+/).length
      setWpm(Math.round(wordsTyped / elapsedTime))
    }
  }, [text, startTime])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const inputText: string = e.target.value
    if (!startTime) {
      setStartTime(new Date())
      const countdownTimer: NodeJS.Timeout = setTimeout(() => {
        alert(`Time's up! Your typing speed is ${wpm} WPM.`)
        setText("")
        setStartTime(null)
        setWpm(0)
        clearTimeout(countdownTimer)
      }, 60000) // 1 minute timer
      setTimer(countdownTimer)
    }
    setText(inputText)

    if (inputText.trim().endsWith(sampleText) && timer) {
      clearTimeout(timer)
      alert(`Congratulations! Your typing speed is ${wpm} WPM.`)
      setText("")
      setStartTime(null)
      setWpm(0)
      setTimer(null)
    }
  }

  return (
    <div className="text-white">
      <h2>Type this text:</h2>
      <p>{sampleText}</p>
      <textarea className="text-black" value={text} onChange={handleChange} placeholder="Start typing..." />
      <p>Your typing speed: {wpm} WPM</p>
    </div>
  )
}

export default TypingSpeedTest
