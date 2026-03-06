import Link from 'next/link'
import { HighlightText } from '@/components/ui/HighlightText'

export function HeroSection() {
  return (
    <section className="bg-[var(--bg-primary)] py-16 md:py-24 px-4">
      <div className="max-w-[1280px] mx-auto text-center">
        <p className="text-sm font-semibold text-[var(--accent-1)] uppercase tracking-wider mb-4">
          🐾 Le comparateur indépendant du pet food premium
        </p>
        <h1 className="mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
          La meilleure bouffe pour ton chien ?{' '}
          <HighlightText>On a tout</HighlightText>{' '}
          comparé.
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
          Franklin, Elmut, Petty Well, Dog Chef... On les a tous testés, scrutés, comparés — sans blabla,
          sans langue de bois. Trouve la marque idéale pour ta bestiole en 2 min.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/quiz" className="btn-primary text-base px-6 py-3">
            Faire le quiz personnalisé →
          </Link>
          <Link href="/comparateur" className="btn-outline text-base px-6 py-3">
            Comparer les marques
          </Link>
        </div>

        {/* Preuves sociales */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-[var(--text-muted)]">
          <span>✅ 4 marques analysées</span>
          <span>✅ Comparatif indépendant</span>
          <span>✅ Mis à jour en 2026</span>
          <span>✅ 100% gratuit</span>
        </div>
      </div>
    </section>
  )
}
