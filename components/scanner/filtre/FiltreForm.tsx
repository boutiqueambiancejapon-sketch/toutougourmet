import type { Filtre } from '@/lib/scanner/filtre'

// @cdc cluster scanner — formulaire du filtre (GET, sans JavaScript : lisible par les moteurs et les assistants d'IA).

const CHAMP = 'flex flex-col gap-1 text-sm font-semibold text-ink'
const SELECT = 'min-h-11 rounded-box border border-line bg-paper px-3 text-base font-normal text-ink'

function Choix({ nom, label, valeur, options }: { nom: string; label: string; valeur: string; options: [string, string][] }) {
  return (
    <label className={CHAMP}>
      {label}
      <select name={nom} defaultValue={valeur} className={SELECT}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  )
}

export function FiltreForm({ f }: { f: Filtre }) {
  return (
    <form method="get" action="/choisir-croquettes" className="grid gap-3 rounded-card border-2 border-ink bg-cream-2 p-4 sm:grid-cols-2">
      <Choix nom="type" label="Type" valeur={f.type} options={[['croquettes', 'Croquettes'], ['patee', 'Pâtées']]} />
      <Choix nom="age" label="Âge" valeur={f.age} options={[['', 'Tous les âges'], ['chiot', 'Chiot'], ['adulte', 'Adulte'], ['senior', 'Senior']]} />
      <Choix nom="taille" label="Gabarit" valeur={f.taille} options={[['', 'Toutes les tailles'], ['petit', 'Petit chien'], ['moyen', 'Chien moyen'], ['grand', 'Grand chien']]} />
      <Choix nom="besoin" label="Besoin particulier" valeur={f.besoin} options={[['', 'Aucun'], ['sterilise', 'Stérilisé'], ['surpoids', 'Surpoids'], ['digestion', 'Digestion sensible'], ['peau', 'Peau sensible'], ['allergies', 'Allergies'], ['articulations', 'Articulations']]} />
      <Choix nom="budget" label="Budget maximum au kilo" valeur={f.budget === null ? '' : String(f.budget)} options={[['', 'Pas de limite'], ['3', '3 €/kg'], ['4', '4 €/kg'], ['5', '5 €/kg'], ['6', '6 €/kg'], ['8', '8 €/kg'], ['10', '10 €/kg']]} />
      <Choix nom="tri" label="Trier par" valeur={f.tri} options={[['note', 'Meilleure note'], ['prix', 'Moins cher au kilo']]} />
      <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-ink sm:col-span-2">
        <input type="checkbox" name="cereales" value="sans" defaultChecked={f.cereales} className="size-5 accent-[var(--color-orange)]" />
        Sans céréales seulement
      </label>
      <button type="submit" className="min-h-12 whitespace-nowrap rounded-control bg-orange px-5 text-base font-semibold text-ink sm:col-span-2">Voir les résultats</button>
    </form>
  )
}
