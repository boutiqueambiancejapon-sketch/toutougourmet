import Link from 'next/link'
import { IconChevron, IconMail } from '@/components/icons'
import { CONTACTS_PATH } from '@/lib/dashboard/subscriber-search'

// @cdc tableau de bord — accès depuis l'onglet Conversions aux contacts du CRM.

export function SubscribersLink() {
  return (
    <Link
      href={CONTACTS_PATH}
      className="mt-4 flex min-h-12 items-center gap-3 rounded-card border border-line bg-paper px-4 py-3 text-ink no-underline hover:border-line-2"
    >
      <IconMail className="size-5 text-orange-ink" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">Voir les contacts</span>
        <span className="block text-xs text-ink-2">Lettre, comptes et e-mails reçus par chacun, dans le CRM</span>
      </span>
      <IconChevron className="size-4 text-ink-2" />
    </Link>
  )
}
