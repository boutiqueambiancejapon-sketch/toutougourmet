import type { ProductKind } from '@/lib/scanner/score'
import { opffIndexPolicy } from '@/lib/server/scanner-published'
import { frenchDate, isoDay, publishedRule, RANKING_COPY } from './ranking-copy'
import { titleTypo } from '@/lib/title-typo'

// @cdc lot 6 — en-tête des classements : H1, introduction factuelle (nombre de fiches publiées,
// méthode, règle de publication) et date de mise à jour calculée sur la fiche la plus récente.
// Rendu serveur : tout ce texte est dans le HTML servi.

const METHOD: Record<ProductKind, string> = {
  complete:
    "La note juge la composition écrite sur l'étiquette avec le barème du scanner : protéines et glucides ramenés sur matière sèche, premier ingrédient, part de viande déclarée, additifs.",
  treat:
    "La note vient du barème friandise : viande ou poisson nommé en premier, part de viande déclarée, sucre et sel ajoutés, additifs, longueur de la liste. Elle ne se compare pas à celle d'une croquette.",
}

export function RankingHeader({ kind, count, enough, updated }: { kind: ProductKind; count: number; enough: boolean; updated: Date | null }) {
  const copy = RANKING_COPY[kind]
  const lead = enough
    ? `${count} ${copy.noun} pour chien ont une fiche publiée, classées de la meilleure à la plus faible note sur 100.`
    : `Le classement des ${copy.noun} pour chien se remplit au fil des fiches publiées.`
  return (
    <header className="flex flex-col gap-3">
      <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">{titleTypo(copy.h1)}</h1>
      <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">{`${lead} ${METHOD[kind]}`}</p>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        {`${publishedRule(opffIndexPolicy())} Un produit absent n'a pas encore de fiche, ce qui ne dit rien de sa note.`}
        {updated ? (
          <>
            {' Mis à jour le '}
            <time dateTime={isoDay(updated)}>{frenchDate(updated)}</time>.
          </>
        ) : null}
      </p>
    </header>
  )
}
