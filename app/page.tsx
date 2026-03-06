import { HeroSection } from '@/components/home/HeroSection'
import { BrandsGrid } from '@/components/home/BrandsGrid'
import { QuizTeaser } from '@/components/home/QuizTeaser'
import { TrustSection } from '@/components/home/TrustSection'
import { BlogPreview } from '@/components/home/BlogPreview'
import { NewsletterBlock } from '@/components/blog/NewsletterBlock'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandsGrid />
      <QuizTeaser />
      <TrustSection />
      <BlogPreview />
      <section className="py-16 px-4 bg-[var(--bg-primary)]">
        <div className="max-w-[640px] mx-auto">
          <NewsletterBlock />
        </div>
      </section>
    </>
  )
}
