import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { brands, getBrandBySlug } from '@/data/brands'
import { BrandHero } from '@/components/marques/BrandHero'
import { BrandCTA } from '@/components/marques/BrandCTA'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { FAQ } from '@/components/ui/FAQ'
import { StatRow, Stat, ProsConsList, InfoBox } from '@/components/mdx/MdxComponents'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) return {}
  return {
    title: `${brand.name} : Avis Complet, Test & Promo 2026`,
    description: `Notre avis honnête sur ${brand.name} : composition, prix, avantages et inconvénients. ${brand.discountOffer}.`,
    alternates: { canonical: `https://toutou-gourmet.com/marques/${slug}` },
    openGraph: {
      title: `${brand.name} — Notre avis honnête`,
      description: `Tout savoir sur ${brand.name} avant de commander.`,
      url: `https://toutou-gourmet.com/marques/${slug}`,
      images: [{ url: `https://toutou-gourmet.com/images/og/${slug}.webp`, width: 1200, height: 630 }],
    },
  }
}

const brandFaqs: Record<string, { q: string; a: string }[]> = {
  franklin: [
    { q: "Franklin est-il recommandé par des vétérinaires ?", a: "Oui. Les recettes Franklin sont formulées par des nutritionnistes spécialisés en alimentation animale et régulièrement recommandées par des vétérinaires praticiens pour les chiens sensibles ou sujets aux allergies." },
    { q: "Franklin convient-il aux chats ?", a: "Oui, Franklin propose des gammes spécifiquement formulées pour les chats, en plus de ses gammes pour chiens. Les recettes mono-protéine sont particulièrement adaptées aux chats sensibles." },
    { q: "Quelle est la différence entre les croquettes Franklin et les marques de supermarché ?", a: "Franklin utilise jusqu'à 70% de viande de qualité, sans céréales ni gluten. Les croquettes de supermarché contiennent généralement plus de céréales et moins de protéines animales réelles." },
    { q: "Peut-on essayer Franklin sans engagement ?", a: "Oui. Tu peux commander sans abonnement, mais le meilleur tarif est disponible en abonnement avec -30% sur la première commande." },
    { q: "Franklin livre-t-il dans toute la France ?", a: "Oui, Franklin livre partout en France métropolitaine, en Corse et dans les DOM-TOM." },
    { q: "Comment contacter le service client Franklin ?", a: "Le service client Franklin est disponible par email et chat sur leur site officiel. Ils répondent généralement sous 24h ouvrées." },
  ],
  elmut: [
    { q: "En quoi Elmut est-il différent des croquettes classiques ?", a: "Elmut propose des repas frais cuisinés avec des ingrédients de qualité humaine, sans conservateurs artificiels. La cuisson douce préserve les nutriments, ce qui améliore la digestibilité et la qualité nutritionnelle globale." },
    { q: "Combien coûte Elmut par mois ?", a: "Le coût varie selon la taille de ton animal. Compte environ 50-120€/mois pour un chien de taille moyenne. Moins cher que tu ne l'imagines quand on compare à une alimentation premium en croquettes." },
    { q: "Comment conserver les repas Elmut ?", a: "Les repas Elmut se conservent au réfrigérateur pendant 5 jours après ouverture, et au congélateur pendant 3 mois. Chaque livraison arrive réfrigérée à domicile." },
    { q: "Elmut convient-il aux chiens ayant des problèmes digestifs ?", a: "Oui, c'est d'ailleurs l'une des forces d'Elmut. Les aliments frais sont naturellement plus digestibles que les croquettes. Beaucoup de propriétaires rapportent une amélioration nette du transit après le passage à Elmut." },
    { q: "Peut-on suspendre ou annuler son abonnement Elmut ?", a: "Oui, l'abonnement est flexible. Tu peux suspendre, modifier la fréquence ou annuler à tout moment depuis ton espace client." },
    { q: "Elmut est-il disponible pour les chats ?", a: "Oui, Elmut propose des gammes pour les chats en plus des chiens, avec des recettes adaptées aux besoins nutritionnels spécifiques des félins." },
  ],
  'petty-well': [
    { q: "Petty Well est-il vraiment fabriqué en France ?", a: "Oui, toutes les recettes Petty Well sont fabriquées en France. La marque met en avant une transparence totale sur l'origine de ses ingrédients et son lieu de production." },
    { q: "Quel est le taux de protéines dans les croquettes Petty Well ?", a: "Les croquettes Petty Well contiennent jusqu'à 41% de protéines animales, un des taux les plus élevés du marché des croquettes sans céréales." },
    { q: "Petty Well est-il sans céréales ?", a: "Oui, toutes les gammes Petty Well sont formulées sans céréales ni gluten. La marque utilise des alternatives comme les légumineuses pour l'apport en glucides." },
    { q: "Comment fonctionne la box d'essai Petty Well ?", a: "La box d'essai te permet de tester les croquettes pendant 2 semaines avec -34% sur le premier achat, sans engagement. Tu choisis ensuite si tu souhaites poursuivre." },
    { q: "Des vétérinaires recommandent-ils Petty Well ?", a: "Oui, Petty Well est recommandé par plusieurs vétérinaires, notamment à Paris. La marque met en avant des formulations validées par des experts en nutrition animale." },
    { q: "Petty Well convient-il aux chats ?", a: "Oui, Petty Well propose des gammes adaptées aux chats avec des niveaux de protéines et une teneur en taurine adaptés aux besoins des félins." },
  ],
  'dog-chef': [
    { q: "Dog Chef vaut-il son prix ?", a: "Dog Chef est effectivement plus cher que les croquettes classiques, mais comparable à d'autres repas frais premium. Élu Produit de l'Année 2026, avec 4.8/5 sur plus de 7 800 avis, le rapport qualité/prix est reconnu par les clients." },
    { q: "Dog Chef est-il disponible pour les chats ?", a: "Non, Dog Chef est exclusivement formulé pour les chiens. Si tu as un chat, nous te recommandons Franklin, Elmut ou Petty Well qui proposent tous des gammes félines." },
    { q: "Comment fonctionne la personnalisation chez Dog Chef ?", a: "Tu renseignes le profil de ton chien : race, âge, poids, niveau d'activité, problèmes de santé éventuels. Dog Chef génère ensuite un menu 100% adapté à ses besoins spécifiques." },
    { q: "Quel est le code promo Dog Chef ?", a: "Le code WZU7090 te donne -35% sur la box d'essai. Applique-le directement sur le site Dog Chef ou passe par notre lien affilié qui l'applique automatiquement." },
    { q: "Combien de temps se conservent les repas Dog Chef ?", a: "Les repas se conservent 4 jours au réfrigérateur et plusieurs mois au congélateur. La livraison se fait en emballages réfrigérés isothermes." },
    { q: "Dog Chef est-il sans conservateurs ?", a: "Oui, Dog Chef ne contient aucun conservateur artificiel. Les repas sont cuisinés à basse température pour préserver les nutriments et la fraîcheur naturelle des ingrédients." },
  ],
}

