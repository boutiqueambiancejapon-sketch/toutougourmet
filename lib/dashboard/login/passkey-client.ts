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
  browser: typeof import('@simplewebauthn/browser')
  at: number
}

async function prepare(action: string): Promise<Prepared> {
  const [reply, browser] = await Promise.all([callLogin(action), import('@simplewebauthn/browser')])
  return { reply, browser, at: Date.now() }
}

/** take() rend ce qui est prêt, ou le prépare si ce n'est plus frais, puis relance une préparation. */
export function usePreparedPasskey(action: 'cle-options' | 'enrol-cle-options', enabled = true): () => Promise<Prepared> {
  const ready = useRef<Promise<Prepared> | null>(null)
  useEffect(() => {
    if (enabled && !ready.current) ready.current = prepare(action)
  }, [action, enabled])
  return useCallback(async () => {
    const current = ready.current ? await ready.current : null
    ready.current = null
    return current && Date.now() - current.at < FRESH_MS ? current : prepare(action)
  }, [action])
}

export async function addPasskey(ready: Prepared): Promise<LoginReply | null> {
  if (!ready.reply.ok) return ready.reply
  try {
    const response = await ready.browser.startRegistration({ optionsJSON: ready.reply.options as PublicKeyCredentialCreationOptionsJSON })
    return await callLogin('enrol-cle-verifier', { response })
  } catch {
    return null
  }
}

export async function signInWithPasskey(ready: Prepared, next: string): Promise<LoginReply | null> {
  if (!ready.reply.ok) return ready.reply
  try {
    const response = await ready.browser.startAuthentication({ optionsJSON: ready.reply.options as PublicKeyCredentialRequestOptionsJSON })
    return await callLogin('cle-verifier', { response, next })
  } catch {
    return null
  }
}
