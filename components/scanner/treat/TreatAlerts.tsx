import Link from 'next/link'
import { IconAlert } from '@/components/icons'
import type { TreatAlert } from '@/lib/scanner/score'

// @cdc lot 6 — alertes de sécurité d'une friandise (xylitol, raisin, chocolat, oignon ou ail,
// peau de buffle, os cuits) : en tête du résultat et de la fiche, à part de la note.

export function TreatAlerts({ alerts }: { alerts: TreatAlert[] }) {
  if (alerts.length === 0) return null
  return (
    <section role="alert" aria-label="Alertes de sécurité" className="flex flex-col gap-2 rounded-box border-2 border-rose-ink bg-rose-bg p-4 text-rose-ink">
      <p className="m-0 flex items-center gap-2 font-display text-lg font-black leading-tight">
        <IconAlert className="size-6 shrink-0" />
        {alerts.length > 1 ? `${alerts.length} ingrédients à risque pour le chien` : 'Un ingrédient à risque pour le chien'}
      </p>
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {alerts.map((a) => (
          <li key={a.id} className="text-[15px] leading-relaxed">
            <strong className="font-semibold">{`${a.label} (« ${a.found} »). `}</strong>
            {a.text}
          </li>
        ))}
      </ul>
      <p className="m-0 text-sm">
        Les autres aliments à éviter sont dans notre{' '}
        <Link href="/fiche-aliments-dangereux" className="font-semibold text-rose-ink underline underline-offset-2">
          fiche des aliments dangereux pour le chien
        </Link>
        .
      </p>
    </section>
  )
}
