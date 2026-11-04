'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef } from 'react'
import { IconCheck, IconClose } from '@/components/icons'
import { track } from '@/lib/analytics'
import { useGuideSignup } from '@/lib/guide/use-guide-signup'
import { pathBlocked, useGuidePopup } from '@/lib/guide/use-guide-popup'
import { rememberShown, setPopupOpen } from '@/lib/guide/popup-state'
import { GuideDownloadLink } from './GuideReady'
import { PopupForm } from './PopupForm'

// @cdc guide — panneau du guide (« popup »), règles d'ouverture dans lib/guide/use-guide-popup.ts.
// Mobile : panneau bas, 40 % de l'écran au plus, à la place de la barre d'onglets tant qu'il est ouvert
// (html[data-popup], globals.css), page visible et utilisable derrière (dialogue non modal : aria-modal="false", pas de piège du focus). Le focus va
// sur le titre à l'ouverture et revient où il était à la fermeture ; Échap ferme. Ordinateur :
// carte en bas à droite. Inscription : flux du guide (/api/contact, source « guide », place « popup »).

export function GuidePopup({ foodCount, recipeCount }: { foodCount: number; recipeCount: number }) {
  const id = useId()
  const pathname = usePathname()
  const [trigger, close] = useGuidePopup(pathname)
  const signup = useGuideSignup('popup')
  const titleRef = useRef<HTMLHeadingElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const open = trigger !== null

  useEffect(() => {
    if (!trigger) return
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    rememberShown()
    setPopupOpen(true)
    track('Guide Popup View', { trigger })
    titleRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      setPopupOpen(false)
      returnTo.current?.focus({ preventScroll: true })
    }
  }, [trigger, close])

  useEffect(() => {
    if (open && pathBlocked(pathname)) close()
  }, [open, pathname, close])

  if (!open) return null
  const done = signup.status === 'success'
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      className="v2 tg-sheet fixed inset-x-0 bottom-0 z-50 md:inset-x-auto md:right-4 md:bottom-4 md:w-[420px] print:hidden"
    >
      <div className="relative flex max-h-[40dvh] flex-col gap-2.5 overflow-y-auto rounded-t-card border-2 border-b-0 border-ink bg-paper px-4 pt-3.5 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-4px_0_var(--orange)] md:max-h-none md:rounded-card md:border-b-2 md:p-5 md:shadow-[5px_5px_0_var(--orange)]">
        <button
          type="button"
          onClick={close}
          aria-label="Fermer le panneau du guide"
          className="absolute top-1.5 right-1.5 grid size-11 place-items-center rounded-control text-ink hover:bg-cream-2"
        >
          <IconClose className="size-5" />
        </button>
        <div className="flex items-center gap-3 pr-10">
          <Image
            src="/guides/apercu-couverture.webp"
            alt=""
            width={480}
            height={679}
            sizes="48px"
            className="h-auto w-12 shrink-0 rounded-sm shadow-[3px_3px_0_var(--orange)]"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 id={`${id}-t`} ref={titleRef} tabIndex={-1} data-popup-title className="m-0 font-display text-lg font-black leading-tight text-ink outline-none">
              {done ? "C'est envoyé" : 'Le guide de la gamelle, gratuit'}
            </h2>
            <p id={`${id}-d`} className="m-0 text-sm leading-snug text-ink-2">
              {done
                ? 'Le guide arrive aussi par e-mail, pour le retrouver plus tard.'
                : `${foodCount} aliments classés, la page frigo à imprimer et ${recipeCount} recettes, en PDF.`}
            </p>
          </div>
        </div>
        {done ? (
          <div role="status" className="flex flex-col gap-2">
            <p className="m-0 flex items-center gap-2 text-sm font-semibold text-green-ink">
              <IconCheck className="size-5" />
              {`Inscription enregistrée pour ${signup.email}.`}
            </p>
            <GuideDownloadLink place="popup" />
          </div>
        ) : (
          <PopupForm signup={signup} />
        )}
      </div>
    </div>
  )
}
