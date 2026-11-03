import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { DeleteDogButton } from '@/components/compte/DeleteDogButton'
import { DogForm } from '@/components/compte/DogForm'
import { BREED_OPTIONS, dogToFormValues } from '@/components/compte/dog-form-values'
import { getSessionUser } from '@/lib/server/auth'
import { todayIso } from '@/lib/server/dog-form'
import { dogExtrasReady, getDog } from '@/lib/server/dogs'
import { deleteDogAction, updateDogAction } from '@/app/(fr)/compte/actions'

export const metadata: Metadata = { title: 'Modifier le profil' }

export default async function EditDogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/compte/connexion?retour=/compte/chien/${encodeURIComponent(id)}/modifier`)
  const dog = await getDog(user.id, id)
  if (!dog) notFound()
  return (
    <>
      <PageHeading title={`Modifier le profil de ${dog.name}`} back={{ href: `/compte/chien/${dog.id}`, label: dog.name }} />
      <div className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 md:p-6">
        <DogForm action={updateDogAction.bind(null, dog.id)} initial={dogToFormValues(dog)} breeds={BREED_OPTIONS} submitLabel="Enregistrer" today={todayIso()} extras={await dogExtrasReady()} />
        <DeleteDogButton action={deleteDogAction.bind(null, dog.id)} name={dog.name} />
      </div>
    </>
  )
}
