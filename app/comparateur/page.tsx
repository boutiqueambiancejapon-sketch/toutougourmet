import type { Metadata } from 'next'
import Link from 'next/link'
import { ComparisonTable, brandAccents } from '@/components/comparateur/ComparisonTable'
import { Disclosure } from '@/components/ui/Disclosure'
import { brands } from '@/data/brands'

export const metadata: Metadata = {
  title: 'Comparatif nourriture pour chien',
  description:
    'Comparez Franklin, Elmut, Petty Well et Dog Chef : notes, prix, ingrédients, croquettes et nourriture fraîche pour chien. Offres et promos 2026.',
  alternates: { canonical: 'https://toutougourmet.fr/comparateur' },
}

const brandBgs = ['#C2F0D5', '#FFD6E3', '#C8DCFF', '#FFE8B5']

export default function ComparateurPage() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1280px] mx-auto">

        {/* Header compact */}
        <div className="mb-10 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            Mis à jour mars 2026
          </p>
          <h1 className="page-title mb-3">Comparatif nourriture pour chien — 4 marques premium</h1>
          <p className="text-base text-[var(--text-secondary)]">
            Franklin, Elmut, Petty Well et Dog Chef — croquettes et nourriture fraîche pour chien, analysés sur les mêmes critères, sans favoritisme.
          </p>
        </div>

        {/* Cartes marques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {brands.map((brand, i) => (
            <div
              key={brand.slug}
              className="rounded-[var(--radius-xl)] p-5 flex flex-col"
              style={{ background: brandBgs[i], borderTop: `3px solid ${brandAccents[i]}` }}
            >
              {/* Nom + score */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div
                  className="font-black text-lg leading-tight"
                  style={{ fontFamily: "'Fraunces', serif", color: brandAccents[i] }}
                >
                  {brand.name}
                </div>
                <div
                  className="font-black text-2xl leading-none shrink-0"
                  style={{ fontFamily: "'Fraunces', serif", color: brandAccents[i] }}
                >
                  {brand.scores.global.toFixed(1)}
                  <span className="text-sm font-normal opacity-60">/5</span>
                </div>
              </div>

              {/* Tagline — texte sombre sur fond clair = bon contraste */}
              <p className="text-sm leading-snug mb-4" style={{ color: 'var(--text-secondary)' }}>
                {brand.tagline}
              </p>

              {/* Pros */}
              <ul className="space-y-2 mb-5 flex-1">
                {brand.pros.slice(0, 3).map((pro, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-bold mt-px shrink-0" style={{ color: brandAccents[i] }}>✓</span>
                    {pro}
                  </li>
                ))}
              </ul>

              {/* Offre — fond blanc solide pour bon contraste */}
              <div
                className="text-sm font-bold text-center px-3 py-1.5 rounded-full mb-3"
                style={{ background: '#ffffff', color: brandAccents[i] }}
              >
                {brand.discountOffer}
              </div>
              <Link
                href={brand.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-primary text-sm py-2.5 text-center block"
              >
                Essayer →
              </Link>
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div className="rounded-[var(--radius-xl)] overflow-hidden mb-6"
          style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', background: 'var(--bg-surface)' }}>
          <ComparisonTable />
        </div>

        <div className="max-w-lg mx-auto mb-8">
          <Disclosure type="full" />
        </div>

        {/* Méthodologie */}
        <div className="rounded-[var(--radius-xl)] p-6 mb-8"
          style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Notre méthodologie de notation
          </h2>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Chaque marque est notée sur 6 critères, de 0 à 5. Les notes sont calculées sur la base de :
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5" style={{ color: 'var(--text-secondary)' }}>
            <li>L&apos;analyse de la composition des aliments (liste d&apos;ingrédients, taux de protéines)</li>
            <li>Les retours de propriétaires et avis vérifiés en ligne</li>
            <li>La comparaison prix/qualité sur les gammes standards</li>
            <li>Les recommandations vétérinaires disponibles publiquement</li>
            <li>Notre propre test sur une période de 4 semaines minimum</li>
          </ul>
        </div>

        {/* CTA Quiz */}
        <div className="text-center">
          <p className="mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            Tu ne sais pas quelle marque choisir pour ton animal ?
          </p>
          <Link href="/quiz" className="btn-primary inline-block">
            Faire le quiz personnalisé →
          </Link>
        </div>

        {/* SEO block + FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="page-title mb-4">
            Quelle nourriture pour chien choisir ?
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
            Croquettes, pâtées, repas frais, sans céréales… le marché du pet food déborde d&apos;options et les
            promesses marketing se ressemblent toutes. Ce comparatif nourriture pour chien analyse Franklin,
            Elmut, Petty Well et Dog Chef sur les mêmes critères objectifs. Tu hésite entre croquettes classiques
            et comparatif nourriture fraîche pour chien ? On détaille les différences ci-dessous pour t&apos;aider
            à faire le meilleur choix selon le profil de ton chien — sans jargon.
          </p>

          {/* FAQ */}
          <div className="space-y-8">

            <div>
              <h3 className="mb-2">
                Quelle est la différence entre les croquettes classiques et le repas frais pour chien ?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Les croquettes subissent une cuisson à haute température (extrusion) qui concentre les nutriments
                mais peut dégrader certaines protéines et vitamines. Le repas frais (comme Dog Chef ou Petty Well
                en format barquette) est cuit à basse température, ce qui préserve davantage la valeur nutritive
                des ingrédients. En pratique, la différence se ressent surtout sur la digestibilité et la qualité
                du poil pour les chiens sensibles.
              </p>
            </div>

            <div>
              <h3 className="mb-2">
                Les croquettes sans céréales sont-elles vraiment meilleures ?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Pas systématiquement. Les croquettes sans céréales contiennent moins de glucides et plus de
                protéines animales, ce qui correspond mieux à la physiologie du chien. Mais elles ne sont pas
                indispensables pour un chien en bonne santé sans sensibilité particulière. En revanche, pour un
                chien avec des allergies alimentaires, des problèmes digestifs ou un pelage terne, passer au
                sans-céréales peut faire une vraie différence. Franklin et Elmut proposent toutes deux des gammes
                sans céréales bien équilibrées.
              </p>
            </div>

            <div>
              <h3 className="mb-2">
                Comment choisir entre Franklin, Elmut, Petty Well et Dog Chef ?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Tout dépend du profil de ton chien et de ton budget. Franklin est le meilleur rapport
                qualité/prix pour un chien standard sans problème particulier. Elmut se distingue sur la
                personnalisation de la gamme (taille, activité, âge). Petty Well est idéal si tu préfères un
                format mixte croquettes + pâtée. Dog Chef, le plus premium, convient aux chiens très sensibles
                ou aux propriétaires qui veulent une alimentation la plus proche du fait-maison. Utilise notre
                quiz pour obtenir une recommandation personnalisée.
              </p>
            </div>

            <div>
              <h3 className="mb-2">
                Combien coûte en moyenne une alimentation premium pour chien ?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Pour un chien de taille moyenne (10–20 kg), compte entre 60 € et 120 € par mois selon la
                marque et le format. Franklin se situe en entrée de gamme premium (autour de 60–75 €/mois),
                Elmut et Petty Well dans une fourchette intermédiaire (75–95 €/mois), et Dog Chef en haut de
                gamme (100–120 €/mois). Toutes les marques proposent des offres de bienvenue — voir les
                détails dans le tableau ci-dessus.
              </p>
            </div>

            <div>
              <h3 className="mb-2">
                Peut-on mélanger croquettes et pâtée pour son chien ?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Oui, c&apos;est même recommandé par de nombreux vétérinaires. L&apos;alimentation mixte combine les
                avantages des deux formats : la densité nutritive et la praticité des croquettes, et l&apos;hydratation
                supplémentaire apportée par la pâtée. L&apos;idéal est de maintenir les proportions
                recommandées par le fabricant pour éviter les déséquilibres. Petty Well propose d&apos;ailleurs
                des packs mixtes spécialement formulés pour cet usage.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
