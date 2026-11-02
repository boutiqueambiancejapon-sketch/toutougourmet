'use client'

import { useId, useState } from 'react'
import { track } from '@/lib/analytics'

// @cdc 04-pages — « Garder ce résultat » sous chaque outil (audit design-cro §3 Outils) :
// e-mail seul, même route que BonusFiche (/api/contact, Formspree aujourd'hui, Brevo demain).
// En cas d'erreur, l'adresse tapée et le résultat restent à l'écran.

interface KeepResultProps {
  /** Nom court de l'outil, envoyé comme `source` et dans l'événement `tool-<nom>` */
  tool: string
  /** Résumé lisible du résultat, repris dans l'objet du message */
  summary: string
}

export function KeepResult({ tool, summary }: KeepResultProps) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _subject: `Résultat ${tool} : ${summary}`, source: tool }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('success')
      track('Newsletter Signup', { place: `tool-${tool}` })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section aria-labelledby={`${id}-t`} className="flex flex-col gap-3 rounded-box bg-cream-2 p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <h3 id={`${id}-t`} className="m-0 font-display text-xl font-black leading-tight text-ink">
          Garder ce résultat
        </h3>
        <p className="m-0 text-[15px] leading-relaxed text-ink-2">
          Laisse ton e-mail, on t&apos;envoie ce calcul pour l&apos;avoir sous la main.
        </p>
      </div>
      {status === 'success' ? (
        <p role="status" className="m-0 text-base text-ink">
          <strong className="font-semibold">C&apos;est noté.</strong> On t&apos;écrit à {email}.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor={`${id}-email`} className="sr-only">
            Ton adresse e-mail
          </label>
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            placeholder="ton@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-12 min-w-0 grow rounded-control border border-line bg-paper px-3 text-base text-ink"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="min-h-12 shrink-0 rounded-control bg-orange px-5 text-[15px] font-semibold text-ink disabled:opacity-60"
          >
            {status === 'loading' ? 'Envoi…' : 'Recevoir mon résultat'}
          </button>
        </form>
      )}
      {status === 'error' ? (
        <p role="alert" className="m-0 text-sm text-ink">
          L&apos;envoi n&apos;est pas passé. Ton résultat reste affiché au-dessus : réessaie dans un moment.
        </p>
      ) : null}
      {status !== 'success' ? <p className="m-0 text-xs text-ink-2">On ne transmet ton e-mail à personne.</p> : null}
    </section>
  )
}
