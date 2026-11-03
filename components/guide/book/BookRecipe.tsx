import type { Book } from '@/lib/guide/book'
import type { GuideRecipe } from '@/data/guide-recipes'
import { BookPage, FillImage, Source } from './BookPage'

// @cdc guide — chapitre 4 : ouverture (liste des recettes) puis une page par recette (maquette
// validée : pastilles, photo de l'article, ingrédients, étapes, doses par gabarit, mise en garde).

export function BookRecipesOpener({ number, chapter, book }: { number: number; chapter: number; book: Book }) {
  const pages = book.pages.flatMap((p) => (p.kind === 'recipe' ? [{ title: p.recipe.title, meta: p.recipe.meta[0], page: p.number }] : []))
  return (
    <BookPage number={number} className="bk-opener">
      <span className="bk-chap-num">{chapter}</span>
      <header className="bk-head">
        <p className="bk-kicker">Chapitre {chapter}</p>
        <h2 className="bk-h1">Six recettes maison</h2>
        <p className="bk-lead">Un repas, des biscuits, une friandise séchée, une glace : avec les doses par taille de chien.</p>
      </header>
      <ul className="bk-index">
        {pages.map((r) => (
          <li key={r.page}>
            <span className="t">{r.title}</span>
            <span className="c">{r.meta}</span>
            <span className="n">{r.page}</span>
          </li>
        ))}
      </ul>
      <Source path="/chien/alimentation-quotidienne" label="Toutes les recettes" />
      <FillImage src="/images/articles/body-chien-curieux.jpeg" />
    </BookPage>
  )
}

export function BookRecipe({ number, recipe, index, total }: { number: number; recipe: GuideRecipe; index: number; total: number }) {
  const path = `/chien/${recipe.categorySlug}/${recipe.slug}`
  return (
    <BookPage number={number} className={recipe.image ? '' : 'bk-recipe-text'} preview={index === 1 ? 'recette' : undefined}>
      <header className="bk-head">
        <p className="bk-kicker">
          Recette {index + 1} sur {total}
        </p>
        <h2 className="bk-h2">{recipe.title}</h2>
      </header>
      <ul className="bk-meta">
        {recipe.meta.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      {recipe.image ? <FillImage src={recipe.image} className="bk-rec-img" /> : null}
      <div className="bk-two">
        <div>
          <h3>Ingrédients</h3>
          <ul>
            {recipe.ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Préparation</h3>
          <ol>
            {recipe.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      </div>
      {recipe.aside ? <Table head={[recipe.aside.title, '']} rows={recipe.aside.rows} /> : null}
      <Table head={recipe.doses.head} rows={recipe.doses.rows} />
      {recipe.doses.note ? <p className="bk-small">{recipe.doses.note}</p> : null}
      {recipe.warnings.map((w) => (
        <p key={w} className="bk-warn">
          {w}
        </p>
      ))}
      <Source path={path} label="La recette complète" />
    </BookPage>
  )
}

function Table({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <table className="bk-table">
      <thead>
        <tr>
          <th>{head[0]}</th>
          <th>{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([a, b]) => (
          <tr key={a}>
            <td className="strong">{a}</td>
            <td>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
