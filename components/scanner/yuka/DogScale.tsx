import { Section } from './YukaSections'

// @cdc seo-geo §2 — ce que le scanner note (aliments complets et friandises pour chien, pas les
// aliments pour chat), et pourquoi un barème propre au chien (FEDIAF, matière sèche). Chiffres repris de docs/v2/scanner-score.md, sources nommées dans le texte.

export function WhatWeScore() {
  return (
    <Section id="aliments-notes" title="Quels aliments pour chien le scanner note-t-il ?">
      <p className="m-0">
        Le scanner note les aliments pour chien&nbsp;: croquettes, pâtées, friandises et snacks. Une pâtée est notée si
        l&apos;étiquette donne son humidité, mention obligatoire au-delà de 14&nbsp;% d&apos;eau (règlement CE n°&nbsp;767/2009).
      </p>
      <p className="m-0">
        Friandises, biscuits, os à mâcher et autres aliments complémentaires ont leur propre barème sur 100, qui juge la
        recette&nbsp;: premier ingrédient, part de viande ou de poisson, sucres et sel ajoutés, colorants et arômes, longueur de la
        liste. La composition suffit pour les noter. Une friandise à 80 ne se compare pas à une croquette à 80.
      </p>
      <p className="m-0">
        Les aliments pour chat ne reçoivent pas de note&nbsp;: une photo d&apos;aliment pour chat est refusée sans être décomptée du
        quota.
      </p>
    </Section>
  )
}

export function WhyDogScale() {
  return (
    <Section id="bareme-chien" title="Pourquoi noter les croquettes avec un barème propre au chien ?">
      <p className="m-0">
        Un chien adulte a besoin d&apos;au moins 18&nbsp;g de protéines et 5,5&nbsp;g de matières grasses pour 100&nbsp;g de matière
        sèche, selon les recommandations nutritionnelles de la FEDIAF (fédération européenne des fabricants d&apos;aliments pour
        animaux familiers, 2021). Le barème du scanner part de ces minimums.
      </p>
      <p className="m-0">
        La matière sèche est ce qui reste d&apos;un aliment une fois l&apos;eau retirée. Le scanner y ramène les protéines, les graisses
        et les glucides&nbsp;: sans ce calcul, une pâtée à 80&nbsp;% d&apos;eau paraîtrait pauvre en protéines à côté d&apos;une
        croquette à 8&nbsp;% d&apos;eau.
      </p>
      <p className="m-0">
        Les autres critères lisent l&apos;étiquette du sac&nbsp;: une espèce animale nommée en premier ingrédient, la part de viande
        ou de poisson déclarée, les ingrédients animaux sans espèce, les céréales en tête de liste, les sucres ajoutés, les
        conservateurs BHA, BHT et éthoxyquine, les colorants. Le rapport calcium-phosphore compte quand les deux valeurs sont
        écrites. Le même barème s&apos;applique à chaque produit, et aucune marque ne paie pour sa note.
      </p>
    </Section>
  )
}
