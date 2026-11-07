'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconPaw } from '@/components/icons'
import { useAccountPrefill } from '@/components/outils/useAccountPrefill'
import { useInviteTracking, useSignedIn } from './useSignupInvite'

// @cdc CRO compte (maquette 1A) — compte de l'en-tête. Visiteur : bouton « Mon chien » vers la page qui présente
// l'espace (test du 2026-11-07, avant : « Créer un compte » vers l'inscription, 2 clics pour 881 vues), plus
// petit sous 375 px pour garder la marge du bord (« S'inscrire » sous 360 px, jamais sur deux lignes). Compte connecté (témoin tg_compte) :
// pastille à l'initiale du chien + « Mon chien ». Rendu serveur et hydratation : version
// visiteur, la page reste statique. Le prénom du chien vient de /api/compte/profil, déjà appelé
// par les outils (une requête par page, seulement avec le témoin).

const BUTTON =
  'inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-control px-3.5 text-[15px] font-semibold text-ink no-underline'

function SignedIn() {
  const dog = useAccountPrefill()
  const initial = dog?.name.trim().charAt(0).toUpperCase()
  return (
    <Link href="/compte" className={`${BUTTON} ml-auto gap-2 px-2 hover:bg-cream-2`}>
      <span aria-hidden="true" className="grid size-9 place-items-center rounded-pill bg-amber font-display text-base font-black text-ink">
        {initial || <IconPaw className="size-5" />}
      </span>
      <span className="hidden min-[360px]:inline">Mon chien</span>
    </Link>
  )
}

function Visitor() {
  const { ref, onClick } = useInviteTracking<HTMLAnchorElement>('header')
  return (
    <>
      <Link
        href="/compte/connexion"
        className="ml-auto hidden min-h-11 shrink-0 items-center whitespace-nowrap rounded-control px-3 text-[15px] font-semibold text-ink no-underline hover:bg-cream-2 xl:inline-flex"
      >
        Connexion
      </Link>
      <Link
        ref={ref}
        href="/mon-chien"
        onClick={onClick}
        data-cta="signup-header"
        className={`${BUTTON} ml-auto bg-orange shadow-[0_3px_0_var(--orange-ink)] hover:brightness-105 max-[374px]:px-2.5 max-[374px]:text-sm md:border-2 md:border-ink md:bg-paper md:shadow-none xl:ml-0`}
      >
        <IconPaw className="mr-1.5 size-5 max-[359px]:hidden" />
        Mon chien
      </Link>
    </>
  )
}

export function HeaderAccount() {
  const signedIn = useSignedIn()
  const pathname = usePathname()
  if (signedIn) return <SignedIn />
  // Pages du compte (inscription, connexion…) : pas de bouton vers la page où l'on est déjà.
  if (pathname.startsWith('/compte')) return null
  return <Visitor />
}
