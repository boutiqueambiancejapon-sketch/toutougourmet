import Link from 'next/link'

// Logo V2 : le nom seul, « Gourmet » en orange (choix du propriétaire, 2026-11-01).
export function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link href="/" className="no-underline" aria-label="Toutou Gourmet, accueil">
      <span className={`whitespace-nowrap font-display text-[21px] font-black ${onDark ? 'text-cream' : 'text-ink'}`}>
        Toutou <span className="text-orange">Gourmet</span>
      </span>
    </Link>
  )
}
