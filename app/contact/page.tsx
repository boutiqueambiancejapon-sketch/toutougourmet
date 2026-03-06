'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: intégrer Resend
    setSent(true)
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[560px] mx-auto">
        <h1 className="page-title mb-3">
          Contact
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Une question, un retour, une idée d&apos;article ? On lit tout.
        </p>

        {sent ? (
          <div className="bg-[var(--bg-surface-2)] border border-[var(--accent-3)] rounded-[var(--radius-xl)] p-8 text-center">
            <span className="text-4xl block mb-3">🐾</span>
            <p className="font-bold text-[var(--text-primary)] text-lg mb-1">Message envoyé !</p>
            <p className="text-[var(--text-secondary)] text-sm">
              On reviendra vers toi dans les meilleurs délais.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Ton prénom
              </label>
              <input
                id="name"
                type="text"
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
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-1)] resize-none"
              />
            </div>
            <button type="submit" className="btn-primary">
              Envoyer →
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
