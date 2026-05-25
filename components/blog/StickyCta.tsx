'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export type StickyCtaBadgeColor = 'rose' | 'green' | 'blue' | 'amber'

export interface DynamicSocialProofConfig {
  /** Endpoint qui retourne { count: number } */
  endpoint: string
  /** Template avec {count} pour le nombre formaté et {plural} pour "s"/"" */
  template: string
  /** Affiche le compteur uniquement si count >= minCount. Défaut 1. */
  minCount?: number
}

export interface StickyCtaConfig {
  /** Marque ou titre principal (affiché toujours, mobile inclus) */
  brandName: string
  /** Destination — peut être URL externe (https://) ou route interne (/outils/...) */
  url: string
  /** Phrase d'accroche affichée à partir de sm+ — garde < 60 chars */
  label: string
  /** Pastille promo (ex. "-35%", "GRATUIT") — affichée si présente, mobile inclus */
  badge?: string
  /**
   * Couleur du badge — défaut: rose (codé promo/alerte).
   * - `rose` : promo, discount, alerte douce
   * - `green` : gratuit, sans engagement, safe
   * - `blue` : info, neutre, comparatif
   * - `amber` : nouveau, mise en avant
   */
  badgeColor?: StickyCtaBadgeColor
  /** Code promo affiché inline après le label (sm+) */
  code?: string
  /**
   * Ligne preuve sociale statique — affichée sur tous viewports (mobile inclus).
   * Toute séquence de ★ est automatiquement colorisée en doré (#F59E0B).
   * Ex : "★★★★★ 4.8/5 · 7 800+ avis Trustpilot"
   */
  socialProof?: string
  /**
   * Preuve sociale dynamique — fetch côté client depuis `endpoint`, formate
   * via `template` ({count} et {plural} sont remplacés), et n'affiche que si
   * `count >= minCount`. Si présent, OVERRIDE `socialProof` statique.
   * Ex pour le bilan Bien Nourri :
   *   { endpoint: '/api/bien-nourri-count', template: 'Déjà {count} bilan{plural} réalisé{plural}', minCount: 1 }
   */
  dynamicSocialProof?: DynamicSocialProofConfig
  /** Override du libellé du bouton — défaut: "J'en profite →" si code, "Acheter →" sinon */
  buttonLabel?: string
  /**
   * Sous-label discret sous le bouton CTA (visible mobile + desktop).
   * Sert à anchorer prix / friction-removers / promesses non-commerciales.
   * Ex : "Livraison incluse · sans engagement" ou "Sans inscription · 2 min"
   */
  subButton?: string
}

interface StickyCtaProps {
  config: StickyCtaConfig
}

const BADGE_BG_BY_COLOR: Record<StickyCtaBadgeColor, string> = {
  rose: 'var(--pill-rose)',
  green: 'var(--pill-green)',
  blue: 'var(--pill-blue)',
  amber: 'var(--pill-amber)',
}

/**
 * Colorise toute séquence de ★ en doré, garde le reste tel quel.
 * Permet d'écrire `"★★★★★ 4.8/5 · ..."` dans la config et obtenir 5 étoiles
 * dorées au rendu sans surcharger l'API du composant.
 */
function colorizeStars(text: string) {
  return text.split(/(★+)/).map((part, i) =>
    /^★+$/.test(part) ? (
      <span key={i} style={{ color: '#F59E0B' }}>{part}</span>
    ) : (
      part
    ),
  )
}

/**
 * Formate un template `{count}` / `{plural}` avec le nombre fourni.
 * - {count} → formaté FR (espace fine comme séparateur de milliers)
 * - {plural} → "s" si count >= 2, "" sinon (singulier pour 0 et 1)
 */
function formatDynamicTemplate(template: string, count: number): string {
  const formatted = new Intl.NumberFormat('fr-FR').format(count)
  const plural = count >= 2 ? 's' : ''
  return template.replace(/\{count\}/g, formatted).replace(/\{plural\}/g, plural)
}

