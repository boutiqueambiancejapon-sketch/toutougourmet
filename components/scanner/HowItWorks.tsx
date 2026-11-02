import { BarcodeArt, IngredientsArt, ScoreArt } from './illustrations'

// @cdc lot 6 — « Comment ça marche » sur /scanner : trois étapes illustrées, rendu serveur.

const STEPS = [
  {
    art: <BarcodeArt />,
    title: 'Le code-barres',
    text: 'La caméra lit le code du sac. Produit déjà connu de notre base ou d\'Open Pet Food Facts : la note s\'affiche aussitôt, sans compte.',
  },
  {
    art: <IngredientsArt />,
    title: 'Les photos, si besoin',
    text: 'Produit inconnu : photographie la composition et les constituants analytiques. Une IA recopie l\'étiquette, la photo est oubliée juste après.',
  },
  {
    art: <ScoreArt />,
    title: 'La note sur 100',
    text: 'Notre barème calcule la note à partir de 11 critères, explique chacun et liste ce qui manque sur l\'étiquette.',
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="comment" className="flex flex-col gap-4">
      <h2 id="comment" className="m-0 font-display text-2xl font-black text-ink">
        Comment fonctionne le scanner ?
      </h2>
      <ol role="list" className="m-0 grid list-none gap-4 p-0 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-card border border-line bg-paper p-4 sm:flex-col">
            <div className="w-24 shrink-0 sm:w-full sm:max-w-40">{s.art}</div>
            <div className="flex flex-col gap-1">
              <p className="m-0 font-display text-lg font-black leading-tight text-ink">{`${i + 1}. ${s.title}`}</p>
              <p className="m-0 text-[15px] leading-relaxed text-ink-2">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
