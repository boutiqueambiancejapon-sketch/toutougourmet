import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeading } from '@/components/compte/espace/PageHeading'
import { DogForm } from '@/components/compte/DogForm'
import { FormNotice } from '@/components/compte/fields'
import { BREED_OPTIONS, EMPTY_DOG } from '@/components/compte/dog-form-values'
import { isKnownBreed } from '@/lib/dog-profile'
import { getSessionUser } from '@/lib/server/auth'
import { todayIso } from '@/lib/server/dog-form'
import { dogExtrasReady } from '@/lib/server/dogs'
import { createDogAction } from '@/app/(fr)/compte/actions'

export const metadata: Metadata = { title: 'Ajouter mon chien' }

type Search = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

// Pré-remplissage depuis une invitation (page race : ?race=slug ; résultat du quiz : ?poids=12).
function prefill(params: Search) {
  const race = one(params.race)
  const kg = Number((one(params.poids) ?? '').replace(',', '.'))
  return {
    ...EMPTY_DOG,
    breedSlug: race && isKnownBreed(race) ? race : '',
    weightKg: Number.isFinite(kg) && kg > 0 && kg <= 120 ? String(kg) : '',
  }
}

export default async function NewDogPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams
  if (!(await getSessionUser())) {
    const query = new URLSearchParams(Object.entries(params).flatMap(([k, v]) => (typeof v === 'string' && k !== 'bienvenue' ? [[k, v]] : []))).toString()
    redirect(`/compte/connexion?retour=${encodeURIComponent(`/compte/chien/nouveau${query ? `?${query}` : ''}`)}`)
  }
  return (
    <>
      <PageHeading title="Ajouter mon chien" back={{ href: '/compte/chiens', label: 'Mes chiens' }} lead={<p>Tu pourras tout modifier ensuite.</p>} />
      {params.bienvenue ? <FormNotice tone="info">Adresse confirmée, ton compte est ouvert. Complète le profil de ton chien.</FormNotice> : null}
      <div className="rounded-card border border-line bg-paper p-4 md:p-6">
        <DogForm action={createDogAction} initial={prefill(params)} breeds={BREED_OPTIONS} submitLabel={
            <>
              <span className="xs:hidden">Enregistrer</span>
              <span className="hidden xs:inline">Enregistrer mon chien</span>
            </>
          } today={todayIso()} extras={await dogExtrasReady()} />
      </div>
    </>
  )
}
