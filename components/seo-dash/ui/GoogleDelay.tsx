import type { Filters } from '@/lib/seo-dash/filters'
import { googleDelayNote } from '@/lib/seo-dash/server/range'

// @cdc tableau de bord SEO — en 24 h ou aujourd'hui, les chiffres de Google (par jour, publiés avec 2 à 3 jours de
// retard) montrent le dernier jour publié : on le dit en tête d'écran plutôt que d'afficher des zéros.

export function GoogleDelay({ filters, last }: { filters: Filters; last: string | null | undefined }) {
  const note = last ? googleDelayNote(filters, last) : null
  return note ? <p className="sd-note warn sd-gap">{note}</p> : null
}
