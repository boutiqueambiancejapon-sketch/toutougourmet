import { CompareTable, CompareTd, CompareTh, CompareThead, CompareTr } from '@/components/mdx/MdxComponents'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'

// @cdc juridique — tableau comparatif sobre : colonne Yuka limitée aux faits vérifiés le 2026-11-03
// (voir yuka-facts.ts), sans coche ni croix, sans couleur d'avantage. Colonne Toutou Gourmet
// reprise des deux barèmes, aliment complet et friandise (docs/v2/scanner-score.md), et des
// quotas réels (lib/scanner/config.ts).

interface Row {
  label: string
  yuka: string
  toutou: string
}

const ROWS: Row[] = [
  {
    label: 'Produits notés',
    yuka: 'Produits alimentaires et cosmétiques',
    toutou: 'Croquettes, pâtées, friandises et snacks pour chien',
  },
  {
    label: 'Aliments pour animaux',
    yuka: 'Non analysés, d\'après son centre d\'aide',
    toutou: 'Aliments pour chien, complets ou complémentaires (friandises, biscuits, os à mâcher). Pas les aliments pour chat',
  },
  {
    label: 'Calcul de la note',
    yuka: 'Sur 100 pour un aliment : qualité nutritionnelle 60 %, additifs 30 %, bio 10 %',
    toutou: 'Sur 100. Croquettes et pâtées : 13 critères (protéines, graisses et glucides sur matière sèche, ingrédients, additifs, calcium et phosphore). Friandises : 10 critères sur la recette (viande, sucres et sel ajoutés, additifs)',
  },
  {
    label: 'Repères nutritionnels',
    yuka: 'Le Nutri-Score, conçu pour l\'alimentation humaine',
    toutou: 'Minimums FEDIAF, NRC et AAFCO pour le chien adulte',
  },
  {
    label: 'Barème',
    yuka: 'Pondérations décrites dans son centre d\'aide',
    toutou: 'Seuils et points de chaque critère publiés sur la page du scanner',
  },
  {
    label: 'Où ça marche',
    yuka: 'Application mobile',
    toutou: 'Dans le navigateur, sans installation',
  },
  {
    label: 'Prix',
    yuka: 'Version Premium facultative, à partir de 10 € par an en Europe',
    toutou: `Gratuit. Code-barres sans compte, ${FREE_MONTHLY_SCANS} analyses photo par mois avec un compte, ${PREMIUM_MONTHLY_SCANS} avec Premium (gratuit pendant le lancement)`,
  },
]

// Mobile : une carte par critère (trois colonnes ne tiennent pas sous 768 px)
function CompareCards() {
  return (
    <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0 md:hidden">
      {ROWS.map((r) => (
        <li key={r.label} className="rounded-box border border-line bg-paper p-4">
          <p className="m-0 font-semibold text-ink">{r.label}</p>
          <dl className="m-0 mt-2 grid gap-2 text-sm leading-relaxed text-ink-2">
            <div>
              <dt className="font-semibold text-ink">Yuka</dt>
              <dd className="m-0">{r.yuka}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Scanner Toutou Gourmet</dt>
              <dd className="m-0">{r.toutou}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}

export function YukaCompare() {
  return (
    <>
      <CompareCards />
      <div className="hidden md:block">
        <CompareTable>
          <caption className="sr-only">Comparaison factuelle entre Yuka et le scanner Toutou Gourmet</caption>
          <CompareThead>
            <tr>
              <CompareTh>
                <span className="sr-only">Critère</span>
              </CompareTh>
              <CompareTh>Yuka</CompareTh>
              <CompareTh>Scanner Toutou Gourmet</CompareTh>
            </tr>
          </CompareThead>
          <tbody>
            {ROWS.map((r) => (
              <CompareTr key={r.label}>
                <th scope="row" className="px-4 py-3 text-left align-top font-semibold text-ink">
                  {r.label}
                </th>
                <CompareTd>{r.yuka}</CompareTd>
                <CompareTd>{r.toutou}</CompareTd>
              </CompareTr>
            ))}
          </tbody>
        </CompareTable>
      </div>
    </>
  )
}
