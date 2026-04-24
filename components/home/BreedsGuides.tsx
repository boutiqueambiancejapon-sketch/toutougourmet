import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'

interface Breed {
  slug: string
  name: string
  count: string
  slot: string
  emoji: string
}

const BREEDS: Breed[] = [
  { slug: 'nourriture-labrador-retriever', name: 'Labrador', count: '12 guides', slot: 'breed-labrador', emoji: '🦴' },
  { slug: 'nourriture-golden-retriever', name: 'Golden Retriever', count: '9 guides', slot: 'breed-golden', emoji: '🌟' },
  { slug: 'nourriture-bouledogue-francais', name: 'Bouledogue', count: '7 guides', slot: 'breed-bouledogue', emoji: '💪' },
  { slug: 'nourriture-berger-australien', name: 'Berger Australien', count: '8 guides', slot: 'breed-berger-australien', emoji: '🏃' },
  { slug: 'nourriture-chihuahua', name: 'Chihuahua', count: '6 guides', slot: 'breed-chihuahua', emoji: '✨' },
  { slug: 'nourriture-cavalier-king-charles', name: 'Cavalier King Charles', count: '5 guides', slot: 'breed-cavalier', emoji: '👑' },
]

export function BreedsGuides() {
  return (
    <section id="races" className="py-24 px-6 md:px-10 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)] mb-2.5">
              Guides par race
            </p>
            <h2 className="section-title m-0">
              Ton{' '}
              <span
                className="inline-block px-3.5 pb-1.5 rounded-[var(--radius-md)]"
                style={{ background: 'var(--pill-blue)', lineHeight: 1 }}
              >
                Labrador
              </span>{' '}
              ne bouffe pas comme un Chihuahua.
            </h2>
          </div>
          <Link
            href="/chien/race"
            className="text-sm font-bold text-[var(--accent-1)] whitespace-nowrap hover:underline"
          >
            Toutes les races →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {BREEDS.map((b) => (
            <Link
              key={b.slug}
              href={`/chien/race/${b.slug}`}
              className="group flex flex-col rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-1)] transition-all duration-300"
            >
              <div className="relative aspect-square">
                <Illustration
                  slot={b.slot}
                  alt={`Photo ${b.name}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 200px"
                  className="!rounded-none"
                />
                <span
                  className="absolute top-2.5 right-2.5 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-surface)] text-lg shadow-[var(--shadow-sm)]"
                  aria-hidden="true"
                >
                  {b.emoji}
                </span>
              </div>
              <div className="px-4 py-3.5">
                <p
                  className="font-black text-[var(--text-primary)] text-sm m-0 leading-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {b.name}
                </p>
                <p
                  className="text-[11px] text-[var(--text-muted)] mt-1 m-0 font-medium"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {b.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
