'use client'

import { useEffect, useState } from 'react'
import type { AccountRationPrefill } from './ration-params'
import { clearSessionHint, hasSessionHint } from '@/lib/account-hint'

// @cdc lot 4 — profil du premier chien du compte, pour pré-remplir un outil. Aucune requête pour
// un visiteur sans compte (pas de témoin de session) ni quand `enabled` est faux (l'URL prime).

export type AccountDog = NonNullable<AccountRationPrefill['dog']>

export function useAccountPrefill(enabled: boolean): AccountDog | null {
  const [dog, setDog] = useState<AccountDog | null>(null)
  useEffect(() => {
    if (!enabled || !hasSessionHint()) return
    const controller = new AbortController()
    fetch('/api/compte/ration', { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        if (res.status === 401) clearSessionHint()
        if (!res.ok) return
        const data = (await res.json()) as AccountRationPrefill
        setDog(data.dog)
      })
      .catch(() => {
        // Sans profil, l'outil reste vide : rien à signaler.
      })
    return () => controller.abort()
  }, [enabled])
  return enabled ? dog : null
}
