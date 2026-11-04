import Link from 'next/link'
import { accountHref } from '@/lib/dashboard/account-status'
import { isScannerResult, SCAN_TYPE_LABEL, SCANNER_RESULTS, scanOriginLabel, type ScanType } from '@/lib/scanner/scanner-events'
import type { FicheChecks } from '@/lib/server/dashboard-fiche-checks'
import type { FailureRow, RecentScanRow } from '@/lib/server/dashboard-scanner'
import { Card, ListRow, Rows, Score, shortMoment } from '../account/parts'
import { Badge } from '../subscribers/RowParts'
import { CHECK_BADGES } from './FicheCheckCard'

// @cdc tableau de bord — échecs récents et derniers scans. Une ligne liée à un compte mène à sa
// fiche ; sans compte, elle le dit. Le produit mène à sa fiche de relecture.

const NO_ACCOUNT = 'Sans compte'

function Who({ userId, email }: { userId: string | null; email: string | null }) {
  if (!userId || !email) return <>{NO_ACCOUNT}</>
  return (
    <Link href={accountHref(userId)} className="break-words text-ink-2 underline underline-offset-2">
      {email}
    </Link>
  )
}

const typeLabel = (type: string): string => (type === 'code' || type === 'photo' ? SCAN_TYPE_LABEL[type as ScanType] : type)

export function RecentFailures({ rows, journal }: { rows: FailureRow[]; journal: boolean }) {
  return (
    <Card title="Échecs récents">
      {rows.length === 0 ? (
        <p className="m-0 text-sm text-ink-2">{journal ? 'Aucun échec enregistré pour le moment.' : 'Le journal n’est pas encore en service.'}</p>
      ) : (
        <Rows>
          {rows.map((r) => {
            const info = isScannerResult(r.result) ? SCANNER_RESULTS[r.result] : null
            return (
              <ListRow
                key={r.id}
                main={info?.label ?? r.result}
                detail={
                  <>
                    {shortMoment(r.at)} · {typeLabel(r.scanType)} · <Who userId={r.userId} email={r.email} />
                  </>
                }
                aside={<Badge tone="rose">{info?.pill ?? 'Échec'}</Badge>}
              />
            )
          })}
        </Rows>
      )}
    </Card>
  )
}

function origin(r: RecentScanRow): string {
  if (r.eventType) return typeLabel(r.eventType)
  return scanOriginLabel({ fromCache: r.fromCache ?? true, source: r.source ?? '', eventType: null })
}

export function RecentScans({ rows, checks }: { rows: RecentScanRow[]; checks: FicheChecks['byFood'] }) {
  return (
    <Card title="Derniers scans">
      {rows.length === 0 ? (
        <p className="m-0 text-sm text-ink-2">Aucun scan enregistré pour le moment. Le premier s’affichera ici.</p>
      ) : (
        <Rows>
          {rows.map((r) => {
            const name = [r.brand, r.product].filter(Boolean).join(', ') || 'Fiche sans nom'
            const check = r.foodId ? checks.get(r.foodId) : undefined
            return (
              <ListRow
                key={r.key}
                main={
                  r.foodId ? (
                    <Link href={`/tableau-de-bord/fiches/${r.foodId}`} className="text-ink underline underline-offset-2">
                      {name}
                    </Link>
                  ) : (
                    'Fiche supprimée depuis'
                  )
                }
                detail={
                  <>
                    {shortMoment(r.at)} · {origin(r)} · <Who userId={r.userId} email={r.email} />
                    {check ? ` · ${CHECK_BADGES[check.status].label} : ${check.reason}` : ''}
                  </>
                }
                aside={r.foodId ? <Score value={r.score} /> : null}
              />
            )
          })}
        </Rows>
      )}
    </Card>
  )
}
