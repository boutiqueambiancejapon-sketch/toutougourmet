import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { Panel } from '@/components/compte/espace/Panel'
import { FormNotice } from '@/components/compte/fields'
import { AccountSheetForm } from '@/components/garde/AccountSheetForm'
import { SheetList } from '@/components/garde/SheetList'
import { draftForDog } from '@/lib/garde/prefill'
import { getSessionUser } from '@/lib/server/auth'
import { todayIso } from '@/lib/server/dog-form'
import { dogExtrasReady, getDog } from '@/lib/server/dogs'
import { listSheets } from '@/lib/server/sitter-sheets'

export const metadata: Metadata = { title: 'Fiche de garde' }

// @cdc fiche de garde — fiches d'un chien : liste, puis création pré-remplie depuis son profil.
export default async function DogSitterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect(`/compte/connexion?retour=/compte/chien/${encodeURIComponent(id)}/garde`)
  const dog = await getDog(user.id, id)
  if (!dog) notFound()
  const [sheets, query, extras] = await Promise.all([listSheets(user.id, dog.id), searchParams, dogExtrasReady()])
  const last = sheets[0] ?? null
  const fromProfile = [dog.food ? 'croquettes' : null, dog.allergies.length > 0 ? 'allergies' : null].filter(Boolean).join(', ')
  const prefilled = last
    ? 'poids, ration, croquettes, allergies, numéros'
    : `poids, âge, activité, donc sa ration${fromProfile ? `, ${fromProfile}` : ''}`
  const gaps = { food: extras && !dog.food, allergies: extras && dog.allergies.length === 0 }

  return (
    <>
      <PageHeading
        title={`Fiche de garde de ${dog.name}`}
        back={{ href: `/compte/chien/${dog.id}`, label: dog.name }}
        lead={<p>Pour la personne qui le garde pendant ton absence : un lien privé et un PDF d&apos;une page.</p>}
      />
      {query.supprimee ? <FormNotice tone="info">Fiche supprimée. Son lien ne fonctionne plus.</FormNotice> : null}
      <Panel id="fiches" title="Ses fiches">
        <SheetList sheets={sheets} now={new Date().getTime()} />
      </Panel>
      <section aria-labelledby="nouvelle-titre" className="flex flex-col gap-3">
        <h2 id="nouvelle-titre" className="m-0 font-display text-xl font-black leading-tight text-ink">
          Nouvelle fiche
        </h2>
        <AccountSheetForm dogId={dog.id} dogName={dog.name} initial={draftForDog(dog, last)} today={todayIso()} prefilled={prefilled} gaps={gaps} />
      </section>
    </>
  )
}
