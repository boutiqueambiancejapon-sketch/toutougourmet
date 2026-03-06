'use client'

import { useEffect, useState } from 'react'

interface WordRotatorProps {
  words: string[]
  intervalMs?: number
  className?: string
}

export function WordRotator({ words, intervalMs = 2000, className = '' }: WordRotatorProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [words.length, intervalMs])

  return (
    <span
      key={index}
      className={className}
      style={{
        display: 'inline-block',
        animation: 'wordSlideIn 0.3s ease both',
      }}
    >
      {words[index]}
    </span>
  )
}
