'use client'

// @cdc contact — formulaire envoyé à /api/contact (base maison) · isolé en client component

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'invalid' | 'busy' | 'unavailable'

const ERRORS: Record<'invalid' | 'busy' | 'unavailable', string> = {
  invalid: 'Vérifie ton adresse e-mail et ton message (10 caractères au moins).',
  busy: 'Trop d’envois d’affilée. Réessaie dans quelques minutes.',
  unavailable: 'Le formulaire est indisponible, réessaie plus tard.',
}

const FIELD =
  'w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-1)]'
const LABEL = 'block text-sm font-medium text-[var(--text-primary)] mb-1'

function statusOf(code: number): Status {
  if (code >= 200 && code < 300) return 'success'
  if (code === 400) return 'invalid'
  if (code === 429) return 'busy'
  return 'unavailable'
}

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, page: window.location.pathname }),
        cache: 'no-store',
      })
      setStatus(statusOf(res.status))
    } catch {
      setStatus('unavailable')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-[var(--bg-surface-2)] border border-[var(--accent-3)] rounded-[var(--radius-xl)] p-8 text-center">
        <span className="text-4xl block mb-3">🐾</span>
        <p className="font-bold text-[var(--text-primary)] text-lg mb-1">Message envoyé !</p>
        <p className="text-[var(--text-secondary)] text-sm">
          On reviendra vers toi dans les meilleurs délais.
        </p>
      </div>
    )
  }

  const error = status === 'invalid' || status === 'busy' || status === 'unavailable' ? ERRORS[status] : null

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-4"
    >
      <div>
        <label htmlFor="name" className={LABEL}>
          Ton prénom
        </label>
        <input
          id="name"
          type="text"
          name="name"
          required
          maxLength={80}
          autoComplete="given-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={FIELD}
        />
      </div>
      <div>
        <label htmlFor="email" className={LABEL}>
          Ton email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          maxLength={254}
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={FIELD}
        />
      </div>
      <div>
        <label htmlFor="message" className={LABEL}>
          Ton message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${FIELD} resize-none`}
        />
      </div>
      {/* Champ piège : invisible pour les humains, rempli par les robots. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="website">Site web</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-[var(--error)]">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn-primary">
        {status === 'loading' ? 'Envoi…' : 'Envoyer →'}
      </button>
    </form>
  )
}
