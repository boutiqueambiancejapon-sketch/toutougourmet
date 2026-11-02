// @cdc premium — page publique de Premium (indexable, statique). Premium est gratuit pendant le
// lancement : aucune carte demandée. Le bouton choisit inscription ou compte côté navigateur.
import type { Metadata } from 'next'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { PremiumCta } from '@/components/compte/PremiumCta'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'
import { PremiumCompare } from './PremiumCompare'

const URL = 'https://www.toutou-gourmet.com/premium'

export const metadata: Metadata = {
  title: { absolute: `Toutou Gourmet Premium, gratuit pendant le lancement` },
  description: `${PREMIUM_MONTHLY_SCANS} analyses de croquettes par mois, courbe de poids avec alertes, historique complet des scans et meilleures alternatives. Gratuit pendant le lancement, sans carte bancaire.`,
  alternates: { canonical: URL },
  openGraph: {
    title: 'Toutou Gourmet Premium, gratuit pendant le lancement',
    description: `${PREMIUM_MONTHLY_SCANS} analyses par mois, alertes de poids et historique complet. Sans carte bancaire.`,
    url: URL,
    type: 'website',
  },
}

const FAQ = [
  {
    question: 'Premium est-il vraiment gratuit ?',
    answer: "Oui, pendant le lancement. Aucune carte bancaire n'est demandée à l'activation, donc rien ne peut être prélevé.",
  },
  {
    question: 'Que se passe-t-il si Premium devient payant ?',
    answer: "On te prévient avant. Rien ne sera prélevé automatiquement : tu choisiras de continuer ou non. Tes chiens, tes pesées et tes analyses restent dans ton compte.",
  },
  {
    question: 'Pourquoi faut-il enregistrer un chien pour activer Premium ?',
    answer: "Les alertes de poids et les offres partent de son profil : âge, poids, activité et stérilisation. Sans chien, Premium n'aurait rien à suivre.",
  },
  {
    question: "Comment l'alerte de poids est-elle calculée ?",
    answer: "On compare ses deux dernières pesées. Un écart de plus de 5 % en moins de deux mois déclenche l'alerte, avec sa ration recalculée au poids d'avant.",
  },
  {
    question: 'Les offres du compte sont-elles des liens partenaires ?',
    answer: "Oui. On touche une commission si tu commandes, sans surcoût pour toi. Les marques sont choisies selon le profil de ton chien et nos fiches d'avis, et les remises affichées sont celles en cours chez nos partenaires.",
  },
  {
    question: 'Comment récupérer ou supprimer mes données ?',
    answer: 'Depuis ton compte : un bouton télécharge tout en JSON, un autre supprime le compte sur-le-champ, formule Premium comprise.',
  },
]

export default function PremiumPage() {
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <div className="v2 mx-auto flex max-w-prose flex-col gap-10 px-4 pt-4 pb-16 md:px-8 md:pt-8">
        <div className="flex flex-col gap-5">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Premium' }]} />
          <header className="flex flex-col gap-3">
            <h1 className="m-0 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">
              Premium, le suivi complet de ton chien
            </h1>
            <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">
              Gratuit pendant le lancement, sans carte bancaire. Si Premium devient payant, on te préviendra avant, et rien ne sera prélevé automatiquement.
            </p>
          </header>
          <PremiumCta />
        </div>

        <section aria-labelledby="contenu" className="flex flex-col gap-4">
          <h2 id="contenu" className="m-0 font-display text-2xl font-black text-ink">Que contient Premium ?</h2>
          <ul role="list" className="m-0 flex list-none flex-col gap-4 p-0">
            <li className="flex flex-col gap-1">
              <h3 className="m-0 text-lg font-semibold text-ink">{`${PREMIUM_MONTHLY_SCANS} analyses par photo par mois au lieu de ${FREE_MONTHLY_SCANS}`}</h3>
              <p className="m-0 leading-relaxed text-ink-2">
                Le scanner lit l&apos;étiquette d&apos;un sac inconnu et note sa composition sur 100. Un produit déjà connu, retrouvé par son code-barres, ne compte jamais.
              </p>
            </li>
            <li className="flex flex-col gap-1">
              <h3 className="m-0 text-lg font-semibold text-ink">La courbe de poids avec alertes</h3>
              <p className="m-0 leading-relaxed text-ink-2">
                Chaque pesée s&apos;ajoute à sa courbe, avec la fourchette de poids adulte de sa race. S&apos;il prend ou perd plus de 5 % en moins de deux mois, sa fiche l&apos;affiche avec la ration recalculée.
              </p>
            </li>
            <li className="flex flex-col gap-1">
              <h3 className="m-0 text-lg font-semibold text-ink">L&apos;historique complet des scans</h3>
              <p className="m-0 leading-relaxed text-ink-2">Toutes tes analyses restent listées dans ton compte. Le compte gratuit garde les 20 dernières.</p>
            </li>
            <li className="flex flex-col gap-1">
              <h3 className="m-0 text-lg font-semibold text-ink">De meilleures alternatives à ses croquettes</h3>
              <p className="m-0 leading-relaxed text-ink-2">
                Sous une croquette notée moins de 55 sur 100, une alternative mieux composée s&apos;affiche, avec la raison de ce choix.
              </p>
            </li>
          </ul>
        </section>

        <PremiumCompare />

        <section aria-labelledby="activer" className="flex flex-col gap-3">
          <h2 id="activer" className="m-0 font-display text-2xl font-black text-ink">Comment activer Premium ?</h2>
          <ol className="m-0 flex flex-col gap-2 pl-5 leading-relaxed text-ink-2 marker:font-semibold marker:text-ink">
            <li>Crée ton compte et confirme ton adresse e-mail avec le lien reçu.</li>
            <li>Enregistre ton chien : nom, âge, poids, activité.</li>
            <li>Dans ton compte, appuie sur « Passer Premium ».</li>
          </ol>
          <PremiumCta />
        </section>

        <section aria-labelledby="faq" className="flex flex-col">
          <h2 id="faq" className="m-0 font-display text-2xl font-black text-ink">Questions fréquentes sur Premium</h2>
          <FaqList>
            {FAQ.map((item) => (
              <FaqItem key={item.question} question={item.question}>
                <p className="m-0">{item.answer}</p>
              </FaqItem>
            ))}
          </FaqList>
        </section>
      </div>
    </>
  )
}
