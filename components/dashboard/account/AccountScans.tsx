import Link from 'next/link'
import { scanOriginLabel } from '@/lib/scanner/scanner-events'
import type { AccountDetail } from '@/lib/server/dashboard-account-detail'
import { Card, ListRow, Rows, Score, shortMoment, Unreadable } from './parts'

// @cdc tableau de bord — scans d'un compte et compteur du mois. Le compteur ne porte que sur les
// analyses par photo (scan_usage) : un code-barres n'est pas décompté, il figure quand même dans la liste.

export function AccountScans({ scans, usage }: Pick<AccountDetail, 'scans' | 'usage'>) {
  return (
    <Card title="Scans">
      <p className="m-0 text-sm text-ink-2">
        {usage ? `${usage.used} sur ${usage.limit} analyses par photo ce mois-ci. Les codes-barres ne sont pas décomptés.` : 'Compteur du mois non lu.'}
      </p>
      {scans === null ? <Unreadable>Les scans de ce compte n’ont pas pu être lus.</Unreadable> : null}
      {scans?.rows.length === 0 ? <p className="m-0 text-sm text-ink-2">Aucun scan enregistré sur ce compte.</p> : null}
      {scans && scans.rows.length > 0 ? (
        <Rows>
          {scans.rows.map((s) => (
            <ListRow
              key={`${s.foodId}-${s.at.toISOString()}`}
              main={
                <Link href={`/tableau-de-bord/fiches/${s.foodId}`} className="text-ink underline underline-offset-2">
                  {[s.brand, s.product].filter(Boolean).join(', ') || 'Fiche sans nom'}
                </Link>
              }
              detail={`${shortMoment(s.at)} · ${scanOriginLabel(s)}`}
              aside={<Score value={s.score} />}
            />
          ))}
        </Rows>
      ) : null}
      {scans && scans.total > scans.rows.length ? <p className="m-0 text-xs text-ink-2">Les {scans.rows.length} plus récents sur {scans.total}.</p> : null}
    </Card>
  )
}
