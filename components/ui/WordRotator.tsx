'use client'

import { useEffect, useState } from 'react'

interface WordRotatorProps {
  words: string[]
  intervalMs?: number
  className?: string
}

export function WordRotator({ words, intervalMs = 2000, className = '' }: WordRotatorProps) {
  const [index, setIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    setAnimKey(1)
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [words.length, intervalMs])

  return (
    <span
      key={`${index}-${animKey}`}
      className={className}
      style={{
        display: 'inline-block',
        animation: animKey > 0 ? 'wordSlideIn 0.3s ease both' : undefined,
      }}
    >
      {words[index]}
    </span>
  )
}
