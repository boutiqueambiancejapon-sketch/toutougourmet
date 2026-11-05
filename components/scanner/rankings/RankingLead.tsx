import { capByBrand, displayBrand, displayName, type RankSegment } from '@/lib/scanner/rankings'
import type { RankedRecipe } from '@/lib/server/rankings'

// @cdc cluster scanner — la réponse en tête de page, recalculée avec le classement : la phrase que Google et les IA reprennent.

const when = (list: RankedRecipe[]) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date(Math.max(...list.map((r) => r.updatedAt.getTime()))))

export function RankingLead({ segment, list }: { segment: RankSegment; list: RankedRecipe[] }) {
  if (list.length === 0) return <p className="m-0 text-base leading-relaxed text-ink-2">Ce classement se remplit au fil des étiquettes lues.</p>
  const label = (r: RankedRecipe) => `${displayBrand(r.brand)} ${displayName(r.name)}`
  const value = (r: RankedRecipe) => (segment.byFat ? `${String(r.fat).replace('.', ',')}\u00a0%` : `${r.score}/100`)
  const [a, ...rest] = capByBrand(list, 1)
  const others = rest.slice(0, 2).map((r) => `${label(r)} (${value(r)})`).join(' et ')
  const top = segment.byFat ? `${value(a)} de matières grasses` : value(a)
  return (
    <div className="flex flex-col gap-2 text-base leading-relaxed text-ink-2">
      <p className="m-0">
        {`Au ${when(list)}, sur ${list.length} recettes ${segment.audience} lues, ${label(a)} arrive en tête avec ${top}.${others ? ` Parmi les autres marques : ${others}.` : ''}`}
      </p>
      <p className="m-0">
        {segment.byFat
          ? "Ce classement compare le gras affiché, pas l'efficacité sur le poids. La ration et la perte de poids se décident avec ton vétérinaire."
          : "La note mesure la composition affichée : viande nommée, protéines, glucides, additifs. Elle ne dit pas comment ton chien digérera la recette, et un chien malade passe d'abord par son vétérinaire."}
      </p>
    </div>
  )
}
