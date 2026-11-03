import Link from 'next/link'
import type { ReactNode } from 'react'
import { IconChevron } from '@/components/icons'

// @cdc compte — titre de page de l'espace compte : lien retour éventuel, H1, chapô, action à droite.

interface PageHeadingProps {
  title: string
  lead?: ReactNode
  back?: { href: string; label: string }
  action?: ReactNode
}

export function PageHeading({ title, lead, back, action }: PageHeadingProps) {
  return (
    <header className="flex flex-col gap-2">
      {back ? (
        <Link href={back.href} className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-orange-ink no-underline hover:underline">
          <IconChevron className="size-4 rotate-180" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-display text-3xl font-black leading-tight tracking-tight text-ink">{title}</h1>
        {action}
      </div>
      {lead ? <div className="text-base leading-relaxed text-ink-2 [&_p]:m-0">{lead}</div> : null}
    </header>
  )
}
