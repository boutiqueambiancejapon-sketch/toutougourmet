import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'promo' | 'new' | 'vet' | 'cat'
  className?: string
}

const variantStyles = {
  default: 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] border border-[var(--border)]',
  promo: 'bg-[var(--accent-1)] text-white',
  new: 'bg-[var(--accent-2)] text-[var(--text-primary)]',
  vet: 'bg-[var(--accent-3)] text-white',
  cat: 'bg-[var(--accent-4)] text-[var(--text-primary)]',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-sm)] text-xs font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
