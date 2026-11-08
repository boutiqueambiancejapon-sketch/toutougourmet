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
          marque, sans aucun surcoût pour toi. Ça nous aide à financer le site et à continuer à comparer les marques.{' '}
          <Link href="/a-propos#affiliation" className="text-orange-ink underline">
            En savoir plus sur notre modèle
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <p className="caption text-center text-[var(--text-muted)] text-xs">
      Lien partenaire&nbsp;: on touche une commission si tu commandes, sans surcoût pour toi.{' '}
      <Link href="/a-propos#affiliation" className="underline hover:text-orange-ink">
        En savoir plus
      </Link>
    </p>
  )
}
