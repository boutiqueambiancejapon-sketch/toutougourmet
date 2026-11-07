'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Gravite } from '@/lib/assistant/urgence'
import { track } from '@/lib/analytics'

// @cdc assistant — fil de discussion avec Milo, partagé entre la page /assistant et la petite fenêtre des autres
// pages (sessionStorage : il suit le visiteur d'une page à l'autre). Sans compte, la question attend dans le
// navigateur (localStorage) et part toute seule au retour de l'inscription.

export interface MiloReponse {
  reponse: string
  questions: boolean
  gravite: Gravite
  depuisLeSite: boolean
  articles: { url: string; titre: string }[]
  produits: { nom: string; url: string; chez: string; score: number | null; remise: string | null }[]
}
export interface MiloMessage {
  q: string
  r?: MiloReponse
  erreur?: string
}

const FIL = 'milo-fil'
const EN_ATTENTE = 'milo-question'
const EVENT = 'milo-fil'

function lire<T>(store: Storage | undefined, key: string, vide: T): T {
  try {
    const v = store?.getItem(key)
    return v ? (JSON.parse(v) as T) : vide
  } catch {
    return vide
  }
}
function ecrire(store: Storage | undefined, key: string, value: unknown): void {
  try {
    if (value === null) store?.removeItem(key)
    else store?.setItem(key, JSON.stringify(value))
  } catch {
    // Navigation privée stricte : le fil vit le temps de la page.
  }
}
const session = () => (typeof window === 'undefined' ? undefined : window.sessionStorage)
const local = () => (typeof window === 'undefined' ? undefined : window.localStorage)

export function useMilo(lieu: 'page' | 'fenetre') {
  const [messages, setMessages] = useState<MiloMessage[]>([])
  const [occupe, setOccupe] = useState(false)
  const [compte, setCompte] = useState<string | null>(null)

  const garder = useCallback((l: MiloMessage[]) => {
    setMessages(l)
    ecrire(session(), FIL, l.filter((m) => m.r).slice(-12))
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const envoyer = useCallback(async (question: string, avant: MiloMessage[]) => {
    const q = question.trim()
    if (q.length < 3) return
    const historique = avant.filter((m) => m.r).slice(-4).map((m) => ({ q: m.q, r: m.r?.reponse ?? '' }))
    const enCours = [...avant, { q }]
    setMessages(enCours)
    setOccupe(true)
    setCompte(null)
    const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, historique }) }).catch(() => null)
    const body = (await res?.json().catch(() => null)) as (MiloReponse & { ok: boolean; compte?: boolean; message?: string }) | null
    setOccupe(false)
    if (body?.compte) {
      ecrire(local(), EN_ATTENTE, q)
      setMessages(avant)
      setCompte(q)
      track('Assistant Signup Asked', { lieu })
      return
    }
    track('Assistant Question', { lieu })
    garder([...avant, body?.ok ? { q, r: body } : { q, erreur: body?.message ?? 'Pas de réponse pour l’instant. Réessaie dans un instant.' }])
  }, [garder, lieu])

  useEffect(() => {
    const charger = () => setMessages(lire<MiloMessage[]>(session(), FIL, []))
    const id = window.setTimeout(() => {
      charger()
      const attente = lire<string | null>(local(), EN_ATTENTE, null)
      if (attente && lieu === 'page') {
        ecrire(local(), EN_ATTENTE, null)
        void envoyer(attente, lire<MiloMessage[]>(session(), FIL, []))
      }
    }, 0)
    window.addEventListener(EVENT, charger)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener(EVENT, charger)
    }
  }, [envoyer, lieu])

  return {
    messages,
    occupe,
    compte,
    envoyer: (q: string) => (occupe ? undefined : void envoyer(q, messages)),
    effacer: () => garder([]),
  }
}
