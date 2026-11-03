'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'
import { isDisposableRejection } from '@/lib/subscribe-client'
import { GUIDE_SOURCE, type GuidePlace } from './config'
import { rememberSubscribed } from './popup-state'

// @cdc guide — envoi de l'inscription au guide vers /api/contact (source « guide ») : partagé par
// la page /guide-alimentation, les encarts d'article et le panneau. Succès mesuré : Guide Signup +
// place ; l'inscription est mémorisée (le panneau du guide ne s'ouvre plus).

export type GuideSignupStatus = 'idle' | 'loading' | 'success' | 'error' | 'disposable'

export function useGuideSignup(place: GuidePlace, article?: string) {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<GuideSignupStatus>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: GUIDE_SOURCE, website }),
      })
      if (await isDisposableRejection(res)) return setStatus('disposable')
      if (!res.ok) throw new Error(String(res.status))
      setStatus('success')
      rememberSubscribed()
      track('Guide Signup', article ? { place, article } : { place })
    } catch {
      setStatus('error')
    }
  }

  return { email, setEmail, website, setWebsite, status, submit }
}
