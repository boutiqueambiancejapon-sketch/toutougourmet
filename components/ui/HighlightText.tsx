import { cn } from '@/lib/utils'

interface HighlightTextProps {
  children: React.ReactNode
  color?: 'orange' | 'yellow'
  className?: string
}

export function HighlightText({ children, color = 'orange', className }: HighlightTextProps) {
  return (
    <span
      className={cn('highlight', color === 'yellow' && 'highlight--yellow', className)}
      style={{ fontFamily: "'Fraunces', serif" }}
    >
      {children}
    </span>
  )
}
