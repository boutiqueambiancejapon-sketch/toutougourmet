import type { Book } from '@/lib/guide/book'
import { VERDICT_ORDER, type GuideFoodFamily, type Verdict } from '@/lib/guide/foods'
import { BookPage, FillImage, fullUrl, Source } from './BookPage'

// @cdc guide — chapitre 2 : ouverture (familles et pages) puis une page par famille, aliments
// rangés en Autorisé / À limiter / Interdit. Nom et note tirés du frontmatter des articles ;
// chaque nom est un lien vers sa fiche.

const VERDICT_TITLE: Record<Verdict, string> = { oui: 'Autorisé', moderation: 'À limiter', danger: 'Interdit' }

export function BookFoodsOpener({ number, chapter, book }: { number: number; chapter: number; book: Book }) {
  const children = book.toc.find((e) => e.children && e.page === number)?.children ?? []
  return (
    <BookPage number={number} className="bk-opener">
      <span className="bk-chap-num">{chapter}</span>
      <header className="bk-head">
        <p className="bk-kicker">Chapitre {chapter}</p>
        <h2 className="bk-h1">Les aliments</h2>
        <p className="bk-lead">
          {book.foodCount} aliments classés en autorisé, à limiter et interdit, avec la bonne forme ou la bonne quantité.
        </p>
      </header>
      <ul className="bk-index">
        {book.families
          .filter((f) => f.foods.length > 0)
          .map((f) => (
            <li key={f.id}>
              <span className="t">{f.title}</span>
              <span className="c">{f.foods.length} aliments</span>
              <span className="n">{children.find((c) => c.title === f.title)?.page}</span>
            </li>
          ))}
      </ul>
      <Source path="/chien/peut-manger" label="Toutes les fiches « peut-il manger »" />
      <FillImage src="/images/articles/body-gamelle-ingredients.jpeg" />
    </BookPage>
  )
}

function Family({ family }: { family: GuideFoodFamily }) {
  return (
    <section className="bk-family">
      <header className="bk-head">
        <h2 className="bk-h2">{family.title}</h2>
        {family.intro ? <p className="bk-lead">{family.intro}</p> : null}
      </header>
      {VERDICT_ORDER.map((verdict) => {
        const foods = family.foods.filter((f) => f.verdict === verdict)
        if (foods.length === 0) return null
        return (
          <div key={verdict} className={`bk-verdict bk-tone-${verdict}`}>
            <h3>{VERDICT_TITLE[verdict]}</h3>
            <ul className="bk-foods">
              {foods.map((f) => (
                <li key={f.path}>
                  <a href={fullUrl(f.path)}>{f.label}</a>
                  {f.note ? <span>{f.note}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

export function BookFoods({ number, chapter, families }: { number: number; chapter: number; families: GuideFoodFamily[] }) {
  const image = families.find((f) => f.image)?.image
  return (
    <BookPage number={number} preview={families[0].id === 'fruits' ? 'aliments' : undefined}>
      <p className="bk-kicker">Chapitre {chapter} · Les aliments</p>
      {families.map((f) => (
        <Family key={f.id} family={f} />
      ))}
      <Source path="/chien/peut-manger" label="Chaque nom ouvre sa fiche détaillée, ou va sur" />
      {image ? <FillImage src={image} /> : null}
    </BookPage>
  )
}
