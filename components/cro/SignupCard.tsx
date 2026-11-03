'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useId } from 'react'
import { IconCheck, type IconProps } from '@/components/icons'
import { signupHref, type SignupPlace } from '@/lib/signup-places'
import { useInviteTracking, useSignedIn } from './useSignupInvite'

// @cdc CRO compte (maquettes 2A et 3A) — carte d'invitation à créer un compte : icône, titre,
// phrase, coches facultatives, bouton pleine largeur (jamais sur deux lignes). Masquée quand un
// compte est connecté. Vue et clic mesurés avec l'emplacement, qui suit jusqu'à l'inscription.

export interface SignupCardProps {
  place: SignupPlace
  title: string
  text: string
  cta: string
  Icon: (props: IconProps) => React.JSX.Element
  checks?: string[]
  /** Page où revenir après l'inscription (par défaut : la page courante) */
  retour?: string
  /** Ligne « Gratuit, sans carte bancaire… » sous le bouton */
  reassurance?: boolean
  className?: string
}

export function SignupCard({ place, title, text, cta, Icon, checks, retour, reassurance = false, className = '' }: SignupCardProps) {
  const id = useId()
  const pathname = usePathname()
  const signedIn = useSignedIn()
  const { ref, onClick } = useInviteTracking<HTMLElement>(place, !signedIn)
  if (signedIn) return null
  return (
    <aside
      ref={ref}
      aria-labelledby={`${id}-t`}
      data-cta={`signup-${place}`}
      className={`v2 flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-4 shadow-[5px_5px_0_var(--orange)] sm:p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-box bg-amber text-ink">
          <Icon className="size-[22px]" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p id={`${id}-t`} className="m-0 font-display text-xl font-black leading-tight text-ink">
            {title}
          </p>
          <p className="m-0 text-[15px] leading-relaxed text-ink-2">{text}</p>
        </div>
      </div>
      {checks?.length ? (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px] text-ink">
          {checks.map((c) => (
            <li key={c} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-green text-green-ink">
                <IconCheck className="size-4" />
              </span>
              {c}
            </li>
          ))}
        </ul>
      ) : null}
      <Link
        href={signupHref(place, retour ?? pathname)}
        onClick={onClick}
        className="flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-control bg-orange px-4 text-[15px] font-semibold text-ink no-underline shadow-[0_3px_0_var(--orange-ink)] hover:brightness-105"
      >
        {cta}
      </Link>
      {reassurance ? (
        <p className="m-0 text-center text-[13px] text-ink-2">Gratuit, sans carte bancaire. Suppression en un clic.</p>
      ) : null}
    </aside>
  )
}
