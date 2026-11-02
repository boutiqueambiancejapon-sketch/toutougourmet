'use client'

import { useId, useState } from 'react'
import type { AnalyticalKey, ExtractedLabel } from '@/lib/scanner/types'

// @cdc lot 6 — « à vérifier » : chiffres dont la lecture est douteuse (ou que la personne veut
// corriger). La note est recalculée dans le navigateur avec la valeur saisie ; envoyer la
// correction crée un signalement relu par la rédaction (la fiche publique ne change pas seule).

export const FIELD_LABELS: Record<AnalyticalKey, string> = {
  proteines: 'Protéines',
  matieresGrasses: 'Matières grasses',
  cellulose: 'Cellulose brute',
  cendres: 'Cendres brutes',
  humidite: 'Humidité',
  calcium: 'Calcium',
  phosphore: 'Phosphore',
}
const KEYS = Object.keys(FIELD_LABELS) as AnalyticalKey[]
const fmt = (n: number | null) => (n === null ? 'absent' : `${n.toLocaleString('fr-FR')} %`)

interface VerifyFieldsProps {
  original: ExtractedLabel
  analysisId: string
  signedIn: boolean
  onChange: (label: ExtractedLabel) => void
}

export function VerifyFields({ original, analysisId, signedIn, onChange }: VerifyFieldsProps) {
  const id = useId()
  const doubtful = (original.champsDouteux ?? []).filter((f): f is AnalyticalKey => f !== 'ingredients')
  const [values, setValues] = useState<Record<AnalyticalKey, string>>(() => Object.fromEntries(KEYS.map((k) => [k, original.constituants[k]?.toString().replace('.', ',') ?? ''])) as Record<AnalyticalKey, string>)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function parsed(v: Record<AnalyticalKey, string>): ExtractedLabel['constituants'] {
    return Object.fromEntries(KEYS.map((k) => {
      const n = Number(v[k].replace(',', '.'))
      return [k, v[k].trim() === '' || !Number.isFinite(n) || n < 0 || n > 100 ? null : n]
    })) as ExtractedLabel['constituants']
  }

  function update(k: AnalyticalKey, value: string) {
    const next = { ...values, [k]: value }
    setValues(next)
    setStatus('idle')
    onChange({ ...original, constituants: parsed(next) })
  }

  const changes = KEYS.filter((k) => parsed(values)[k] !== original.constituants[k])
  async function send() {
    setStatus('sending')
    const message = `Correction des constituants : ${changes.map((k) => `${FIELD_LABELS[k]} ${fmt(original.constituants[k])} → ${fmt(parsed(values)[k])}`).join(' ; ')}`
    const res = await fetch('/api/scanner/signaler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ analysisId, message }) }).catch(() => null)
    setStatus(res?.ok ? 'sent' : 'error')
  }

  const shown = doubtful.length > 0 ? doubtful : KEYS
  return (
    <details open={doubtful.length > 0} className={`rounded-box p-3 ${doubtful.length ? 'bg-amber-bg text-amber-ink' : 'bg-cream-2 text-ink'}`}>
      <summary className="min-h-11 cursor-pointer content-center text-[15px] font-semibold">
        {doubtful.length ? `À vérifier : ${doubtful.map((k) => `${FIELD_LABELS[k].toLowerCase()} (lu ${fmt(original.constituants[k])})`).join(', ')}` : 'Un chiffre ne correspond pas à ton paquet ?'}
      </summary>
      <p className="m-0 pt-1 text-sm">Corrige la valeur écrite sur ton sac : la note se recalcule tout de suite, pour toi.</p>
      <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
        {shown.map((k) => (
          <label key={k} htmlFor={`${id}-${k}`} className="flex flex-col gap-1 text-sm font-semibold text-ink">
            {`${FIELD_LABELS[k]} (%)`}
            <input id={`${id}-${k}`} inputMode="decimal" value={values[k]} onChange={(e) => update(k, e.target.value)} className="min-h-11 w-full rounded-control border-2 border-ink bg-paper px-3 text-base font-normal tabular-nums text-ink outline-none focus-visible:ring-4 focus-visible:ring-amber" />
          </label>
        ))}
      </div>
      {changes.length > 0 ? (
        <div className="flex flex-col gap-2 pt-3">
          {signedIn ? (
            <button type="button" onClick={send} disabled={status === 'sending' || status === 'sent'} className="min-h-11 self-start rounded-control bg-ink px-4 text-[15px] font-semibold text-cream disabled:opacity-60">
              {status === 'sent' ? 'Correction envoyée, merci' : status === 'sending' ? 'Envoi…' : 'Envoyer la correction à la rédaction'}
            </button>
          ) : (
            <p className="m-0 text-sm text-ink">Connecte-toi pour envoyer cette correction à la rédaction : elle corrigera la fiche après vérification.</p>
          )}
          {status === 'error' ? <p role="alert" className="m-0 text-sm text-rose-ink">La correction n&apos;est pas partie. Réessaie dans un instant.</p> : null}
        </div>
      ) : null}
    </details>
  )
}
