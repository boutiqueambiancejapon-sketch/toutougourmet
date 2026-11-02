'use client'

import { useId, useState } from 'react'

// @cdc lot 6 — signaler une erreur de lecture (AI Act). Repliable pour ne pas alourdir le résultat.

export function ReportError({ analysisId }: { analysisId: string }) {
  const id = useId()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const res = await fetch('/api/scanner/signaler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId, message }),
    }).catch(() => null)
    setStatus(res?.ok ? 'sent' : 'error')
  }

  if (status === 'sent') {
    return (
      <p role="status" className="m-0 text-[15px] text-ink">
        Merci, la rédaction va vérifier cette fiche.
      </p>
    )
  }

  return (
    <details className="rounded-box bg-cream-2 p-3">
      <summary className="min-h-11 cursor-pointer content-center text-[15px] font-semibold text-ink">Signaler une erreur de lecture</summary>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 pt-2">
        <label htmlFor={`${id}-msg`} className="text-sm text-ink-2">
          Quel chiffre ou quel ingrédient est faux ? Indique la bonne valeur si tu l&apos;as.
        </label>
        <textarea
          id={`${id}-msg`}
          required
          minLength={3}
          maxLength={1000}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-control border-2 border-ink bg-paper p-3 text-base text-ink outline-none focus-visible:ring-4 focus-visible:ring-amber"
        />
        <button type="submit" disabled={status === 'sending'} className="min-h-11 self-start rounded-control bg-ink px-4 text-[15px] font-semibold text-cream disabled:opacity-60">
          {status === 'sending' ? 'Envoi…' : 'Envoyer le signalement'}
        </button>
        {status === 'error' ? (
          <p role="alert" className="m-0 text-sm text-rose-ink">
            Le signalement n&apos;est pas parti. Réessaie dans un instant.
          </p>
        ) : null}
      </form>
    </details>
  )
}
