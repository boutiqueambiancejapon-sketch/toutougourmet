import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comparateur nourriture chien et chat',
  description:
    'Comparez les meilleures marques de nourriture pour chien : Franklin, Elmut, Petty Well, Dog Chef. Quiz personnalisé, notes, prix et codes promo exclusifs.',
  alternates: { canonical: 'https://toutou-gourmet.com' },
}

import { HeroSection } from '@/components/home/HeroSection'
import { BrandsGrid } from '@/components/home/BrandsGrid'
import { QuizTeaser } from '@/components/home/QuizTeaser'
import { TrustSection } from '@/components/home/TrustSection'
import { BlogPreview } from '@/components/home/BlogPreview'
import { NewsletterBlock } from '@/components/blog/NewsletterBlock'
import { Marquee } from '@/components/ui/Marquee'

const marqueeItems = [
  '70% de viande chez Franklin',
  '-30% sur ta 1ère commande',
  '4 marques testées indépendamment',
  'Repas frais livré chez toi',
  '0€ de sponsoring, 100% honnête',
  'Petty Well → -34% 1ère box',
  'Quiz gratuit en 2 min',
  'Dog Chef → -35% box d\'essai',
  'Elmut → -20% 1ère commande',
  'Sans blabla, sans bullshit',
]

const marqueeItems2 = [
  'Résultats du quiz en 2 min',
  'Comparatif mis à jour en 2026',
  'Ta bestiole mérite mieux',
  'Franklin · Elmut · Petty Well · Dog Chef',
  '100% gratuit, sans inscription',
  'Sélection rigoureuse & indépendante',
]

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Ticker rose post-hero */}
      <Marquee
        items={marqueeItems}
        bgClass="bg-[var(--pill-rose)]"
        textClass="text-[var(--text-primary)]"
      />

      <BrandsGrid />
      <QuizTeaser />
      <TrustSection />
      <BlogPreview />

      {/* Ticker bleu avant newsletter */}
      <Marquee
        items={marqueeItems2}
        bgClass="bg-[var(--pill-blue)]"
        textClass="text-[var(--text-primary)]"
      />

      <section className="py-20 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-[640px] mx-auto">
          <NewsletterBlock />
        </div>
      </section>
    </>
  )
}
