'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser'
import { callLogin, type LoginReply } from './client'

// @cdc tableau de bord — dialogue avec Face ID. Safari annule la demande si trop de temps passe
// entre le toucher et l'appel : bibliothèque et défi sont donc prêts dès l'affichage de l'écran,
// et le bouton appelle Face ID sans attendre. null = fenêtre du système annulée ou clé impossible.

const FRESH_MS = 4 * 60_000

interface Prepared {
  reply: LoginReply
  browser: typeof import('@simplewebauthn/browser') | null
  at: number
}

async function prepare(action: string): Promise<Prepared> {
  try {
    const [reply, browser] = await Promise.all([callLogin(action), import('@simplewebauthn/browser')])
    return { reply, browser, at: Date.now() }
  } catch {
    return { reply: { ok: false, error: 'unavailable' }, browser: null, at: Date.now() }
  }
}

/**
 * take() rend ce qui est prêt. Une annulation ne consomme pas le défi : il resservira tel quel.
 * refresh() en demande un autre après une réponse du serveur, qui, elle, l'a consommé.
 */
export function usePreparedPasskey(action: 'cle-directe-options' | 'cle-options' | 'enrol-cle-options', enabled = true) {
  const ready = useRef<Promise<Prepared> | null>(null)
  useEffect(() => {
    if (enabled && !ready.current) ready.current = prepare(action)
  }, [action, enabled])
  const refresh = useCallback(() => {
    ready.current = prepare(action)
  }, [action])
  const take = useCallback(async (): Promise<Prepared> => {
    const current = ready.current ? await ready.current : null
    if (current && Date.now() - current.at < FRESH_MS) return current
    const fresh = prepare(action)
    ready.current = fresh
    return fresh
  }, [action])
  return { take, refresh }
}

export async function addPasskey(ready: Prepared): Promise<LoginReply | null> {
  if (!ready.reply.ok || !ready.browser) return ready.reply
  try {
    const response = await ready.browser.startRegistration({ optionsJSON: ready.reply.options as PublicKeyCredentialCreationOptionsJSON })
    return await callLogin('enrol-cle-verifier', { response })
  } catch {
    return null
  }
}

export async function signInWithPasskey(ready: Prepared, next: string, verify: 'cle-directe' | 'cle-verifier' = 'cle-verifier'): Promise<LoginReply | null> {
  if (!ready.reply.ok || !ready.browser) return ready.reply
  try {
    const response = await ready.browser.startAuthentication({ optionsJSON: ready.reply.options as PublicKeyCredentialRequestOptionsJSON })
    return await callLogin(verify, { response, next })
  } catch {
    return null
  }
}
