'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MiloAvatar } from './MiloAvatar'

// @cdc assistant — petite fenêtre de Milo sur les pages du site (décision du propriétaire du 2026-11-07). La
// discussion ne se charge qu'à l'ouverture. Masquée sur /assistant, sur l'inscription et la connexion, et quand le
// bandeau partenaire ou le panneau du guide occupe le bas de l'écran (globals.css, [data-milo]).

const MiloChat = dynamic(() => import('./MiloChat').then((m) => m.MiloChat), { ssr: false })
const CACHEE = /^\/(assistant|compte\/(inscription|connexion|mot-de-passe-oublie|nouveau-mot-de-passe))/

export function MiloFenetre() {
  const pathname = usePathname()
  const [ouvert, setOuvert] = useState(false)
  if (CACHEE.test(pathname)) return null
  return (
    <div data-milo className="v2 print:hidden">
      {ouvert ? (
        <div role="dialog" aria-label="Milo, l'assistant de Toutou Gourmet" className="fixed inset-x-2 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+8px)] z-50 flex h-[min(560px,calc(100dvh-var(--tabbar-h)-96px))] flex-col gap-3 rounded-card border-2 border-ink bg-cream p-3 shadow-[5px_5px_0_var(--orange)] md:inset-x-auto md:right-4 md:bottom-4 md:h-[min(600px,calc(100dvh-32px))] md:w-[400px]">
          <header className="flex shrink-0 items-center gap-2.5 border-b border-line pb-2.5">
            <MiloAvatar size={40} />
            <div className="flex min-w-0 grow flex-col">
              <p className="m-0 font-display text-lg font-black leading-tight text-ink">Milo</p>
              <p className="m-0 truncate text-xs text-ink-2">Le Shiba de Toutou Gourmet</p>
            </div>
            <Link href="/assistant" className="text-xs font-semibold text-ink underline underline-offset-2">Agrandir</Link>
            <button type="button" onClick={() => setOuvert(false)} aria-label="Fermer" className="flex size-10 items-center justify-center rounded-full text-xl text-ink hover:bg-cream-2">×</button>
          </header>
          <div className="min-h-0 grow"><MiloChat compact /></div>
        </div>
      ) : (
        <button type="button" onClick={() => setOuvert(true)} className="fixed right-3 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+12px)] z-40 flex min-h-12 items-center gap-2 rounded-pill border-2 border-ink bg-paper py-1 pr-4 pl-1 font-semibold text-ink shadow-[3px_3px_0_var(--orange)] md:right-5 md:bottom-5">
          <MiloAvatar size={40} />
          <span className="whitespace-nowrap text-sm">Demande à Milo</span>
        </button>
      )}
    </div>
  )
}
