import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { IconChevron } from '@/components/icons'
import { TOOLS } from '@/components/outils/tool-list'

export const metadata: Metadata = {
  title: { absolute: 'Calculateurs pour chien : ration, poids, budget, âge' },
  description:
    'Ration journalière en grammes, budget mensuel par marque, poids de forme et âge humain : des calculateurs gratuits pour nourrir ton chien.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils' },
  openGraph: {
    title: 'Calculateurs pour chien : ration, poids, budget, âge',
    description: 'Ration journalière en grammes, budget mensuel par marque, poids de forme et âge humain : des calculateurs gratuits pour nourrir ton chien.',
    url: 'https://www.toutou-gourmet.com/outils',
    type: 'website',
  },
}

// @cdc 04-pages — hub Outils V2 : la liste de tous les outils d'abord (le propriétaire arrivait
// sur le calculateur de ration et croyait être sur la page ration). La ration a sa page (/outils/ration).
export default function OutilsPage() {
  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-8 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <div className="flex flex-col gap-4">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Outils' }]} />
        <header className="flex max-w-prose flex-col gap-2">
          <h1 className="m-0 font-display text-[clamp(1.9rem,4.2vw,2.8rem)] font-black leading-[1.05] tracking-tight text-ink">
            Les calculateurs pour bien nourrir ton chien
          </h1>
          <p className="m-0 text-lg leading-relaxed text-ink-2">
            Gratuits, chacun avec sa formule et ses sources. Seul le scanner demande un compte.
          </p>
        </header>
      </div>

      <section aria-labelledby="tous-outils" className="flex max-w-prose flex-col gap-2">
        <h2 id="tous-outils" className="m-0 font-display text-2xl font-black text-ink">
          Tous les outils
        </h2>
        <ul role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
          {TOOLS.map(({ slug, href, question, name, detail, Icon }) => (
            <li key={slug}>
              <Link href={href} className="group flex min-h-16 items-center gap-4 py-4 text-ink no-underline">
                <Icon className="size-10" />
                <span className="flex min-w-0 grow flex-col gap-0.5">
                  <span className="font-display text-lg font-black leading-snug group-hover:underline">{question}</span>
                  <span className="text-[15px] text-ink-2">{`${name}. ${detail}`}</span>
                </span>
                <IconChevron className="size-5 text-ink-2" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
