// @cdc 5.0 — contrat : Outil test de la marque · rendu SSG · JSON-LD WebApplication + FAQPage
import type { Metadata } from 'next'
import Link from 'next/link'
import { QuizWrapper } from '@/components/quiz/QuizWrapper'
import { ToolPage, type FaqEntry } from '@/components/outils/ToolPage'

export const metadata: Metadata = {
  title: 'Quelle marque pour ton chien ? Le test en 5 questions',
  description:
    "Âge, poids, digestion, budget, croquettes ou repas frais : 5 questions pour savoir quelle marque correspond à ton chien, avec la raison du conseil. Gratuit, sans inscription.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/quiz' },
  openGraph: {
    title: 'Quelle marque pour ton chien ? Le test en 5 questions',
    description: 'Cinq questions sur ton chien, une marque conseillée et pourquoi.',
    url: 'https://www.toutou-gourmet.com/quiz',
    type: 'website',
  },
}

const faqItems: FaqEntry[] = [
  {
    question: 'Combien de temps prend le test ?',
    answer: "Cinq questions, moins de deux minutes, sans inscription. La marque conseillée et la raison du conseil s'affichent tout de suite.",
  },
  {
    question: 'Quelles marques le test peut-il conseiller ?',
    answer: "Les quatre marques de notre sélection : Franklin Pet Food et Ultra Premium Direct pour les croquettes, Elmut et Dog Chef pour les repas frais. Dog Chef propose aussi une formule mixte avec des croquettes.",
  },
  {
    question: 'Le test touche-t-il une commission ?',
    answer: "Oui, si tu commandes par le lien affiché sous le résultat, sans surcoût pour toi. Le lien n'apparaît que lorsqu'une marque devance nettement les autres ; en cas d'égalité, on te renvoie vers nos avis.",
  },
  {
    question: 'Le test remplace-t-il un avis vétérinaire ?',
    answer: "Non. Il aide à choisir une marque selon tes préférences. Pour une allergie, une digestion qui reste fragile ou un poids qui ne bouge pas, demande l'avis de ton vétérinaire avant de changer d'aliment.",
  },
  {
    question: 'Mes réponses sont-elles enregistrées ?',
    answer: "Tes réponses restent dans ton navigateur. On compte seulement, sans rien qui t'identifie, le nombre de tests terminés et la marque conseillée. Si tu laisses ton e-mail pour garder le résultat, il sert uniquement à t'écrire.",
  },
]

export default function QuizPage() {
  return (
    <ToolPage
      slug="quiz"
      path="/quiz"
      crumb="Test de la marque"
      title="Quelle marque pour ton chien ?"
      lead={<p>Cinq questions sur son âge, sa santé, ton budget et le type de repas qui te tente. Tu obtiens une marque et la raison du conseil.</p>}
      methodTitle="Comment le test choisit la marque"
      method={
        <>
          <p>
            Chaque réponse donne des points aux marques qui y répondent. Le type de repas pèse le plus (croquettes ou repas
            frais), puis la digestion, l&apos;allergie et le budget. L&apos;âge départage. Le poids ne change pas le
            conseil&nbsp;: il sert à pré-remplir le <Link href="/outils/ration">calcul de ration</Link>.
          </p>
          <p>
            Les raisons affichées sous le résultat viennent de nos fiches marques (prix au kilo ou par mois, format,
            cuisson). Les points attribués à chaque réponse sont un choix de la rédaction. Si deux marques arrivent à
            égalité, on n&apos;affiche aucun lien partenaire et on te propose nos deux avis.
          </p>
          <p>
            Les tranches d&apos;âge suivent les AAHA Canine Life Stage Guidelines (Creevy et al., Journal of the American
            Animal Hospital Association, 2019)&nbsp;: un chien est senior dans le dernier quart de son espérance de vie, donc
            plus tôt pour un grand chien. Pour comparer toutes les marques, ouvre le <Link href="/comparateur">comparateur</Link>.
          </p>
        </>
      }
      faqTitle="Questions fréquentes sur le test"
      faq={faqItems}
      app={{
        name: 'Test\u00a0: quelle marque de nourriture pour ton chien\u00a0?',
        description: 'Test gratuit en 5 questions pour choisir une marque de croquettes ou de repas frais adaptée à ton chien.',
      }}
    >
      <QuizWrapper />
    </ToolPage>
  )
}
