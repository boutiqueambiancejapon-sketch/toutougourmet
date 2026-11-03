import type { Book as BookData, BookPage } from '@/lib/guide/book'
import { BookCover, BookToc } from './BookCover'
import { BookRation } from './BookRation'
import { BookFoods, BookFoodsOpener } from './BookFoods'
import { BookUrgences } from './BookUrgences'
import { BookRecipe, BookRecipesOpener } from './BookRecipe'
import { BookEnd } from './BookEnd'

// @cdc guide — le livre complet, page par page, dans l'ordre du plan (lib/guide/book.ts).

function Page({ page, book, edition }: { page: BookPage; book: BookData; edition: string }) {
  switch (page.kind) {
    case 'cover':
      return <BookCover number={page.number} edition={edition} />
    case 'toc':
      return <BookToc number={page.number} book={book} />
    case 'ration':
      return <BookRation number={page.number} chapter={page.chapter} />
    case 'foods-opener':
      return <BookFoodsOpener number={page.number} chapter={page.chapter} book={book} />
    case 'foods':
      return <BookFoods number={page.number} chapter={page.chapter} families={page.families} />
    case 'urgences':
      return <BookUrgences number={page.number} chapter={page.chapter} families={book.families} />
    case 'recipes-opener':
      return <BookRecipesOpener number={page.number} chapter={page.chapter} book={book} />
    case 'recipe':
      return <BookRecipe number={page.number} recipe={page.recipe} index={page.index} total={book.recipes.length} />
    case 'end':
      return <BookEnd number={page.number} />
  }
}

export function Book({ book, edition }: { book: BookData; edition: string }) {
  return (
    <main className="bk-book">
      {book.pages.map((page) => (
        <Page key={page.number} page={page} book={book} edition={edition} />
      ))}
    </main>
  )
}
