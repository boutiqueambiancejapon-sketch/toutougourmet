import { notFound } from 'next/navigation'
import { IconDownload } from '@/components/icons'
import { SitterView } from '@/components/garde/SitterView'
import { sitterView } from '@/lib/garde/view'
import { sheetByToken } from '@/lib/server/sitter-sheets'

// @cdc fiche de garde — page du gardien, sans compte. Lue à chaque visite (fiche supprimée ou
// expirée : 404 tout de suite). Limite de débit et en-têtes noindex / no-store dans proxy.ts.
export const dynamic = 'force-dynamic'

export default async function SitterPage({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params
  const sheet = await sheetByToken(jeton)
  if (!sheet) notFound()
  return (
    <main className="mx-auto flex max-w-md flex-col gap-3 px-3 py-4">
      <SitterView m={sitterView(sheet.data)} />
      <a
        href={`/garde/${jeton}/fiche.pdf`}
        className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-control border-2 border-ink bg-paper px-4 text-base font-semibold text-ink no-underline"
      >
        <IconDownload className="size-5" />
        Télécharger le PDF
      </a>
    </main>
  )
}
