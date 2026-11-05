import { Sources } from '@/components/outils/ToolPage'
import { dogSizeRanges } from '@/lib/calculators'
import { TREAT_SCORE_VERSION } from '@/lib/scanner/score-treat'
import { TREAT_SHARE } from '@/lib/scanner/treat-allowance'

// @cdc lot 6 — « Comment est calculée la note des friandises ? » sur /scanner (#methode-friandises).
// Doit rester aligné avec lib/scanner/score-treat.ts et docs/v2/scanner-score.md (barème friandise).

const NB = ' '
const CRITERIA: [string, number, string][] = [
  ['Premier ingrédient', 20, `20 pour une viande ou un poisson d'espèce nommée, 12 pour un morceau nommé comme une trachée, un cou ou une queue, 9 si l'espèce n'est pas précisée, 4 pour des sous-produits ou une partie à mâcher (peau, cuir, corne, sabot, oreille, tendon, nerf, os), 0 sinon`],
  ['Part de viande ou de poisson déclarée', 15, `0 si rien n'est écrit, 1 sous 4${NB}%, 3 de 4 à 14${NB}%, 6 de 14 à 30${NB}%, 9 de 30 à 50${NB}%, 12 de 50 à 70${NB}%, 15 à partir de 70${NB}% ou quand la recette n'est faite que de viande ou de poisson. Les parties à mâcher ne comptent pas comme viande`],
  ['Sucres ajoutés', 12, '0 si un sucre, du miel, de la mélasse, un sirop, du dextrose ou du caramel est listé'],
  ['Colorants, conservateurs et arômes', 13, '13 sans défaut, 6 avec un défaut, 0 avec deux ou plus. Défauts : un colorant, un conservateur ou antioxygène cité sans nom (ou BHA, BHT, éthoxyquine), un arôme artificiel'],
  ['Sel ajouté', 8, '0 si du sel ou du chlorure de sodium est listé (les « sels minéraux » ne comptent pas)'],
  ['Longueur de la liste', 10, '10 jusqu\'à 5 ingrédients, puis 2 de moins par ingrédient en plus : 0 à partir de 10 (additifs non comptés)'],
  ['Glycérine et origine animale non nommée', 8, '8 sans défaut, 4 avec un, 0 avec deux ou plus. Défauts : de la glycérine (E422), des sous-produits, un ingrédient animal sans espèce'],
  ['Céréale ou farine en tête', 4, '0 si le premier ingrédient est une céréale, une farine, un amidon ou une fécule végétale'],
  ['Étiquette complète', 10, '6 pour les 5 constituants affichés, 4 pour 4, 2 pour 3, plus 4 si les calories sont affichées'],
]

const kg = (s: keyof typeof dogSizeRanges) => `${dogSizeRanges[s].midKg}${NB}kg`

export function TreatMethod() {
  const share = `${Math.round(TREAT_SHARE * 100)}${NB}%`
  return (
    <>
      <p>
        Une friandise, un snack, un os à mâcher ou un aliment complémentaire ne nourrit pas seul le chien. Le comparer à une
        croquette sur les protéines ou les glucides n&apos;aurait pas de sens : son barème regarde la recette. La viande vient-elle
        en premier, quelle part en déclare l&apos;étiquette, y a-t-il du sucre, du sel ou des additifs ? Pour lire une friandise,
        la composition suffit.
      </p>
      <table className="w-full border-collapse text-[15px]">
        <caption className="pb-2 text-left font-semibold text-ink">{`Barème des friandises sur 100 points (version ${TREAT_SCORE_VERSION.replace('friandise-', '')})`}</caption>
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th scope="col" className="py-2 pr-2 font-semibold text-ink">
              Critère
            </th>
            <th scope="col" className="py-2 pr-2 text-right font-semibold text-ink">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {CRITERIA.map(([name, pts, rule]) => (
            <tr key={name} className="border-b border-line align-top">
              <td className="py-2 pr-2">
                <span className="block font-semibold text-ink">{name}</span>
                <span className="block text-sm">{rule}</span>
              </td>
              <td className="py-2 text-right font-semibold text-ink">{pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Les deux barèmes utilisent les mêmes tranches de couleur, mais une friandise à 80 ne vaut pas une croquette à 80 : le
        classement les sépare.
      </p>
      <p>
        <strong>Combien par jour ?</strong> Si l&apos;étiquette donne l&apos;énergie (en kcal par kilo, pour 100{NB}g ou par
        pièce), le résultat calcule combien de friandises tiennent dans {share} de l&apos;apport calorique du jour, repère courant
        des vétérinaires. Le besoin du jour vient de la formule du calculateur de ration (NRC 2006) pour un chien adulte d&apos;activité
        normale de {kg('petit')}, {kg('moyen')} ou {kg('grand')}. Sans énergie écrite, le résultat le dit et ne donne pas de
        chiffre.
      </p>
      <p>
        <strong>Alertes.</strong> Xylitol (E967, sucre de bouleau), raisin, chocolat ou cacao, oignon ou ail, peau de buffle ou
        cuir, os cuits ou fumés : ces ingrédients déclenchent une alerte affichée au-dessus de la note, quelle que soit la note.
      </p>
      <Sources
        items={[
          'WSAVA, Feeding treats to your dog, 2025 (repère de 10 % de l\'apport calorique).',
          'FEDIAF, Code of Good Labelling Practice for Pet Food, 2019 (« au poulet » : 4 % au moins, « riche en poulet » : 14 % au moins).',
          'National Research Council, Nutrient Requirements of Dogs and Cats, National Academies Press, 2006 (besoin énergétique).',
          'Règlement (CE) n° 767/2009 (ordre des ingrédients par poids décroissant) et directive 82/475/CEE (catégories d\'ingrédients).',
        ]}
      />
    </>
  )
}
