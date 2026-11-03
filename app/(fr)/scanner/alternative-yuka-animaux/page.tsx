// @cdc seo — page d'intention « Yuka pour animaux » : rendu serveur, statique. Yuka n'est cité que pour
// comparer (faits vérifiés le 2026-11-03, components/scanner/yuka/yuka-facts.ts), encadré de
// transparence avant le premier H2, objectif principal : aller au scanner (docs/v2/cro-carte.md).
import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { ExampleFiche } from '@/components/scanner/ExampleFiche'
import { WhatWeScore, WhyDogScale } from '@/components/scanner/yuka/DogScale'
import { ScanPackLink } from '@/components/scanner/yuka/ScanPackLink'
import { YukaJsonLd } from '@/components/scanner/yuka/YukaJsonLd'
import { YukaNotice } from '@/components/scanner/yuka/YukaNotice'
import { Differences, HowWeScore, YukaCoverage } from '@/components/scanner/yuka/YukaSections'
import { yukaFaq } from '@/components/scanner/yuka/yuka-faq'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { PAGE_DATES } from '@/data/page-dates'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'

const PATH = '/scanner/alternative-yuka-animaux'
const URL = `https://www.toutou-gourmet.com${PATH}`
const TITLE = 'Yuka pour animaux : alternative pour scanner les croquettes'
const DESCRIPTION =
  'Yuka ne note pas l\'alimentation animale. Notre scanner note sur 100 les croquettes et pâtées pour chien, par code-barres ou photo, gratuit et sans appli.'
const UPDATED = PAGE_DATES[PATH]
const UPDATED_LABEL = new Date(`${UPDATED}T00:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'website' },
}

const SUMMARY = [
  'Yuka analyse les aliments et cosmétiques pour humains, pas les aliments pour animaux.',
  'Notre scanner note les croquettes et pâtées pour chien sur 100, selon 11 critères publiés.',
  'Code-barres sans compte, analyses par photo avec un compte gratuit.',
]

export default function YukaAlternativePage() {
  const faq = yukaFaq(FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS)
  return (
    <>
      <YukaJsonLd path={PATH} title={TITLE} description={DESCRIPTION} dateModified={UPDATED} faq={faq} />
      <div className="v2 mx-auto flex max-w-prose flex-col gap-12 px-4 pt-4 pb-16 md:px-8 md:pt-8">
        <div className="flex flex-col gap-5">
          <BreadcrumbNav
            items={[{ label: 'Accueil', href: '/' }, { label: 'Scanner de croquettes', href: '/scanner' }, { label: 'Alternative à Yuka pour animaux' }]}
          />
          <header className="flex flex-col gap-3">
            <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">
              Yuka pour animaux&nbsp;: quelle alternative pour scanner les croquettes&nbsp;?
            </h1>
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              Yuka ne note pas l&apos;alimentation animale&nbsp;: son centre d&apos;aide indique qu&apos;il n&apos;analyse pas les aliments
              pour animaux. Pour les croquettes et les pâtées de ton chien, le scanner de Toutou Gourmet lit le code-barres ou deux
              photos de l&apos;étiquette, puis donne une note sur 100 calculée par un barème publié.
            </p>
            <p className="m-0 text-sm text-ink-2">
              <time dateTime={UPDATED}>{`Mis à jour le ${UPDATED_LABEL}`}</time>
            </p>
          </header>
          <YukaNotice />
          <div className="flex flex-col gap-2">
            <p className="m-0 text-sm font-semibold text-ink">En résumé</p>
            <ul className="m-0 flex flex-col gap-1 pl-5 text-base leading-relaxed text-ink-2">
              {SUMMARY.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <ScanPackLink place="haut" />
          </div>
        </div>

        <YukaCoverage />
        <HowWeScore />
        <Differences />
        <WhatWeScore />
        <WhyDogScale />
        <ExampleFiche />

        <section aria-labelledby="faq" className="flex flex-col">
          <h2 id="faq" className="m-0 font-display text-2xl font-black text-ink">
            Questions fréquentes sur Yuka et les croquettes
          </h2>
          <FaqList>
            {faq.map((item) => (
              <FaqItem key={item.question} question={item.question}>
                <p className="m-0">{item.answer}</p>
              </FaqItem>
            ))}
          </FaqList>
          <p className="m-0 text-sm text-ink-2">
            {`Quotas et fonctions du compte : `}
            <Link href="/premium" className="font-semibold text-orange-ink underline underline-offset-2">
              comparer le compte gratuit et Premium
            </Link>
            .
          </p>
        </section>

        <aside aria-label="Scanner un paquet" className="relative mr-2 flex flex-col gap-4 rounded-card bg-ink p-5 text-cream shadow-[8px_8px_0_var(--orange)] md:p-8">
          <p className="m-0 font-display text-[clamp(1.5rem,3.4vw,2rem)] font-black leading-tight">Le paquet est sous la main&nbsp;?</p>
          <p className="m-0 text-base leading-relaxed text-cream/90">
            Le code-barres suffit pour un produit déjà connu, sans compte et sans application à installer.
          </p>
          <div>
            <ScanPackLink place="fin" />
          </div>
        </aside>
      </div>
    </>
  )
}
