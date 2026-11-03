'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'
import { DISPOSABLE_MESSAGE, isDisposableRejection } from '@/lib/subscribe-client'

interface NewsletterBlockProps {
  title?: string
  description?: string
}

export function NewsletterBlock({
  title = 'Un e-mail quand un guide sort',
  description = 'Les nouveaux guides, de temps en temps, et les offres des marques partenaires quand elles valent le coup.',
}: NewsletterBlockProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'disposable'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      setErrorMsg('Cette adresse e-mail n\'a pas l\'air valide.')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _subject: 'Nouvelle inscription newsletter' }),
      })
      if (await isDisposableRejection(res)) return setStatus('disposable')
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) track('Newsletter Signup', { place: title })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="v2 flex flex-col gap-3 rounded-card bg-cream-2 p-6 md:p-8">
      <h2 className="m-0 font-display text-2xl font-black text-ink">
        {title}
      </h2>
      <p className="m-0 max-w-prose text-[15px] text-ink-2">{description}</p>

      {status === 'success' ? (
        <p className="m-0 font-semibold text-green-ink">
          C&apos;est noté, tu recevras le prochain guide.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Ton adresse email
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="ton@email.fr"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMsg('') }}
              required
              className="min-h-12 w-full rounded-control border-2 border-ink bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-2 focus-visible:ring-4 focus-visible:ring-amber"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="min-h-12 whitespace-nowrap rounded-control bg-orange px-5 font-semibold text-ink hover:underline disabled:opacity-60"
          >
            {status === 'loading' ? 'Envoi…' : "Je m'abonne"}
          </button>
        </form>
      )}
      {errorMsg && <p className="m-0 text-sm text-rose-ink">{errorMsg}</p>}
      {status === 'disposable' ? (
        <p role="alert" className="m-0 text-sm text-rose-ink">
          {DISPOSABLE_MESSAGE}
        </p>
      ) : null}
      {status === 'error' && <p className="m-0 text-sm text-rose-ink">L&apos;inscription n&apos;est pas passée, réessaie dans un instant.</p>}
      <p className="m-0 text-xs text-ink-2">
        Un lien en bas de chaque e-mail pour te désinscrire.
      </p>
    </section>
  )
}
