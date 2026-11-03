'use client'

import { useState, type ReactNode } from 'react'
import { partnerCta } from '@/lib/partner-cta'

// @cdc affiliation — bouton unique des offres partenaires (BrandCTA, comparatif race, encart du
// milieu, offres du compte, offres des outils). Avec un code promo : « Voir le code promo », le
// clic copie le code, affiche « Code copié : WZU7090 » et ouvre le lien dans un nouvel onglet
// (comportement natif du lien, rien n'est bloqué). Sans code : « Profiter de −50 % », ou le
// libellé d'origine. Clic mesuré par components/analytics/Tracking.tsx (data-cta le plus proche).

interface PartnerButtonProps {
  href: string
  /** Libellé quand la marque n'a ni code ni remise connue */
  fallback: string
  className: string
  /** Fin de libellé lue seulement par les lecteurs d'écran (« chez Franklin ») */
  srLabel?: string
  /** Après le libellé (flèche, icône) */
  after?: ReactNode
  /** Couleur du message « Code copié » (fond foncé : texte clair) */
  statusClassName?: string
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function PartnerButton({ href, fallback, className, srLabel, after, statusClassName = 'text-ink' }: PartnerButtonProps) {
  const { code, label } = partnerCta(href, fallback)
  const [status, setStatus] = useState<'idle' | 'copied' | 'shown'>('idle')
  const link = (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener"
      onClick={code ? () => void copy(code).then((ok) => setStatus(ok ? 'copied' : 'shown')) : undefined}
      className={className}
    >
      {label}
      {srLabel ? <span className="sr-only"> {srLabel}</span> : null}
      {after}
    </a>
  )
  if (!code) return link
  return (
    <>
      {link}
      <span role="status" className={`text-sm font-semibold empty:hidden ${statusClassName}`}>
        {status === 'copied' ? `Code copié : ${code}` : status === 'shown' ? `Ton code : ${code}` : ''}
      </span>
    </>
  )
}
