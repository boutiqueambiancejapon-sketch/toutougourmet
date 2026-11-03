import type { OpffImportStatusData } from '@/lib/server/opff-store'
import type { OpffIndexPolicy } from '@/lib/server/scanner-published'
import { Empty, SectionTitle } from './Panel'

// @cdc lot 6 — « Copie Open Pet Food Facts » : dernier import hebdomadaire (scripts/opff-import.ts),
// ses compteurs, et le contenu de la table (produits chien, fiches notées, indexables selon la règle).

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' })
const STATUS = { ok: 'réussi', error: 'en échec', running: 'en cours' } as const

/** Compteurs affichés, dans cet ordre (les autres restent dans le journal du service). */
const SHOWN: [string, string][] = [
  ['lus', 'lignes lues'],
  ['chien', 'produits chien'],
  ['nouveaux', 'nouveaux'],
  ['modifies', 'modifiés'],
  ['notes', 'notés'],
  ['fiches_creees', 'fiches créées'],
  ['fiches_mises_a_jour', 'fiches mises à jour'],
  ['duree_s', 'secondes'],
]

interface Props {
  status: OpffImportStatusData | null
  policy: OpffIndexPolicy
}

export function OpffImportSection({ status, policy }: Props) {
  const last = status?.last ?? null
  const counters = last?.counters ?? {}
  return (
    <>
      <SectionTitle
        id="opff"
        title="Copie Open Pet Food Facts"
        intro="Import chaque dimanche à 1 h 10 : scans par code-barres sans attendre leur serveur et fiches pré-notées. Alerte si l'import échoue ou n'a pas réussi depuis 8 jours."
      />
      <div className="mt-4">
        {!status && <Empty>Table de l&apos;import illisible (migration 0005 appliquée ?).</Empty>}
        {status && !last && <Empty>Aucun import encore passé.</Empty>}
        {status && last && (
          <div className="rounded-card border border-line bg-paper p-4 text-sm text-ink-2">
            <p className="m-0">
              <strong className={last.status === 'error' ? 'text-rose-ink' : 'text-ink'}>{`Dernier import ${STATUS[last.status]}`}</strong>
              {' le '}
              <time dateTime={last.startedAt.toISOString()}>{dateFmt.format(last.startedAt)}</time>
              {status.lastOk && status.lastOk.id !== last.id ? ` · dernier réussi le ${dateFmt.format(status.lastOk.startedAt)}` : ''}
              {last.dumpModified ? ` · export du ${dateFmt.format(last.dumpModified)}` : ''}
            </p>
            {last.error && <p className="m-0 mt-1 text-rose-ink">{last.error}</p>}
            <p className="m-0 mt-2">
              {counters.export_inchange ? 'Export inchangé depuis le passage précédent, rien relu. ' : ''}
              {SHOWN.filter(([k]) => counters[k] !== undefined)
                .map(([k, label]) => `${counters[k]} ${label}`)
                .join(' · ')}
            </p>
            <p className="m-0 mt-2">
              {`Dans la table : ${status.products} produits chien, ${status.scorable} notés, ${status.indexable} indexables selon la règle (marque, nom, composition, 5 constituants). `}
              {policy === 'complete' ? 'Règle activée (OPFF_INDEX_POLICY=complete) : ces fiches sont indexées.' : 'Règle désactivée : seules les fiches relues sont indexées.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
