'use client'

import { useId } from 'react'
import { DISPOSABLE_MESSAGE } from '@/lib/subscribe-client'
import type { useGuideSignup } from '@/lib/guide/use-guide-signup'

// @cdc guide — formulaire compact du guide (panneau et haut d'article) : champ e-mail et bouton
// « Recevoir le guide » sur une seule ligne dès 320 px, champ piège « website » caché, mention de
// la lettre sous le champ.

type Signup = ReturnType<typeof useGuideSignup>

export function PopupForm({ signup }: { signup: Signup }) {
  const id = useId()
  const { email, setEmail, website, setWebsite, status, submit } = signup
  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={submit} className="flex gap-2">
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
          className="min-h-11 min-w-0 grow rounded-control border-2 border-ink bg-paper px-3 text-base text-ink"
        />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="min-h-11 shrink-0 whitespace-nowrap rounded-control bg-orange px-3.5 text-[15px] font-semibold text-ink shadow-[0_3px_0_var(--orange-ink)] disabled:opacity-60"
        >
          {status === 'loading' ? 'Envoi…' : 'Recevoir le guide'}
        </button>
      </form>
      {status === 'disposable' ? (
        <p role="alert" className="m-0 text-sm text-rose-ink">
          {DISPOSABLE_MESSAGE}
        </p>
      ) : null}
      {status === 'error' ? (
        <p role="alert" className="m-0 text-sm text-rose-ink">
          L&apos;inscription n&apos;est pas passée. Réessaie dans quelques minutes.
        </p>
      ) : null}
      <p className="m-0 text-xs text-ink-2">Tu reçois aussi notre lettre mensuelle. Désinscription en un clic.</p>
    </div>
  )
}
