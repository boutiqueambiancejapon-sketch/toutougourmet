// @cdc lot 6 — page publique du scanner, la seule avec le bouton de scan et la seule indexée.
// En haut : H1, phrase courte, parcours (composant client), deux cartes vers les listes, trois
// dernières fiches. Tout le texte (étapes, barèmes, repères, FAQ) reste dans le HTML servi, plié
// sous <details>. Revalidée toutes les 60 s pour les dernières fiches et les meilleures notes.
import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { OtherTools } from '@/components/outils/OtherTools'
import { CarbsSection } from '@/components/scanner/CarbsSection'
import { CompositionGuide } from '@/components/scanner/CompositionGuide'
import { EXAMPLE_TITLE, ExampleFicheBody } from '@/components/scanner/ExampleFiche'
import { HowItWorks } from '@/components/scanner/HowItWorks'
import { BrowseCards } from '@/components/scanner/lists/BrowseCards'
import { LatestFiches } from '@/components/scanner/lists/LatestFiches'
import { MethodDetails } from '@/components/scanner/MethodDetails'
import { ReadScore } from '@/components/scanner/ReadScore'
import { ScannerJsonLd } from '@/components/scanner/ScannerJsonLd'
import { ScannerGuides } from '@/components/scanner/ScannerGuides'
import { ScannerMethod } from '@/components/scanner/ScannerMethod'
import { BaremeSections } from '@/components/scanner/ScannerMethodBaremes'
import { ScannerTool } from '@/components/scanner/ScannerTool'
import { TopRated } from '@/components/scanner/TopRated'
import { RankingLinks } from '@/components/scanner/rankings/RankingLinks'
import { scannerFaq } from '@/components/scanner/scanner-faq'
import { FREE_MONTHLY_SCANS } from '@/lib/scanner/config'

export const revalidate = 60

// Mots clés (recherche du 2026-11-03) : scanner / application croquettes chien, analyse et note
// de composition, pâtée et friandises. « Yuka » est visé par /scanner/alternative-yuka-animaux.
const TITLE = 'Scanner de croquettes, pâtées et friandises pour chien'
const DESCRIPTION =
  'Scanne le code-barres de tes croquettes, pâtées ou friandises pour chien : analyse de la composition et note sur 100 gratuite, selon un barème publié.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.toutou-gourmet.com/scanner' },
  openGraph: {
    title: 'Croquettes, pâtées et friandises : la note sur 100 en une photo',
    description: DESCRIPTION,
    url: 'https://www.toutou-gourmet.com/scanner',
    type: 'website',
    images: [{ url: 'https://www.toutou-gourmet.com/scanner/exemple-story.png', width: 1080, height: 1920 }],
  },
}

export default function ScannerPage() {
  const faq = scannerFaq(FREE_MONTHLY_SCANS)
  return (
    <>
      <ScannerJsonLd faq={faq} description={DESCRIPTION} />
      <div className="v2 mx-auto flex max-w-prose flex-col gap-10 px-4 pt-4 pb-16 md:px-8 md:pt-8">
        <div className="flex flex-col gap-5">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Outils', href: '/outils' }, { label: 'Scanner de croquettes' }]} />
          <header className="flex flex-col gap-2">
            <h1 className="m-0 font-display text-[clamp(1.75rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">
              Scanner de croquettes, pâtées et friandises pour chien : note sur 100
            </h1>
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              Scanne le paquet de ton chien : tu obtiens une note sur 100, et ce qu&apos;elle veut dire.
            </p>
          </header>
          <ScannerTool monthlyLimit={FREE_MONTHLY_SCANS} />
          <BrowseCards />
          <LatestFiches />
        </div>

        <RankingLinks />

        <div className="flex flex-col gap-3">
          <p className="m-0 text-[15px] leading-relaxed text-ink-2">1. Tu scannes. 2. On lit la composition. 3. Tu as la note et ce qu&apos;elle veut dire.</p>
          <MethodDetails id="comment" title={'Comment analyser les croquettes, la pâtée ou les friandises de ton chien ?'}>
            <HowItWorks />
          </MethodDetails>
          <MethodDetails id="exemple" title={EXAMPLE_TITLE}>
            <ExampleFicheBody />
          </MethodDetails>
          <MethodDetails id="lire-note" title={'Quelle est une bonne note pour des croquettes ?'}>
            <ReadScore />
          </MethodDetails>
          <MethodDetails title="Comment est calculée la note des croquettes et pâtées ?">
            <ScannerMethod />
          </MethodDetails>
          <MethodDetails id="methode-friandises" title="Comment est calculée la note des friandises ?">
            <BaremeSections ids={['friandise']} />
          </MethodDetails>
          <MethodDetails id="methode-complements" title="Comment sont notés les compléments et les huiles ?">
            <BaremeSections ids={['complement', 'huile']} />
          </MethodDetails>
          <MethodDetails id="glucides" title={'Comment calculer le taux de glucides des croquettes ?'}>
            <CarbsSection />
          </MethodDetails>
          <MethodDetails id="bonne-composition" title={'Qu’est-ce qu’une bonne composition de croquettes pour chien ?'}>
            <CompositionGuide />
          </MethodDetails>
          <MethodDetails id="patee-friandise" title={'Comment juger la composition d’une pâtée ou d’une friandise ?'}>
            <ScannerGuides />
          </MethodDetails>
          <TopRated />
        </div>

        <section aria-labelledby="faq" className="flex flex-col">
          <h2 id="faq" className="m-0 font-display text-2xl font-black text-ink">
            Questions fréquentes sur le scanner
          </h2>
          <FaqList>
            {faq.map((item) => (
              <FaqItem key={item.question} question={item.question}>
                <p className="m-0">{item.answer}</p>
              </FaqItem>
            ))}
          </FaqList>
          <p className="m-0 text-sm leading-relaxed text-ink-2">
            {'Yuka ne note pas les aliments pour animaux : '}
            <Link href="/scanner/alternative-yuka-animaux" className="font-semibold text-orange-ink underline underline-offset-2">
              notre scanner comparé à Yuka pour les croquettes
            </Link>
            {'. Les fiches marque du site suivent une autre grille, sur 6 critères, décrite dans notre '}
            <Link href="/a-propos#methodologie" className="font-semibold text-orange-ink underline underline-offset-2">
              méthodologie d&apos;évaluation des marques
            </Link>
            .
          </p>
        </section>

        <OtherTools current="scanner" />
      </div>
    </>
  )
}
