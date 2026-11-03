// @cdc 5.0 — contrat : Outil · rendu SSG · JSON-LD WebApplication + HowTo + FAQPage + BreadcrumbList
// Mot-clé : fiche de garde chien (variantes : fiche pet sitter, consignes pet sitter, modèle à
// imprimer, fiche de liaison). Aucun site français ne propose de fiche gratuite à remplir (SERP
// du 3 novembre 2026) : angle outil, la ration calculée et les interdits du guide en plus.
import type { Metadata } from 'next'
import Link from 'next/link'
import { Formula, Sources, ToolPage, type FaqEntry } from '@/components/outils/ToolPage'
import { LandingSections, STEPS } from '@/components/garde/LandingSections'
import { PublicSheetForm } from '@/components/garde/PublicSheetForm'
import { KIBBLE_KCAL_100G, RER_COEFF, ACTIVITY_FACTORS, STERILIZED_FACTOR } from '@/lib/calculators'
import { EXAMPLE_SHEET } from '@/lib/garde/view'
import { defaultGrams } from '@/lib/garde/sheet'

const URL = 'https://www.toutou-gourmet.com/outils/fiche-de-garde'
const TITLE = 'Fiche de garde pour chien : à remplir ou à imprimer'
const DESCRIPTION =
  "Prépare la fiche de garde de ton chien : ration en grammes, friandises permises, aliments interdits, numéros d'urgence. Un lien à envoyer au pet sitter."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'website' },
}

const fr = (n: number) => String(n).replace('.', ',')
const grams = defaultGrams(EXAMPLE_SHEET)
const stock = Math.round((grams * 18) / 100) / 10

const faqItems: FaqEntry[] = [
  {
    question: 'Que laisser au pet sitter pour son chien ?',
    answer:
      "Ses croquettes habituelles pour toute l'absence plus 3 jours de marge, ses gamelles, sa laisse, son carnet de santé, ses médicaments et une fiche écrite : ration en grammes, heures des repas, friandises permises, aliments interdits et numéros à appeler.",
  },
  {
    question: 'Combien de croquettes laisser pendant les vacances ?',
    answer: `La ration du jour multipliée par le nombre de jours, plus 3 jours de marge. Un chien adulte stérilisé de 12 kg mange environ ${grams} g par jour avec notre calcul : pour 15 jours d'absence, prévois 18 × ${grams} g, soit ${fr(stock)} kg.`,
  },
  {
    question: 'La fiche de garde est-elle gratuite ?',
    answer:
      "Oui. Le formulaire, la fiche, le lien et le PDF sont gratuits. Le lien et le PDF demandent un compte gratuit, qui garde la fiche pour la prochaine absence. Le modèle vierge à imprimer demande seulement une adresse e-mail.",
  },
  {
    question: 'La personne qui garde le chien doit-elle créer un compte ?',
    answer: "Non. Elle ouvre le lien sur son téléphone, la fiche s'affiche sans compte ni application. Les numéros s'appellent d'un geste.",
  },
  {
    question: 'Quelles informations personnelles le lien montre-t-il ?',
    answer:
      "Ton téléphone et celui de ton vétérinaire, rien d'autre : ni e-mail, ni adresse. Le lien est impossible à deviner, n'est pas indexé par Google et expire le lendemain de ton retour. Supprimer la fiche le coupe tout de suite.",
  },
  {
    question: "Que faire si le chien mange un aliment interdit pendant la garde ?",
    answer:
      "Appeler tout de suite son vétérinaire ou un centre antipoison vétérinaire, sans attendre les symptômes, avec le poids du chien et la quantité avalée. En France, le CNITV de Lyon répond 24 h sur 24 au 04 78 87 10 40. Le numéro du pays de la garde figure en rouge sur la fiche.",
  },
  {
    question: 'Faut-il changer de croquettes avant de faire garder son chien ?',
    answer:
      "Non. Un changement d'aliment se fait progressivement sur 7 à 10 jours. Juste avant un départ, il ajoute un risque de diarrhée au stress de la séparation : on garde ses croquettes habituelles pendant toute la garde.",
  },
  {
    question: 'Fiche de garde, fiche de liaison, consignes pet sitter : quelle différence ?',
    answer:
      "Aucune sur le fond : trois noms pour la même page de consignes. Un contrat de garde, lui, fixe le prix et les responsabilités : la fiche ne le remplace pas.",
  },
]

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Préparer la fiche de garde de son chien',
  totalTime: 'PT5M',
  step: STEPS.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text, url: `${URL}#etapes` })),
}

export default function SitterSheetToolPage() {
  return (
    <ToolPage
      slug="fiche-de-garde"
      path="/outils/fiche-de-garde"
      crumb="Fiche de garde"
      title="Fiche de garde pour chien, à remplir ou à imprimer"
      lead={
        <p>
          Combien de croquettes, à quelle heure, ce qu&apos;il ne doit jamais manger et qui appeler : la fiche dit tout au gardien sur
          une page. La ration se calcule toute seule à partir de son poids.
        </p>
      }
      before={<LandingSections />}
      methodTitle="Comment la ration de la fiche est-elle calculée ?"
      method={
        <>
          <p>
            Avec la formule de notre <Link href="/outils/ration">calculateur de ration</Link> : le besoin au repos du National Research
            Council (NRC 2006), multiplié par un facteur d&apos;activité.
          </p>
          <Formula>{`kcal par jour = ${RER_COEFF.chien} × poids (kg)^0,75 × facteur d'activité`}</Formula>
          <p>
            {`Activité normale × ${fr(ACTIVITY_FACTORS.normal)}, chien stérilisé × ${fr(STERILIZED_FACTOR)}. Les grammes supposent des croquettes à ${KIBBLE_KCAL_100G} kcal pour 100 g : si le sac de ton chien indique une autre valeur, tape directement les grammes conseillés sur le sac.`}
          </p>
          <p>
            Les aliments interdits viennent de nos <Link href="/chien/urgences">guides urgences</Link>,
            chacun classé « danger » avec sa dose toxique et ses sources.
          </p>
          <Sources
            items={[
              'National Research Council, Nutrient Requirements of Dogs and Cats, National Academies Press, 2006 (besoin au repos : 70 × poids^0,75).',
              "FEDIAF, Nutritional Guidelines for Complete and Complementary Pet Food for Cats and Dogs, 2021 (besoins d'entretien selon l'activité).",
              "CNITV, Centre national d'informations toxicologiques vétérinaires, VetAgro Sup Lyon (numéro 24 h sur 24).",
            ]}
          />
        </>
      }
      faqTitle="Questions fréquentes sur la fiche de garde"
      faq={faqItems}
      jsonLd={[howToJsonLd]}
      app={{ name: 'Fiche de garde pour chien | Toutou Gourmet', description: DESCRIPTION }}
    >
      <PublicSheetForm />
    </ToolPage>
  )
}
