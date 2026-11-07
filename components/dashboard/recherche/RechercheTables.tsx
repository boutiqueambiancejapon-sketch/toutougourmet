import type { LigneGsc } from '@/lib/server/search-console'
import { Card } from '../account/parts'

// @cdc tableau de bord — tableaux Search Console : requête ou page, clics, affichages, taux de clic, position.

const nf = new Intl.NumberFormat('fr-FR')
const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })
const court = (url: string) => url.replace(/^https:\/\/www\.toutou-gourmet\.com/, '') || '/'

export function TableGsc({ titre, intro, lignes, page = false }: { titre: string; intro?: string; lignes: LigneGsc[]; page?: boolean }) {
  return (
    <Card title={titre}>
      {intro ? <p className="m-0 text-xs text-ink-2">{intro}</p> : null}
      {lignes.length ? (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-2">
                <th className="px-1 py-1 font-semibold">{page ? 'Page' : 'Recherche'}</th>
                <th className="px-1 py-1 text-right font-semibold">Clics</th>
                <th className="px-1 py-1 text-right font-semibold">Affichages</th>
                <th className="px-1 py-1 text-right font-semibold">Taux</th>
                <th className="px-1 py-1 text-right font-semibold">Position</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.keys[0]} className="border-t border-line">
                  <td className="px-1 py-1.5 text-ink [overflow-wrap:anywhere]">
                    {page ? <a href={l.keys[0]} className="text-ink underline underline-offset-2">{court(l.keys[0])}</a> : l.keys[0]}
                  </td>
                  <td className="px-1 py-1.5 text-right tabular-nums text-ink">{nf.format(l.clicks)}</td>
                  <td className="px-1 py-1.5 text-right tabular-nums text-ink">{nf.format(l.impressions)}</td>
                  <td className="px-1 py-1.5 text-right tabular-nums text-ink-2">{pct.format(l.ctr)}</td>
                  <td className="px-1 py-1.5 text-right tabular-nums text-ink">{l.position.toFixed(1).replace('.', ',')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="m-0 text-sm text-ink-2">Rien pour l’instant.</p>}
    </Card>
  )
}
