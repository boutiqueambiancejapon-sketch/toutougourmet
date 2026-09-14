import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  imageSlots,
  type ImageGroup,
  type ImageSlot,
} from '@/data/images-manifest'
import { Illustration } from '@/components/ui/Illustration'

export const metadata: Metadata = {
  title: 'Dev · Illustrations — Toutou Gourmet',
  robots: { index: false, follow: false },
}

const GROUP_LABELS: Record<ImageGroup, string> = {
  hero: 'Hero',
  brands: 'Marques',
  breeds: 'Races',
  articles: 'Articles — catégories & pilotes',
  social: 'Social / OG',
}

function groupBy<T, K extends string>(items: readonly T[], key: (t: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>
  for (const item of items) {
    const k = key(item)
    if (!out[k]) out[k] = []
    out[k].push(item)
  }
  return out
}

function SlotCard({ slot }: { slot: ImageSlot }) {
  return (
    <figure className="flex flex-col gap-2">
      <Illustration
        slot={slot.id}
        alt={slot.subject}
        className="rounded-[var(--radius-xl)] border border-[var(--border)]"
      />
      <figcaption className="flex flex-wrap items-center gap-2 text-xs">
        <code className="font-mono font-semibold text-[var(--text-primary)]">{slot.id}</code>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="text-[var(--text-muted)]">{slot.ratio}</span>
        <span className="text-[var(--text-muted)]">·</span>
        <span
          className="px-2 py-0.5 rounded-full font-semibold"
          style={{
            background:
              slot.tone === 'rose' ? 'var(--pill-rose)'
              : slot.tone === 'blue' ? 'var(--pill-blue)'
              : slot.tone === 'amber' ? 'var(--pill-amber)'
              : slot.tone === 'green' ? 'var(--pill-green)'
              : 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
          }}
        >
          {slot.tone}
        </span>
        {slot.decorations.map((d) => (
          <span key={d} className="text-[10px] text-[var(--text-muted)] font-mono">· {d}</span>
        ))}
      </figcaption>
    </figure>
  )
}

export default function IllustrationsDevPage() {
  // Guard: only reachable outside production builds
  if (process.env.NODE_ENV === 'production') notFound()

  const grouped = groupBy(imageSlots, (s) => s.group)
  const groups = Object.keys(grouped) as ImageGroup[]

  return (
    <main className="mx-auto max-w-[1280px] px-6 md:px-10 py-12">
      <header className="mb-10 pb-6 border-b border-[var(--border)]">
        <p className="text-xs uppercase tracking-widest font-bold text-[var(--accent-1)] mb-2">
          Dev · non indexé
        </p>
        <h1 className="mb-3">Illustrations — revue visuelle</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Revue des {imageSlots.length} slots du manifest images. En l&rsquo;absence de
          fichier dans <code className="font-mono">/public/images/</code>, le composant{' '}
          <code className="font-mono">&lt;Illustration /&gt;</code> rend un placeholder SVG dans le
          ton de la marque, avec l&rsquo;overlay décoratif (confetti, chapeau, gamelle,
          étoile, patte) de la signature. Une fois les images Gemini livrées, le
          composant bascule automatiquement sur la photo sans changement d&rsquo;appel.
        </p>
      </header>

      <div className="flex flex-col gap-14">
        {groups.map((group) => (
          <section key={group}>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="m-0">{GROUP_LABELS[group]}</h2>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {grouped[group].length} slot{grouped[group].length > 1 ? 's' : ''}
              </span>
            </div>
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns:
                  group === 'hero' || group === 'social'
                    ? 'minmax(0, 1fr)'
                    : group === 'breeds'
                    ? 'repeat(auto-fill, minmax(220px, 1fr))'
                    : 'repeat(auto-fill, minmax(320px, 1fr))',
              }}
            >
              {grouped[group].map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
