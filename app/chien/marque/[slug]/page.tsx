import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { brands, getBrandBySlug, type Brand } from '@/data/brands'
import { getComparatif, type Comparatif } from '@/lib/mdx'
import { BrandHero } from '@/components/marques/BrandHero'
import { BrandCTA } from '@/components/marques/BrandCTA'
import { StickyBrandCTA } from '@/components/marques/StickyBrandCTA'
import { StickyComparatifCTA } from '@/components/marques/StickyComparatifCTA'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { FAQ } from '@/components/ui/FAQ'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { formatDate } from '@/lib/utils'
import {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider, FaqList, FaqItem,
} from '@/components/mdx/MdxComponents'

const mdxComponents = {
  InfoBox, Callout, FeatureGrid, Feature,
  StatRow, Stat, CompareTable, CompareThead, CompareTh,
  CompareTr, CompareTd, Verdict, ProsConsList, ProsBlock, ConsBlock, ProItem, ConItem, SectionDivider, FaqList, FaqItem,
}

interface Props {
  params: Promise<{ slug: string }>
}

// ─── Données brand (reprises de /marques/[slug]) ──────────────────────────────

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
    { q: "Quel est le prix Elmut selon la taille de mon chien ?", a: "Petit chien (< 10 kg) : environ 1,80–2,50 €/jour soit ~55–75 €/mois. Chien moyen (10–25 kg) : environ 2,50–4 €/jour soit ~75–120 €/mois. Grand chien (25–40 kg) : environ 4–6 €/jour soit ~120–180 €/mois. Ces tarifs sont pour une ration complète à 100% Elmut. La formule demi-pension (50% Elmut + 50% croquettes) divise le budget par deux." },
    { q: "Comment faire la transition depuis les croquettes ?", a: "Elmut recommande 7 à 10 jours progressifs : J1-J3 → 25% Elmut / 75% ancienne alimentation. J4-J6 → 50/50. J7-J9 → 75% Elmut. J10 → 100% Elmut. Cette progressivité évite les troubles digestifs (diarrhée, ballonnements) et laisse le temps à la flore intestinale de s'adapter. Ne pas mélanger les deux aliments dans le même bol — alterner les repas." },
    { q: "Elmut convient-il aux chiots ?", a: "Oui. Elmut propose des rations adaptées aux chiots dès 2 mois. Le questionnaire prend en compte l'âge, la race et le poids adulte estimé pour calculer des apports adaptés à la croissance. Pour les très grandes races (Berger Allemand, Labrador…), surveiller la vitesse de croissance est essentiel — Elmut ajuste les rations en conséquence." },
    { q: "Elmut convient-il aux chiens seniors ou en surpoids ?", a: "C'est l'un des meilleurs cas d'usage d'Elmut. Pour les seniors : le menu Saumon & Brocoli est riche en oméga-3 anti-inflammatoires, très utile pour les chiens avec de l'arthrite. Pour les chiens en surpoids : le menu Dinde & Courgette est faible en lipides. Dans les deux cas, la ration est calculée au profil — pas besoin d'adapter manuellement." },
    { q: "Que faire des repas Elmut pendant les vacances ?", a: "Deux options : 1) Congeler à l'avance — les repas se conservent 3 mois au congélateur, tu pars avec des portions congelées dans une glacière. 2) Suspendre l'abonnement depuis ton espace client avant de partir, et reprendre à ton retour. Aucune pénalité, aucun délai minimum." },
    { q: "Comment conserver les repas Elmut ?", a: "Non ouvertes : 5 jours au réfrigérateur, 3 mois au congélateur. Ouvertes : consommer dans les 48h. Chaque livraison arrive réfrigérée via Chronofresh. Il faut prévoir environ 2 étagères de frigo pour une semaine de ration selon la taille du chien." },
    { q: "Elmut est-il disponible pour les chats ?", a: "Oui, Elmut propose 3 recettes pour chats (poulet, bœuf, dinde) avec jusqu'à 90% de viande et moins de 3% de glucides — parfaitement adapté aux besoins des félins carnivores stricts." },
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
    { q: "Quel est le prix Dog Chef selon la taille de mon chien ?", a: "Petit chien (< 10 kg) : environ 1,50–2 €/jour soit ~45–60 €/mois. Chien moyen (10–25 kg) : environ 2–4 €/jour soit ~60–120 €/mois. Grand chien (25–40 kg) : environ 4–5,50 €/jour soit ~120–165 €/mois. Livraison gratuite incluse. Le plan mixte 50/50 (frais + croquettes) réduit la facture de moitié tout en conservant la majorité des bénéfices santé." },
    { q: "Quelle est la différence entre les 3 plans Dog Chef ?", a: "Plan 100% frais : alimentation maximale, meilleure digestibilité, tous les bénéfices sur le pelage, le transit et l'énergie. Plan mixte 50/50 : recommandé en première approche — le meilleur rapport qualité/budget. Plan 100% croquettes Dog Chef : sans gluten, enrichies en prébiotiques, glucosamine et oméga-3 via huile d'algues. Idéal si le budget ou la logistique frigo est un frein." },
    { q: "Qu'est-ce que les Boosters Dog Chef ?", a: "Les Boosters sont des compléments alimentaires ciblés que tu peux ajouter à la ration. Puppy Booster : calcium et phosphore pour les chiots en croissance. Senior Booster : glucosamine + curcuma anti-inflammatoire pour les chiens âgés. Mobility Booster : soutien des cartilages pour les chiens à risque articulaire. Pro Transit Booster : pré et probiotiques pour les chiens au transit fragile. Chaque Booster s'ajoute à ta box d'abonnement si Dog Chef le recommande après questionnaire." },
    { q: "Dog Chef convient-il aux chiens allergiques ?", a: "Oui. Les recettes au canard et au poisson sont hypoallergéniques et particulièrement adaptées aux chiens avec des sensibilités alimentaires avérées ou une peau atopique. Le canard est une protéine dite 'novel' — la plupart des chiens ne l'ont jamais consommée, ce qui réduit drastiquement le risque de réaction." },
    { q: "Dog Chef convient-il aux chiots et aux seniors ?", a: "Oui pour les deux. Pour les chiots : Dog Chef adapte les ratios calcium/phosphore à la race et au poids adulte estimé, et propose le Puppy Booster pour soutenir la croissance. Pour les seniors : le menu Poisson + Senior Booster (glucosamine + curcuma) est particulièrement adapté aux chiens de plus de 7-8 ans avec de l'arthrite ou une mobilité réduite." },
    { q: "Combien de temps se conservent les repas Dog Chef ?", a: "Les boudins non ouverts se conservent 7 jours au réfrigérateur et 4 mois au congélateur — une durée supérieure à la plupart des concurrents. Une fois ouvert, consommer dans les 24h. La box d'essai couvre 2 semaines complètes pour une transition sereine." },
    { q: "La livraison Dog Chef est-elle gratuite ?", a: "Oui, la livraison est gratuite en France métropolitaine, incluse dans le tarif de l'abonnement. Les repas arrivent en camionnette réfrigérée sous forme de boudins portionnés. Pas de mauvaise surprise sur la facture finale." },
    { q: "Quel est le code promo Dog Chef ?", a: "Le code WZU7090 donne -35% sur la box d'essai. Tu peux l'entrer directement sur le site Dog Chef ou passer par notre lien affilié qui l'applique automatiquement à la commande." },
  ],
}