export function StickyCta({ config }: StickyCtaProps) {
  const [dismissed, setDismissed] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dynamicCount, setDynamicCount] = useState<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch du compteur dynamique si la config en déclare un.
  // Silencieux en cas d'échec — le compteur reste null et on retombe sur
  // le socialProof statique (ou rien si pas défini).
  useEffect(() => {
    const endpoint = config.dynamicSocialProof?.endpoint
    if (!endpoint) return

    let cancelled = false
    fetch(endpoint)
      .then((r) => r.json())
      .then((d: { count?: number }) => {
        if (!cancelled) setDynamicCount(typeof d.count === 'number' ? d.count : 0)
      })
      .catch(() => {
        /* fail silently — pas de compteur, c'est tout */
      })

    return () => {
      cancelled = true
    }
  }, [config.dynamicSocialProof?.endpoint])

  if (dismissed) return null

  // Internal route (/...) → no target=_blank, no sponsored rel
  const isInternal = config.url.startsWith('/')
  const buttonLabel =
    config.buttonLabel ?? (config.code ? 'J\'en profite →' : 'Acheter →')
  const badgeBg = BADGE_BG_BY_COLOR[config.badgeColor ?? 'rose']

  // Calcule la social proof à afficher : dynamique si seuil atteint, sinon statique
  const dyn = config.dynamicSocialProof
  const minCount = dyn?.minCount ?? 1
  const dynamicProof =
    dyn && dynamicCount !== null && dynamicCount >= minCount
      ? formatDynamicTemplate(dyn.template, dynamicCount)
      : null
  const effectiveSocialProof = dynamicProof ?? config.socialProof

  // Bouton de fermeture — rendu en 2 emplacements selon viewport (l'un est
  // toujours masqué via sm:hidden/sm:block, donc UX = un seul bouton visible)
  function CloseBtn({ extraClasses = '' }: { extraClasses?: string }) {
    return (
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fermer"
        className={`shrink-0 transition-colors text-lg leading-none ${
          scrolled
            ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-on-dark)]'
        } ${extraClasses}`}
      >
        ✕
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div
        className={[
          'max-w-[720px] mx-auto rounded-[var(--radius-xl)] border shadow-[var(--shadow-xl)] p-4 pointer-events-auto transition-all duration-500',
          // Mobile : empilement vertical (texte ligne 1, bouton pleine largeur ligne 2)
          // sm+ : tout sur une ligne horizontale
          'flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4',
          scrolled
            ? 'backdrop-blur-xl bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
            : 'border-[var(--border)]',
        ].join(' ')}
        style={scrolled ? {} : { background: 'var(--bg-dark)' }}
      >
        {/* Groupe A : badge + bloc texte + close (mobile only).
            Sur sm+, `sm:contents` flatten ce conteneur dans le flex parent,
            si bien que badge/text/button-col/close-desktop deviennent tous
            siblings d'un seul flex horizontal. */}
        <div className="flex items-start sm:items-center gap-3 sm:contents">
          {config.badge && (
            <span
              className="shrink-0 text-xs font-black px-2.5 py-1.5 rounded-[var(--radius-md)] whitespace-nowrap"
              style={{ background: badgeBg, color: 'var(--text-primary)' }}
            >
              {config.badge}
            </span>
          )}

          <div className="flex-1 min-w-0">
            <p
              className={[
                'text-sm leading-snug transition-colors duration-500',
                scrolled ? 'text-[var(--text-primary)]' : '',
              ].join(' ')}
              style={scrolled ? {} : { color: 'var(--text-on-dark)' }}
            >
              <span className="font-bold">{config.brandName}</span>
              <span
                className={`hidden sm:inline ${
                  scrolled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {' '}— {config.label}
              </span>
              {config.code && (
                <>
                  {' '}· Code{' '}
                  <span
                    className={`font-mono font-bold transition-colors duration-500 ${
                      scrolled ? 'text-rose-600' : ''
                    }`}
                    style={scrolled ? {} : { color: 'var(--pill-rose)' }}
                  >
                    {config.code}
                  </span>
                </>
              )}
            </p>

            {/* Social proof (statique ou dynamique) — visible sur tous viewports */}
            {effectiveSocialProof && (
              <p
                className={`text-xs leading-snug mt-0.5 transition-colors duration-500 ${
                  scrolled ? 'text-[var(--text-muted)]' : ''
                }`}
                style={scrolled ? {} : { color: 'var(--text-muted)', opacity: 0.85 }}
              >
                {colorizeStars(effectiveSocialProof)}
              </p>
            )}
          </div>

          {/* Close button — mobile only, en haut-droite du card */}
          <CloseBtn extraClasses="sm:hidden mt-0.5" />
        </div>

        {/* Groupe B : colonne CTA — bouton pleine largeur sur mobile, inline sm+ */}
        <div className="flex flex-col items-center gap-1 shrink-0 w-full sm:w-auto">
          <Link
            href={config.url}
            target={isInternal ? undefined : '_blank'}
            rel={isInternal ? undefined : 'noopener noreferrer sponsored'}
            className="btn-primary text-sm px-4 py-2.5 sm:py-2 whitespace-nowrap w-full sm:w-auto text-center"
          >
            {buttonLabel}
          </Link>
          {config.subButton && (
            <span
              className={`text-[10px] leading-snug whitespace-nowrap transition-colors duration-500 ${
                scrolled ? 'text-[var(--text-muted)]' : ''
              }`}
              style={scrolled ? {} : { color: 'var(--text-muted)', opacity: 0.85 }}
            >
              {config.subButton}
            </span>
          )}
        </div>

        {/* Close button — sm+ uniquement, fin de ligne horizontale */}
        <CloseBtn extraClasses="hidden sm:block" />
      </div>
    </div>
  )
}
