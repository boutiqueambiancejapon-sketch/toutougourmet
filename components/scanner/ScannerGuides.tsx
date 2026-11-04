import Link from 'next/link'
import { RANKING_MIN_REVIEWED } from '@/lib/scanner/seo'
import { reviewedItemsSafe } from '@/lib/server/scanner-catalog'

// @cdc lot 6 — « Comment juger une pâtée ou une friandise ? » sur /scanner : la différence avec
// une croquette en deux paragraphes, puis les guides nutrition qui détaillent chaque critère
// (maillage interne vers les articles, ancres descriptives). Lien vers le classement des
// friandises seulement quand il est indexable (jamais de lien vers une page noindex).

const LINK = 'font-semibold text-orange-ink underline underline-offset-2'

const GUIDES: { href: string; label: string; text: string }[] = [
  { href: '/chien/alimentation-quotidienne/comprendre-etiquette-croquettes-chien', label: "Le guide de l'étiquette des croquettes", text: 'détaille la composition et les constituants analytiques ligne par ligne.' },
  { href: '/chien/alimentation-quotidienne/comprendre-etiquette-patee-chien', label: "Le guide de l'étiquette des pâtées", text: "explique l'humidité, la matière sèche et la part réelle de viande." },
  { href: '/chien/alimentation-quotidienne/glucides-croquettes-chien', label: 'Le dossier sur les glucides des croquettes', text: "donne le calcul et les seuils, absents du sac." },
  { href: '/chien/sante/additifs-croquettes-chien-conservateurs-colorants', label: 'Le dossier sur les additifs des croquettes', text: 'trie les conservateurs, colorants et antioxydants.' },
  { href: '/chien/alimentation-quotidienne/friandises-naturelles-chien-guide', label: 'Le guide des friandises naturelles pour chien', text: 'liste les bons choix et la part de friandises dans la ration.' },
]

export async function ScannerGuides() {
  const treatsListed = (await reviewedItemsSafe('treat')).length >= RANKING_MIN_REVIEWED
  return (
    <section aria-labelledby="patee-friandise" className="flex flex-col gap-4">
      <h2 id="patee-friandise" className="m-0 font-display text-2xl font-black text-ink">
        Comment juger la composition d&apos;une pâtée ou d&apos;une friandise&nbsp;?
      </h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        Une pâtée se juge comme une croquette, une fois l&apos;eau retirée. Avec 78 % d&apos;humidité, 8 % de protéines sur la boîte
        font environ 36 % sur matière sèche. Le scanner fait ce calcul pour comparer une pâtée et une croquette sur la même base.
      </p>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        Une friandise n&apos;a pas à couvrir les besoins du chien. Son barème regarde la viande ou le poisson nommé en premier, le
        sucre, le sel et les additifs ajoutés, et la longueur de la liste.
        {treatsListed ? (
          <>
            {' Les mieux notées sont dans le '}
            <Link href="/croquettes/friandises" className={LINK}>
              classement des meilleures friandises pour chien
            </Link>
            .
          </>
        ) : null}
      </p>
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {GUIDES.map((g) => (
          <li key={g.href} className="text-[15px] leading-relaxed text-ink-2">
            <Link href={g.href} className={LINK}>
              {g.label}
            </Link>
            {` ${g.text}`}
          </li>
        ))}
      </ul>
    </section>
  )
}
