import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { textOf } from '@/lib/article-toc'

// @cdc seo-geo — tableau comparatif des articles (184 tableaux dans 160 articles). Rendu serveur.
// À partir de 3 colonnes, sur mobile, chaque ligne devient une carte : la première cellule en titre,
// puis une ligne par colonne avec son intitulé (audit mobile 2026-11-04 : une colonne entière restait
// cachée sans le dire). Les intitulés viennent de CompareThead, l'article MDX ne change pas. Sans
// intitulés (3 tableaux écrits à la main), le tableau reste tel quel et défile avec une indication.
// Classe v2 : le tableau échappe aux règles .mdx-content (dont le texte sans retour à la ligne).
// Rôles ARIA : ils gardent la sémantique de tableau quand l'affichage change (Safari la perd sinon).

const STACK_FROM = 3
const STACKED_ROW = 'mb-3 block rounded-box border p-3 md:mb-0 md:table-row md:rounded-none md:border-0 md:border-b md:p-0'

type Parent = ReactElement<{ children?: ReactNode; role?: string }>

const isParent = (node: ReactNode): node is Parent => isValidElement(node)
const isHeadCell = (node: Parent) => node.type === CompareTh || node.type === 'th'
const isBodyCell = (node: Parent) => node.type === CompareTd || node.type === 'td'
const isRow = (node: Parent) => node.type === CompareTr || node.type === 'tr'

/** Premier parcours de l'arbre qui trouve des cellules : textes de l'en-tête, ou nombre de colonnes. */
function headTexts(node: ReactNode): string[] {
  return Children.toArray(node).filter(isParent).flatMap((child) =>
    isHeadCell(child) ? [textOf(child.props.children)] : headTexts(child.props.children),
  )
}

function maxColumns(node: ReactNode): number {
  return Children.toArray(node).filter(isParent).reduce((max, child) => {
    if (!isRow(child)) return Math.max(max, maxColumns(child.props.children))
    const cells = Children.toArray(child.props.children).filter(isParent)
    return Math.max(max, cells.length)
  }, 0)
}

/**
 * Pose intitulés et rôles ARIA. Les balises écrites à la main dans le MDX (<thead>, <tr>, <th>, <td>)
 * passent par les mêmes composants : une balise HTML recevrait ces props comme de faux attributs.
 */
function stackTree(node: ReactNode, labels: string[]): ReactNode {
  return Children.map(node, (child) => {
    if (!isParent(child)) return child
    const { children } = child.props
    if (isRow(child)) {
      const inHead = Children.toArray(children).filter(isParent).some(isHeadCell)
      if (inHead) return <tr role="row">{stackTree(children, labels)}</tr>
      const highlight = child.type === CompareTr && (child.props as CompareTrProps).highlight
      let col = -1
      const cells = Children.map(children, (cell) => {
        if (!isParent(cell) || !isBodyCell(cell)) return cell
        col += 1
        const { good, bad } = cell.type === CompareTd ? (cell.props as CompareTdProps) : { good: false, bad: false }
        return <CompareTd good={good} bad={bad} stackLabel={labels[col] ?? ''} stackFirst={col === 0}>{cell.props.children}</CompareTd>
      })
      return <CompareTr role="row" stacked highlight={highlight}>{cells}</CompareTr>
    }
    if (isHeadCell(child)) return <CompareTh>{children}</CompareTh>
    if (child.type === 'thead' || child.type === CompareThead) return <CompareThead role="rowgroup">{stackTree(children, labels)}</CompareThead>
    if (child.type === 'tbody') return <tbody role="rowgroup">{stackTree(children, labels)}</tbody>
    return cloneElement(child, undefined, stackTree(children, labels))
  })
}

export function CompareTable({ children }: { children: ReactNode }) {
  const labels = headTexts(children)
  if (labels.length >= STACK_FROM) {
    return (
      <div className="v2 my-6 md:overflow-x-auto md:rounded-box md:bg-paper">
        <table role="table" className="block w-full text-left text-sm md:table">
          {stackTree(children, labels)}
        </table>
      </div>
    )
  }
  const scrolls = maxColumns(children) >= STACK_FROM
  return (
    <>
      {scrolls ? <p aria-hidden="true" className="mt-6 -mb-4 text-xs text-ink-2 md:hidden">Fais glisser le tableau sur le côté pour tout voir&nbsp;→</p> : null}
      <div className="v2 my-6 overflow-x-auto rounded-box bg-paper">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    </>
  )
}

export function CompareThead({ children, role }: { children: ReactNode; role?: string }) {
  return (
    <thead role={role} className={`bg-ink text-cream ${role ? 'sr-only md:not-sr-only md:table-header-group' : ''}`}>
      {children}
    </thead>
  )
}

export function CompareTh({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-sm font-bold">
      {children}
    </th>
  )
}

interface CompareTrProps {
  children: ReactNode
  highlight?: boolean
  role?: string
  /** Posé par CompareTable : carte sur mobile */
  stacked?: boolean
}

export function CompareTr({ children, highlight, role, stacked }: CompareTrProps) {
  const layout = stacked ? STACKED_ROW : 'border-b'
  const tone = highlight ? 'bg-rose-bg' : stacked ? 'bg-paper md:bg-transparent' : ''
  return <tr role={role} className={`border-line ${layout} ${tone}`}>{children}</tr>
}

interface CompareTdProps {
  children: ReactNode
  good?: boolean
  bad?: boolean
  /** Posés par CompareTable : intitulé de la colonne affiché sur mobile, première cellule en titre */
  stackLabel?: string
  stackFirst?: boolean
}

export function CompareTd({ children, good, bad, stackLabel, stackFirst }: CompareTdProps) {
  const color = good ? 'text-green-ink' : bad ? 'text-rose-ink' : 'text-ink-2'
  const stacked = stackLabel !== undefined
  const marks = (
    <>
      {good && <span className="mr-1 font-bold">✓</span>}
      {bad && <span className="mr-1 font-bold">✗</span>}
      {children}
    </>
  )
  if (!stacked) return <td className={`px-4 py-3 ${color}`}>{marks}</td>
  return (
    <td
      role="cell"
      className={`block py-1 md:table-cell md:px-4 md:py-3 ${stackFirst ? 'pb-1.5 text-base font-semibold text-ink md:text-sm md:font-normal md:text-ink-2' : color}`}
    >
      {stackFirst || !stackLabel ? null : (
        <span aria-hidden="true" className="block text-xs font-semibold text-ink-2 md:hidden">{stackLabel}</span>
      )}
      {marks}
    </td>
  )
}