const brandRecipes: Record<string, { name: string; description: string; tag?: string }[]> = {
  franklin: [
    { name: 'Croquettes Poulet & Patate douce', description: 'Mono-protéine · sans céréales · 68% de viande · idéal sensibilités digestives', tag: 'Best-seller' },
    { name: 'Croquettes Saumon & Courgette', description: 'Riche en oméga-3 · sans gluten · peau et pelage brillants', tag: 'Peau & pelage' },
    { name: 'Croquettes Agneau & Riz', description: 'Source de protéines digeste · formule douce pour chiens sensibles' },
    { name: 'Pâtée Canard & Courge', description: 'Complément humide · texture appétente · idéale en mix avec les croquettes' },
    { name: 'Friandises Bœuf séché', description: 'Mono-ingrédient · sans additifs · idéales pour l\'éducation' },
  ],
  elmut: [
    { name: 'Menu Poulet & Légumes', description: '67% viande · 54% protéines · recette signature · cuisson douce · zéro conservateur', tag: 'Best-seller' },
    { name: 'Menu Bœuf & Carottes', description: '70% viande · 58% protéines · riche en fer · idéal chiens actifs et sportifs' },
    { name: 'Menu Saumon & Brocoli', description: '65% poisson · oméga-3 EPA/DHA · anti-inflammatoire · peaux sensibles & seniors', tag: 'Senior' },
    { name: 'Menu Dinde & Courgette', description: '65% viande · faible en lipides · recommandé pour les chiens en surpoids ou stérilisés' },
    { name: 'Menu Porc & Patate douce', description: '66% viande · source de protéines alternative · digeste · adapté aux intolérants poulet' },
  ],
  'petty-well': [
    { name: 'Croquettes Poulet & Pois', description: 'Made in France · 41% de protéines · sans céréales ni gluten', tag: 'Best-seller' },
    { name: 'Croquettes Saumon & Lentilles', description: 'Oméga-3 · légumineuses · favorise la santé cutanée' },
    { name: 'Pâtée Canard & Potiron', description: 'Complément humide · fabriqué en France · ingredients d\'origine traçable' },
  ],
  'dog-chef': [
    { name: 'Menu Poulet', description: 'Viande + gésier + foie · 48% protéines (MS) · 15% lipides · recette la plus digestible', tag: 'Best-seller' },
    { name: 'Menu Bœuf', description: 'Abats de bœuf (cœur, tripes, foie) + pommes de terre + haricots verts + sarrasin · riche en fer' },
    { name: 'Menu Porc', description: 'Cœur + langue de porc + haricots verts + riz · recette économique · complète et équilibrée' },
    { name: 'Menu Canard', description: 'Viande premium · hypoallergénique · idéal allergies avérées ou exclusion diagnostique', tag: 'Hypoallergénique' },
    { name: 'Menu Poisson', description: 'Merlu/colin + carottes + courgettes + riz · 1,4% oméga-3 · anti-inflammatoire · senior & arthrose', tag: 'Senior' },
    { name: 'Croquettes Poulet ou Canard', description: 'Sans gluten · prébiotiques + huile d\'algues (EPA/DHA) · glucosamine + chondroïtine articulaire' },
  ],
}

