'use client'

// @cdc fiche de garde — croquettes ou allergies tapées dans la fiche alors que le profil du chien
// ne les a pas : proposition de les garder dans son profil (cochée par défaut). Le serveur ne
// remplit que les champs encore vides du profil (lib/server/dogs.ts, fillDogExtras).

export interface ProfileGaps {
  food: boolean
  allergies: boolean
}

/** Ce que la fiche apprendrait au profil : rien si le profil a déjà tout ce que la fiche contient. */
export function keepable(gaps: ProfileGaps, d: { food: string; allergies: string }): ProfileGaps {
  return { food: gaps.food && d.food.trim() !== '', allergies: gaps.allergies && d.allergies.trim() !== '' }
}

interface KeepInProfileProps {
  name: string
  what: ProfileGaps
  checked: boolean
  onChange: (checked: boolean) => void
}

export function KeepInProfile({ name, what, checked, onChange }: KeepInProfileProps) {
  if (!what.food && !what.allergies) return null
  const items = what.food && what.allergies ? 'Ses croquettes et ses allergies' : what.food ? 'Ses croquettes' : 'Ses allergies'
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-control bg-cream-2 px-4 py-3 text-base text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" />
      <span className="min-w-0">
        <strong className="block font-semibold">{`Garder dans le profil de ${name || 'ton chien'}`}</strong>
        <span className="text-sm text-ink-2">{`${items} seront reprises par ses prochaines fiches.${what.allergies ? ' Le scanner te signalera les compositions qui en contiennent.' : ''}`}</span>
      </span>
    </label>
  )
}
