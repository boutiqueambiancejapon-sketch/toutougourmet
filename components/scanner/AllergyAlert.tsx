'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IconAlert } from '@/components/icons'
import { loadProfile } from '@/components/outils/useAccountPrefill'
import { hasSessionHint } from '@/lib/account-hint'
import { findAllergens } from '@/lib/allergen-match'

// @cdc profil chien — encadré « contient du bœuf, signalé pour Rex » sur le résultat du scanner
// et la fiche /croquettes. Rendu dans le navigateur après lecture du profil (témoin de session
// présent seulement) : la fiche reste statique, aucune requête pour un visiteur sans compte.

type DogAllergies = { name: string; allergies: string[] }[]

export function AllergyAlert({ ingredients }: { ingredients: string[] }) {
  const [dogs, setDogs] = useState<DogAllergies>([])

  useEffect(() => {
    if (!hasSessionHint()) return
    let alive = true
    void loadProfile().then((p) => {
      if (alive) setDogs(p?.allergies ?? [])
    })
    return () => {
      alive = false
    }
  }, [])

  const lines = dogs.flatMap((d) => findAllergens(d.allergies, ingredients).map((h) => ({ ...h, name: d.name })))
  if (lines.length === 0) return null
  return (
    <section role="alert" aria-label="Allergies de tes chiens" className="flex flex-col gap-2 rounded-box border-2 border-rose-ink bg-rose-bg p-4 text-rose-ink">
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {lines.map((h) => (
          <li key={`${h.name}-${h.allergy}`} className="flex items-start gap-2 text-[15px] leading-relaxed">
            <IconAlert className="mt-0.5 size-5 shrink-0" />
            <span>
              <strong className="font-semibold">{`Attention : ${h.possible ? 'peut contenir' : 'contient'} ${h.partitive}, signalé pour ${h.name}.`}</strong>
              {h.possible ? ` L'ingrédient « ${h.ingredient} » ne précise pas l'espèce ou la céréale.` : ` Ingrédient : « ${h.ingredient} ».`}
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 text-sm">
        Repérage automatique sur la composition affichée, sans valeur de diagnostic. Allergies modifiables dans{' '}
        <Link href="/compte/chiens" className="font-semibold text-rose-ink underline underline-offset-2">
          le profil de tes chiens
        </Link>
        .
      </p>
    </section>
  )
}
