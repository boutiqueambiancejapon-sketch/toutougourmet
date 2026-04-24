import type { Metadata } from 'next'

import { HeroSection } from '@/components/home/HeroSection'
import { BrandsGrid } from '@/components/home/BrandsGrid'
import { ComparisonTable } from '@/components/home/ComparisonTable'
import { BreedsGuides } from '@/components/home/BreedsGuides'
import { QuizTeaser } from '@/components/home/QuizTeaser'
import { ArticlesGrid } from '@/components/home/ArticlesGrid'
import { TrustSection } from '@/components/home/TrustSection'
import { NewsletterBlock } from '@/components/blog/NewsletterBlock'

export const metadata: Metadata = {
  title: 'Toutou Gourmet - Meilleure alimentation pour chien & chat',
  description:
    'Comparez les meilleures marques de nourriture pour chien : Franklin, Elmut, Petty Well, Dog Chef. Quiz personnalisé, notes, prix et codes promo exclusifs.',
  alternates: { canonical: 'https://www.toutou-gourmet.com' },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandsGrid />
      <ComparisonTable />
      <BreedsGuides />
      <QuizTeaser />
      <ArticlesGrid />
      <TrustSection />

      <section className="py-20 px-6 bg-[var(--bg-primary)]">
        <div className="max-w-[640px] mx-auto">
          <NewsletterBlock />
        </div>
      </section>
    </>
  )
}
