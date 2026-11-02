// @cdc lot 6 — page publique du scanner : rendu serveur indexable, revalidée toutes les 60 s
// pour le bloc « Derniers scans ». L'analyse elle-même demande un compte (ScannerTool).
import type { Metadata } from 'next'
import { ToolPage, type FaqEntry } from '@/components/outils/ToolPage'
import { RecentScans } from '@/components/scanner/RecentScans'
import { ScannerExample } from '@/components/scanner/ScannerExample'
import { ScannerMethod } from '@/components/scanner/ScannerMethod'
import { ScannerTool } from '@/components/scanner/ScannerTool'
import { FREE_MONTHLY_SCANS } from '@/lib/scanner/config'

export const revalidate = 60

export const metadata: Metadata = {
  title: { absolute: "Scanner d'étiquette de croquettes : la note de leur composition" },
  description:
    'Prends en photo la composition de ses croquettes : une IA recopie l\'étiquette, notre barème publié calcule une note sur 100 et explique chaque critère.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/scanner' },
  openGraph: {
    title: "Scanner d'étiquette de croquettes",
    description: 'Une photo de la composition, une note sur 100 expliquée critère par critère.',
    url: 'https://www.toutou-gourmet.com/scanner',
    type: 'website',
  },
}

const faq: FaqEntry[] = [
  {
    question: 'Mes photos sont-elles enregistrées ?',
    answer:
      "Non. Les photos sont lues en mémoire le temps de l'analyse, puis oubliées : rien n'est écrit sur disque ni en base. Pour la lecture, elles passent par l'API Gemini de Google. On garde seulement le texte lu sur l'étiquette et la note, rattachés à ton compte.",
  },
  {
    question: "Combien d'analyses puis-je faire ?",
    answer: `${FREE_MONTHLY_SCANS} par mois avec un compte gratuit. Un produit déjà analysé (même code-barres) s'affiche sans être décompté. Le compteur repart à zéro le 1er de chaque mois.`,
  },
  {
    question: "L'IA peut-elle se tromper en lisant l'étiquette ?",
    answer:
      "Oui : un chiffre mal lu sur une photo floue, un ingrédient sauté sur un emballage plié. Compare le résultat avec ton paquet et signale l'erreur sous le résultat. Les fiches produits restent marquées « analyse automatique » tant que la rédaction ne les a pas relues.",
  },
  {
    question: "Pourquoi mon paquet n'a-t-il pas de note ?",
    answer:
      "Il manque trop d'informations sur les photos (composition ou constituants analytiques coupés, flous), ou l'aliment est destiné au chat. Le résultat liste ce qui manque : reprends une photo nette de cette partie.",
  },
  {
    question: 'Une bonne note veut-elle dire que ces croquettes conviennent à mon chien ?',
    answer:
      "La note juge la composition écrite sur l'étiquette, pas l'adaptation à ton chien. Chiot, chien âgé, maladie rénale ou allergie : les besoins changent, et ton vétérinaire reste le bon interlocuteur.",
  },
  {
    question: 'Les marques paient-elles pour leur note ?',
    answer: 'Non. Le barème est le même pour tous les produits et il est publié sur cette page.',
  },
]

export default function ScannerPage() {
  return (
    <ToolPage
      slug="scanner"
      path="/scanner"
      crumb="Scanner d'étiquette"
      title="Scanner d'étiquette de croquettes"
      lead={
        <p>
          Prends en photo la composition et les constituants analytiques du paquet. Une IA recopie l&apos;étiquette, notre barème
          calcule une note sur 100 et explique chaque point.
        </p>
      }
      methodTitle="Comment la note sur 100 est-elle calculée ?"
      method={<ScannerMethod />}
      after={<ScannerExample />}
      faqTitle="Questions fréquentes sur le scanner"
      faq={faq}
      app={{
        name: "Scanner d'étiquette de croquettes pour chien",
        description: 'Lecture de la composition par IA et note sur 100 calculée par un barème publié.',
      }}
    >
      <ScannerTool monthlyLimit={FREE_MONTHLY_SCANS} />
      <RecentScans />
    </ToolPage>
  )
}
