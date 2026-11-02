'use client'

import { useEffect, useState } from 'react'
import { isPoisonCountry, type PoisonCountry } from '@/data/poison-centers'

// @cdc urgences — pays retenu pour les numéros d'urgence : choix manuel gardé dans la session,
// sinon pays détecté par /api/geo, sinon France (rendu serveur, ce que voit Google).
const KEY = 'tg-poison-country'
const EVENT = 'tg-poison-country'

export function usePoisonCountry(): [PoisonCountry, (c: PoisonCountry) => void] {
  const [country, setCountry] = useState<PoisonCountry>('FR')

  useEffect(() => {
    let cancelled = false
    const stored = window.sessionStorage.getItem(KEY)
    if (isPoisonCountry(stored)) {
      window.setTimeout(() => !cancelled && setCountry(stored), 0)
    } else {
      fetch('/api/geo', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { country?: unknown } | null) => {
          if (!cancelled && d && isPoisonCountry(d.country)) {
            window.sessionStorage.setItem(KEY, d.country)
            setCountry(d.country)
          }
        })
        .catch(() => undefined)
    }
    const sync = (e: Event) => {
      const c = (e as CustomEvent<unknown>).detail
      if (isPoisonCountry(c)) setCountry(c)
    }
    window.addEventListener(EVENT, sync)
    return () => {
      cancelled = true
      window.removeEventListener(EVENT, sync)
    }
  }, [])

  const choose = (c: PoisonCountry) => {
    window.sessionStorage.setItem(KEY, c)
    window.dispatchEvent(new CustomEvent(EVENT, { detail: c }))
  }
  return [country, choose]
}
