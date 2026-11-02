// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { CostComparisonTool } from '@/components/outils/CostComparison'
import { Formula, ToolPage, type FaqEntry } from '@/components/outils/ToolPage'
import { FOOD_TYPES, buildCostComparisons, calculateDailyCalories } from '@/lib/calculators'

export const metadata: Metadata = {
  title: 'Comparateur coût alimentation chien : croquettes ou repas frais, le bilan sur un an',
  description:
    "Croquettes standard, premium ou repas frais : compare le coût annuel selon le poids de ton chien, pour la même ration.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/cout' },
  openGraph: {
    title: 'Comparateur coût alimentation chien : croquettes ou repas frais, le bilan sur un an',
    description: 'Croquettes ou repas frais : quelle différence de budget sur un an pour ton chien ?',
    url: 'https://www.toutou-gourmet.com/outils/cout',
    type: 'website',
  },
}

const fr = (n: number) => String(n).replace('.', ',')
const kcal10 = calculateDailyCalories({ animal: 'chien', weightKg: 10, ageGroup: 'adulte', activityLevel: 'normal', sterilized: false })
const ten = Object.fromEntries(buildCostComparisons(kcal10).map((r) => [r.type, r.annualBudget]))
const premium = FOOD_TYPES.find((t) => t.type === 'croquettes-premium')
const fresh = FOOD_TYPES.find((t) => t.type === 'repas-frais')

const faqItems: FaqEntry[] = [
  {
    question: 'Les repas frais pour chien sont-ils vraiment plus chers que les croquettes ?',
    answer: `Au kilo, pas forcément : on compte ${fr(fresh?.pricePerKg ?? 0)} € le kg de repas frais contre ${fr(premium?.pricePerKg ?? 0)} € pour des croquettes premium. Mais un repas frais apporte ${fresh?.kcalPer100g} kcal pour 100 g contre ${premium?.kcalPer100g} : il en faut plus de deux fois plus. Pour un chien de 10 kg, cela donne environ ${ten['repas-frais']} € par an contre ${ten['croquettes-premium']} €.`,
  },
  {
    question: 'Combien coûte une alimentation premium pour chien sur un an ?',
    answer: `Pour un chien adulte de 10 kg à activité normale, comptez environ ${ten['croquettes-premium']} € par an en croquettes premium et ${ten['repas-frais']} € en repas frais, hors remise de bienvenue. Le coût suit le besoin en calories, qui augmente moins vite que le poids : un chien de 30 kg ne coûte pas trois fois plus qu'un chien de 10 kg.`,
  },
  {
    question: 'Les croquettes de grande surface sont-elles suffisantes pour mon chien ?',
    answer: "Une croquette vendue comme aliment complet couvre les besoins minimaux réglementaires. Les écarts portent sur la composition : part de viande, source des protéines, céréales. Lis la liste des ingrédients, classée par ordre décroissant : une viande nommée en tête est bon signe.",
  },
  {
    question: "Qu'est-ce que l'alimentation mixte croquettes + repas frais ?",
    answer: "On remplace une partie de la ration quotidienne, souvent 20 à 30 %, par du repas frais, le reste en croquettes premium. Le coût se situe entre les deux. Calcule chaque part en calories pour ne pas dépasser le besoin total.",
  },
]

export default function CoutPage() {
  return (
    <ToolPage
      slug="cout"
      path="/outils/cout"
      crumb="Coût annuel"
      title="Croquettes ou repas frais : combien sur un an ?"
      lead={<p>Quatre façons de nourrir ton chien, comparées pour la même ration, au mois et à l&apos;année.</p>}
      methodTitle="Comment le coût annuel est-il calculé ?"
      method={
        <>
          <p>
            Son besoin en kcal vient de la formule du <Link href="/outils/ration">calculateur de ration</Link> (NRC 2006).
            Pour chaque type d&apos;aliment, on le convertit en grammes avec une densité énergétique moyenne, puis on
            multiplie par un prix moyen au kilo.
          </p>
          <Formula>coût par mois = kcal ÷ (kcal pour 100 g) × 100 × prix au kg × 30 ÷ 1000 ; par an = × 12</Formula>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
            {FOOD_TYPES.map((t) => (
              <li key={t.type}>{`${t.label} : ${fr(t.pricePerKg)} € le kg, ${t.kcalPer100g} kcal pour 100 g.`}</li>
            ))}
          </ul>
          <p>
            Ces prix et densités sont nos hypothèses moyennes, hors remises. Pour un prix par marque, passe par le{' '}
            <Link href="/outils/budget">simulateur de budget</Link>.
          </p>
        </>
      }
      faqTitle="Questions fréquentes sur le coût de l'alimentation du chien"
      faq={faqItems}
      app={{
        name: 'Comparateur coût alimentation chien | Toutou Gourmet',
        description: "Compare le coût annuel de différents types d'alimentation pour chien selon son poids.",
      }}
    >
      <CostComparisonTool />
    </ToolPage>
  )
}