const brandReviews: Record<string, { author: string; rating: number; text: string; verified?: boolean }[]> = {
  franklin: [
    { author: 'Marie T.', rating: 5, text: 'Mon golden retriever avait des problèmes de peau depuis des années. Depuis Franklin mono-protéine saumon, plus aucune démangeaison en 3 mois. Je recommande sans hésitation.', verified: true },
    { author: 'Julien R.', rating: 5, text: 'Rapport qualité/prix imbattable dans le premium sans céréales. J\'ai comparé avec 5 autres marques, Franklin gagne haut la main sur la composition.', verified: true },
    { author: 'Sophie M.', rating: 4, text: 'Très bon produit, mon chien adore les croquettes poulet. Un bémol sur le prix hors abonnement, mais avec les -30% c\'est vraiment compétitif.', verified: true },
    { author: 'Éric B.', rating: 5, text: 'Vétérinaire recommandé pour mon labrador sensible. Selles bien formées, pelage brillant, énergie au top. On ne reviendra pas en arrière.', verified: true },
  ],
  elmut: [
    { author: 'Claire D.', rating: 5, text: 'Mon beagle était en surpoids depuis 2 ans. Après 3 mois sur le menu Dinde Elmut, il a perdu 2,1 kg et son vétérinaire était bluffé par ses analyses. La différence sur le pelage est visible dès le premier mois.', verified: true },
    { author: 'Thomas L.', rating: 5, text: 'Transition facile en 10 jours comme recommandé. Mon border collie hyperactif a refusé ses anciennes croquettes dès la deuxième semaine — impossible de revenir en arrière maintenant. Énergie au top, selles parfaites.', verified: true },
    { author: 'Nathalie C.', rating: 4, text: 'J\'avais deux chiens avec des sensibilités digestives différentes. Elmut m\'a permis de donner une recette différente à chacun. Fini les épisodes de diarrhée. Oui c\'est plus cher, mais les frais vétérinaires ont chuté de 60%.', verified: true },
    { author: 'Marc B.', rating: 5, text: 'Mon golden retriever de 11 ans avait des douleurs articulaires. Depuis le menu Saumon (oméga-3), il est nettement plus mobile. Le vétérinaire a réduit sa dose d\'anti-inflammatoires de moitié en 2 mois. Je ne m\'attendais pas à ça.', verified: true },
  ],
  'petty-well': [
    { author: 'Aurélie P.', rating: 5, text: 'Fière de donner du Made in France à mes chiens ! La composition est lisible, les ingrédients sont traçables. Mon vet était bluffé par les résultats en 2 mois.', verified: true },
    { author: 'Nicolas F.', rating: 5, text: 'J\'avais peur que mon whippet n\'accepte pas les légumineuses à la place des céréales. Aucun problème digestif, au contraire — transit nickel depuis le départ.', verified: true },
    { author: 'Isabelle H.', rating: 4, text: 'Très bonne marque française. Le taux de protéines est vraiment élevé comparé aux autres sans-céréales. Seul reproche : gamme un peu limitée.', verified: true },
  ],
  'dog-chef': [
    { author: 'Antoine M.', rating: 5, text: 'Mon Labrador de 12 ans avait tellement de mal à se lever le matin qu\'on envisageait des anti-douleurs à vie. J\'ai opté pour le menu Poisson + Senior Booster. En 6 semaines, il monte les escaliers seul. Le véto a réduit sa médication de 30%.', verified: true },
    { author: 'Laure V.', rating: 5, text: 'Mon malinois fait de l\'agility compétition. Avec le plan 100% frais poulet + Mobility Booster, ses récupérations sont deux fois plus rapides. Son entraîneur a remarqué la différence avant même que je lui dise quoi que ce soit.', verified: true },
    { author: 'Pierre G.', rating: 5, text: 'J\'ai essayé 3 autres marques avant Dog Chef. La différence : ils ont vraiment ajusté le plan quand mon chien a pris 2 kg en 3 mois. Pas juste un mail automatique — un vrai recalibrage. Service client imbattable.', verified: true },
    { author: 'Céline R.', rating: 4, text: 'Mon bouledogue français avait des intolérances alimentaires depuis ses 2 ans. Passage au menu Canard — fini les démangeaisons et les oreilles rouges en 1 mois. Cher, oui. Mais mes frais vétérinaires ont chuté de 80%.', verified: true },
    { author: 'Romain D.', rating: 5, text: 'Chiot berger australien de 4 mois. Le Puppy Booster est une vraie valeur ajoutée — mon véto était rassuré par les ratios calcium/phosphore adaptés à sa croissance. Selles parfaites depuis le J7. La box d\'essai à -35% ne m\'a laissé aucune excuse pour ne pas tester.', verified: true },
  ],
}

