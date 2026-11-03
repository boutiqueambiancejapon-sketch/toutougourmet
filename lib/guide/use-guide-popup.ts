'use client'

import { useCallback, useEffect, useState } from 'react'
import { hasSessionHint } from '@/lib/account-hint'
import { pageTypeOf } from '@/lib/page-type'
import { isSubscribed, msOnSite, shownRecently } from './popup-state'

// @cdc guide — quand ouvrir le panneau du guide (règles Google sur les interstitiels mobiles :
// panneau bas, contenu visible derrière, jamais à l'arrivée sur la page).
// Mobile : après la moitié du corps d'un article lue, ou 40 s passées sur le site.
// Ordinateur (souris) : à l'intention de sortie, la souris quitte la fenêtre par le haut.
// Jamais : urgences, aliment « danger » (data-no-popup posé par l'article), compte, Premium,
// scanner, page du guide et fiche frigo ; ni pour un compte connecté, une adresse déjà inscrite,
// ni moins de 7 jours après la dernière apparition. Attend que le bandeau cookies et le bandeau
// partenaire collant soient fermés, et qu'aucun champ ne soit en cours de saisie.

export type PopupTrigger = 'lecture' | 'temps' | 'sortie'

const BLOCKED_PATH = /^\/(compte|premium|scanner|guide-alimentation|fiche-aliments-dangereux|outils\/fiche-de-garde)(\/|$)/
const ARTICLE_PATH = /^\/(chien\/[^/]+\/[^/]+|blog\/[^/]+)\/?$/
const TIME_MS = 40_000
const READ_SHARE = 0.5

/** Pages où le panneau ne s'ouvre jamais (et se ferme si le visiteur y arrive). */
export function pathBlocked(pathname: string): boolean {
  return BLOCKED_PATH.test(pathname) || pageTypeOf(pathname) === 'urgences'
}

/** Règles qui excluent la page ou le visiteur. */
function popupBlocked(pathname: string): boolean {
  if (pathBlocked(pathname)) return true
  if (document.querySelector('[data-no-popup]')) return true
  return hasSessionHint() || isSubscribed() || shownRecently()
}

/** Un autre élément occupe le bas de l'écran ou le visiteur écrit : on attend. */
function busy(): boolean {
  if (document.documentElement.dataset.sticky === '1') return true
  if (document.querySelector('[data-consent-banner]')) return true
  const active = document.activeElement
  return active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement
}

function articleHalfRead(): boolean {
  const body = document.querySelector('.mdx-content')
  if (!body) return false
  const rect = body.getBoundingClientRect()
  return rect.height > 0 && (window.innerHeight - rect.top) / rect.height >= READ_SHARE
}

export function useGuidePopup(pathname: string): [PopupTrigger | null, () => void] {
  const [trigger, setTrigger] = useState<PopupTrigger | null>(null)

  useEffect(() => {
    if (trigger || popupBlocked(pathname)) return
    const desktop = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches
    const fire = (t: PopupTrigger) => {
      if (busy() || popupBlocked(pathname)) return
      setTrigger(t)
    }
    if (desktop) {
      const onLeave = (e: MouseEvent) => {
        if (!e.relatedTarget && e.clientY <= 0) fire('sortie')
      }
      document.addEventListener('mouseout', onLeave)
      return () => document.removeEventListener('mouseout', onLeave)
    }
    const article = ARTICLE_PATH.test(pathname)
    msOnSite()
    const timer = window.setInterval(() => {
      if (article && articleHalfRead()) fire('lecture')
      else if (msOnSite() >= TIME_MS) fire('temps')
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [pathname, trigger])

  const close = useCallback(() => setTrigger(null), [])
  return [trigger, close]
}
