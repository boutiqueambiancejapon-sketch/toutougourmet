// @cdc 5.0 — contrat : Outil calculateur · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import { PrefilledAgeCalculator } from '@/components/outils/PrefilledTools'
import { Sources, ToolPage, type FaqEntry } from '@/components/outils/ToolPage'
import { calculateDogHumanAge } from '@/lib/calculators'

export const metadata: Metadata = {
  title: { absolute: 'Âge de ton chien en âge humain : calculateur par gabarit' },
  description:
    "Quel âge a vraiment ton chien en âge humain ? Convertis l'âge de ton chien selon son gabarit, plus juste que la règle des 7 ans. Gratuit et instantané.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/age' },
  openGraph: {
    title: 'Calculateur âge chien en âge humain : la conversion selon le gabarit',
    description: "Convertis l'âge de ton chien en âge humain selon son gabarit. La règle des 7 ans ne tient pas.",
    url: 'https://www.toutou-gourmet.com/outils/age',
    type: 'website',
  },
}

const lab10 = calculateDogHumanAge(10, 'grand').humanAge
const yorkie10 = calculateDogHumanAge(10, 'petit').humanAge
const one = calculateDogHumanAge(1, 'moyen').humanAge

const faqItems: FaqEntry[] = [
  {
    question: 'La règle « 1 an de chien = 7 ans humains » est-elle exacte ?',
    answer: `Non. Un chien vieillit très vite pendant sa première année (l'équivalent de ${one} ans humains à 1 an dans le tableau de l'AVMA), puis le rythme ralentit et dépend du gabarit. Les petites races vieillissent moins vite que les grandes.`,
  },
  {
    question: "Pourquoi le gabarit change-t-il l'âge humain équivalent ?",
    answer: `Les grandes races vieillissent plus vite que les petites. À 10 ans, un Labrador a l'équivalent de ${lab10} ans humains, un Yorkshire de ${yorkie10} ans. Les grands chiens vivent aussi moins longtemps en moyenne : c'est ce que montre l'étude d'O'Neill et ses collègues sur plus de 5 000 chiens anglais (The Veterinary Journal, 2013).`,
  },
  {
    question: 'À quel âge un chien est-il considéré senior ?',
    answer: "Ça dépend de sa taille : vers 8 à 10 ans pour les petites races, 7 à 8 ans pour les moyennes, 6 à 7 ans pour les grandes et dès 5 à 6 ans pour les très grandes. Ses besoins changent à ce moment-là, en général avec moins de calories.",
  },
  {
    question: 'Mon chien a 1 an, est-il adulte ?',
    answer: `Physiquement, oui pour la plupart des races : à 1 an, il a l'équivalent d'environ ${one} ans humains et sa croissance osseuse est presque terminée. Les très grandes races grandissent jusqu'à 18 à 24 mois. La maturité de comportement arrive souvent entre 2 et 3 ans.`,
  },
  {
    question: 'Comment bien nourrir un chien senior ?',
    answer: "Moins de calories s'il bouge moins, des protéines de bonne qualité pour garder ses muscles, et un suivi de son poids. Le calculateur de ration a un réglage senior qui baisse le besoin énergétique.",
  },
]

export default function AgePage() {
  return (
    <ToolPage
      slug="age"
      path="/outils/age"
      crumb="Âge humain"
      title="Quel âge a ton chien en âge humain ?"
      lead={<p>Son âge et son gabarit suffisent. La règle des 7 ans se trompe surtout sur la première année.</p>}
      methodTitle="Comment l'âge humain est-il calculé ?"
      method={
        <>
          <p>
            On utilise le tableau par gabarit diffusé par l&apos;AVMA, l&apos;association des vétérinaires américains. À 1 an,
            un chien de taille moyenne a l&apos;équivalent de {one} ans humains, puis chaque année compte moins, et plus ou
            moins selon sa taille. Entre deux anniversaires, on répartit l&apos;écart selon les mois.
          </p>
          <p>
            Une autre approche, celle de Wang et ses collègues (Cell Systems, 2020), compare le vieillissement de l&apos;ADN du
            chien et de l&apos;humain. Elle a été établie sur des Labradors seulement, c&apos;est pourquoi on garde le tableau
            par gabarit.
          </p>
          <Sources
            items={[
              'AVMA (American Veterinary Medical Association), tableau « Age of dog in human years » par gabarit.',
              "O'Neill D. G. et al., « Longevity and mortality of owned dogs in England », The Veterinary Journal, 2013.",
              'Wang T. et al., « Quantitative translation of dog-to-human aging by conserved remodeling of the DNA methylome », Cell Systems, 2020.',
            ]}
          />
        </>
      }
      faqTitle="Questions fréquentes sur l'âge du chien"
      faq={faqItems}
      app={{
        name: 'Calculateur âge chien en âge humain | Toutou Gourmet',
        description: "Convertit l'âge d'un chien en âge humain équivalent selon son gabarit.",
      }}
    >
      <PrefilledAgeCalculator />
    </ToolPage>
  )
}
