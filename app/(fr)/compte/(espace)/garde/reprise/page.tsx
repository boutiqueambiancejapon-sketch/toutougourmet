import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { DraftResume } from '@/components/garde/DraftResume'
import { getSessionUser } from '@/lib/server/auth'
import { listDogs } from '@/lib/server/dogs'

export const metadata: Metadata = { title: 'Ta fiche de garde' }

// @cdc fiche de garde — retour de l'inscription commencée sur /outils/fiche-de-garde
// (source « fiche-garde ») : la saisie gardée dans le navigateur devient une fiche du compte.
export default async function SitterResumePage() {
  const user = await getSessionUser()
  if (!user) redirect('/compte/connexion?retour=/compte/garde/reprise')
  const dogs = await listDogs(user.id)
  return (
    <>
      <PageHeading title="Ta fiche de garde" lead={<p>Ta saisie est reprise. Encore un clic pour obtenir le lien à envoyer et le PDF.</p>} />
      <DraftResume dogs={dogs.map((d) => ({ id: d.id, name: d.name }))} />
    </>
  )
}
