import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { Panel } from '@/components/compte/espace/Panel'
import { periodOf } from '@/components/garde/SheetList'
import { DeleteSheetButton, SheetActions } from '@/components/garde/SheetActions'
import { SitterView } from '@/components/garde/SitterView'
import { formatDay } from '@/lib/garde/sheet'
import { sitterView } from '@/lib/garde/view'
import { getSessionUser } from '@/lib/server/auth'
import { getOwnSheet } from '@/lib/server/sitter-sheets'
import { deleteSheetAction } from '@/app/(fr)/compte/garde-actions'

export const metadata: Metadata = { title: 'Fiche de garde' }

// @cdc fiche de garde — une fiche : envoyer le lien, PDF, aperçu de la page du gardien, suppression.
export default async function SitterSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; sheetId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id, sheetId } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/compte/connexion?retour=/compte/chien/${encodeURIComponent(id)}/garde`)
  const sheet = await getOwnSheet(user.id, sheetId)
  if (!sheet || sheet.dogId !== id) notFound()
  const query = await searchParams
  const live = sheet.expiresAt.getTime() > new Date().getTime()
  const name = sheet.data.dogName

  return (
    <>
      <PageHeading title={query.nouvelle ? `La fiche de ${name} est prête` : `Fiche de garde de ${name}`} back={{ href: `/compte/chien/${id}/garde`, label: 'Ses fiches' }} lead={<p>{periodOf(sheet)}</p>} />
      <section aria-label="Partager la fiche" className="flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-4 shadow-[4px_4px_0_var(--orange)] md:p-6">
        {live ? (
          <>
            <p className="m-0 text-base leading-relaxed text-ink-2">
              {`Valable jusqu'au lendemain du retour (${formatDay(sheet.endsOn)}). Le lien ne montre ni ton e-mail ni ton adresse.`}
            </p>
            <SheetActions token={sheet.token} name={name} />
            <p className="m-0 text-sm text-ink-2">
              « Envoyer le lien » ouvre le partage du téléphone (WhatsApp, SMS, e-mail). Si tu supprimes la fiche, le lien cesse de fonctionner.
            </p>
          </>
        ) : (
          <p className="m-0 text-base text-ink-2">Le lien a expiré. Crée une nouvelle fiche pour la prochaine absence.</p>
        )}
        <DeleteSheetButton action={deleteSheetAction.bind(null, sheet.id)} />
      </section>
      <Panel id="apercu" title="Ce que reçoit la personne qui le garde">
        <div className="mx-auto w-full max-w-md">
          <SitterView m={sitterView(sheet.data)} headingLevel={2} />
        </div>
      </Panel>
    </>
  )
}
