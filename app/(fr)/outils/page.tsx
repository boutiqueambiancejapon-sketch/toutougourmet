import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { RationQuick } from '@/components/tools/RationQuick'
import { IconChevron } from '@/components/icons'
import { TOOLS } from '@/components/outils/tool-list'

export const metadata: Metadata = {
  title: { absolute: 'Calculateurs pour chien : ration, poids, budget, âge' },
  description:
    'Ration journalière, budget mensuel, poids idéal, coût annuel : des calculateurs gratuits pour mieux nourrir ton chien ou ton chat.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils' },
  openGraph: {
    title: 'Calculateurs nutrition chien et chat : ration, poids idéal, budget, âge',
    description: 'Ration journalière, budget par marque, poids idéal, coût annuel : des outils concrets pour mieux nourrir ton animal.',
    url: 'https://www.toutou-gourmet.com/outils',
    type: 'website',
  },
}

// @cdc 04-pages — hub Outils V2 (audit design-cro §3 Outils) : la ration en grand, utilisable
// sur place, puis chaque outil présenté par la question à laquelle il répond, en lignes.
export default function OutilsPage() {
  const others = TOOLS.filter((t) => t.slug !== 'ration')
  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-12 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <div className="flex flex-col gap-4">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Outils' }]} />
        <header className="flex max-w-prose flex-col gap-2">
          <h1 className="m-0 font-display text-[clamp(1.9rem,4.2vw,2.8rem)] font-black leading-[1.05] tracking-tight text-ink">
            Les calculateurs pour bien nourrir ton chien
          </h1>
          <p className="m-0 text-lg leading-relaxed text-ink-2">
            Chaque outil répond à une question précise, avec sa formule et ses sources. Tous sont gratuits. Seul le scanner d&apos;étiquette demande un compte.
          </p>
        </header>
      </div>

      <section aria-labelledby="ration-hub" className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
        <div className="flex flex-col gap-3 lg:pt-6">
          <p className="m-0 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-black leading-tight text-ink">
            Pour commencer, combien de grammes lui donner par jour&nbsp;?
          </p>
          <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
            Le calcul part de son poids avec la formule du NRC (2006), puis tient compte de son âge, de son activité et de
            la stérilisation.
          </p>
          <Link href="/outils/ration" className="inline-flex min-h-11 items-center gap-1 self-start text-[15px] font-semibold text-orange-ink no-underline hover:underline">
            Le calculateur complet, chats et races très énergiques compris
            <IconChevron className="size-4" />
          </Link>
        </div>
        {/* Mobile : l'outil d'abord, l'explication ensuite. Bureau : explication à gauche. */}
        <div className="order-first lg:order-none">
          <RationQuick headingId="ration-hub" />
        </div>
      </section>

      <section aria-labelledby="tous-outils" className="flex max-w-prose flex-col gap-2">
        <h2 id="tous-outils" className="m-0 font-display text-2xl font-black text-ink">
          Les autres questions
        </h2>
        <ul role="list" className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
          {others.map(({ slug, href, question, name, detail, Icon }) => (
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
