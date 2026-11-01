import Link from 'next/link'

// Logo du prototype V2 : tuile ambre + tête de chien, « Gourmet » en orange.
export function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 no-underline" aria-label="Toutou Gourmet, accueil">
      <span aria-hidden="true" className="grid size-9 place-items-center rounded-tile bg-amber text-[19px]">
        🐶
      </span>
      <span className={`whitespace-nowrap font-display text-[19px] font-black ${onDark ? 'text-cream' : 'text-ink'}`}>
        Toutou <span className="text-orange">Gourmet</span>
      </span>
    </Link>
  )
}
