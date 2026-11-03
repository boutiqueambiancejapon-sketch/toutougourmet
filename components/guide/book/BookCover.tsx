import Image from 'next/image'
import type { Book } from '@/lib/guide/book'
import { BookPage } from './BookPage'

// @cdc guide — couverture (maquette validée) et sommaire du livre.

export function BookCover({ number, edition }: { number: number; edition: string }) {
  return (
    <BookPage number={number} className="bk-cover" foot={false} preview="couverture">
      <span className="bk-logo">
        Toutou <b>Gourmet</b>
      </span>
      <h1 className="bk-cover-title">
        Le guide de la <b>gamelle</b>
      </h1>
      <p className="bk-cover-lead">Ce que ton chien peut manger, ce qu&apos;il faut limiter, ce qui est interdit. Et 6 recettes maison.</p>
      <span className="bk-badge">Édition {edition}</span>
      <div className="bk-cover-img">
        <Image src="/images/hero/home-hero.webp" alt="" width={1376} height={768} sizes="210mm" className="bk-img" priority />
      </div>
    </BookPage>
  )
}

export function BookToc({ number, book }: { number: number; book: Book }) {
  return (
    <BookPage number={number}>
      <header className="bk-head">
        <p className="bk-kicker">Sommaire</p>
        <h2 className="bk-h2">Dans ce guide</h2>
      </header>
      <ol className="bk-toc">
        {book.toc.map((entry) => (
          <li key={entry.title}>
            <a href={`#page-${entry.page}`} className="bk-toc-row">
              <span className="t bk-toc-main">{entry.title}</span>
              <span className="bk-toc-num">{entry.page}</span>
            </a>
            {entry.children ? (
              <ul className="bk-toc-sub">
                {entry.children.map((c) => (
                  <li key={c.title}>
                    <a href={`#page-${c.page}`} className="bk-toc-row">
                      <span className="t">{c.title}</span>
                      <span className="n">{c.page}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
      <div className="bk-legend">
        <div className="bk-tone-oui">
          <b>Autorisé</b>
          <span>Sous la forme indiquée.</span>
        </div>
        <div className="bk-tone-moderation">
          <b>À limiter</b>
          <span>En petite quantité, pas tous les jours, et sous la forme indiquée dans le guide.</span>
        </div>
        <div className="bk-tone-danger">
          <b>Interdit</b>
          <span>À ne jamais donner, même en petite quantité.</span>
        </div>
      </div>
      <p className="bk-small">
        Ce guide reprend les fiches de toutou-gourmet.com ({book.foodCount} aliments, {book.recipes.length} recettes). Il ne remplace pas
        l&apos;avis d&apos;un vétérinaire.
      </p>
    </BookPage>
  )
}