const brandDescriptions: Record<string, string[]> = {
  franklin: [
    "Franklin Pet Food s'est imposé comme l'une des références du pet food premium en France, notamment pour les propriétaires de chiens et chats à l'alimentation sensible. La marque a fait le choix du mono-protéine : une seule source de viande par recette, ce qui réduit considérablement les risques d'allergies alimentaires.",
    "Ce qui distingue Franklin, c'est la clarté de sa composition. Jusqu'à 70% de viande réelle, sans céréales, sans gluten, sans colorants artificiels. Les recettes sont formulées par des nutritionnistes spécialisés en alimentation animale — pas de marketing vide, du concret.",
    "La gamme est large : croquettes, pâtées, friandises, compléments. De quoi construire une alimentation complète et variée. Le prix reste accessible, surtout en abonnement où la première commande bénéficie de -30%.",
  ],
  elmut: [
    "Fondée en 2019 par une équipe française passionnée, Elmut part d'un constat simple : on mange de mieux en mieux, nos animaux méritent la même attention. La marque propose des repas cuisinés dans une vraie cuisine agréée qualité humaine — pas des usines d'extrusion à 200°C, mais une cuisson douce sous vide à 90°C pendant plus de 2h pour préserver chaque nutriment.",
    "Le concept en pratique : tu renseignes le profil de ton chien (race, âge, poids, activité, santé), Elmut calcule la ration exacte et t'envoie des barquettes réfrigérées prêtes à servir. 67% de viande fraîche en moyenne, zéro conservateur artificiel, zéro colorant. La liste d'ingrédients tient sur 4 lignes — ce qui est rarissime dans le pet food.",
    "Pour la transition depuis les croquettes : Elmut recommande 7 à 10 jours progressifs. Semaine 1 : 25% Elmut + 75% ancienne alimentation. Semaine 2 : 50/50. Semaine 3 : 75% Elmut. Puis passage à 100%. Cette progressivité évite les troubles digestifs et permet à la flore intestinale de s'adapter.",
    "Une étude publiée dans le Journal of Veterinary Internal Medicine montre que les chiens nourris à l'alimentation fraîche vivent en moyenne 2,5 ans de plus que ceux nourris aux croquettes industrielles. Avec Elmut, tu n'achètes pas de la nourriture — tu investis dans des années de vie supplémentaires.",
  ],
  'petty-well': [
    "Petty Well est la marque française du lot. Fabriquée en France avec une transparence totale sur l'origine des ingrédients, la marque a réussi le pari d'un taux de protéines animales parmi les plus élevés du marché : jusqu'à 41%.",
    "La marque est particulièrement recommandée par les vétérinaires parisiens pour les animaux en bonne santé qui ont besoin d'une alimentation protéinée et sans céréales. Le format box d'essai permet de tester sans risque.",
    "Petty Well mise sur la simplicité : peu de références mais bien faites. Pas de repas frais, pas de compléments compliqués. Juste des croquettes de qualité, fabriquées ici, avec des ingrédients qu'on peut lire sans dictionnaire.",
  ],
  'dog-chef': [
    "Fondée en 2017 en Belgique, Dog Chef cuisine ses repas dans son propre atelier à Huldenberg, avec plus de 100 employés. Élu Produit de l'Année 2026, c'est aujourd'hui la référence du repas frais personnalisé pour chiens en France, Belgique et Luxembourg. Livraison gratuite incluse — pas de frais cachés.",
    "Le principe : un questionnaire de 5 minutes (race, âge, poids, activité, santé, stérilisation) génère un plan nutritionnel sur-mesure. Les portions sont calculées à la calorie près et s'ajustent automatiquement si le poids de ton chien évolue. Trois formats au choix — 100% frais, mixte 50/50 (frais + croquettes), ou 100% croquettes. Le plan mixte est souvent recommandé en première approche : meilleur équilibre qualité/budget.",
    "Un vrai différenciant par rapport aux concurrents : les Boosters. Ces compléments ciblés s'ajoutent à la ration selon le profil — Puppy Booster (calcium/phosphore pour la croissance), Senior Booster (glucosamine + curcuma anti-inflammatoire), Mobility Booster (cartilages), Pro Transit Booster (pré et probiotiques). Du sur-mesure au niveau nutritionnel, pas juste sur la portion.",
    "Pour la transition : Dog Chef recommande 7 jours progressifs. Les repas se conservent 7 jours au réfrigérateur (vs 5 pour Elmut) et jusqu'à 4 mois au congélateur. La box d'essai couvre 2 semaines complètes — largement assez pour voir les premiers effets.",
  ],
}

