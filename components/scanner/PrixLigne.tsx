import { dateReleve, euros, remise, type PrixMaxiZoo } from '@/lib/scanner/prix'

// @cdc scanner — prix Maxi Zoo sous un bouton d'achat : prix, prix au kilo, ancien prix barré et remise en promotion,
// date du relevé (le prix peut changer). Rendu serveur.

export function PrixLigne({ prix, compact = false }: { prix: PrixMaxiZoo; compact?: boolean }) {
  const pct = remise(prix)
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-2">
      <span className="font-semibold text-ink">{euros(prix.prix)}</span>
      {pct && prix.prixAncien ? <s className="text-ink-3">{euros(prix.prixAncien)}</s> : null}
      {pct ? <span className="whitespace-nowrap rounded-pill bg-rose-bg px-2 py-0.5 text-xs font-bold text-rose-ink">{`−${pct} %`}</span> : null}
      {prix.prixKg ? <span>{`· ${euros(prix.prixKg)}/kg`}</span> : null}
      {compact ? null : <span className="text-xs">{`· prix Maxi Zoo du ${dateReleve(prix)}, il peut changer`}</span>}
    </span>
  )
}