const brandDescriptions: Record<string, string[]> = {
  franklin: [
    "Franklin Pet Food s'est imposé comme l'une des références du pet food premium en France, notamment pour les propriétaires de chiens et chats à l'alimentation sensible. La marque a fait le choix du mono-protéine : une seule source de viande par recette, ce qui réduit considérablement les risques d'allergies alimentaires.",
    "Ce qui distingue Franklin, c'est la clarté de sa composition. Jusqu'à 70% de viande réelle, sans céréales, sans gluten, sans colorants artificiels. Les recettes sont formulées par des nutritionnistes spécialisés en alimentation animale — pas de marketing vide, du concret.",
    "La gamme est large : croquettes, pâtées, friandises, compléments. De quoi construire une alimentation complète et variée. Le prix reste accessible, surtout en abonnement où la première commande bénéficie de -30%.",
  ],
  elmut: [
    "Elmut a pris le parti radical du repas frais livré à domicile. L'idée : cuisiner pour ton animal comme tu cuisinerais pour toi-même, avec des ingrédients de qualité humaine, sans conservateurs ni additifs controversés.",
    "Le concept est simple mais exigeant : chaque semaine ou quinzaine, tu reçois des barquettes réfrigérées prêtes à servir. La cuisson douce préserve les vitamines et minéraux, souvent détruits dans le processus d'extrusion des croquettes classiques.",
    "Une étude souvent citée suggère que les chiens nourris à l'alimentation fraîche vivent en moyenne 3 ans de plus que ceux nourris aux croquettes industrielles. Avec Elmut, tu investis dans la santé long-terme de ton animal.",
  ],
  'petty-well': [
    "Petty Well est la marque française du lot. Fabriquée en France avec une transparence totale sur l'origine des ingrédients, la marque a réussi le pari d'un taux de protéines animales parmi les plus élevés du marché : jusqu'à 41%.",
    "La marque est particulièrement recommandée par les vétérinaires parisiens pour les animaux en bonne santé qui ont besoin d'une alimentation protéinée et sans céréales. Le format box d'essai permet de tester sans risque.",
    "Petty Well mise sur la simplicité : peu de références mais bien faites. Pas de repas frais, pas de compléments compliqués. Juste des croquettes de qualité, fabriquées ici, avec des ingrédients qu'on peut lire sans dictionnaire.",
  ],
  'dog-chef': [
    "Dog Chef, c'est le top du top pour les chiens. Élu Produit de l'Année 2026, la marque belge (livraison en France) propose des repas frais 100% personnalisés selon le profil précis de ton chien : race, âge, poids, niveau d'activité, pathologies éventuelles.",
    "Le concept de personnalisation poussée est vraiment différenciant. Ton chien de 8 kg au métabolisme lent ne reçoit pas le même menu qu'un Husky de 30 kg hyperactif. C'est de la nutrition sur-mesure, ce que seul un vétérinaire ou un nutritionniste pouvait proposer avant.",
    "4.8/5 sur plus de 7 800 avis vérifiés, aucun conservateur artificiel, cuisson basse température — Dog Chef fait partie des rares marques à mériter pleinement son positionnement premium.",
  ],
}

