// @cdc lot 6 — « Qu'est-ce qu'une bonne composition de croquettes pour chien ? » sur /scanner :
// repères chiffrés et sourcés. Seuils alignés sur lib/scanner/score.ts et docs/v2/scanner-score.md.

const MARKS: [string, string, string][] = [
  ['Protéines', 'au moins 18 % sur matière sèche, note pleine à partir de 36 %', 'FEDIAF 2021, AAFCO (chien adulte)'],
  ['Matières grasses', 'au moins 5,5 % sur matière sèche, entre 10 et 22 % pour un chien d\'activité normale', 'FEDIAF 2021, NRC 2006'],
  ['Glucides estimés', '30 % sur matière sèche ou moins pour la note pleine, plus de 50 % pour la plus basse', 'NRC 2006 : aucun besoin minimal chez l\'adulte'],
  ['Premier ingrédient', 'une viande ou un poisson dont l\'espèce est nommée (« poulet », « saumon »)', 'Règlement (CE) 767/2009, art. 17 : ordre de poids décroissant'],
  ['Part animale', 'un pourcentage écrit ; « au poulet » veut dire 4 % au moins, « riche en poulet » 14 %', 'FEDIAF, Code of Good Labelling Practice, 2019'],
  ['Calcium et phosphore', 'rapport entre 1 et 2 pour 1', 'FEDIAF 2021, AAFCO'],
  ['Additifs', 'ni BHA, ni BHT, ni éthoxyquine, aucun sucre ajouté ni colorant', 'Règlement (UE) 2017/962 ; CIRC vol. 40'],
]

export function CompositionGuide() {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-base leading-relaxed text-ink-2">
        Une bonne croquette pour chien adulte annonce une viande ou un poisson d&apos;espèce nommée en tête de liste, plus de 30 %
        de protéines sur matière sèche et moins de 40 % de glucides, sans sucre ni colorant. Les repères ci-dessous sont ceux du
        barème de la note.
      </p>
      <table className="w-full border-collapse text-[15px]">
        <caption className="pb-2 text-left font-semibold text-ink">Repères pour un chien adulte en bonne santé</caption>
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th scope="col" className="py-2 pr-2 font-semibold text-ink">Critère</th>
            <th scope="col" className="py-2 font-semibold text-ink">Repère</th>
          </tr>
        </thead>
        <tbody>
          {MARKS.map(([name, mark, source]) => (
            <tr key={name} className="border-b border-line align-top">
              <th scope="row" className="py-2 pr-3 text-left font-semibold text-ink">{name}</th>
              <td className="py-2">
                <span className="block text-ink">{mark}</span>
                <span className="block text-sm text-ink-2">{source}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        Un chiot, une chienne qui allaite ou un chien malade ont d&apos;autres besoins : la FEDIAF demande par exemple 25 g de
        protéines pour 100 g de matière sèche avant 14 semaines. Pour une maladie rénale ou digestive, le choix se fait avec le
        vétérinaire.
      </p>
    </div>
  )
}
