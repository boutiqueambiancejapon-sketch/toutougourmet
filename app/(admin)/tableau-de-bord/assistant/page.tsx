import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { parsePeriod } from '@/lib/dashboard/period'
import { READ_FAILED } from '@/lib/dashboard/tab-page'
import { getAssistantSuivi } from '@/lib/server/dashboard-assistant'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { AssistantConversations, AssistantIdees } from '@/components/dashboard/assistant/AssistantConversations'
import { AssistantClics, AssistantJours, AssistantParcours, AssistantTiles } from '@/components/dashboard/assistant/AssistantNumbers'

// @cdc tableau de bord — suivi de Milo, sous-page de l'onglet Contenu. Identifiants revérifiés ici, jamais indexée.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Milo, l’assistant — Tableau de bord' },
  robots: { index: false, follow: false, nocache: true },
}

export default async function AssistantSuiviPage() {
  if (!(await dashboardAllowed())) notFound()
  const s = await getAssistantSuivi()
  return (
    <DashboardShell
      period={parsePeriod(undefined).key}
      current="contenu"
      title="Milo, l’assistant"
      intro="Questions posées, réponses, coût, comptes ouverts grâce au chat et clics vers les partenaires. Le coût est une estimation : 0,001 $ par appel à l’IA."
      notice={s.ok ? null : READ_FAILED}
    >
      <p className="m-0 mt-3 text-sm">
        <Link href="/tableau-de-bord/contenu" className="text-ink-2 underline underline-offset-2">Retour à l’onglet Contenu</Link>
        {' · '}
        <a href="https://www.toutou-gourmet.com/assistant" className="text-ink-2 underline underline-offset-2">Ouvrir Milo sur le site</a>
      </p>
      <AssistantTiles s={s} />
      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <AssistantParcours s={s} />
          <AssistantClics s={s} />
          <AssistantJours s={s} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <AssistantIdees s={s} />
          <AssistantConversations s={s} />
        </div>
      </div>
    </DashboardShell>
  )
}
