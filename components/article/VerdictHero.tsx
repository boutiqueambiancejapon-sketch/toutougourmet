import { VerdictIcon, type VerdictKind } from '@/components/icons'
import { POISON_CENTERS } from '@/data/poison-centers'

// @cdc 04-pages — verdict en tête d'article (audit design-cro §3 « Article ») : la réponse
// tient sous le titre, en grand, teintée selon le verdict, sans bordure colorée.
// Rendu serveur : le verdict fait partie du texte indexable.

const TONE: Record<VerdictKind, { word: string; bg: string }> = {
  oui: { word: 'OUI', bg: 'bg-green-bg' },
  moderation: { word: 'AVEC MODÉRATION', bg: 'bg-amber-bg' },
  danger: { word: 'DANGER', bg: 'bg-rose-bg' },
}

export function VerdictHero({ verdict, note }: { verdict: VerdictKind; note?: string }) {
  const tone = TONE[verdict]
  const center = verdict === 'danger' ? POISON_CENTERS.fr[0] : undefined
  return (
    <section aria-label="Verdict" className={`v2 flex flex-col gap-3 rounded-card p-4 md:p-5 ${tone.bg}`}>
      <div className="flex items-center gap-4">
        <VerdictIcon verdict={verdict} className="size-14 text-ink md:size-16" />
        <p className="m-0 flex min-w-0 flex-col">
          <span className="font-display text-[clamp(1.6rem,4vw,2.1rem)] font-black leading-none tracking-tight text-ink">
            <span className="sr-only">Verdict : </span>
            {tone.word}
          </span>
          {note ? <span className="mt-1.5 text-base leading-snug text-ink">{note}</span> : null}
        </p>
      </div>
      {center ? (
        <p className="m-0 text-[15px] leading-snug text-ink">
          S&apos;il en a mangé, appelle le {center.name} ({center.city}
          {center.hours ? `, ${center.hours}` : ''}) au{' '}
          <a href={`tel:${center.tel}`} className="whitespace-nowrap font-semibold text-ink underline underline-offset-2">
            {center.phone}
          </a>
          .
        </p>
      ) : null}
    </section>
  )
}
