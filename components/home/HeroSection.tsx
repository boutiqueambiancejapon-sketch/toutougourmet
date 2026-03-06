import Link from 'next/link'
import { WordRotator } from '@/components/ui/WordRotator'

const rotatingWords = [
  'chien',
  'chat',
  'Labrador',
  'Golden',
  'animal',
  'bouledogue',
  'compagnon',
  'toutou',
]

const stats = [
  { value: '4', label: 'marques testées' },
  { value: '0€', label: 'de sponsoring' },
  { value: '2 min', label: 'pour le quiz' },
  { value: '100%', label: 'indépendant' },
]

export function HeroSection() {
  return (
    <section className="bg-[var(--bg-dark)] min-h-[90vh] flex flex-col justify-center px-6 md:px-10 lg:px-16 py-20 relative overflow-hidden">

      {/* Blobs déco */}
      <div aria-hidden="true" className="absolute top-[-80px] right-[-80px] w-[380px] h-[380px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'var(--pill-rose)' }} />
      <div aria-hidden="true" className="absolute bottom-[-60px] left-[8%] w-[260px] h-[260px] rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: 'var(--pill-blue)' }} />

      <div className="max-w-[1280px] mx-auto w-full">
        <div className="max-w-[900px]">

          {/* Eyebrow */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}>
              Comparatif indépendant · 2026
            </span>
          </div>

          {/* H1 avec mot rotatif */}
          <h1 className="text-[var(--text-on-dark)] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
            La bouffe de ton{' '}
            <span className="inline-block px-4 py-1 rounded-[var(--radius-md)] leading-tight" style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}>
              <WordRotator words={rotatingWords} intervalMs={1800} />
            </span>
            {' '}on a tout comparé.
          </h1>

          {/* Sous-titre */}
          <p className="text-lg md:text-xl mb-10 max-w-[600px] leading-relaxed" style={{ color: 'var(--text-on-dark)', opacity: 0.75 }}>
            Franklin, Elmut, Petty Well, Dog Chef — on les a tous testés, scrutés, notés.
            Sans blabla, sans langue de bois. Trouve la meilleure option en 2 min.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-14">
            <Link href="/quiz" className="btn-dark text-base px-8 py-4">
              Faire le quiz personnalisé →
            </Link>
            <Link
              href="/comparateur"
              className="text-base px-8 py-4 rounded-[var(--radius-md)] font-bold border-2 inline-flex items-center gap-2 hover:bg-white/10 transition-colors"
              style={{ borderColor: 'rgba(245,238,230,0.30)', color: 'var(--text-on-dark)' }}
            >
              Voir le comparateur
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-8 border-t" style={{ borderColor: 'rgba(245,238,230,0.12)' }}>
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-black mb-0.5" style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-on-dark)' }}>
                  {s.value}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-on-dark)', opacity: 0.55 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
