import Link from 'next/link'

interface DisclosureProps {
  type?: 'short' | 'full'
}

export function Disclosure({ type = 'short' }: DisclosureProps) {
  if (type === 'full') {
    return (
      <div className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 text-sm text-[var(--text-secondary)]">
        <p className="font-semibold text-[var(--text-primary)] mb-2">Transparence & Affiliation</p>
        <p>
          Toutou Gourmet est un site indépendant. Certains liens présents sur ce site sont des liens
          affiliés : si tu passes commande via ces liens, on perçoit une commission de la part de la
          marque, sans aucun surcoût pour toi. Ça nous aide à financer le site et à continuer à faire
          des comparatifs honnêtes.{' '}
          <Link href="/a-propos#affiliation" className="text-[var(--accent-1)] underline">
            En savoir plus sur notre modèle
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <p className="caption text-center text-[var(--text-muted)] text-xs">
      🔗 Lien affilié — on perçoit une commission si tu commandes, sans impact sur le prix que tu
      paies.{' '}
      <Link href="/a-propos#affiliation" className="underline hover:text-[var(--accent-1)]">
        En savoir plus
      </Link>
    </p>
  )
}
