import { Formula, Sources } from '@/components/outils/ToolPage'
import { SCORE_VERSION } from '@/lib/scanner/score'

// @cdc lot 6 — « Comment la note est-elle calculée ? » sur /scanner : barème en clair et sources.
// Doit rester aligné avec lib/scanner/score.ts et docs/v2/scanner-score.md.

const CRITERIA: [string, number, string][] = [
  ['Protéines sur matière sèche', 20, '0 sous 18 % (minimum FEDIAF et AAFCO pour un adulte), 20 à partir de 36 %'],
  ['Matières grasses sur matière sèche', 10, '0 sous 5,5 %, maximum entre 10 et 22 %'],
  ['Glucides estimés sur matière sèche', 15, 'maximum jusqu\'à 30 %, 2 points au-delà de 50 %'],
  ['Premier ingrédient', 15, '15 pour une viande ou un poisson d\'espèce nommée, 7 si l\'espèce n\'est pas précisée, 3 pour des sous-produits (« viandes et sous-produits animaux (dont poulet) » en reste un)'],
  ['Part de viande ou poisson déclarée', 10, 'selon les pourcentages écrits, 0 si aucun'],
  ['Ingrédients animaux non nommés', 10, '0 si « viandes et sous-produits animaux » ou une catégorie de ce type apparaît, 5 pour un ingrédient animal sans espèce (« graisses animales »), 3 pour deux ou plus'],
  ['Céréales en tête', 5, '0 si une céréale est le premier ingrédient, 3 en deuxième ou troisième position, 1 si deux céréales ou plus figurent parmi les 5 premiers ingrédients'],
  ['Sucres ajoutés', 5, '0 si un sucre, un sirop ou du caramel est listé'],
  ['Conservateurs controversés', 5, '0 si BHA, BHT ou éthoxyquine apparaît, 3 si des antioxygènes sont cités sans leur nom'],
  ['Colorants', 5, '0 si un colorant est listé'],
  ['Rapport calcium / phosphore', 5, '5 entre 1 et 2 pour 1, 0 hors de cette fourchette ou si les deux valeurs manquent sur la fiche'],
]

export function ScannerMethod() {
  return (
    <>
      <p>
        <strong>D&apos;où viennent les données ?</strong> D&apos;abord de notre base : un produit déjà scanné s&apos;affiche
        tout de suite. Sinon, le serveur interroge{' '}
        <a href="https://world.openpetfoodfacts.org" rel="noopener">
          Open Pet Food Facts
        </a>
        , base ouverte remplie par ses contributeurs (licence ODbL), en n&apos;envoyant que le code-barres. Si la fiche contient la
        composition et les constituants analytiques, notre barème la note sans photo. Sinon, deux photos de l&apos;étiquette
        prennent le relais.
      </p>
      <p>
        L&apos;IA ne donne pas la note. Elle recopie l&apos;étiquette (composition, constituants analytiques, additifs) dans un
        format fixe. La note vient ensuite d&apos;un barème écrit par la rédaction, le même pour tous les produits, à partir des
        repères de la FEDIAF, du NRC et de l&apos;AAFCO.
      </p>
      <p>
        Protéines, matières grasses et glucides sont ramenés sur matière sèche, une fois l&apos;eau retirée. Sans ce calcul, une
        pâtée à 80&nbsp;% d&apos;eau paraîtrait pauvre en protéines à côté d&apos;une croquette.
      </p>
      <Formula>matière sèche = valeur × 100 ÷ (100 − humidité)</Formula>
      <Formula>glucides = 100 − protéines − matières grasses − cendres − fibres − humidité</Formula>
      <table className="w-full border-collapse text-[15px]">
        <caption className="pb-2 text-left font-semibold text-ink">{`Barème sur 100 points (version ${SCORE_VERSION})`}</caption>
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
        Quand une information manque, le critère n&apos;est pas évalué et la note se calcule sur les critères restants, ce que
        le résultat indique. Sous 60 points évaluables, pas de note : le résultat dit quelle partie reprendre en photo. Une
        croquette qui n&apos;affiche pas son humidité est comptée à 10&nbsp;%, hypothèse écrite avec le résultat (la mention
        n&apos;est obligatoire qu&apos;au-delà de 14&nbsp;%, règlement CE 767/2009).
      </p>
      <p>
        Le barème vise le chien adulte. Il ne mesure ni la digestibilité, ni l&apos;origine des matières premières, ni
        l&apos;adaptation à une maladie. Un taux de protéines élevé ne convient pas à tous les chiens, en cas de maladie rénale
        par exemple : demande l&apos;avis de ton vétérinaire. Les céréales ne sont pas toxiques pour le chien, qui digère
        l&apos;amidon (Axelsson et al., Nature, 2013) : le critère regarde seulement leur place dans la recette.
      </p>
      <Sources
        items={[
          'FEDIAF, Nutritional Guidelines for Complete and Complementary Pet Food for Cats and Dogs, 2021 (minimums par 100 g de matière sèche, rapport Ca/P).',
          'National Research Council, Nutrient Requirements of Dogs and Cats, National Academies Press, 2006.',
          'AAFCO, Dog Food Nutrient Profiles (entretien de l\'adulte : 18 % de protéines et 5,5 % de matières grasses sur matière sèche).',
          'Règlement (CE) n° 767/2009 (ordre des ingrédients, mention de l\'humidité) et directive 82/475/CEE (catégories d\'ingrédients).',
          'Règlement d\'exécution (UE) 2017/962 (suspension de l\'éthoxyquine) ; CIRC, monographie vol. 40 (BHA, groupe 2B).',
          'Axelsson E. et al., « The genomic signature of dog domestication reveals adaptation to a starch-rich diet », Nature 495, 2013.',
        ]}
      />
    </>
  )
}
