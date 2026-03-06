import { Star } from 'lucide-react'

interface StarRatingProps {
  score: number
  max?: number
  size?: number
}

export function StarRating({ score, max = 5, size = 16 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Note : ${score} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(score)
        const partial = !filled && i < score
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              size={size}
              className="text-[var(--border)]"
              fill="currentColor"
            />
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: partial ? `${(score % 1) * 100}%` : '100%' }}
              >
                <Star
                  size={size}
                  className="text-[var(--accent-2)]"
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        )
      })}
      <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">{score}/5</span>
    </div>
  )
}
