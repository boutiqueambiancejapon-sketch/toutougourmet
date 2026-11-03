'use client'

import { useId } from 'react'
import { DISPOSABLE_MESSAGE } from '@/lib/subscribe-client'
import type { useGuideSignup } from '@/lib/guide/use-guide-signup'

// @cdc guide — champ e-mail + bouton « Recevoir le guide gratuit » (maquette validée), mention
// Brevo exacte, champ piège « website » caché. Bouton jamais sur deux lignes : libellé court
// sous 384 px.

type Signup = ReturnType<typeof useGuideSignup>

export const BUTTON_CLASS =
  'flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-control px-4 text-base font-semibold no-underline'

export function GuideForm({ signup, row = false }: { signup: Signup; row?: boolean }) {
  const id = useId()
  const { email, setEmail, website, setWebsite, status, submit } = signup
  return (
    <div className="flex flex-col gap-2.5">
      <form onSubmit={submit} className={`flex flex-col gap-2.5 ${row ? 'sm:flex-row' : ''}`}>
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
          className="min-h-12 min-w-0 grow rounded-control border-2 border-ink bg-paper px-3.5 text-base text-ink"
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
          className={`${BUTTON_CLASS} bg-orange text-ink shadow-[0_3px_0_var(--orange-ink)] disabled:opacity-60 ${row ? 'sm:w-auto sm:shrink-0' : ''}`}
        >
          {status === 'loading' ? (
            'Envoi…'
          ) : (
            <>
              <span className="min-[384px]:hidden">Recevoir le guide</span>
              <span className="hidden min-[384px]:inline">Recevoir le guide gratuit</span>
            </>
          )}
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
      <p className={`m-0 text-[13px] text-ink-2 ${row ? '' : 'text-center'}`}>
        Tu reçois le guide et notre lettre mensuelle. Désinscription en un clic.
      </p>
    </div>
  )
}