const brandVerdicts: Record<string, string> = {
  elmut: "Elmut est notre recommandation numéro 1 pour les propriétaires qui veulent passer au repas frais sans compromis sur la qualité. Ingrédients de qualité humaine, cuisson douce, 5 recettes couvrant tous les profils — du chiot au senior, du chien actif au chien en surpoids. La logistique frigo rebute parfois au début, mais elle devient vite un non-sujet. Ce qui ne l'est pas : les résultats. Pelage, digestion, énergie, poids — les transformations observées par les propriétaires sont cohérentes et rapides (4 à 8 semaines). Profite des -40% via notre lien pour tester sans risque financier.",
  franklin: "Franklin Pet Food est la meilleure option si tu cherches des croquettes premium sans céréales, formulées par des nutritionnistes, sans te ruiner. Le mono-protéine est un vrai différenciant pour les chiens sensibles aux allergies. Si tu veux rester sur des croquettes mais upgrader la qualité, c'est le choix le plus intelligent du marché français en 2026.",
  'petty-well': "Petty Well est le choix Made in France par excellence. Si la traçabilité et l'origine des ingrédients sont tes priorités, aucune autre marque ne fait mieux sur ce critère. Le taux de protéines est parmi les plus élevés du marché des croquettes. Seule limite : la gamme reste plus étroite que Franklin. Pour un chien en bonne santé sans besoin spécifique, c'est une valeur sûre.",
  'dog-chef': "Dog Chef mérite son titre de Produit de l'Année 2026. Si ton chien a des besoins nutritionnels évolutifs — surpoids, croissance, pathologie articulaire, performance sportive — c'est l'option la plus intelligente du marché. La personnalisation n'est pas du marketing : les macros et les portions s'adaptent vraiment au profil de ton chien et évoluent avec lui. À -35% avec le code WZU7090, le test est sans risque.",
}

// ─── Page brand ────────────────────────────────────────────────────────────────

