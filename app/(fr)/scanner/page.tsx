// @cdc lot 6 — page publique du scanner, orientée action : rendu serveur indexable, revalidée
// toutes les 60 s pour « Derniers scans » et « Meilleures notes ». Le parcours (code-barres,
// photos) et le calculateur de glucides sont des composants clients ; tout le texte (étapes,
// méthodes repliées des deux barèmes, repères de composition, FAQ) est dans le HTML servi.
import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { OtherTools } from '@/components/outils/OtherTools'
import { CarbsSection } from '@/components/scanner/CarbsSection'
import { CompositionGuide } from '@/components/scanner/CompositionGuide'
import { ExampleFiche } from '@/components/scanner/ExampleFiche'
import { HowItWorks } from '@/components/scanner/HowItWorks'
import { MethodDetails } from '@/components/scanner/MethodDetails'
import { ReadScore } from '@/components/scanner/ReadScore'
import { RecentScans } from '@/components/scanner/RecentScans'
import { ScanAgainButton } from '@/components/scanner/ScanStart'
import { ScannerJsonLd } from '@/components/scanner/ScannerJsonLd'
import { ScannerGuides } from '@/components/scanner/ScannerGuides'
import { ScannerMethod } from '@/components/scanner/ScannerMethod'
import { TreatMethod } from '@/components/scanner/treat/TreatMethod'
import { ScannerTool } from '@/components/scanner/ScannerTool'
import { TopRated } from '@/components/scanner/TopRated'
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
      <div className="v2 mx-auto flex max-w-prose flex-col gap-12 px-4 pt-4 pb-16 md:px-8 md:pt-8">
        <div className="flex flex-col gap-5">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Outils', href: '/outils' }, { label: 'Scanner de croquettes' }]} />
          <header className="flex flex-col gap-2">
            <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">
              Scanner de croquettes, pâtées et friandises pour chien : note sur 100
            </h1>
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              Le scanner analyse la composition des croquettes, pâtées et friandises pour chien et lui donne une note sur 100.
              Scanne le code-barres du paquet : si le produit est déjà connu, la note s&apos;affiche aussitôt, sans compte. Sinon,
              deux photos de l&apos;étiquette suffisent (une seule pour une friandise) avec un compte gratuit, et notre barème publié
              fait le calcul.
            </p>
          </header>
          <ScannerTool monthlyLimit={FREE_MONTHLY_SCANS} />
          <RecentScans />
        </div>

        <HowItWorks />
        <ExampleFiche />
        <ReadScore />

        <div className="flex flex-col gap-3">
          <MethodDetails title="Comment est calculée la note des croquettes et pâtées ?">
            <ScannerMethod />
          </MethodDetails>
          <MethodDetails id="methode-friandises" title="Comment est calculée la note des friandises ?">
            <TreatMethod />
          </MethodDetails>
        </div>

        <CarbsSection />
        <CompositionGuide />
        <ScannerGuides />
        <TopRated />

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
            {'Yuka ne note pas les aliments pour animaux\u00a0: '}
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

        <aside aria-label="Scanner un sac" className="relative mr-2 flex flex-col gap-4 rounded-card bg-ink p-6 text-cream shadow-[8px_8px_0_var(--orange)] md:p-8">
          <p className="m-0 font-display text-[clamp(1.5rem,3.4vw,2rem)] font-black leading-tight">Le sac est à portée de main ?</p>
          <p className="m-0 text-base leading-relaxed text-cream/90">Sac de croquettes ou paquet de friandises : le code-barres suffit pour les produits déjà connus, sans compte.</p>
          <div>
            <ScanAgainButton />
          </div>
        </aside>

        <OtherTools current="scanner" />
      </div>
    </>
  )
}
