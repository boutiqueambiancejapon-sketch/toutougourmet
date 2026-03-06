import type { Metadata } from 'next'
import Link from 'next/link'
import { BodyScoreEvaluator } from '@/components/outils/BodyScoreEvaluator'

export const metadata: Metadata = {
  title: 'Évaluateur de poids & score de condition corporelle chien chat — Toutou Gourmet',
  description:
    'Ton chien ou chat est-il en surpoids, trop maigre ou à son poids idéal ? Évalue son score de condition corporelle (SCC) avec la méthode utilisée par les vétérinaires.',
  alternates: { canonical: 'https://toutougourmet.fr/outils/poids' },
  openGraph: {
    title: 'Évaluateur de poids & score corporel — Toutou Gourmet',
    description: 'Ton animal est-il à son poids de forme ? Découvre son score de condition corporelle vétérinaire.',
    url: 'https://toutougourmet.fr/outils/poids',
    type: 'website',
  },
}

export default function PoidsPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[720px] mx-auto">

        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--text-muted)] mb-6 flex items-center gap-2">
          <Link href="/outils" className="hover:text-[var(--accent-1)]">Outils</Link>
          <span>/</span>
          <span className="text-[var(--text-primary)]">Poids & score corporel</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <span className="text-5xl shrink-0">⚖️</span>
          <div>
            <h1 className="page-title mb-2" >
              Évaluateur de poids & score corporel
            </h1>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Ton animal est-il à son poids de forme, en surpoids ou trop maigre ? L&apos;outil compare
              son poids actuel à son poids idéal et calcule son score de condition corporelle (SCC).
            </p>
          </div>
        </div>

        {/* Évaluateur */}
        <BodyScoreEvaluator />

        {/* Explications */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
            <h2 className="font-bold text-[var(--text-primary)] mb-3" >
              📏 Qu&apos;est-ce que le Score de Condition Corporelle (SCC) ?
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Le SCC est l&apos;indicateur utilisé par les vétérinaires pour évaluer la composition
              corporelle d&apos;un animal sur une échelle de 1 (cachectique) à 9 (obèse).
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Il s&apos;évalue en palpant les côtes, en observant la silhouette de profil (creux abdominal)
              et de dessus (sablier visible). Le score idéal se situe entre 4 et 5.
            </p>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
            <h2 className="font-bold text-[var(--text-primary)] mb-3" >
              ⚠️ Risques du surpoids chez l&apos;animal
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1.5 list-disc pl-4">
              <li>Diabète et résistance à l&apos;insuline</li>
              <li>Problèmes articulaires et d&apos;arthrose prématurés</li>
              <li>Maladies cardiovasculaires</li>
              <li>Réduction de l&apos;espérance de vie de 15 à 20%</li>
            </ul>
          </div>
        </div>

        {/* Nav outils */}
        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--text-muted)] mb-3">Autres outils</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/outils/ration" className="btn-outline text-sm py-2">🥣 Ration journalière →</Link>
            <Link href="/outils/budget" className="btn-outline text-sm py-2">💰 Budget mensuel →</Link>
            <Link href="/outils/cout" className="btn-outline text-sm py-2">📊 Coût annuel →</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
