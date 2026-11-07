import { COUT_APPEL_USD, type AssistantSuivi } from '@/lib/server/dashboard-assistant'
import { Card } from '../account/parts'

// @cdc tableau de bord — chiffres de Milo : appels et coût, parcours (ouverture, demande de compte, inscription),
// réponses par type, clics partenaires, 14 derniers jours.

const nf = new Intl.NumberFormat('fr-FR')
const usd = (n: number) => `${(n * COUT_APPEL_USD).toLocaleString('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} $`

export const SORTES: Record<string, string> = {
  site: 'Réponse tirée d’un article',
  ia: 'Réponse de l’IA seule',
  contexte: 'Milo a demandé des détails',
  sensible: 'Renvoi vers le vétérinaire',
  echec: 'Échec',
  ancienne: 'Avant le suivi',
}

function Tile({ value, label, detail }: { value: string; label: string; detail?: string }) {
  return (
    <div className="rounded-card border border-line bg-paper p-3">
      <dt className="text-sm font-semibold text-ink-2">{label}</dt>
      <dd className="m-0 mt-1 font-display text-3xl font-black tabular-nums text-ink">{value}</dd>
      {detail ? <dd className="m-0 mt-1 text-xs text-ink-2">{detail}</dd> : null}
    </div>
  )
}

export function AssistantTiles({ s }: { s: AssistantSuivi }) {
  return (
    <dl className="m-0 mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Tile value={nf.format(s.appels.aujourdhui)} label="Appels à l’IA aujourd’hui" detail={`Plafond ${nf.format(s.cap)} · ${usd(s.appels.aujourdhui)}`} />
      <Tile value={usd(s.appels.mois)} label="Coût estimé sur 30 jours" detail={`${nf.format(s.appels.mois)} appels · ${usd(s.appels.semaine)} sur 7 jours`} />
      <Tile value={nf.format(s.comptesActifs)} label="Comptes qui ont posé une question" detail={`7 jours · ${s.parCompte} questions par jour au plus`} />
      <Tile value={nf.format(s.inscrits.semaine)} label="Comptes ouverts grâce au chat" detail={`7 jours · ${nf.format(s.inscrits.total)} depuis le début`} />
    </dl>
  )
}

export function AssistantParcours({ s }: { s: AssistantSuivi }) {
  const total = Object.values(s.sortes).reduce((a, b) => a + b, 0)
  return (
    <Card title="Sur 7 jours">
      <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-sm">
        {[
          ['Ouvertures de la petite fenêtre', s.ouvertures],
          ['Questions envoyées sans compte (inscription demandée)', s.demandesCompte],
          ['Comptes ouverts depuis le chat', s.inscrits.semaine],
          ['Questions traitées', total],
        ].map(([k, v]) => (
          <div key={k} className="contents"><dt className="text-ink-2">{k}</dt><dd className="m-0 text-right font-semibold tabular-nums text-ink">{nf.format(Number(v))}</dd></div>
        ))}
      </dl>
      <h3 className="m-0 mt-2 text-sm font-bold text-ink">Type de réponse</h3>
      <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
        {Object.entries(s.sortes).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
          <li key={k} className="flex justify-between gap-3"><span className="text-ink-2">{SORTES[k] ?? k}</span><span className="font-semibold tabular-nums text-ink">{nf.format(n)}</span></li>
        ))}
        {total === 0 ? <li className="text-ink-2">Aucune question cette semaine.</li> : null}
      </ul>
    </Card>
  )
}

export function AssistantClics({ s }: { s: AssistantSuivi }) {
  return (
    <Card title="Clics vers les partenaires depuis Milo (7 jours)">
      {s.clics.length ? (
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
          {s.clics.map((c) => <li key={c.marque} className="flex justify-between gap-3"><span className="text-ink-2">{c.marque}</span><span className="font-semibold tabular-nums text-ink">{nf.format(c.n)}</span></li>)}
        </ul>
      ) : <p className="m-0 text-sm text-ink-2">Aucun clic cette semaine.</p>}
    </Card>
  )
}

export function AssistantJours({ s }: { s: AssistantSuivi }) {
  const max = Math.max(1, ...s.jours.map((j) => j.questions))
  return (
    <Card title="14 derniers jours">
      <table className="w-full border-collapse text-sm">
        <thead><tr className="text-left text-xs text-ink-2"><th className="py-1 font-semibold">Jour</th><th className="py-1 font-semibold">Questions</th><th className="py-1 text-right font-semibold">Appels IA</th></tr></thead>
        <tbody>
          {s.jours.map((j) => (
            <tr key={j.jour} className="border-t border-line">
              <td className="py-1 pr-2 tabular-nums text-ink-2">{j.jour}</td>
              <td className="w-full py-1 pr-2">
                <span className="flex items-center gap-2"><span className="h-2 rounded-pill bg-orange" style={{ width: `${(j.questions / max) * 100}%`, minWidth: j.questions ? 4 : 0 }} /><span className="tabular-nums text-ink">{j.questions}</span></span>
              </td>
              <td className="py-1 text-right tabular-nums text-ink">{j.appels}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
