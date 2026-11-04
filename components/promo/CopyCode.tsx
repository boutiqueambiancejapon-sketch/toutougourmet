'use client'

import { useState } from 'react'

// @cdc affiliation — code promo et bouton « Copier » (le code se tape chez Dog Chef à la fin d'un
// questionnaire). Si le navigateur refuse la copie, le texte « Sélectionne le code » prend le relais
// et le code reste sélectionnable d'un appui.

export function CopyCode({ code, onDark = false }: { code: string; onDark?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'refused'>('idle')

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setStatus('copied')
    } catch {
      setStatus('refused')
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className={`select-all rounded-box px-2 py-1 font-mono text-lg font-bold tracking-wider text-ink ${onDark ? 'bg-cream' : 'bg-cream-2'}`}>{code}</span>
      <button
        type="button"
        onClick={() => void copy()}
        className={`min-h-11 rounded-control border px-3 text-[15px] font-semibold ${onDark ? 'border-cream/60 text-cream hover:border-cream' : 'border-ink text-ink hover:bg-cream-2'}`}
      >
        {status === 'copied' ? 'Copié' : 'Copier'}
      </button>
      <span role="status" className={`text-sm empty:hidden ${onDark ? 'text-cream' : 'text-ink-2'}`}>
        {status === 'refused' ? 'Sélectionne le code pour le copier.' : ''}
      </span>
    </span>
  )
}
