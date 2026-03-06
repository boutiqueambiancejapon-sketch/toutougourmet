'use client'

import { useEffect, useState } from 'react'

interface WordRotatorProps {
  words: string[]
  intervalMs?: number
  className?: string
}

export function WordRotator({ words, intervalMs = 2000, className = '' }: WordRotatorProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Fade-in au montage — garantit l'affichage sur hard nav et soft nav
    const fadeIn = setTimeout(() => setVisible(true), 50)

    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length)
        setVisible(true)
      }, 300)
    }, intervalMs)

    return () => {
      clearTimeout(fadeIn)
      clearInterval(timer)
    }
  }, [words.length, intervalMs])

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {words[index]}
    </span>
  )
}
