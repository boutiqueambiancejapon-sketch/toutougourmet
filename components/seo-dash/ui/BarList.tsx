import type { ReactNode } from 'react'
import { n0 } from '@/lib/seo-dash/format'
import { BarIn } from './Cells'
import { Empty } from './Card'

// @cdc tableau de bord SEO — liste classée : libellé, barre proportionnelle (une seule couleur), valeur à droite.

export interface BarItem {
  key: string
  label: ReactNode
  value: number
  /** Texte de la valeur quand ce n'est pas un simple nombre (« 45 % »). */
  text?: string
}

export function BarList({ items, color, empty = 'Rien sur cette période.' }: { items: BarItem[]; color?: string; empty?: string }) {
  if (!items.length) return <Empty>{empty}</Empty>
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="sd-tw">
      <table>
        <tbody>
          {items.map((i) => (
            <tr key={i.key}>
              <td className="u">{i.label}</td>
              <td className="sd-bar-cell">
                <BarIn value={i.value} max={max} color={color} />
              </td>
              <td className="num">{i.text ?? n0(i.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
