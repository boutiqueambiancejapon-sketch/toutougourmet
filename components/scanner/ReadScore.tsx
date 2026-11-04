import { BAND_LABELS, type Band } from '@/lib/scanner/score'
import { BAND_CLASSES } from './ScoreBadge'

// @cdc lot 6 — « Comment lire la note » : les 4 tranches réelles de lib/scanner/score.ts (bandFor),
// une phrase concrète chacune. Garder les seuils alignés avec bandFor.

const LEVELS: { band: Band; range: string; text: string }[] = [
  { band: 'tres-bon', range: '75 à 100', text: 'Viande ou poisson d\'espèce nommée en tête, protéines au-dessus de 30 % sur sec, pas de sucre ni de colorant.' },
  { band: 'correct', range: '55 à 74', text: 'Une base animale correcte avec un ou deux défauts : céréales en deuxième position, part de viande non déclarée.' },
  { band: 'moyen', range: '35 à 54', text: 'Souvent une céréale ou une catégorie floue (« viandes et sous-produits animaux ») en tête, et beaucoup de glucides.' },
  { band: 'faible', range: '0 à 34', text: 'Peu de protéines animales identifiables, sucres, colorants ou conservateurs controversés dans la liste.' },
]

export function ReadScore() {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        Une note de 75 ou plus signale une très bonne composition, 55 à 74 une composition correcte. Chaque tranche, avec le
        profil d&apos;étiquette qu&apos;on y trouve le plus souvent :
      </p>
      <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {LEVELS.map((l) => (
          <li key={l.band} className="flex flex-col items-start gap-2 rounded-card sm:flex-row sm:gap-4 border border-line bg-paper p-4">
            <span className={`inline-flex min-w-24 shrink-0 justify-center rounded-pill px-3 py-1.5 text-sm font-bold ${BAND_CLASSES[l.band]}`}>{l.range}</span>
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold text-ink">{BAND_LABELS[l.band]}</span>
              <span className="text-[15px] leading-relaxed text-ink-2">{l.text}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        La note juge la composition écrite sur le sac, pas l&apos;adaptation à ton chien : un chiot, un chien âgé ou malade a des
        besoins propres, à voir avec ton vétérinaire. Une friandise a les mêmes tranches de couleur, calculées avec son propre
        barème. Une note se compare dans sa catégorie : l&apos;eau d&apos;une pâtée change le calcul face à des croquettes.
      </p>
    </div>
  )
}
