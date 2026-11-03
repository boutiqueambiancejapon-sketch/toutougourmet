import Link from 'next/link'
import type { ReactNode } from 'react'
import { YukaCompare } from './YukaCompare'
import { YUKA_PET_FOOD_HELP } from './yuka-facts'

// @cdc seo-geo §2 — sections de /scanner/alternative-yuka-animaux, rendu serveur : H2 en questions,
// réponse dans la première phrase, paragraphes autonomes. Faits Yuka vérifiés le 2026-11-03
// (yuka-facts.ts) ; faits du scanner tirés de docs/v2/scanner-score.md.

const LINK = 'font-semibold text-orange-ink underline underline-offset-2'

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 text-base leading-relaxed text-ink-2">
      <h2 id={id} className="m-0 font-display text-2xl font-black text-ink">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function YukaCoverage() {
  return (
    <Section id="yuka-croquettes" title="Yuka analyse-t-il les croquettes pour chien ?">
      <p className="m-0">
        Non. Yuka note les produits alimentaires et les cosmétiques destinés aux humains. Sa{' '}
        <a href={YUKA_PET_FOOD_HELP} target="_blank" rel="nofollow noopener" className={LINK}>
          page d&apos;aide sur les aliments pour animaux (en anglais, nouvel onglet)
        </a>{' '}
        indique que l&apos;application ne les analyse pas et ne prévoit pas de le faire pour l&apos;instant, parce que leurs
        ingrédients et les besoins des animaux diffèrent de ceux de l&apos;alimentation humaine.
      </p>
      <p className="m-0">
        Pour un aliment humain, Yuka calcule une note sur 100 à partir de trois blocs&nbsp;: la qualité nutritionnelle (60&nbsp;%,
        fondée sur le Nutri-Score), les additifs (30&nbsp;%) et le bio (10&nbsp;%), d&apos;après son centre d&apos;aide.
      </p>
    </Section>
  )
}

export function HowWeScore() {
  return (
    <Section id="scanner-croquettes" title="Quelle application pour scanner les croquettes de son chien ?">
      <p className="m-0">
        Le scanner de Toutou Gourmet lit le code-barres du paquet avec la caméra du téléphone. Un produit déjà analysé, ou
        présent avec sa composition dans la base ouverte Open Pet Food Facts, affiche sa note tout de suite, sans compte.
      </p>
      <p className="m-0">
        Open Pet Food Facts ne contient encore qu&apos;une partie des croquettes vendues en France. Pour un produit absent,
        deux photos de l&apos;étiquette suffisent&nbsp;: la composition et les constituants analytiques. Une IA recopie le texte,
        puis notre barème calcule la note. La photo est oubliée après la lecture.
      </p>
      <p className="m-0">
        Chaque produit noté a sa fiche, qui se partage en image ou se télécharge en PDF A4 avec le détail de chaque critère. La{' '}
        <Link href="/scanner#methode" className={LINK}>
          méthode de calcul de la note des croquettes
        </Link>{' '}
        donne le seuil et les points de chaque critère.
      </p>
    </Section>
  )
}

export function Differences() {
  return (
    <Section id="differences" title="Yuka ou scanner Toutou Gourmet : quelles différences ?">
      <p className="m-0">
        Les deux outils lisent un code-barres et donnent une note sur 100, mais ils ne notent pas les mêmes produits. Yuka couvre
        les courses de la maison, le scanner de Toutou Gourmet couvre la gamelle du chien.
      </p>
      <YukaCompare />
    </Section>
  )
}
