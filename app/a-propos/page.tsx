import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'À propos — Qui sommes-nous et comment on fonctionne',
  description:
    "Toutou Gourmet est un comparateur indépendant de pet food premium. Découvrez notre équipe, notre méthodologie et notre modèle d'affiliation.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/a-propos' },
}

export default function AProposPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[720px] mx-auto">
        <header className="mb-10">
          <h1 className="page-title mb-3">
            À propos de Toutou Gourmet
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Le comparateur fun et honnête du pet food premium en France.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {/* Concept */}
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Notre concept
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              Toutou Gourmet est né d&apos;une frustration simple : trouver la meilleure alimentation pour
              son chien ou son chat, c&apos;est une jungle. Chaque marque se dit "la meilleure", les
              comparatifs sur Google sont souvent biaisés ou incomplets, et les vétérinaires n&apos;ont
              pas forcément le temps de tout décortiquer.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              Alors on a pris le temps de le faire. On a comparé des dizaines de marques, décortiqué
              les compositions, testé sur nos propres animaux, et on a retenu les 4 qu&apos;on recommande
              vraiment. Sans langue de bois, avec les points forts ET les points faibles de chacune.
            </p>
          </section>

          {/* Méthodologie */}
          <section id="methodologie">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Notre méthodologie
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              Chaque marque est évaluée sur 6 critères, notés de 0 à 5 :
            </p>
            <ul className="space-y-3">
              {[
                ['Qualité des ingrédients', "Composition, taux de protéines animales réelles, absence d'additifs controversés, traçabilité."],
                ['Rapport qualité/prix', "Prix au kilo ou par portion, en tenant compte de la taille des portions nécessaires."],
                ['Digestibilité', "Retours clients sur la qualité des selles, études disponibles, taux de digestibilité déclarés."],
                ['Variantes disponibles', "Richesse de la gamme : races, âges, problèmes spécifiques."],
                ['Service client', "Réactivité, politique de retour, support disponible."],
                ['Note globale', "Synthèse pondérée des 5 critères précédents."],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="text-[var(--accent-1)] mt-1 shrink-0">▸</span>
                  <div>
                    <span className="font-semibold text-[var(--text-primary)]">{title} : </span>
                    <span className="text-[var(--text-secondary)] text-sm">{desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Affiliation */}
          <section id="affiliation" className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              🔗 Notre modèle d&apos;affiliation
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              Toutou Gourmet est un site indépendant, financé uniquement par l&apos;affiliation. Voici
              comment ça fonctionne :
            </p>
            <ul className="space-y-2 text-[var(--text-secondary)] text-sm mb-4">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-1)] mt-1 shrink-0">✓</span>
                Quand tu cliques sur un de nos liens affiliés et que tu passes commande, on perçoit
                une commission de la marque.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-1)] mt-1 shrink-0">✓</span>
                Cette commission ne change rien au prix que tu paies. Souvent, tu bénéficies même
                d&apos;une réduction exclusive via nos liens.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-1)] mt-1 shrink-0">✓</span>
                Nos avis et notes sont établis indépendamment de toute relation commerciale. On ne
                sélectionne pas une marque parce qu&apos;elle nous paye plus.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-1)] mt-1 shrink-0">✓</span>
                Tous les liens affiliés sont clairement identifiés sur le site (mention "Lien affilié"
                et attribut <code>rel="sponsored"</code> dans le code HTML).
              </li>
            </ul>
            <p className="text-sm text-[var(--text-muted)]">
              Si tu as des questions sur notre modèle économique,{' '}
              <Link href="/contact" className="text-[var(--accent-1)] underline">
                contacte-nous
              </Link>
              .
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Nous contacter
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              Des questions, des retours, un partenariat à proposer ?
            </p>
            <Link href="/contact" className="btn-primary inline-block">
              Nous écrire →
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
