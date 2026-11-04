'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useId, useState, useSyncExternalStore } from 'react'
import { hasSessionHint } from '@/lib/account-hint'
import { track } from '@/lib/analytics'
import { rememberSubscribed } from '@/lib/guide/popup-state'
import { DISPOSABLE_MESSAGE, isDisposableRejection } from '@/lib/subscribe-client'

// @cdc 04-pages — « Garder ce résultat » sous les outils sans carte compte (budget, coût) :
// inscription à la lettre par /api/contact.
// En cas d'erreur, l'adresse tapée et le résultat restent à l'écran.
// Lot 4 : sous le formulaire, lien vers la création de compte (masqué si un compte est connecté).

const noop = () => () => {}

interface KeepResultProps {
  /** Nom court de l'outil, envoyé comme `source` et dans l'événement `tool-<nom>` */
  tool: string
  /** Résumé lisible du résultat, repris dans l'objet du message */
  summary: string
  /** Invitation à créer un compte propre à l'outil (lien, phrase qui suit, page de retour) */
  invite?: { label: string; text: string; retour?: string }
  /** Faux quand une carte d'inscription est déjà posée à côté (components/cro/ToolSignupCard) */
  accountLink?: boolean
}

function request(email: string, tool: string, summary: string): Promise<Response> {
  return fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, _subject: `Résultat ${tool} : ${summary}`, source: tool }),
  })
}

export function KeepResult({ tool, summary, invite, accountLink = true }: KeepResultProps) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'disposable'>('idle')
  const pathname = usePathname()
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await request(email, tool, summary)
      if (await isDisposableRejection(res)) return setStatus('disposable')
      if (!res.ok) throw new Error(String(res.status))
      setStatus('success')
      rememberSubscribed()
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
          Laisse ton e-mail, on t&apos;envoie ce résultat pour l&apos;avoir sous la main.
        </p>
      </div>
      {status === 'success' ? (
        <p role="status" className="m-0 text-base text-ink">
          <strong className="font-semibold">C&apos;est noté.</strong> {`On t'écrit à ${email}.`}
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
      {status === 'disposable' ? (
        <p role="alert" className="m-0 text-sm text-rose-ink">
          {DISPOSABLE_MESSAGE}
        </p>
      ) : null}
      {status === 'error' ? (
        <p role="alert" className="m-0 text-sm text-ink">
          L&apos;envoi n&apos;est pas passé. Ton résultat reste affiché au-dessus : réessaie dans un moment.
        </p>
      ) : null}
      {status !== 'success' ? (
        <p className="m-0 text-xs text-ink-2">On ne transmet ton e-mail à personne.</p>
      ) : null}
      {signedIn || !accountLink ? null : (
        <p className="m-0 border-t border-line pt-3 text-[15px] text-ink-2">
          <Link
            href={`/compte/inscription?retour=${encodeURIComponent(invite?.retour ?? pathname)}`}
            className="font-semibold text-orange-ink underline underline-offset-2"
          >
            {invite?.label ?? 'Crée un compte pour garder ses résultats'}
          </Link>
          {invite?.text ?? '. Le profil de ton chien remplit les outils à ta place et tu suis son poids.'}
        </p>
      )}
    </section>
  )
}
