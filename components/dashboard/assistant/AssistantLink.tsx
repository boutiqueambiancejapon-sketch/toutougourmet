import Link from 'next/link'
import { IconChevron } from '@/components/icons'
import { MiloAvatar } from '@/components/assistant/MiloAvatar'

// @cdc tableau de bord — accès depuis l'onglet Contenu au suivi de Milo.

export function AssistantLink() {
  return (
    <Link href="/tableau-de-bord/assistant" className="mt-3 flex min-h-12 items-center gap-3 rounded-card border border-line bg-paper px-4 py-3 text-ink no-underline hover:border-line-2">
      <MiloAvatar size={28} />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">Voir le suivi de Milo, l’assistant</span>
        <span className="block text-xs text-ink-2">Questions, réponses, coût, comptes ouverts et clics partenaires</span>
      </span>
      <IconChevron className="size-4 text-ink-2" />
    </Link>
  )
}