export default async function MarquePage({ params }: Props) {
  const { slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) notFound()

  const faqs = brandFaqs[slug] || []
  const descriptions = brandDescriptions[slug] || []

  const scoreLabels: Record<string, string> = {
    qualiteIngredients: 'Qualité des ingrédients',
    rapportQualitePrix: 'Rapport qualité/prix',
    digestibilite: 'Digestibilité',
    variantesDisponibles: 'Variantes disponibles',
    serviceClient: 'Service client',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: brand.name,
    brand: { '@type': 'Brand', name: brand.name },
    description: brand.tagline,
    url: `https://toutou-gourmet.com/marques/${slug}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: brand.scores.global.toString(),
      bestRating: '5',
      ratingCount: '1',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
        <div className="max-w-[860px] mx-auto flex flex-col gap-10">
          {/* Hero */}
          <BrandHero brand={brand} />

          {/* Stats rapides */}
          <StatRow>
            <Stat value={`${brand.scores.global}/5`} label="Note globale" color="rose" />
            <Stat value={brand.priceRange} label="Gamme de prix" color="amber" />
            <Stat value={brand.animal.join(' & ')} label="Pour" color="blue" />
            <Stat value={brand.type[0]} label="Type" color="green" />
          </StatRow>

          {/* Présentation */}
          <section>
            <h2 className="font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Présentation de {brand.name}
            </h2>
            {descriptions.map((para, i) => (
              <p key={i} className="text-[var(--text-secondary)] leading-relaxed mb-3">
                {para}
              </p>
            ))}
          </section>

          {/* Pros & Cons */}
          <section>
            <ProsConsList pros={brand.pros} cons={brand.cons} />
          </section>

          {/* Scores */}
          <section>
            <h2 className="font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Nos scores détaillés
            </h2>
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-4">
              {Object.entries(scoreLabels).map(([key, label]) => (
                <ScoreBar
                  key={key}
                  label={label}
                  score={brand.scores[key as keyof typeof brand.scores]}
                />
              ))}
            </div>
          </section>

          {/* Offre */}
          <InfoBox color="amber" emoji="🎉" title="Offre du moment">
            <p className="font-bold text-base text-[var(--text-primary)] mb-3">{brand.discountOffer}</p>
            <BrandCTA
              brandName={brand.name}
              affiliateUrl={brand.affiliateUrl}
              offer={brand.discountOffer}
              code={brand.affiliateCode}
              variant="primary"
            />
          </InfoBox>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section>
              <h2 className="font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
                Questions fréquentes sur {brand.name}
              </h2>
              <FAQ items={faqs} />
            </section>
          )}

          {/* Verdict final */}
          <div className="rounded-[var(--radius-xl)] p-6 border-2" style={{ background: 'var(--bg-dark)', borderColor: 'var(--pill-rose)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--pill-rose)' }}>Notre verdict</p>
                <p className="font-black text-xl" style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-on-dark)' }}>
                  {brand.name}
                  <span className="ml-2 text-base px-2 py-0.5 rounded-[var(--radius-sm)]" style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}>
                    {brand.scores.global}/5
                  </span>
                </p>
              </div>
            </div>
            <p className="text-base leading-relaxed mb-5" style={{ color: 'var(--text-on-dark)' }}>
              {brand.name} fait partie des meilleures options du marché pour son profil d&apos;usage.
              Si ton animal correspond aux profils recommandés, c&apos;est une valeur sûre. Profite
              de l&apos;offre du moment pour tester sans risque.
            </p>
            <BrandCTA
              brandName={brand.name}
              affiliateUrl={brand.affiliateUrl}
              offer={brand.discountOffer}
              code={brand.affiliateCode}
              variant="primary"
            />
          </div>

          {/* Liens internes */}
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link href="/comparateur" className="text-[var(--accent-1)] hover:underline">
              → Voir le comparateur complet
            </Link>
            <Link href="/quiz" className="text-[var(--accent-1)] hover:underline">
              → Faire le quiz personnalisé
            </Link>
            <Link href="/marques" className="text-[var(--accent-1)] hover:underline">
              → Voir toutes les marques
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
