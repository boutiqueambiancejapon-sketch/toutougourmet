'use client'

import { useEffect, useState } from 'react'
import type { AccountProfile } from './ration-params'
import { clearSessionHint, hasSessionHint } from '@/lib/account-hint'

// @cdc lot 4 — profil du premier chien du compte, pour pré-remplir un outil. Aucune requête pour
// un visiteur sans compte (pas de témoin de session) ni quand `enabled` est faux (l'URL prime).
// Une seule requête par page, partagée entre les outils qui la demandent.

export type AccountDog = NonNullable<AccountProfile['dog']>

let pending: Promise<AccountDog | null> | null = null

function loadProfile(): Promise<AccountDog | null> {
  pending ??= fetch('/api/compte/profil', { cache: 'no-store' })
    .then(async (res) => {
      if (res.status === 401) clearSessionHint()
      if (!res.ok) return null
      return ((await res.json()) as AccountProfile).dog
    })
    .catch(() => null)
    .finally(() => {
      // La requête suivante (autre page, profil modifié) repart du serveur.
      setTimeout(() => (pending = null), 0)
    })
  return pending
}

export function useAccountPrefill(enabled = true): AccountDog | null {
  const [dog, setDog] = useState<AccountDog | null>(null)
  useEffect(() => {
    if (!enabled || !hasSessionHint()) return
    let alive = true
    void loadProfile().then((d) => {
      if (alive) setDog(d)
    })
    return () => {
      alive = false
    }
  }, [enabled])
  return enabled ? dog : null
}
