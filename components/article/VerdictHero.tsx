import { VerdictIcon, type VerdictKind } from '@/components/icons'
import { VerdictPoisonLine } from './VerdictPoisonLine'

// @cdc 04-pages — verdict en tête d'article (audit design-cro §3 « Article ») : la réponse
// tient sous le titre, en grand, teintée selon le verdict, sans bordure colorée.
// Rendu serveur : le verdict fait partie du texte indexable.

const TONE: Record<VerdictKind, { word: string; bg: string }> = {
  oui: { word: 'OUI', bg: 'bg-green-bg' },
  moderation: { word: 'AVEC MODÉRATION', bg: 'bg-amber-bg' },
  danger: { word: 'DANGER', bg: 'bg-rose-bg' },
}

export function VerdictHero({ verdict, note, call = verdict === 'danger' }: { verdict: VerdictKind; note?: string; call?: boolean }) {
  const tone = TONE[verdict]
  return (
    <section aria-label="Verdict" className={`v2 flex flex-col gap-3 rounded-card p-4 md:p-5 ${tone.bg}`}>
      <div className="flex items-center gap-4">
        <VerdictIcon verdict={verdict} className="tg-stamp size-14 shrink-0 text-ink md:size-16" />
        <p className="m-0 flex min-w-0 flex-col">
          <span className="font-display text-[clamp(1.6rem,4vw,2.1rem)] font-black leading-none tracking-tight text-ink">
            <span className="sr-only">Verdict : </span>
            {tone.word}
          </span>
          {note ? <span className="mt-1.5 text-base leading-snug text-ink">{note}</span> : null}
        </p>
      </div>
      {call ? <VerdictPoisonLine /> : null}
    </section>
  )
}
