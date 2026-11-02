// @cdc lot 6 — page publique du scanner, orientée action : rendu serveur indexable, revalidée
// toutes les 60 s pour « Derniers scans ». Le parcours (code-barres, photos) est un composant
// client ; tout le texte (étapes, lecture de la note, méthode repliée, FAQ) est dans le HTML.
import type { Metadata } from 'next'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { OtherTools } from '@/components/outils/OtherTools'
import { ExampleFiche } from '@/components/scanner/ExampleFiche'
import { HowItWorks } from '@/components/scanner/HowItWorks'
import { MethodDetails } from '@/components/scanner/MethodDetails'
import { ReadScore } from '@/components/scanner/ReadScore'
import { RecentScans } from '@/components/scanner/RecentScans'
import { ScanAgainButton } from '@/components/scanner/ScanStart'
import { ScannerJsonLd } from '@/components/scanner/ScannerJsonLd'
import { ScannerMethod } from '@/components/scanner/ScannerMethod'
import { ScannerTool } from '@/components/scanner/ScannerTool'
import { scannerFaq } from '@/components/scanner/scanner-faq'
import { FREE_MONTHLY_SCANS } from '@/lib/scanner/config'

export const revalidate = 60

export const metadata: Metadata = {
  title: { absolute: 'Scanner de croquettes : la note sur 100 de leur composition' },
  description:
    'Scanne le code-barres du sac de croquettes : note sur 100 de la composition, expliquée critère par critère, selon un barème publié. Produit inconnu : deux photos suffisent.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/scanner' },
  openGraph: {
    title: 'Note les croquettes de ton chien en une photo',
    description: 'Code-barres ou photo de l\'étiquette, note sur 100 expliquée critère par critère.',
    url: 'https://www.toutou-gourmet.com/scanner',
    type: 'website',
    images: [{ url: 'https://www.toutou-gourmet.com/scanner/exemple-story.png', width: 1080, height: 1920 }],
  },
}

export default function ScannerPage() {
  const faq = scannerFaq(FREE_MONTHLY_SCANS)
  return (
    <>
      <ScannerJsonLd faq={faq} />
      <div className="v2 mx-auto flex max-w-prose flex-col gap-12 px-4 pt-4 pb-16 md:px-8 md:pt-8">
        <div className="flex flex-col gap-5">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Outils', href: '/outils' }, { label: 'Scanner de croquettes' }]} />
          <header className="flex flex-col gap-2">
            <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">
              Note les croquettes de ton chien en une photo
            </h1>
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              Scanne le code-barres du sac. Produit déjà connu : sa note sur 100 s&apos;affiche aussitôt. Sinon, deux photos de
              l&apos;étiquette suffisent, et notre barème publié fait le calcul.
            </p>
          </header>
          <ScannerTool monthlyLimit={FREE_MONTHLY_SCANS} />
          <RecentScans />
        </div>

        <HowItWorks />
        <ExampleFiche />
        <ReadScore />

        <MethodDetails title="Méthode : comment la note est-elle calculée ?">
          <ScannerMethod />
        </MethodDetails>

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
