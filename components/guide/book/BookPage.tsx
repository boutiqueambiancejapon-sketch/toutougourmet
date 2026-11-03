import type { ReactNode } from 'react'
import Image from 'next/image'
import { GUIDE_TITLE } from '@/lib/guide/config'
import { SITE_URL } from '@/lib/i18n/config'

// @cdc guide — cadre d'une page A4 du livre : contenu + pied (titre, site, numéro de page).
// Classes bk-* : app/(livre)/livre.css.

export const fullUrl = (path: string): string => `${SITE_URL}${path}`
/** Adresse lisible imprimée sous chaque élément : « toutou-gourmet.com/outils/ration ». */
export const shortUrl = (path: string): string => `toutou-gourmet.com${path}`

export interface BookPageProps {
  number: number
  className?: string
  children: ReactNode
  foot?: boolean
  /** Nom de l'aperçu WebP tiré de cette page par le script (public/guides/apercu-{preview}.webp) */
  preview?: string
}

export function BookPage({ number, className = '', children, foot = true, preview }: BookPageProps) {
  return (
    <section id={`page-${number}`} className={`bk-page ${className}`} data-page={number} data-preview={preview} aria-label={`Page ${number}`}>
      <div className="bk-body">{children}</div>
      {foot ? (
        <footer className="bk-foot">
          <span>{GUIDE_TITLE}</span>
          <span>toutou-gourmet.com · {number}</span>
        </footer>
      ) : null}
    </section>
  )
}

/** Lien imprimé vers la page d'origine du site (cliquable dans le PDF). */
export function Source({ path, label = 'Pour aller plus loin' }: { path: string; label?: string }) {
  return (
    <p className="bk-src">
      {label} : <a href={fullUrl(path)}>{shortUrl(path)}</a>
    </p>
  )
}

/** Image qui remplit la place restante de la page (masquée s'il en reste trop peu). */
export function FillImage({ src, className = 'bk-fill' }: { src: string; className?: string }) {
  return (
    <div className={className}>
      <Image src={src} alt="" width={1200} height={800} sizes="180mm" className="bk-img" />
    </div>
  )
}
