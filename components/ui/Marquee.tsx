interface MarqueeProps {
  items: string[]
  className?: string
  bgClass?: string
  textClass?: string
  separator?: string
}

export function Marquee({
  items,
  className = '',
  bgClass = 'bg-[var(--pill-rose)]',
  textClass = 'text-[var(--text-primary)]',
  separator = '·',
}: MarqueeProps) {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items]

  return (
    <div className={`overflow-hidden py-3 ${bgClass} ${className}`} aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className={`flex items-center gap-4 px-4 text-sm font-semibold whitespace-nowrap ${textClass}`}>
            <span>{item}</span>
            <span className="opacity-40">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
