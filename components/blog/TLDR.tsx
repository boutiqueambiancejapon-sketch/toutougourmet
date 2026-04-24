interface TLDRProps {
  items: string[]
}

export function TLDR({ items }: TLDRProps) {
  return (
    <div
      className="rounded-[var(--radius-xl)] my-7 p-5 md:p-6 border"
      style={{
        background: 'var(--bg-amber)',
        borderColor: 'var(--pill-amber)',
      }}
    >
      <p
        className="flex items-center gap-2 font-bold text-sm m-0 mb-4"
        style={{ color: 'var(--accent-2)' }}
      >
        <span aria-hidden="true">⚡</span> En bref
      </p>
      <ul className="m-0 p-0 list-none flex flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="grid grid-cols-[20px_1fr] gap-2.5 items-start text-sm md:text-base leading-relaxed text-[var(--text-primary)]"
          >
            <span aria-hidden="true" className="text-[var(--accent-3)] mt-1">
              ✓
            </span>
            <span
              dangerouslySetInnerHTML={{
                __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
