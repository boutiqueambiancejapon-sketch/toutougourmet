import type { ReactNode } from 'react'
import Image from 'next/image'

// ─── BodyImage ───────────────────────────────────────────────────────────────
// Image éditoriale insérée dans le corps d'un article MDX.
// Wrap next/image (mandatory per CLAUDE.md) + figure/figcaption pour le SEO.
// Lazy par défaut (sauf si priority est explicitement true sur une image LCP).
// Utilisé pour les 2 images génériques body (gamelle + chien curieux) et toute
// future image en cours d'article.

interface BodyImageProps {
  /** Chemin relatif depuis /public, ex: /images/articles/body-gamelle-ingredients.jpeg */
  src: string
  /** Texte alternatif descriptif (SEO + a11y) */
  alt: string
  /** Légende optionnelle (rendue dans <figcaption>) */
  caption?: ReactNode
  /** Dimensions intrinsèques de l'image — défaut 1200×900 (4:3) */
  width?: number
  height?: number
  /** Forcer priority=true uniquement si l'image est above-the-fold (LCP) */
  priority?: boolean
}

export function BodyImage({
  src,
  alt,
  caption,
  width = 1200,
  height = 900,
  priority = false,
}: BodyImageProps) {
  return (
    <figure className="my-8">
      <div className="relative w-full rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)]">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 800px) calc(100vw - 2rem), 760px"
          className="w-full h-auto"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
      {caption && (
        <figcaption
          className="mt-3 text-sm text-center italic"
          style={{ color: 'var(--text-muted)' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// ─── InfoBox ─────────────────────────────────────────────────────────────────
// Équivalent des callout boxes colorées de Klaro

type InfoBoxColor = 'rose' | 'blue' | 'green' | 'amber' | 'dark'

const infoBoxStyles: Record<InfoBoxColor, { box: string; title: string; body: string }> = {
  rose:  { box: 'bg-rose-bg',  title: 'text-rose-ink',  body: 'text-ink-2' },
  blue:  { box: 'bg-blue-bg',  title: 'text-blue-ink',  body: 'text-ink-2' },
  green: { box: 'bg-green-bg', title: 'text-green-ink', body: 'text-ink-2' },
  amber: { box: 'bg-amber-bg', title: 'text-amber-ink', body: 'text-ink-2' },
  dark:  { box: 'bg-ink',      title: 'text-cream',     body: 'text-cream/85' },
}

export function InfoBox({
  children,
  color = 'blue',
  title,
}: {
  children: ReactNode
  color?: InfoBoxColor
  title?: string
  /** Ignoré depuis la V2 (plus d'emojis) ; gardé pour ne pas casser les anciens articles. */
  emoji?: string
}) {
  const s = infoBoxStyles[color]
  return (
    <div className={`my-6 rounded-box p-5 ${s.box}`}>
      {title ? <p className={`mb-2 text-sm font-bold ${s.title}`}>{title}</p> : null}
      <div className={`text-sm leading-relaxed ${s.body}`}>{children}</div>
    </div>
  )
}

// ─── Callout ──────────────────────────────────────────────────────────────────
// Citation / point important encadré

export function Callout({
  children,
}: {
  children: ReactNode
  /** Ignoré depuis la V2 (plus d'emojis). */
  emoji?: string
}) {
  return <div className="my-6 rounded-box bg-cream-2 p-5 text-base leading-relaxed text-ink">{children}</div>
}

// ─── FeatureGrid ──────────────────────────────────────────────────────────────
// Grille de features/caractéristiques (comme les cartes Klaro)

export function FeatureGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
      {children}
    </div>
  )
}

export function Feature({
  title,
  value,
  positive,
  negative,
}: {
  title: string
  value?: string
  /** Ignoré depuis la V2 (plus d'emojis). */
  icon?: string
  positive?: boolean
  negative?: boolean
}) {
  const tone = positive ? 'bg-green-bg text-green-ink' : negative ? 'bg-rose-bg text-rose-ink' : 'bg-cream-2 text-ink'
  return (
    <div className={`rounded-box p-4 ${tone}`}>
      <p className="m-0 mb-1 text-sm font-bold">
        {positive ? '✓\u00a0' : negative ? '✗\u00a0' : ''}
        {title}
      </p>
      {value ? <p className="m-0 text-sm text-ink-2">{value}</p> : null}
    </div>
  )
}

// ─── StatRow ──────────────────────────────────────────────────────────────────
// Ligne de stats visuelles

export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {children}
    </div>
  )
}

export function Stat({
  value,
  label,
  color = 'default',
}: {
  value: string
  label: string
  color?: 'default' | 'rose' | 'blue' | 'green' | 'amber'
}) {
  const shown = value.replace(/\p{Extended_Pictographic}|\uFE0F/gu, '').trim()
  const tones = {
    default: 'bg-cream-2 text-orange-ink',
    rose:    'bg-rose text-rose-ink',
    blue:    'bg-blue text-blue-ink',
    green:   'bg-green text-green-ink',
    amber:   'bg-amber text-amber-ink',
  }

  return (
    <div className={`flex flex-col gap-2 rounded-box p-4 ${tones[color]}`}>
      {shown ? (
        <p className="m-0 w-full min-w-0 break-words font-display text-[clamp(1.25rem,3vw,2rem)] font-black leading-tight">
          {shown}
        </p>
      ) : null}
      <p className="m-0 text-sm leading-snug text-ink-2">{label}</p>
    </div>
  )
}

// ─── CompareTable ─────────────────────────────────────────────────────────────
// Tableau comparatif stylisé (comme Klaro)

export function CompareTable({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto rounded-box bg-paper">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

export function CompareThead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-ink text-cream">
      {children}
    </thead>
  )
}

export function CompareTh({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-sm font-bold">
      {children}
    </th>
  )
}

export function CompareTr({ children, highlight }: { children: ReactNode; highlight?: boolean }) {
  return (
    <tr className={`border-b border-line ${highlight ? 'bg-rose-bg' : ''}`}>
      {children}
    </tr>
  )
}

export function CompareTd({
  children,
  good,
  bad,
}: {
  children: ReactNode
  good?: boolean
  bad?: boolean
}) {
  const color = good ? 'text-green-ink' : bad ? 'text-rose-ink' : 'text-ink-2'
  return (
    <td className={`px-4 py-3 ${color}`}>
      {good && <span className="mr-1 font-bold">✓</span>}
      {bad && <span className="mr-1 font-bold">✗</span>}
      {children}
    </td>
  )
}

// ─── Verdict ──────────────────────────────────────────────────────────────────
// Bloc verdict final de l'article

export function Verdict({
  children,
  brand,
  score,
}: {
  children: ReactNode
  brand?: string
  score?: number
  /** Ignoré depuis la V2 (plus d'emojis). */
  emoji?: string
}) {
  return (
    <div className="v2 my-8 rounded-card bg-ink p-6 text-cream md:p-8">
      <p className="m-0 text-sm font-bold text-amber">Notre verdict</p>
      {brand ? (
        <p className="m-0 mt-1 font-display text-xl font-black text-cream md:text-2xl">
          {brand}
          {score ? <span className="ml-2 rounded-tile bg-amber px-2 py-0.5 text-base text-ink">{score}/10</span> : null}
        </p>
      ) : null}
      <div className="verdict-content mt-4 text-base leading-relaxed text-cream">{children}</div>
    </div>
  )
}

// ─── ProsConsList ─────────────────────────────────────────────────────────────
// Deux modes :
// 1. Array props (pages/templates) : <ProsConsList pros={["a","b"]} cons={["c"]} />
// 2. Children MDX (articles) : <ProsConsList><ProsBlock>…</ProsBlock><ConsBlock>…</ConsBlock></ProsConsList>

export function ProsConsList({
  pros,
  cons,
  children,
}: {
  pros?: string[]
  cons?: string[]
  children?: ReactNode
}) {
  // Mode enfants (MDX) — évite les array literal props incompatibles avec next-mdx-remote/rsc
  if (children) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {children}
      </div>
    )
  }

  // Mode array (pages/templates)
  const prosItems = pros ?? []
  const consItems = cons ?? []
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      <div className="rounded-[var(--radius-lg)] p-4 border" style={{ borderColor: 'var(--pill-green)', background: '#F0FFF8' }}>
        <p className="text-sm font-bold mb-3" style={{ color: '#1A7A47' }}>Points forts</p>
        <ul className="space-y-2">
          {prosItems.map((p, i) => (
            <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
              <span style={{ color: '#1A7A47' }} className="shrink-0 font-bold">✓</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[var(--radius-lg)] p-4 border" style={{ borderColor: 'var(--pill-rose)', background: 'var(--bg-rose)' }}>
        <p className="text-sm font-bold mb-3" style={{ color: '#8B1A4A' }}>Points faibles</p>
        <ul className="space-y-2">
          {consItems.map((c, i) => (
            <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
              <span style={{ color: 'var(--orange-ink)' }} className="shrink-0 font-bold">✗</span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Sous-composants MDX pour ProsConsList (évitent les array literal props)

export function ProsBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] p-4 border" style={{ borderColor: 'var(--pill-green)', background: '#F0FFF8' }}>
      <p className="text-sm font-bold mb-3" style={{ color: '#1A7A47' }}>Points forts</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

export function ConsBlock({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] p-4 border" style={{ borderColor: 'var(--pill-rose)', background: 'var(--bg-rose)' }}>
      <p className="text-sm font-bold mb-3" style={{ color: '#8B1A4A' }}>Points faibles</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

export function ProItem({ children }: { children: ReactNode }) {
  return (
    <li className="text-sm text-[var(--text-secondary)] flex gap-2">
      <span style={{ color: '#1A7A47' }} className="shrink-0 font-bold">✓</span>
      {children}
    </li>
  )
}

export function ConItem({ children }: { children: ReactNode }) {
  return (
    <li className="text-sm text-[var(--text-secondary)] flex gap-2">
      <span style={{ color: 'var(--orange-ink)' }} className="shrink-0 font-bold">✗</span>
      {children}
    </li>
  )
}

// ─── SectionDivider ──────────────────────────────────────────────────────────

export function SectionDivider({ label }: { label?: string }) {
  if (!label) return <hr className="border-[var(--border)] my-8" />
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-[var(--border)]" />
      <span
        className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
        style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  )
}

// ─── FaqList / FaqItem ────────────────────────────────────────────────────────
// Version V2 dans components/article/Faq.tsx (réexportée ici pour les imports existants).

export { FaqList, FaqItem } from '@/components/article/Faq'
