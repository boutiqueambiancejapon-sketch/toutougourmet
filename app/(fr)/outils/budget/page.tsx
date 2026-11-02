// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { PrefilledBudgetCalculator } from '@/components/outils/PrefilledTools'
import { Formula, ToolPage, type FaqEntry } from '@/components/outils/ToolPage'
import { brandPricings, calculateDailyCalories, calculateMonthlyBudget } from '@/lib/calculators'

export const metadata: Metadata = {
  title: { absolute: 'Budget alimentation chien : Franklin, Elmut, Dog Chef' },
  description:
    'Compare le budget mensuel de Franklin, Elmut et Dog Chef selon le profil de ton chien. Calcul instantané à partir de sa ration.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/budget' },
  openGraph: {
    title: 'Simulateur budget chien : Franklin, Elmut et Dog Chef comparés',
    description: 'Combien coûte vraiment de nourrir ton chien avec ces marques ? Le calcul à partir de sa ration.',
    url: 'https://www.toutou-gourmet.com/outils/budget',
    type: 'website',
  },
}

const fr = (n: number) => String(n).replace('.', ',')
const monthly = (kg: number) => {
  const kcal = calculateDailyCalories({ animal: 'chien', weightKg: kg, ageGroup: 'adulte', activityLevel: 'normal', sterilized: false })
  return brandPricings.map((b) => ({ name: b.name, eur: calculateMonthlyBudget(kcal, b) })).sort((a, b) => a.eur - b.eur)
}
const list = (rows: { name: string; eur: number }[]) => rows.map((r) => `${r.name} ${r.eur} €`).join(', ')
const ten = monthly(10)
const thirty = monthly(30)

const faqItems: FaqEntry[] = [
  {
    question: 'Combien coûte nourrir un chien par mois en France ?',
    answer: `Ça dépend surtout de son poids et du type d'aliment. Avec nos hypothèses de prix, un chien adulte de 10 kg à activité normale coûte par mois : ${list(ten)}. Un chien de 30 kg : ${list(thirty)}.`,
  },
  {
    question: 'Quelle marque de nourriture pour chien est la plus économique ?',
    answer: "Le prix au kilo ne suffit pas à comparer : une croquette apporte deux à trois fois plus de calories pour 100 g qu'un repas frais, donc on en donne moins. L'outil compare le coût de la ration réelle de ton chien, ce qui change parfois le classement.",
  },
  {
    question: 'Comment réduire le budget alimentation de mon chien sans rogner sur la qualité ?',
    answer: "Pèse la ration pour ne pas suralimenter, compte les friandises dedans et profite des offres de bienvenue : -30 % sur la 1re commande en abonnement chez Franklin, -40 % sur la 1re commande chez Elmut, -30 % sur la box d'essai chez Dog Chef.",
  },
  {
    question: 'Les repas frais sont-ils vraiment plus chers que les croquettes ?',
    answer: "Pas toujours au kilo, mais souvent à la ration : un repas frais contient beaucoup d'eau, il en faut donc plus de grammes pour la même énergie. Le résultat de l'outil donne l'écart pour le profil de ton chien.",
  },
]

export default function BudgetPage() {
  return (
    <ToolPage
      slug="budget"
      path="/outils/budget"
      crumb="Budget mensuel"
      title="Combien coûte son alimentation par mois ?"
      lead={<p>Franklin, Elmut et Dog Chef comparés pour la ration de ton chien, pas pour un chien moyen.</p>}
      methodTitle="Comment le budget est-il estimé ?"
      method={
        <>
          <p>
            On calcule d&apos;abord son besoin en kcal avec la formule du{' '}
            <Link href="/outils/ration">calculateur de ration</Link> (NRC 2006). On le convertit en grammes avec la densité
            énergétique de chaque marque, puis on multiplie par son prix au kilo, sur 30 jours.
          </p>
          <Formula>budget par mois = kcal ÷ (kcal pour 100 g) × 100 × prix au kg × 30 ÷ 1000</Formula>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
            {brandPricings.map((b) => (
              <li key={b.slug}>{`${b.name} : ${fr(b.pricePerKg)} € le kg, ${b.kcalPer100g} kcal pour 100 g (${b.type === 'croquettes' ? 'croquettes' : 'repas frais'}).`}</li>
            ))}
          </ul>
          <p>
            Ces prix sont nos hypothèses moyennes pour la gamme standard en abonnement, hors remise de bienvenue. Les
            tarifs changent selon la recette et la formule : vérifie le prix sur le site de la marque avant de commander.
          </p>
        </>
      }
      faqTitle="Questions fréquentes sur le budget alimentation du chien"
      faq={faqItems}
      app={{
        name: 'Estimateur budget alimentation chien | Toutou Gourmet',
        description: 'Compare le budget mensuel de trois marques de nourriture pour chien selon sa ration.',
      }}
    >
      <PrefilledBudgetCalculator />
    </ToolPage>
  )
}
