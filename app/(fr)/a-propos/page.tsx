import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'À propos de Toutou Gourmet' },
  description:
    "Qui écrit Toutou Gourmet, comment on note les marques de croquettes et de repas frais, et comment le site gagne de l'argent avec l'affiliation.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/a-propos' },
}

const CRITERIA: [string, string][] = [
  ['Qualité des ingrédients', "Composition, taux de protéines animales réelles, absence d'additifs controversés, traçabilité."],
  ['Rapport qualité/prix', 'Prix au kilo ou par portion, en tenant compte de la taille des portions nécessaires.'],
  ['Digestibilité', 'Retours clients sur la qualité des selles, études disponibles, taux de digestibilité déclarés.'],
  ['Variantes disponibles', 'Étendue de la gamme : races, âges, problèmes spécifiques.'],
  ['Service client', 'Réactivité, politique de retour, support disponible.'],
  ['Note globale', 'Synthèse pondérée des 5 critères précédents.'],
]

const AFFILIATION = [
  'Quand tu cliques sur un de nos liens partenaires et que tu passes commande, la marque nous verse une commission.',
  'Cette commission ne change rien au prix que tu paies. Plusieurs marques accordent une remise de bienvenue à ceux qui passent par nos liens.',
  "Nos avis et nos notes ne dépendent d'aucune relation commerciale. Une marque ne remonte pas dans un classement parce qu'elle paie plus.",
  'Chaque lien partenaire est signalé sur la page (mention « Lien partenaire ») et porte l’attribut rel="sponsored" dans le code HTML.',
]

const h2 = 'text-2xl font-bold mb-4'

export default function AProposPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[720px] mx-auto">
        <header className="mb-10">
          <h1 className="page-title mb-3">À propos de Toutou Gourmet</h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Un site français sur l&apos;alimentation du chien : ce qu&apos;il peut manger, combien lui donner et
            quelles marques choisir.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          <section>
            <h2 className={h2} style={{ fontFamily: "'Fraunces', serif" }}>
              Pourquoi ce site existe
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              Toutou Gourmet est né d&apos;une frustration : chaque marque se dit « la meilleure », les
              comparatifs trouvés sur Google sont souvent incomplets, et le vétérinaire n&apos;a pas toujours le
              temps de décortiquer une étiquette pendant la consultation.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              On compare donc les compositions, les prix et les retours clients, on cite nos sources, et on
              écrit les points faibles de chaque marque à côté de ses points forts.
            </p>
          </section>

          <section id="methodologie">
            <h2 className={h2} style={{ fontFamily: "'Fraunces', serif" }}>
              Comment on note les marques
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">Chaque marque est notée de 0 à 5 sur 6 critères.</p>
            <ul className="space-y-3">
              {CRITERIA.map(([title, desc]) => (
                <li key={title}>
                  <span className="font-semibold text-[var(--text-primary)]">{title}.</span>{' '}
                  <span className="text-[var(--text-secondary)] text-sm">{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="affiliation" className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
            <h2 className={h2} style={{ fontFamily: "'Fraunces', serif" }}>
              Comment le site gagne de l&apos;argent
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              Toutou Gourmet est un site indépendant, financé uniquement par l&apos;affiliation.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)] text-sm mb-4">
              {AFFILIATION.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="text-sm text-[var(--text-muted)]">
              Une question sur notre modèle économique ?{' '}
              <Link href="/contact" className="text-orange-ink underline">
                Écris-nous
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className={h2} style={{ fontFamily: "'Fraunces', serif" }}>
              Nous contacter
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">Une question, une erreur repérée, un partenariat à proposer ?</p>
            <Link href="/contact" className="btn-primary inline-block">
              Nous écrire →
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
