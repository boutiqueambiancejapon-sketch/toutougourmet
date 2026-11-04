'use client'

import { useState } from 'react'
import { Panel } from '@/components/dashboard/Panel'
import { callLogin, errorText, type LoginReply } from '@/lib/dashboard/login/client'
import { LoginError } from './LoginFrame'

// @cdc tableau de bord — sessions ouvertes, fermeture une à une, déconnexion ici ou partout.

interface SecuritySessionsProps {
  sessions: { id: string; label: string; meta: string; current: boolean }[]
}

const smallButton = 'inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-pill border-2 border-line px-4 text-sm font-semibold text-ink hover:border-line-2 disabled:opacity-60'

export function SecuritySessions({ sessions }: SecuritySessionsProps) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function run(action: string, body: Record<string, unknown> = {}) {
    setBusy(true)
    setError('')
    const reply: LoginReply = await callLogin(action, body)
    if (reply.ok) {
      if (reply.next) window.location.assign(reply.next)
      else window.location.reload()
      return
    }
    setError(errorText(reply.error))
    setBusy(false)
  }

  return (
    <Panel title="Sessions ouvertes" hint="12 heures au plus, fermées après 2 heures sans activité.">
      <ul className="m-0 list-none space-y-2 p-0">
        {sessions.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 text-sm">
            <span>
              <span className="block font-semibold text-ink">
                {s.label}
                {s.current ? ' (cet appareil)' : ''}
              </span>
              <span className="block text-ink-2">{s.meta}</span>
            </span>
            {s.current ? null : (
              <button type="button" disabled={busy} onClick={() => run('session-fermer', { id: s.id })} className={smallButton}>
                Fermer
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="m-0 mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => run('deconnexion')} className={smallButton}>
          Se déconnecter
        </button>
        <button type="button" disabled={busy} onClick={() => run('deconnexion-partout')} className={smallButton}>
          Déconnecter partout
        </button>
      </p>
      <LoginError>{error}</LoginError>
    </Panel>
  )
}
