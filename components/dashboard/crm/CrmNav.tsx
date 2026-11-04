import type { PeriodKey } from '@/lib/dashboard/period'
import { SubNav } from '../SubNav'

// @cdc tableau de bord — sous-pages de l'onglet CRM.

const VIEWS = [
  { sub: '', label: 'Où en sont-ils ?' },
  { sub: '/contacts', label: 'Contacts' },
] as const

export function CrmNav({ period, current }: { period: PeriodKey; current: (typeof VIEWS)[number]['sub'] }) {
  return <SubNav tab="crm" label="Vues du CRM" views={VIEWS} period={period} current={current} />
}
