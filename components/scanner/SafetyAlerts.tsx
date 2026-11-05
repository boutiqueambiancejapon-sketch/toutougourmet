import { IconAlert } from '@/components/icons'

// @cdc scanner — alertes de sécurité des nouveaux barèmes (toxiques, oignon et ail, chiot, foie de morue, limite NRC), tous types.

export function SafetyAlerts({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null
  return (
    <section role="alert" aria-label="Alertes de sécurité" className="flex flex-col gap-2 rounded-box border-2 border-rose-ink bg-rose-bg p-4 text-rose-ink">
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {alerts.map((a) => (
          <li key={a} className="flex gap-2 text-[15px] leading-relaxed">
            <IconAlert className="size-5 shrink-0" />
            {a}
          </li>
        ))}
      </ul>
    </section>
  )
}
