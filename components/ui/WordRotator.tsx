'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface WordRotatorProps {
  words: string[]
  intervalMs?: number
  className?: string
}

export function WordRotator({ words, intervalMs = 2000, className = '' }: WordRotatorProps) {
  const [index, setIndex] = useState(0)
  const spanRef = useRef<HTMLSpanElement>(null)
  const isMountedRef = useRef(false)

  const restartAnim = () => {
    const el = spanRef.current
    if (!el) return
    el.style.animation = 'none'
    void el.getBoundingClientRect() // force reflow so browser registers the reset
    el.style.animation = 'wordSlideIn 0.3s ease both'
  }

  // Restart animation synchronously before paint when word changes (avoids flash)
  useLayoutEffect(() => {
    if (isMountedRef.current) restartAnim()
  }, [index])

  useEffect(() => {
    // Trigger entrance animation after hydration — fixes SSR first-load issue
    restartAnim()
    isMountedRef.current = true
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [words.length, intervalMs])

  return (
    <span
      ref={spanRef}
      className={className}
      style={{ display: 'inline-block' }}
    >
      {words[index]}
    </span>
  )
}
