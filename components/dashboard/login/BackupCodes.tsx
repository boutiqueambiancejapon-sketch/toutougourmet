'use client'

import { useState } from 'react'
import { buttonPrimary, buttonSecondary } from '@/lib/dashboard/login/client'

// @cdc tableau de bord — codes de secours, affichés une seule fois : ils ne vivent que dans cet
// écran, le serveur n'en garde que les empreintes.

export function BackupCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(codes.join('\n'))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      <p className="m-0 text-sm text-ink-2">
        Note ces {codes.length} codes hors de ton iPhone. Chacun sert une fois si Face ID ne répond plus, et cet écran ne reviendra pas.
      </p>
      <ol className="m-0 mt-3 grid list-none grid-cols-2 gap-2 p-0 font-mono text-sm text-ink" aria-label="Codes de secours">
        {codes.map((code) => (
          <li key={code} className="whitespace-nowrap rounded-box bg-cream-2 px-2 py-2 text-center">
            {code}
          </li>
        ))}
      </ol>
      <button type="button" onClick={copy} className={`${buttonSecondary} mt-4`}>
        {copied ? 'Codes copiés' : 'Copier les codes'}
      </button>
      <button type="button" onClick={onDone} className={`${buttonPrimary} mt-2`}>
        J’ai noté mes codes
      </button>
    </div>
  )
}
