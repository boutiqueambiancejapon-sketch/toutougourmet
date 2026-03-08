interface TLDRProps {
  items: string[]
}

export function TLDR({ items }: TLDRProps) {
  return (
    <div className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 my-6">
      <p className="font-semibold text-[var(--text-primary)] mb-3">⚡ En bref</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-[var(--accent-3)] mt-0.5">✅</span>
            <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
          </li>
        ))}
      </ul>
    </div>
  )
}
