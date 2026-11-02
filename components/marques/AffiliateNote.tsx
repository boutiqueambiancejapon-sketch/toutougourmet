import Link from 'next/link'

// @cdc affiliation — mention lisible sous chaque lien partenaire (audit design-cro §3).
export function AffiliateNote({ className = 'text-ink-2', single = true }: { className?: string; single?: boolean }) {
  return (
    <p className={`m-0 text-xs leading-snug ${className}`}>
      {single ? 'Lien partenaire' : 'Liens partenaires'}&nbsp;: on touche une commission si tu commandes, sans surcoût pour toi.{' '}
      <Link href="/a-propos#affiliation" className="text-inherit underline underline-offset-2">
        Comment on travaille
      </Link>
    </p>
  )
}
