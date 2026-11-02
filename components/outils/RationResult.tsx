import { NextSteps } from './NextSteps'
import type { RationFood } from './ration-params'

// Résultat de /outils/ration : kcal, grammes de croquettes et de repas frais (l'aliment choisi
// dans l'URL est encadré), puis la suite logique.
export interface RationValues {
  kcal: number
  gKibble: number
  gFresh: number
}

const MONO = { fontFamily: "'JetBrains Mono', monospace" }

function Cell({ value, unit, tone, active }: { value: string; unit: string; tone: string; active: boolean }) {
  return (
    <div className={`bg-[var(--bg-surface-2)] rounded-[var(--radius-lg)] p-4 text-center border-2 ${active ? 'border-ink' : 'border-transparent'}`}>
      <p className={`text-2xl font-black ${tone}`} style={MONO}>{value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{unit}</p>
    </div>
  )
}

export function RationResult({ result, food }: { result: RationValues; food?: RationFood }) {
  return (
    <div className="mt-6 pt-6 border-t border-[var(--border)]">
      <h3 className="font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
        Besoins journaliers estimés
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Cell value={String(result.kcal)} unit="kcal / jour" tone="text-[var(--accent-1)]" active={false} />
        <Cell value={`${result.gKibble}g`} unit="croquettes / jour" tone="text-[var(--accent-2)]" active={food === 'croquettes'} />
        <Cell value={`${result.gFresh}g`} unit="repas frais / jour" tone="text-[var(--accent-3)]" active={food === 'frais'} />
      </div>
      <p className="text-xs text-[var(--text-muted)] italic">
        Estimation basée sur les formules vétérinaires standard (NRC 2006). Ajuste en fonction
        du poids de ton animal sur 4 semaines. En cas de doute, consulte un vétérinaire.
      </p>
      <NextSteps
        steps={[
          { href: '/chien/urgences', label: 'Aliments à éviter', sub: 'Le niveau de risque de chaque aliment et quoi faire' },
          { href: '/chien/marque', label: 'Comparer les marques', sub: 'Compositions et prix comparés' },
        ]}
      />
    </div>
  )
}
