'use client'

import { useEffect, useState } from 'react'

interface WordRotatorProps {
  words: string[]
  intervalMs?: number
  className?: string
}

export function WordRotator({ words, intervalMs = 2000, className = '' }: WordRotatorProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % words.length)
        setVisible(true)
      }, 200)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [words.length, intervalMs])

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      {words[index]}
    </span>
  )
}
