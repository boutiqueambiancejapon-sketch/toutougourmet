'use client'

import { useId, useState } from 'react'
import { IconDownload } from '@/components/icons'
import { track } from '@/lib/analytics'
import { DISPOSABLE_MESSAGE, isDisposableRejection } from '@/lib/subscribe-client'

// @cdc fiche de garde — modèle vierge à imprimer contre un e-mail : inscription à la lettre par
// /api/contact (source « fiche-garde-vierge », adresses jetables refusées), puis lien du PDF.

export const TEMPLATE_SOURCE = 'fiche-garde-vierge'
export const TEMPLATE_HREF = '/outils/fiche-de-garde/modele.pdf'

export function TemplateOffer() {
  const id = useId()
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'disposable'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: TEMPLATE_SOURCE, website }),
      })
      if (await isDisposableRejection(res)) return setStatus('disposable')
      if (!res.ok) throw new Error(String(res.status))
      setStatus('success')
      track('Newsletter Signup', { place: TEMPLATE_SOURCE })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col gap-3">
        <p className="m-0 text-base text-ink">C&apos;est noté. Le modèle est prêt :</p>
        <a
          href={TEMPLATE_HREF}
          onClick={() => track('Sitter Template Download', { place: 'outil' })}
          className="inline-flex min-h-12 items-center justify-center gap-2 self-start whitespace-nowrap rounded-control bg-ink px-5 text-base font-semibold text-cream no-underline hover:underline"
        >
          <IconDownload className="size-5" />
          Télécharger le PDF
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
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
          className="min-h-12 min-w-0 grow rounded-control border-2 border-ink bg-paper px-3 text-base text-ink"
        />
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="min-h-12 shrink-0 whitespace-nowrap rounded-control bg-orange px-5 text-base font-semibold text-ink disabled:opacity-60"
        >
          {status === 'loading' ? 'Envoi…' : 'Recevoir le modèle'}
        </button>
      </div>
      {status === 'disposable' ? (
        <p role="alert" className="m-0 text-sm text-rose-ink">
          {DISPOSABLE_MESSAGE}
        </p>
      ) : null}
      {status === 'error' ? (
        <p role="alert" className="m-0 text-sm text-ink">
          L&apos;envoi n&apos;est pas passé. Réessaie dans un moment.
        </p>
      ) : null}
      <p className="m-0 text-xs text-ink-2">Tu reçois aussi la lettre mensuelle de Toutou Gourmet, désinscription en un clic. On ne transmet ton e-mail à personne.</p>
    </form>
  )
}
