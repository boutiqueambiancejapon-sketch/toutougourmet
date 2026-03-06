'use client'

import { useEffect, useRef, useState } from 'react'

interface ScoreBarProps {
  label: string
  score: number
}

export function ScoreBar({ label, score }: ScoreBarProps) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWidth((score / 5) * 100)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [score])

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="text-sm text-[var(--text-secondary)] w-44 shrink-0">{label}</span>
      <div className="flex-1 score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={5}
        />
      </div>
      <span className="text-sm font-medium text-[var(--text-primary)] w-8 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {score.toFixed(1)}
      </span>
    </div>
  )
}
