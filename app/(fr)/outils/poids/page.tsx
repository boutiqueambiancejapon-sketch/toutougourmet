// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import { PrefilledBodyScoreEvaluator } from '@/components/outils/PrefilledTools'
import { Sources, ToolPage, type FaqEntry } from '@/components/outils/ToolPage'

export const metadata: Metadata = {
  title: { absolute: 'Poids idéal du chien : calculateur de score corporel' },
  description:
    "Ton chien est-il en surpoids, trop maigre ou à son poids idéal ? Compare son poids à son poids de forme et vois quoi changer dans sa ration.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/poids' },
  openGraph: {
    title: 'Calculateur poids idéal chien : surpoids, maigreur ou poids de forme',
    description: 'Ton animal est-il à son poids de forme ? Compare son poids actuel à son poids idéal.',
    url: 'https://www.toutou-gourmet.com/outils/poids',
    type: 'website',
  },
}

const faqItems: FaqEntry[] = [
  {
    question: 'Comment savoir si mon chien est en surpoids ?',
    answer: "Passe la main sur ses côtes. Si tu les sens sans appuyer, sous une fine couche de graisse, son poids est bon. S'il faut appuyer pour les trouver, il est en surpoids. Si elles se voient, il est trop maigre. Vu de dessus, la taille doit se dessiner derrière les côtes.",
  },
  {
    question: 'Quel est le poids idéal pour mon chien ?',
    answer: "Il n'y a pas de poids idéal universel : il dépend de la race et de la morphologie. Repères généraux : moins de 10 kg pour les petites races, 10 à 25 kg pour les moyennes, 25 à 45 kg pour les grandes. Ton vétérinaire peut fixer un poids cible précis lors d'une visite.",
  },
  {
    question: 'Mon chien est obèse, que faire ?',
    answer: "Ne coupe pas sa ration d'un coup. Les recommandations de l'AAHA visent une perte de 1 à 2 % de son poids par semaine, avec une ration calculée pour son poids de forme. Supprime les friandises hors ration et allonge les promenades. Au-delà de 25 % de surpoids, fais établir le programme par ton vétérinaire.",
  },
  {
    question: "Pourquoi l'obésité est-elle dangereuse pour un chien ?",
    answer: "Elle use les articulations (arthrose précoce), favorise le diabète et gêne la respiration. Elle raccourcit aussi la vie : dans l'étude de Kealy et ses collègues (JAVMA, 2002), des Labradors nourris avec 25 % de moins que leurs frères de portée ont vécu 1,8 an de plus en médiane.",
  },
]

export default function PoidsPage() {
  return (
    <ToolPage
      slug="poids"
      path="/outils/poids"
      crumb="Poids et état corporel"
      title="Ton chien est-il à son poids de forme ?"
      lead={<p>Entre son poids actuel et son poids de forme. Tu sauras s&apos;il faut revoir sa ration, et de combien.</p>}
      methodTitle="Comment le poids est-il évalué ?"
      method={
        <>
          <p>
            L&apos;outil calcule l&apos;écart entre son poids actuel et son poids de forme. Moins de 15 % en dessous : trop
            maigre. De 5 à 15 % en dessous : un peu léger. Jusqu&apos;à 10 % au-dessus : poids de forme. De 10 à 25 % : surpoids.
            Au-delà : fort surpoids. Ces seuils sont des repères de l&apos;outil.
          </p>
          <p>
            Les vétérinaires notent l&apos;état corporel de 1 à 9 (score de condition corporelle de Laflamme, 4 et 5 étant
            l&apos;idéal), en palpant les côtes et en regardant la silhouette. Chaque point au-dessus de 5 correspond à environ
            10 % de poids en trop. Ce score reste la référence : l&apos;outil ne fait que l&apos;approcher par la balance.
          </p>
          <Sources
            items={[
              'Laflamme D. P., « Development and validation of a body condition score system for dogs », Canine Practice, 1997.',
              'Kealy R. D. et al., « Effects of diet restriction on life span and age-related changes in dogs », JAVMA, 2002.',
              'AAHA, Weight Management Guidelines for Dogs and Cats, 2014.',
            ]}
          />
        </>
      }
      faqTitle="Questions fréquentes sur le poids du chien"
      faq={faqItems}
      app={{
        name: 'Évaluateur score corporel chien | Toutou Gourmet',
        description: "Évalue le score de condition corporelle d'un chien selon son poids actuel et son poids idéal.",
      }}
    >
      <PrefilledBodyScoreEvaluator />
    </ToolPage>
  )
}
