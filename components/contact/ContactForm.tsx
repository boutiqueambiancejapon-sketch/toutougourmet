'use client'

// @cdc contact — formulaire Formspree · isolé en client component

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('https://formspree.io/f/xaqpdpqd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-4"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Ton prénom
        </label>
        <input
          id="name"
          type="text"
          name="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-1)]"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Ton email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-1)]"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Ton message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-1)] resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-[var(--error)]">
          Une erreur est survenue. Réessaie ou écris-nous directement.
        </p>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn-primary">
        {status === 'loading' ? 'Envoi…' : 'Envoyer →'}
      </button>
    </form>
  )
}
