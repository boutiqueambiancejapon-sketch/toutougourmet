// @cdc tableau de bord SEO — formes de données des graphiques (partagées serveur → client, sans fonction).

export type NoteKind = 'pub' | 'maj' | 'tech' | 'google'

export const NOTE_LABEL: Record<NoteKind, string> = {
  pub: 'publication',
  maj: 'mise à jour',
  tech: 'technique',
  google: 'Google',
}

export const NOTE_COLOR: Record<NoteKind, string> = {
  pub: 'var(--sd-s2)',
  maj: 'var(--sd-s3)',
  tech: 'var(--sd-s4)',
  google: 'var(--sd-ink)',
}

export interface ChartNote {
  day: string
  kind: NoteKind
  text: string
}

export interface LineSeries {
  key: string
  label: string
  color: string
  values: (number | null)[]
  /** Série de comparaison : grise, fine, sous la série principale. */
  muted?: boolean
  /** Dates de cette série si elles diffèrent de l'axe (période d'avant). */
  days?: string[]
}

export interface BarSeries {
  key: string
  label: string
  color: string
  values: number[]
}

export type ValueFormat = 'count' | 'position' | 'decimal' | 'pct' | 'eur'
