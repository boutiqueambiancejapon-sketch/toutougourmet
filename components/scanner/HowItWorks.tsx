import { BarcodeArt, IngredientsArt, ScoreArt } from './illustrations'

// @cdc lot 6 — « Comment ça marche » sur /scanner : trois étapes illustrées, rendu serveur (titre porté par le pli).

const STEPS = [
  {
    art: <BarcodeArt />,
    title: 'Le code-barres',
    text: 'La caméra lit le code du paquet. Produit déjà connu de notre base ou d\'Open Pet Food Facts : la note s\'affiche aussitôt, sans compte.',
  },
  {
    art: <IngredientsArt />,
    title: 'Les photos, si besoin',
    text: 'Produit inconnu : photographie la composition et les constituants analytiques (pour une friandise, la composition suffit). Une IA recopie l\'étiquette, la photo est oubliée juste après.',
  },
  {
    art: <ScoreArt />,
    title: 'La note sur 100',
    text: 'Notre barème calcule la note sur 13 critères pour un aliment complet, 10 pour une friandise. Il explique chacun et liste ce qui manque sur l\'étiquette.',
  },
]

export function HowItWorks() {
  return (
    <div className="flex flex-col gap-4">
      <p>
        Le scanner analyse la composition des croquettes, pâtées et friandises pour chien et lui donne une note sur 100. Scanne le
        code-barres du paquet : si le produit est déjà connu, la note s&apos;affiche aussitôt, sans compte. Sinon, deux photos de
        l&apos;étiquette suffisent (une seule pour une friandise) avec un compte gratuit, et notre barème publié fait le calcul.
      </p>
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
    </div>
  )
}
