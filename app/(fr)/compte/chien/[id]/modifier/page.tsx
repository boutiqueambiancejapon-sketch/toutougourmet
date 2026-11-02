import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { AccountPage } from '@/components/compte/AccountPage'
import { DeleteDogButton } from '@/components/compte/DeleteDogButton'
import { DogForm } from '@/components/compte/DogForm'
import { BREED_OPTIONS, dogToFormValues } from '@/components/compte/dog-form-values'
import { getSessionUser } from '@/lib/server/auth'
import { todayIso } from '@/lib/server/dog-form'
import { getDog } from '@/lib/server/dogs'
import { deleteDogAction, updateDogAction } from '../../../actions'

export const metadata: Metadata = { title: 'Modifier le profil' }

export default async function EditDogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/compte/connexion?retour=/compte/chien/${encodeURIComponent(id)}/modifier`)
  const dog = await getDog(user.id, id)
  if (!dog) notFound()
  return (
    <AccountPage title={`Modifier le profil de ${dog.name}`} back={{ href: `/compte/chien/${dog.id}`, label: dog.name }}>
      <DogForm action={updateDogAction.bind(null, dog.id)} initial={dogToFormValues(dog)} breeds={BREED_OPTIONS} submitLabel="Enregistrer" today={todayIso()} />
      <DeleteDogButton action={deleteDogAction.bind(null, dog.id)} name={dog.name} />
    </AccountPage>
  )
}
