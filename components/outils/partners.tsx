import { IconChevron } from '@/components/icons'

// @cdc affiliation — liens partenaires autorisés sous les outils (un au plus par résultat,
// et seulement quand le résultat le justifie). Les clics sont mesurés par
// components/analytics/Tracking.tsx (marque reconnue sur l'URL, emplacement via data-cta).

export interface Partner {
  brand: string
  href: string
  /** Offre en cours, telle que donnée par la marque */
  offer: string
  /** Pourquoi ce lien, à partir du résultat */
  why: string
  label: string
}

export const PARTNERS = {
  dogChef: { brand: 'Dog Chef', href: 'https://www.dogchef.com/fr/code/WZU7090', offer: "−30 % sur la box d'essai, livraison gratuite, sans engagement" },
  dogfy: { brand: 'Dogfy Diet', href: 'https://tidd.ly/4jT3Tqg', offer: "−50 % sur la box d'essai de 14 jours" },
  elmut: { brand: 'Elmut', href: 'https://c3po.link/QWMW4k6mbU', offer: '−40 % sur la 1re commande' },
  franklin: { brand: 'Franklin', href: 'https://c3po.link/Q3xbJhfapn', offer: '−30 % sur la 1re commande en abonnement' },
  upd: { brand: 'Ultra Premium Direct', href: 'https://c3po.link/QqJYNnzYD8', offer: '' },
} as const

export function PartnerLink({ partner, tool }: { partner: Partner; tool: string }) {
  return (
    <div data-cta={`tool-${tool}`} className="flex flex-col gap-3 rounded-box bg-ink p-4 text-cream shadow-[5px_5px_0_var(--orange)] sm:p-5">
      <p className="m-0 text-[15px] leading-relaxed text-cream">{partner.why}</p>
      {partner.offer ? <p className="m-0 text-sm font-bold text-amber">{partner.offer}</p> : null}
      <a
        href={partner.href}
        target="_blank"
        rel="sponsored noopener"
        className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-control bg-amber px-5 text-base font-bold text-ink no-underline hover:underline"
      >
        {partner.label}
        <IconChevron className="size-4" />
      </a>
      <p className="m-0 text-xs text-cream/70">Lien partenaire&nbsp;: on touche une commission si tu commandes, sans surcoût pour toi.</p>
    </div>
  )
}