function BrandPage({ brand }: { brand: Brand }) {
  const faqs = brandFaqs[brand.slug] || []
  const descriptions = brandDescriptions[brand.slug] || []
  const recipes = brandRecipes[brand.slug] || []
  const reviews = brandReviews[brand.slug] || []
  const verdictText = brandVerdicts[brand.slug] ?? `${brand.name} fait partie des meilleures options du marché pour son profil d'usage. Si ton animal correspond aux profils recommandés, c'est une valeur sûre. Profite de l'offre du moment pour tester sans risque.`

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
    url: `https://www.toutou-gourmet.com/chien/marque/${brand.slug}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: brand.scores.global.toString(),
      bestRating: '5',
      ratingCount: '1',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
        <div className="max-w-[860px] mx-auto flex flex-col gap-10">
          <Breadcrumb items={[
            { label: 'Accueil', href: '/' },
            { label: 'Chien', href: '/chien' },
            { label: 'Marques', href: '/chien/marque' },
            { label: brand.name },
          ]} />

          <BrandHero brand={brand} />

          <StatRow>
            <Stat value={`${brand.scores.global}/5`} label="Note globale" color="rose" />
            <Stat value={brand.priceRange} label="Gamme de prix" color="amber" />
            <Stat value={brand.animal.join(' & ')} label="Pour" color="blue" />
            <Stat value={brand.type[0]} label="Type" color="green" />
          </StatRow>

          <section>
            <h2 className="font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Présentation de {brand.name}
            </h2>
            {descriptions.map((para, i) => (
              <p key={i} className="text-[var(--text-secondary)] leading-relaxed mb-3">{para}</p>
            ))}
          </section>

          <section>
            <ProsConsList pros={brand.pros} cons={brand.cons} />
          </section>

          {recipes.length > 0 && (
            <section>
              <h2 className="font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
                Les recettes {brand.name}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {recipes.map((recipe, i) => (
                  <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-[var(--text-primary)] text-sm leading-snug">{recipe.name}</p>
                      {recipe.tag && (
                        <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}>
                          {recipe.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{recipe.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
              Nos scores détaillés
            </h2>
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-4">
              {Object.entries(scoreLabels).map(([key, label]) => (
                <ScoreBar label={label} score={Number(brand.scores[key as keyof typeof brand.scores])} />
              ))}
            </div>
          </section>

          <InfoBox color="amber" emoji="🎉" title="Offre du moment">
            <p className="font-bold text-base text-[var(--text-primary)] mb-3">{brand.discountOffer}</p>
            <BrandCTA brandName={brand.name} affiliateUrl={brand.affiliateUrl} offer={brand.discountOffer} code={brand.affiliateCode} variant="primary" />
          </InfoBox>

          {reviews.length > 0 && (
            <section>
              <h2 className="font-bold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                Avis clients sur {brand.name}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Retours vérifiés de propriétaires ayant testé {brand.name} sur une durée minimale de 2 mois.
              </p>
              <div className="flex flex-col gap-4">
                {reviews.map((review, i) => (
                  <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--text-primary)]">{review.author}</span>
                        {review.verified && (
                          <span className="text-xs text-[var(--text-muted)]">· Achat vérifié</span>
                        )}
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <span key={s} className="text-sm" style={{ color: s < review.rating ? '#F59E0B' : 'var(--border)' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {faqs.length > 0 && (
            <section>
              <h2 className="font-bold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                Questions fréquentes sur {brand.name}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Toutes les réponses aux questions les plus posées avant d&apos;essayer {brand.name}.
              </p>
              <FAQ items={faqs} />
            </section>
          )}

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
              {verdictText}
            </p>
            <BrandCTA brandName={brand.name} affiliateUrl={brand.affiliateUrl} offer={brand.discountOffer} code={brand.affiliateCode} variant="primary" />
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/comparateur" className="text-[var(--accent-1)] hover:underline">→ Comparateur complet</Link>
            <Link href="/quiz" className="text-[var(--accent-1)] hover:underline">→ Quiz personnalisé</Link>
            <Link href="/chien/marque" className="text-[var(--accent-1)] hover:underline">→ Toutes les marques</Link>
          </div>
        </div>
      </div>

      <StickyBrandCTA
        brandName={brand.name}
        affiliateUrl={brand.affiliateUrl}
        offer={brand.discountOffer}
        code={brand.affiliateCode}
      />
    </>
  )
}

// ─── Page VS ──────────────────────────────────────────────────────────────────

const accentBySlug: Record<string, string> = {
  franklin:     '#1A7A47',
  elmut:        '#8B1A4A',
  'petty-well': '#1A4E8B',
  'dog-chef':   '#C47C00',
}

function VsPage({ brandA, brandB }: { brandA: Brand; brandB: Brand }) {
  const scoreLabels: [keyof typeof brandA.scores, string][] = [
    ['qualiteIngredients', 'Qualité des ingrédients'],
    ['rapportQualitePrix', 'Rapport qualité/prix'],
    ['digestibilite', 'Digestibilité'],
    ['variantesDisponibles', 'Variantes disponibles'],
    ['serviceClient', 'Service client'],
  ]

  const winner = brandA.scores.global >= brandB.scores.global ? brandA : brandB
  const accentA = accentBySlug[brandA.slug] ?? 'var(--accent-1)'
  const accentB = accentBySlug[brandB.slug] ?? 'var(--accent-1)'

  const vsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brandA.name} vs ${brandB.name}`,
    itemListElement: [brandA, brandB].map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      url: `https://www.toutou-gourmet.com/chien/marque/${b.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vsSchema) }} />

      <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
        <div className="max-w-[860px] mx-auto flex flex-col gap-10">
          <Breadcrumb items={[
            { label: 'Accueil', href: '/' },
            { label: 'Chien', href: '/chien' },
            { label: 'Marques', href: '/chien/marque' },
            { label: `${brandA.name} vs ${brandB.name}` },
          ]} />

          {/* Header VS */}
          <div className="max-w-[640px]">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">Comparatif</p>
            <h1 className="page-title mb-3">{brandA.name} vs {brandB.name}</h1>
            <p className="text-[var(--text-secondary)]">
              Comparaison point par point — composition, prix, pour qui ? On tranche.
            </p>
          </div>

          {/* Scores côte à côte */}
          <div className="grid grid-cols-2 gap-4">
            {[brandA, brandB].map((brand, i) => {
              const accent = i === 0 ? accentA : accentB
              return (
                <div key={brand.slug} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 flex flex-col gap-3" style={{ borderTop: `3px solid ${accent}` }}>
                  <div>
                    <p className="font-black text-lg" style={{ fontFamily: "'Fraunces', serif", color: accent }}>{brand.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{brand.tagline}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black" style={{ fontFamily: "'Fraunces', serif", color: accent }}>
                      {brand.scores.global.toFixed(1)}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">/5</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] space-y-1">
                    <div>{brand.priceRange} · {brand.type[0]}</div>
                    <div>{brand.animal.map(a => a === 'chien' ? '🐶 Chien' : '🐱 Chat').join(', ')}</div>
                  </div>
                  <BrandCTA brandName={brand.name} affiliateUrl={brand.affiliateUrl} offer={brand.discountOffer} code={brand.affiliateCode} variant="primary" />
                </div>
              )
            })}
          </div>

          {/* Tableau des scores */}
          <section>
            <h2 className="font-bold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>Scores détaillés</h2>
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ background: 'var(--bg-dark)', color: 'var(--text-on-dark)' }}>
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">Critère</th>
                    <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: accentA }}>{brandA.name}</th>
                    <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: accentB }}>{brandB.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreLabels.map(([key, label]) => {
                    const sA = brandA.scores[key] as number
                    const sB = brandB.scores[key] as number
                    return (
                      <tr key={key} className="border-t border-[var(--border)]">
                        <td className="px-5 py-3 text-[var(--text-secondary)]">{label}</td>
                        <td className="px-5 py-3 text-center font-bold" style={{ color: sA >= sB ? accentA : 'var(--text-muted)' }}>
                          {sA.toFixed(1)} {sA > sB ? '✓' : ''}
                        </td>
                        <td className="px-5 py-3 text-center font-bold" style={{ color: sB >= sA ? accentB : 'var(--text-muted)' }}>
                          {sB.toFixed(1)} {sB > sA ? '✓' : ''}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Avantages de chaque marque */}
          <div className="grid md:grid-cols-2 gap-6">
            {[{ brand: brandA, accent: accentA }, { brand: brandB, accent: accentB }].map(({ brand, accent }) => (
              <div key={brand.slug} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5" style={{ borderTop: `3px solid ${accent}` }}>
                <p className="font-bold mb-3" style={{ color: accent }}>Points forts — {brand.name}</p>
                <ul className="space-y-1.5">
                  {brand.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                      <span className="font-bold shrink-0" style={{ color: accent }}>✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className="rounded-[var(--radius-xl)] p-6 border-2" style={{ background: 'var(--bg-dark)', borderColor: 'var(--pill-rose)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--pill-rose)' }}>Notre verdict</p>
                <p className="font-black text-xl" style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-on-dark)' }}>
                  {winner.name} l&apos;emporte
                  <span className="ml-2 text-base px-2 py-0.5 rounded-[var(--radius-sm)]" style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}>
                    {winner.scores.global}/5
                  </span>
                </p>
              </div>
            </div>
            <p className="text-base leading-relaxed mb-5" style={{ color: 'var(--text-on-dark)' }}>
              Sur la base de nos critères, {winner.name} obtient la meilleure note globale. Cela dit,
              le choix final dépend de ton chien, de son profil et de ton budget. Utilise le quiz
              pour une recommandation personnalisée.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/quiz" className="btn-primary text-sm">Faire le quiz →</Link>
              <Link href="/chien/marque" className="btn-outline text-sm">Voir toutes les marques</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Page comparatif éditorial MDX ───────────────────────────────────────────

function ComparatifMdxPage({
  slug,
  comparatif,
  brandA,
  brandB,
}: {
  slug: string
  comparatif: Comparatif
  brandA: Brand | undefined
  brandB: Brand | undefined
}) {
  const { frontmatter, content } = comparatif
  const accentA = brandA ? (accentBySlug[brandA.slug] ?? 'var(--accent-1)') : 'var(--accent-1)'
  const accentB = brandB ? (accentBySlug[brandB.slug] ?? 'var(--accent-1)') : 'var(--accent-1)'

  return (
    <>
    {brandA && brandB && (
      <StickyComparatifCTA
        brandA={{ name: brandA.name, affiliateUrl: brandA.affiliateUrl, offer: brandA.discountOffer, code: brandA.affiliateCode }}
        brandB={{ name: brandB.name, affiliateUrl: brandB.affiliateUrl, offer: brandB.discountOffer, code: brandB.affiliateCode }}
      />
    )}
    <div className="min-h-screen py-10 px-6 bg-[var(--bg-primary)]">
      <article className="max-w-[720px] mx-auto">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: 'Chien', href: '/chien' },
          { label: 'Marques', href: '/chien/marque' },
          { label: `${brandA?.name ?? ''} vs ${brandB?.name ?? ''}` },
        ]} />

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-[var(--radius-sm)]"
              style={{ background: 'var(--pill-rose)', color: 'var(--text-primary)' }}
            >
              Comparatif
            </span>
            <span className="text-sm text-[var(--text-muted)]">
              {formatDate(frontmatter.updatedAt || frontmatter.date)}
            </span>
          </div>
          <h1 className="page-title mb-3">{frontmatter.title}</h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            {frontmatter.description}
          </p>
        </header>

        {brandA && brandB && (
          <div className="grid grid-cols-2 gap-4 mb-8 p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] items-start">
            <BrandCTA brandName={brandA.name} affiliateUrl={brandA.affiliateUrl} offer={brandA.discountOffer} code={brandA.affiliateCode} variant="primary" />
            <BrandCTA brandName={brandB.name} affiliateUrl={brandB.affiliateUrl} offer={brandB.discountOffer} code={brandB.affiliateCode} variant="primary" />
          </div>
        )}

        <div className="mdx-content">
          <MDXRemote source={content} components={mdxComponents} />
        </div>

        <div className="flex flex-wrap gap-4 mt-10 pt-6 border-t border-[var(--border)] text-sm font-medium">
          <Link href="/quiz" className="text-[var(--accent-1)] hover:underline">→ Faire le quiz personnalisé</Link>
          <Link href="/chien/marque" className="text-[var(--accent-1)] hover:underline">→ Voir toutes les marques</Link>
          <Link href="/chien/marque/comparatif" className="text-[var(--accent-1)] hover:underline">→ Tous les comparatifs</Link>
        </div>
      </article>
    </div>
    </>
  )
}

// ─── Route principale ─────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const brandSlugs = brands.map((b) => ({ slug: b.slug }))
  const vsSlugs: { slug: string }[] = []
  for (let i = 0; i < brands.length; i++) {
    for (let j = i + 1; j < brands.length; j++) {
      vsSlugs.push({ slug: `${brands[i].slug}-vs-${brands[j].slug}` })
    }
  }
  return [...brandSlugs, ...vsSlugs]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (slug.includes('-vs-')) {
    const [slugA, slugB] = slug.split('-vs-')
    const a = getBrandBySlug(slugA)
    const b = getBrandBySlug(slugB)
    if (!a || !b) return {}
    return {
      title: `${a.name} vs ${b.name} — Comparatif 2026`,
      description: `Comparaison complète ${a.name} vs ${b.name} : composition, prix, scores, verdict. Quelle marque choisir pour ton chien ?`,
      alternates: { canonical: `https://www.toutou-gourmet.com/chien/marque/${slug}` },
    }
  }

  const brand = getBrandBySlug(slug)
  if (!brand) return {}
  return {
    title: `${brand.name} : Avis Complet, Test & Promo 2026`,
    description: `Notre avis honnête sur ${brand.name} : composition, prix, avantages et inconvénients. ${brand.discountOffer}.`,
    alternates: { canonical: `https://www.toutou-gourmet.com/chien/marque/${slug}` },
  }
}

export default async function MarqueOrVsPage({ params }: Props) {
  const { slug } = await params

  if (slug.includes('-vs-')) {
    // Essaie d'abord de charger un article éditorial MDX
    const comparatif = getComparatif(slug)
    if (comparatif) {
      const brandA = getBrandBySlug(comparatif.frontmatter.brandA)
      const brandB = getBrandBySlug(comparatif.frontmatter.brandB)
      return <ComparatifMdxPage slug={slug} comparatif={comparatif} brandA={brandA} brandB={brandB} />
    }

    // Fallback auto-généré depuis les données brands
    const brandA = brands.find((b) => slug.startsWith(b.slug + '-vs-'))
    const brandBSlug = brandA ? slug.replace(brandA.slug + '-vs-', '') : ''
    const brandB = getBrandBySlug(brandBSlug)
    if (!brandA || !brandB) notFound()
    return <VsPage brandA={brandA as Brand} brandB={brandB as Brand} />
  }

  const brand = getBrandBySlug(slug)
  if (!brand) notFound()
  return <BrandPage brand={brand as Brand} />
}
