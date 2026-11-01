'use client'

// Groupe de boutons radio présenté en segments (outils de l'accueil). Vrais <input type="radio">
// pour le clavier et les lecteurs d'écran ; le libellé visible sert d'étiquette.
interface SegmentedProps<T extends string> {
  name: string
  legend: string
  hint?: string
  options: readonly (readonly [T, string])[]
  value: T
  onChange: (value: T) => void
}

export function Segmented<T extends string>({ name, legend, hint, options, value, onChange }: SegmentedProps<T>) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
      <legend className="mb-1.5 p-0 text-sm font-semibold text-ink">
        {legend}
        {hint ? <span className="font-normal text-ink-2">{` (${hint})`}</span> : null}
      </legend>
      <div className="flex gap-1 rounded-control bg-cream-2 p-1">
        {options.map(([val, label]) => (
          <label key={val} className="relative flex min-h-10 flex-1 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={val}
              checked={value === val}
              onChange={() => onChange(val)}
              className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
            />
            <span className="flex w-full items-center justify-center rounded-tile px-1 text-center text-sm leading-tight text-ink-2 peer-checked:bg-paper peer-checked:font-semibold peer-checked:text-ink peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ink">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
