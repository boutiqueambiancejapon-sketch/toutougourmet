import Link from 'next/link'
import { IconChevron, IconScan } from '@/components/icons'

// @cdc tableau de bord — accès depuis l'onglet Contenu à l'écran de santé du scanner.

export function ScannerHealthLink() {
  return (
    <Link
      href="/tableau-de-bord/scanner"
      className="mt-4 flex min-h-12 items-center gap-3 rounded-card border border-line bg-paper px-4 py-3 text-ink no-underline hover:border-line-2"
    >
      <IconScan className="size-5 text-orange-ink" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">Voir la santé du scanner</span>
        <span className="block text-xs text-ink-2">Scans du jour, échecs, produits introuvables et plafond de lectures</span>
      </span>
      <IconChevron className="size-4 text-ink-2" />
    </Link>
  )
}
