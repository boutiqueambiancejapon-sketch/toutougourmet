'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { hasSessionHint } from '@/lib/account-hint'
import { track } from '@/lib/analytics'
import type { SignupPlace } from '@/lib/signup-places'

// @cdc mesure — état « compte connecté » (témoin tg_compte, aucune requête : les pages restent
// statiques) et mesure d'une invitation : vue une fois par page dès qu'elle entre à moitié dans
// l'écran, puis clic.

const noop = () => () => {}

/** Faux au rendu serveur et à l'hydratation : le rendu par défaut est celui du visiteur. */
export function useSignedIn(): boolean {
  return useSyncExternalStore(noop, hasSessionHint, () => false)
}

/** Vues déjà comptées sur cette page (chemin + emplacement). */
const seen = new Set<string>()

export function useInviteTracking<T extends HTMLElement>(place: SignupPlace, active = true) {
  const ref = useRef<T>(null)
  const pathname = usePathname()

  useEffect(() => {
    const el = ref.current
    if (!active || !el || typeof IntersectionObserver === 'undefined') return
    const key = `${pathname}|${place}`
    if (seen.has(key)) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || seen.has(key)) return
        seen.add(key)
        track('Account Invite View', { place })
        io.disconnect()
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [place, active, pathname])

  const onClick = useCallback(() => track('Account Invite Click', { place }), [place])
  return { ref, onClick }
}
