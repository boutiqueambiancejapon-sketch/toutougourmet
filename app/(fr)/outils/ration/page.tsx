// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { RationCalculator, RationCalculatorFromUrl } from '@/components/outils/RationCalculator'
import { Formula, Sources, ToolPage, type FaqEntry } from '@/components/outils/ToolPage'
import {
  ACTIVITY_FACTORS,
  FRESH_KCAL_100G,
  KIBBLE_KCAL_100G,
  PUPPY_FACTOR,
  RER_COEFF,
  STERILIZED_FACTOR,
  computeRation,
} from '@/lib/calculators'

export const metadata: Metadata = {
  title: { absolute: 'Ration journalière du chien : calculateur en grammes' },
  description:
    'Calcule la ration journalière de ton chien selon son poids, son âge et son activité. Formule NRC 2006, résultat en grammes de croquettes ou de repas frais.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/ration' },
  openGraph: {
    title: 'Calculateur de ration journalière du chien : résultat en grammes selon le NRC',
    description: 'Combien de grammes par jour pour ton chien ? La formule NRC selon son poids, son âge et son activité.',
    url: 'https://www.toutou-gourmet.com/outils/ration',
    type: 'website',
  },
}

const fr = (n: number) => String(n).replace('.', ',')
const adult = (kg: number, activityLevel: 'normal' | 'actif') =>
  computeRation({ animal: 'chien', weightKg: kg, ageGroup: 'adulte', activityLevel, sterilized: false })
const ten = adult(10, 'normal')
const twentyFive = adult(25, 'normal')
const tenActive = adult(10, 'actif')

const faqItems: FaqEntry[] = [
  {
    question: 'Combien de grammes de croquettes donner à mon chien par jour ?',
    answer: `Ça dépend de son poids, de son âge et de son activité. Avec notre calcul, un chien adulte non stérilisé de 10 kg à activité normale a besoin d'environ ${ten.kcal} kcal, soit ${ten.gKibble} g de croquettes à ${KIBBLE_KCAL_100G} kcal les 100 g (${tenActive.gKibble} g s'il est sportif). Un chien de 25 kg : environ ${twentyFive.gKibble} g.`,
  },
  {
    question: 'La quantité indiquée sur le sac de croquettes est-elle fiable ?',
    answer: `Le tableau du sac est calculé pour la densité énergétique de ces croquettes-là, que notre outil ne connaît pas : il prend une moyenne de ${KIBBLE_KCAL_100G} kcal pour 100 g. Si ton sac indique une autre valeur, divise les kcal du résultat par cette valeur et multiplie par 100. Le sac, lui, ne tient compte ni de l'activité ni de la stérilisation.`,
  },
  {
    question: 'Mon chien mange-t-il trop ou pas assez ?',
    answer: "Combine ce calcul avec l'évaluateur de poids. Si ton chien prend du poids avec la ration calculée, réduis de 10 %. S'il en perd, augmente de 10 %. Un suivi de 4 semaines suffit en général pour trouver la bonne quantité.",
  },
  {
    question: 'Faut-il donner la même ration été comme hiver ?',
    answer: "Pas forcément. Un chien qui sort moins en hiver dépense moins. Par forte chaleur, l'appétit baisse. Un chien qui part en randonnée a besoin de plus ce jour-là. Le calcul donne une base, son poids te dit ensuite s'il faut ajuster.",
  },
  {
    question: 'En combien de repas diviser la ration journalière ?',
    answer: "Deux repas par jour pour un adulte, matin et soir. Trois pour un chiot de moins de 6 mois, et parfois pour un chien âgé qui digère mal. Évite de donner toute la ration en une fois à un chien de grande race, à cause du risque de torsion de l'estomac.",
  },
]

const activityList = Object.values(ACTIVITY_FACTORS).map(fr).join(' ; ')

export default function RationPage() {
  return (
    <ToolPage
      slug="ration"
      path="/outils/ration"
      crumb="Ration journalière"
      title="Combien de grammes donner à ton chien par jour ?"
      lead={<p>Son poids, son âge et son activité suffisent. Le résultat est en grammes de croquettes ou de repas frais.</p>}
      methodTitle="Comment la ration est-elle calculée ?"
      method={
        <>
          <p>
            On part du besoin au repos, le RER du National Research Council (NRC 2006), puis on le multiplie par un facteur
            d&apos;activité :
          </p>
          <Formula>{`kcal par jour = ${RER_COEFF.chien} × poids (kg)^0,75 × facteur d'activité`}</Formula>
          <p>
            {`Facteurs d'activité, de calme à intense : ${activityList}. Pour un adulte à activité normale, cela donne ${fr(RER_COEFF.chien * ACTIVITY_FACTORS.normal)} kcal par kg^0,75, entre les 95 et 110 kcal que la FEDIAF retient pour un chien peu actif et un chien modérément actif.`}
          </p>
          <p>
            {`Ajustements : chiot × ${fr(PUPPY_FACTOR)} ; stérilisé × ${fr(STERILIZED_FACTOR)} ; senior ${RER_COEFF.chienSenior} au lieu de ${RER_COEFF.chien} ; race très énergique ${RER_COEFF.hauteEnergie}.`}
          </p>
          <p>
            {`Les grammes viennent de densités moyennes : ${KIBBLE_KCAL_100G} kcal pour 100 g de croquettes, ${FRESH_KCAL_100G} kcal pour 100 g de repas frais. Le mini-calculateur de l'accueil utilise exactement la même formule.`}
          </p>
          <Sources
            items={[
              'National Research Council, Nutrient Requirements of Dogs and Cats, National Academies Press, 2006 (besoin au repos : 70 × poids^0,75).',
              "FEDIAF, Nutritional Guidelines for Complete and Complementary Pet Food for Cats and Dogs, 2021 (besoins d'entretien selon l'activité).",
            ]}
          />
        </>
      }
      faqTitle="Questions fréquentes sur la ration du chien"
      faq={faqItems}
      app={{
        name: 'Calculateur ration journalière chien | Toutou Gourmet',
        description: "Calcule la ration journalière d'un chien selon son poids, son âge et son activité.",
      }}
    >
      {/* Calculateur : pré-rempli par l'URL (?poids=12&age=adulte…), rendu statique sans paramètres */}
      <Suspense fallback={<RationCalculator />}>
        <RationCalculatorFromUrl />
      </Suspense>
    </ToolPage>
  )
}
