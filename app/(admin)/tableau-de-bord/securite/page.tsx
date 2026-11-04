import { notFound } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { SecurityFactors } from '@/components/dashboard/login/SecurityFactors'
import { SecurityJournal } from '@/components/dashboard/login/SecurityJournal'
import { SecuritySessions } from '@/components/dashboard/login/SecuritySessions'
import { dashboardSession } from '@/lib/dashboard/guard'
import { sessionStageLabel } from '@/lib/dashboard/login/labels'
import { parsePeriod } from '@/lib/dashboard/period'
import { readSecurity } from '@/lib/server/dashboard-login/security-data'

// @cdc tableau de bord — écran Sécurité. Absent tant que l'authentification Basic reste active.

export const dynamic = 'force-dynamic'

const when = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris' })

export default async function SecurityPage() {
  const session = await dashboardSession()
  if (!session) notFound()
  const data = await readSecurity()
  return (
    <DashboardShell period={parsePeriod(undefined).key} current="" security title="Sécurité" intro="Qui peut se connecter, ce qui est ouvert, ce qui s'est passé.">
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SecurityFactors
          passkeys={data.passkeys.map((p) => ({ id: p.id, label: p.label, meta: `Ajoutée le ${when.format(p.createdAt)}${p.lastUsedAt ? `, servie le ${when.format(p.lastUsedAt)}` : ''}` }))}
          totp={data.totp}
          backupCodes={data.backupCodes}
        />
        <SecuritySessions
          sessions={data.sessions.map((s) => ({
            id: s.id,
            label: s.deviceLabel || 'Appareil inconnu',
            meta: `${sessionStageLabel(s.stage)}, vue le ${when.format(s.lastSeenAt)}`,
            current: s.id === session.id,
          }))}
        />
        <SecurityJournal events={data.events} />
      </div>
    </DashboardShell>
  )
}
