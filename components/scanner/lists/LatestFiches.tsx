import { latestPool } from '@/lib/scanner/fiche-lists'
import { listFiches } from '@/lib/server/scanner-lists'
import { FicheRows } from './FicheRows'

// @cdc scanner — les 3 dernières fiches sur /scanner : fiches contrôlées ou relues, et vrais scans.
// Masqué s'il n'y en a aucune. Rien sur la personne qui a scanné.

const SHOWN = 3

export async function LatestFiches() {
  const items = latestPool(await listFiches()).slice(0, SHOWN)
  if (items.length === 0) return null
  return (
    <section aria-labelledby="dernieres-fiches" className="flex flex-col gap-2">
      <h2 id="dernieres-fiches" className="m-0 font-display text-xl font-black text-ink">
        Dernières fiches
      </h2>
      <FicheRows items={items} showNoun />
    </section>
  )
}
