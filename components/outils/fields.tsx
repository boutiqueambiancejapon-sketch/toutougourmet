import type { ReactNode } from 'react'

// @cdc 04-pages — briques des calculateurs V2 (même dessin que components/tools/RationQuick.tsx) :
// champ numérique bordé encre, bouton plein, chiffre du résultat en Fraunces. Sans état, donc
// utilisables dans les composants clients des outils comme côté serveur.

export function ToolCard({ children, label, onSubmit }: { children: ReactNode; label: string; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form aria-label={label} onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:p-6">
      {children}
    </form>
  )
}

interface NumberFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  min: number
  max: number
  step?: number
  hint?: string
  /** false : champ facultatif (valeur par défaut appliquée par l'outil) */
  required?: boolean
}

export function NumberField({ id, label, value, onChange, placeholder, min, max, step = 0.1, hint, required = true }: NumberFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {hint ? <span className="font-normal text-ink-2">{` (${hint})`}</span> : null}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full min-w-0 rounded-control border-2 border-ink bg-paper px-4 text-lg text-ink outline-none placeholder:text-ink-3 focus-visible:ring-4 focus-visible:ring-amber"
      />
    </div>
  )
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button type="submit" className="min-h-12 rounded-control bg-ink px-5 text-base font-semibold text-cream hover:underline">
      {children}
    </button>
  )
}

/** Case à cocher avec une cible de 44 px. */
export function CheckField({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-ink" />
      <span>{children}</span>
    </label>
  )
}

/** Gros chiffre du résultat, suivi de son unité et d'une phrase de contexte. */
export function BigResult({ value, unit, children }: { value: string; unit: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 flex flex-wrap items-baseline gap-x-2 text-ink">
        <span className="font-display text-5xl font-black leading-none tracking-tight">{value}</span>
        <span className="text-lg">{unit}</span>
      </p>
      {children ? <div className="text-[15px] leading-relaxed text-ink-2 [&_p]:m-0 [&_p+p]:mt-2">{children}</div> : null}
    </div>
  )
}
