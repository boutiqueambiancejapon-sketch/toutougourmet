import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { WordRotator } from '@/components/ui/WordRotator'

const rotatingWords = [
  'chien',
  'chat',
  'Labrador',
  'Golden',
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
    <section className="relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Cover illustration — fades into cream at bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[620px] pointer-events-none"
      >
        <Illustration
          slot="home-hero"
          alt=""
          priority
          className="h-full !rounded-none"
          overlayIntensity="soft"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(250,250,248,0) 0%, rgba(250,250,248,0) 35%, rgba(250,250,248,0.4) 60%, rgba(250,250,248,0.9) 85%, var(--bg-primary) 100%)',
          }}
        />
        {/* Signature blobs */}
        <div
          className="absolute -top-16 right-[12%] w-[320px] h-[320px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'var(--pill-rose)' }}
        />
        <div
          className="absolute top-16 -left-16 w-[260px] h-[260px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'var(--pill-blue)' }}
        />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 pt-[180px] pb-16">
        <div className="max-w-[960px]">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[var(--border)] shadow-[var(--shadow-sm)] mb-7"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-1)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-1)]">
              Comparatif indépendant · 2026
            </span>
          </span>

          <h1
            className="mb-7 text-[var(--text-primary)]"
            style={{
              fontFamily: "'Fraunces', serif",
              textWrap: 'balance',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            La bouffe de ton{' '}
            <span
              className="inline-block px-4 pb-1.5 rounded-[var(--radius-lg)] align-baseline"
              style={{ background: 'var(--pill-rose)', lineHeight: 1 }}
            >
              <WordRotator words={rotatingWords} intervalMs={1800} />
            </span>
            <br />
            on a tout comparé.
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-[640px] leading-relaxed text-[var(--text-secondary)]">
            Franklin, Elmut, Petty Well, Dog Chef — on les a tous testés,
            scrutés, notés. Sans blabla, sans langue de bois.{' '}
            <b className="text-[var(--text-primary)]">
              Trouve la meilleure option en 2 min.
            </b>
          </p>

          <div className="flex flex-wrap gap-3.5 mb-16">
            <Link href="/quiz" className="btn-primary text-base px-8 py-4">
              Faire le quiz personnalisé →
            </Link>
            <Link
              href="#comparatif"
              className="btn-outline text-base px-7 py-3.5"
            >
              Voir le comparateur
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[var(--border)]">
            {stats.map((s) => (
              <div key={s.label}>
                <p
                  className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-1"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    letterSpacing: '-0.02em',
                    lineHeight: 1.05,
                  }}
                >
                  {s.value}
                </p>
                <p className="text-sm font-medium text-[var(--text-muted)]">
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
