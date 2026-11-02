'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { track } from '@/lib/analytics'
import { IconAlert } from '@/components/icons'

// @cdc 04-pages — bonus lié au contenu (audit design-cro §3 « Article ») : la fiche des aliments
// dangereux contre l'e-mail. Seul formulaire e-mail de l'article (remplace NewsletterBlock).
// En cas d'erreur serveur, le lien vers la fiche reste affiché : le lecteur n'y perd rien.

const FICHE_HREF = '/fiche-aliments-dangereux'

interface BonusFicheProps {
  slug: string
  dangerCount: number
  moderationCount: number
}

export function BonusFiche({ slug, dangerCount, moderationCount }: BonusFicheProps) {
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
        body: JSON.stringify({ email, _subject: 'Bonus fiche aliments dangereux', source: slug }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('success')
      track('Newsletter Signup', { place: 'bonus-fiche', article: slug })
    } catch {
      setStatus('error')
    }
  }

  const ficheLink = (
    <Link href={FICHE_HREF} className="font-semibold text-ink underline underline-offset-2">
      Ouvrir la fiche à imprimer
    </Link>
  )

  return (
    <section aria-labelledby={`${id}-t`} className="v2 mt-10 flex flex-col gap-4 rounded-card bg-cream-2 p-5 md:p-7">
      <div className="flex items-start gap-3">
        <IconAlert className="size-10 text-ink" />
        <div className="flex min-w-0 flex-col gap-2">
          <h2 id={`${id}-t`} className="m-0 font-display text-xl font-black leading-tight text-ink md:text-2xl">
            La liste des aliments dangereux pour le chien, en fiche à imprimer
          </h2>
          <p className="m-0 text-[15px] leading-relaxed text-ink-2">
            Une page A4 avec les {dangerCount} aliments dangereux, les {moderationCount} à donner avec modération et
            les numéros des centres antipoison. À coller sur le frigo.
          </p>
        </div>
      </div>

      {status === 'success' ? (
        <p role="status" className="m-0 text-base text-ink">
          <strong className="font-semibold">C&apos;est noté.</strong> {ficheLink}
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
            className="min-h-11 min-w-0 grow rounded-control border border-line bg-paper px-3 text-base text-ink"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="min-h-11 shrink-0 rounded-control bg-orange px-5 text-[15px] font-semibold text-ink disabled:opacity-60"
          >
            {status === 'loading' ? 'Envoi…' : 'Recevoir la fiche'}
          </button>
        </form>
      )}

      {status === 'error' ? (
        <p role="alert" className="m-0 text-sm text-ink">
          L&apos;inscription n&apos;est pas passée, réessaie plus tard. La fiche reste accessible : {ficheLink}
        </p>
      ) : null}
      {status !== 'success' ? (
        <p className="m-0 text-xs text-ink-2">
          On ne transmet ton e-mail à personne.
        </p>
      ) : null}
    </section>
  )
}
