// @cdc lot 6 — page publique du scanner, orientée action : rendu serveur indexable, revalidée
// toutes les 60 s pour « Derniers scans » et « Meilleures notes ». Le parcours (code-barres,
// photos) et le calculateur de glucides sont des composants clients ; tout le texte (étapes,
// méthode repliée, repères de composition, FAQ) est dans le HTML servi.
import type { Metadata } from 'next'
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
import { ScannerMethod } from '@/components/scanner/ScannerMethod'
import { ScannerTool } from '@/components/scanner/ScannerTool'
import { TopRated } from '@/components/scanner/TopRated'
import { scannerFaq } from '@/components/scanner/scanner-faq'
import { FREE_MONTHLY_SCANS } from '@/lib/scanner/config'

export const revalidate = 60

const DESCRIPTION =
  'Scanne le code-barres ou l\'étiquette des croquettes de ton chien : protéines, glucides, viande nommée, additifs. Note sur 100 gratuite, sans appli.'

export const metadata: Metadata = {
  title: { absolute: 'Scanner de croquettes pour chien : note sur 100 gratuite' },
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.toutou-gourmet.com/scanner' },
  openGraph: {
    title: 'Scanner de croquettes pour chien : la note sur 100 en une photo',
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
              Scanner de croquettes pour chien : la note sur 100 en une photo
            </h1>
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              Scanne le code-barres du sac de croquettes de ton chien. Produit déjà connu : sa note sur 100 s&apos;affiche aussitôt.
              Sinon, deux photos de l&apos;étiquette suffisent, et notre barème publié fait le calcul.
            </p>
          </header>
          <ScannerTool monthlyLimit={FREE_MONTHLY_SCANS} />
          <RecentScans />
        </div>

        <HowItWorks />
        <ExampleFiche />
        <ReadScore />

        <MethodDetails title="Comment est calculée la note des croquettes ?">
          <ScannerMethod />
        </MethodDetails>

        <CarbsSection />
        <CompositionGuide />
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
        </section>

        <aside aria-label="Scanner un sac" className="relative mr-2 flex flex-col gap-4 rounded-card bg-ink p-6 text-cream shadow-[8px_8px_0_var(--orange)] md:p-8">
          <p className="m-0 font-display text-[clamp(1.5rem,3.4vw,2rem)] font-black leading-tight">Le sac est à portée de main ?</p>
          <p className="m-0 text-base leading-relaxed text-cream/90">Le code-barres suffit pour les produits déjà connus, sans compte.</p>
          <div>
            <ScanAgainButton />
          </div>
        </aside>

        <OtherTools current="scanner" />
      </div>
    </>
  )
}
