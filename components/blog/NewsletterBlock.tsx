'use client'

import { useState } from 'react'

interface NewsletterBlockProps {
  title?: string
  description?: string
}

export function NewsletterBlock({
  title = 'Rejoins la meute 🐾',
  description = 'Comparatifs, promos et conseils nutrition — sans blabla, sans spam.',
}: NewsletterBlockProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      setErrorMsg('Oups, cet email ne semble pas valide.')
      return
    }
    setStatus('loading')
    const res = await fetch('https://formspree.io/f/xaqpdpqd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, _subject: 'Nouvelle inscription newsletter' }),
    })
    setStatus(res.ok ? 'success' : 'error')
  }

  return (
    <section className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 text-center">
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
        {title}
      </h2>
      <p className="text-[var(--text-secondary)] mb-6 text-sm">{description}</p>

      {status === 'success' ? (
        <p className="text-[var(--accent-3)] font-semibold">
          T&apos;es dans la meute ! Check ta boîte mail pour confirmer.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
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
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-1)]"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary whitespace-nowrap"
          >
            {status === 'loading' ? 'Envoi...' : "Je m'abonne"}
          </button>
        </form>
      )}
      {errorMsg && <p className="text-sm text-[var(--error)] mt-2">{errorMsg}</p>}
      {status === 'error' && <p className="text-sm text-[var(--error)] mt-2">Une erreur est survenue, réessaie.</p>}
      <p className="text-xs text-[var(--text-muted)] mt-3">
        Double opt-in, désabonnement en 1 clic. Pas de spam.
      </p>
    </section>
  )
}
