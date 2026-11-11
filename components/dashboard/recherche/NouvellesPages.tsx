import type { NouvellePage } from '@/lib/server/dashboard-nouvelles-pages'
import { Card } from '../account/parts'

// @cdc tableau de bord — nouvelles pages dans Google : date d'apparition, 7 derniers jours contre les 7 d'avant, et
// affichages par semaine (barres, 6 semaines, la plus récente à droite).

const nf = new Intl.NumberFormat('fr-FR')
const court = (url: string) => url.replace(/^https:\/\/www\.toutou-gourmet\.com/, '') || '/'

function Semaines({ valeurs }: { valeurs: number[] }) {
  const max = Math.max(1, ...valeurs)
  return (
    <span className="flex h-6 items-end gap-0.5" title={`Affichages par semaine : ${valeurs.join(', ')}`}>
      {valeurs.map((v, i) => <span key={i} className="w-1.5 rounded-sm bg-orange" style={{ height: `${Math.max(v ? 12 : 4, (v / max) * 100)}%`, opacity: v ? 1 : 0.25 }} />)}
    </span>
  )
}

function Evolution({ maintenant, avant }: { maintenant: number; avant: number }) {
  if (!avant) return <span className="text-xs text-ink-2">{maintenant ? 'nouveau' : '–'}</span>
  const pct = Math.round(((maintenant - avant) / avant) * 100)
  return <span className={`text-xs font-semibold ${pct >= 0 ? 'text-green-ink' : 'text-rose-ink'}`}>{`${pct >= 0 ? '+' : ''}${pct} %`}</span>
}

export function NouvellesPages({ pages }: { pages: NouvellePage[] }) {
  return (
    <Card title="Nouvelles pages dans Google (45 jours)">
      <p className="m-0 text-xs text-ink-2">Pages vues pour la première fois par Google ces 45 derniers jours, la plus récente en haut. Mis à jour chaque nuit.</p>
      {pages.length ? (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-2">
                <th className="px-1 py-1 font-semibold">Page</th>
                <th className="px-1 py-1 font-semibold">Apparue</th>
                <th className="px-1 py-1 text-right font-semibold">Affichages 7 j</th>
                <th className="px-1 py-1 text-right font-semibold">Clics 7 j</th>
                <th className="px-1 py-1 text-right font-semibold">Position</th>
                <th className="px-1 py-1 font-semibold">6 semaines</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.page} className="border-t border-line">
                  <td className="px-1 py-1.5 [overflow-wrap:anywhere]"><a href={p.page} className="text-ink underline underline-offset-2">{court(p.page)}</a></td>
                  <td className="px-1 py-1.5 tabular-nums text-ink-2">{p.premiere}</td>
                  <td className="px-1 py-1.5 text-right tabular-nums text-ink">{nf.format(p.affichages7)} <Evolution maintenant={p.affichages7} avant={p.affichagesAvant} /></td>
                  <td className="px-1 py-1.5 text-right tabular-nums text-ink">{`${nf.format(p.clics7)} (${nf.format(p.clics)} en tout)`}</td>
                  <td className="px-1 py-1.5 text-right tabular-nums text-ink">{p.position7 === null ? '–' : p.position7.toFixed(1).replace('.', ',')}</td>
                  <td className="px-1 py-1.5"><Semaines valeurs={p.semaines} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="m-0 text-sm text-ink-2">Aucune nouvelle page pour l’instant.</p>}
    </Card>
  )
}
