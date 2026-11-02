// @cdc 5.0 — contrat : Outil bilan · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { BienNourriEvaluator } from '@/components/outils/BienNourriEvaluator'
import { ToolPage, type FaqEntry } from '@/components/outils/ToolPage'

export const metadata: Metadata = {
  title: { absolute: 'Ton chien est-il bien nourri ? Le bilan gratuit' },
  description:
    "6 questions pour évaluer l'alimentation de ton chien : score sur 100, conseils précis selon tes réponses et recommandation adaptée. Gratuit, sans inscription.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/outils/bien-nourri' },
  openGraph: {
    title: 'Est-ce que ton chien est bien nourri ? Le bilan gratuit',
    description: "Évalue l'alimentation de ton chien en 6 questions : score, conseils et recommandation adaptée.",
    url: 'https://www.toutou-gourmet.com/outils/bien-nourri',
    type: 'website',
  },
}

const faqItems: FaqEntry[] = [
  {
    question: 'Combien de temps prend le bilan ?',
    answer: "Six questions courtes, sans inscription. Le score sur 100, le verdict et les conseils liés à tes réponses s'affichent tout de suite.",
  },
  {
    question: 'Le bilan remplace-t-il un avis vétérinaire ?',
    answer: "Non. C'est une auto-évaluation, pas un diagnostic. Pour une maladie, un doute ou un changement d'alimentation délicat (chiot, gestation, maladie chronique), demande l'avis de ton vétérinaire.",
  },
  {
    question: 'Comment est calculé le score ?',
    answer: "Chaque réponse ajoute ou retire des points. Le total est ramené sur 100. Quatre niveaux : très bien nourri (80 et plus), bien nourri (60 à 79), à améliorer (40 à 59), à revoir (moins de 40).",
  },
  {
    question: 'Pourquoi recommandez-vous Dog Chef ou Elmut selon les cas ?',
    answer: "Elmut quand tu coches des signes de peau ou de digestion : ses repas frais sont cuits à basse température, sans conservateurs. Dog Chef quand le poids est à corriger ou que l'alimentation actuelle est basique : les portions sont dosées selon le profil du chien. Si tout va bien, on ne conseille aucune marque et on renvoie vers le comparateur.",
  },
  {
    question: 'Mes réponses sont-elles enregistrées ?',
    answer: "Tes réponses restent dans ton navigateur. On compte seulement, sans rien qui t'identifie, le nombre de bilans terminés et leur niveau de score. Si tu laisses ton e-mail pour garder le résultat, il sert uniquement à t'écrire et n'est transmis à personne.",
  },
]

export default function BienNourriPage() {
  return (
    <ToolPage
      slug="bien-nourri"
      path="/outils/bien-nourri"
      crumb="Bilan alimentation"
      title="Ton chien est-il bien nourri ?"
      lead={<p>6 questions sur sa gamelle, sa silhouette et sa digestion. Tu obtiens un score sur 100 et les points à changer.</p>}
      methodTitle="Sur quoi repose le bilan ?"
      method={
        <>
          <p>
            Les questions reprennent les repères d&apos;un bilan nutritionnel vétérinaire : le type d&apos;aliment,
            l&apos;état corporel (côtes palpables, taille visible), les signes de peau et de pelage, le transit, la façon de
            doser et le nombre de repas.
          </p>
          <p>
            Le type d&apos;aliment, l&apos;état corporel et la digestion pèsent le plus dans le score. La recommandation dépend du profil : <Link href="/chien/marque/elmut">Elmut</Link> pour des signes de peau ou de
            digestion, <Link href="/chien/marque/dog-chef">Dog Chef</Link> pour un poids à corriger, sinon le{' '}
            <Link href="/comparateur">comparateur</Link>.
          </p>
          <p>
            Le bilan s&apos;inspire des WSAVA Nutritional Assessment Guidelines (Freeman et al., Journal of Small Animal
            Practice, 2011). Les points attribués à chaque réponse sont un choix de la rédaction.
          </p>
        </>
      }
      faqTitle="Questions fréquentes sur le bilan alimentation"
      faq={faqItems}
      app={{
        name: 'Bilan alimentation chien : est-ce que ton chien est bien nourri ?',
        description: "Bilan gratuit en 6 questions pour évaluer la qualité de l'alimentation de ton chien.",
      }}
    >
      <BienNourriEvaluator />
    </ToolPage>
  )
}
