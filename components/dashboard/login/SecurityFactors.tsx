'use client'

import { useState } from 'react'
import { callLogin, errorText, PASSKEY_CANCELLED, type LoginReply } from '@/lib/dashboard/login/client'
import { addPasskey, usePreparedPasskey } from '@/lib/dashboard/login/passkey-client'
import { Panel } from '@/components/dashboard/Panel'
import { BackupCodes } from './BackupCodes'
import { LoginError } from './LoginFrame'
import { TotpSetup } from './TotpSetup'

// @cdc tableau de bord — écran Sécurité : clés d'accès, application de codes, codes de secours.
// Le serveur refuse tout changement si le second facteur date de plus de 15 minutes.

interface SecurityFactorsProps {
  passkeys: { id: string; label: string; meta: string }[]
  totp: boolean
  backupCodes: number
}

const smallButton = 'inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-pill border-2 border-line px-4 text-sm font-semibold text-ink hover:border-line-2 disabled:opacity-60'

export function SecurityFactors({ passkeys, totp, backupCodes }: SecurityFactorsProps) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [codes, setCodes] = useState<string[] | null>(null)
  const [settingUp, setSettingUp] = useState(false)
  const takePrepared = usePreparedPasskey('enrol-cle-options')

  function settle(reply: LoginReply | null) {
    if (reply?.codes) {
      setCodes(reply.codes)
      setSettingUp(false)
    } else if (reply?.ok) {
      window.location.reload()
      return
    } else {
      setError(reply ? errorText(reply.error) : PASSKEY_CANCELLED)
    }
    setBusy(false)
  }

  async function run(work: () => Promise<LoginReply | null>) {
    setBusy(true)
    setError('')
    settle(await work())
  }

  if (codes) return <Panel title="Nouveaux codes de secours"><BackupCodes codes={codes} onDone={() => window.location.reload()} /></Panel>

  return (
    <Panel title="Clés et codes" hint="Ajouter ou retirer demande un second facteur passé il y a moins de 15 minutes.">
      <h4 className="m-0 text-sm font-semibold text-ink">Clés d’accès</h4>
      <ul className="m-0 mt-2 list-none space-y-2 p-0">
        {passkeys.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 text-sm">
            <span>
              <span className="block font-semibold text-ink">{p.label}</span>
              <span className="block text-ink-2">{p.meta}</span>
            </span>
            <button type="button" disabled={busy} onClick={() => run(() => callLogin('cle-retirer', { id: p.id }))} className={smallButton}>
              Retirer
            </button>
          </li>
        ))}
        {passkeys.length === 0 ? <li className="text-sm text-ink-2">Aucune clé d’accès.</li> : null}
      </ul>
      <button type="button" disabled={busy} onClick={() => run(async () => addPasskey(await takePrepared()))} className={`${smallButton} mt-3`}>
        Ajouter une clé
      </button>

      <h4 className="m-0 mt-5 text-sm font-semibold text-ink">Application de codes</h4>
      <p className="m-0 mt-1 text-sm text-ink-2">{totp ? 'Enregistrée.' : 'Aucune application enregistrée.'}</p>
      {totp ? (
        <button type="button" disabled={busy} onClick={() => run(() => callLogin('code-retirer'))} className={`${smallButton} mt-2`}>
          Retirer l’application
        </button>
      ) : settingUp ? (
        <div className="mt-3">
          <TotpSetup onDone={settle} />
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => setSettingUp(true)} className={`${smallButton} mt-2`}>
          Ajouter une application
        </button>
      )}

      <h4 className="m-0 mt-5 text-sm font-semibold text-ink">Codes de secours</h4>
      <p className="m-0 mt-1 text-sm text-ink-2">{backupCodes === 0 ? 'Aucun code restant.' : `${backupCodes} ${backupCodes > 1 ? 'codes restants' : 'code restant'}.`}</p>
      <button type="button" disabled={busy} onClick={() => run(() => callLogin('codes-renouveler'))} className={`${smallButton} mt-2`}>
        Renouveler les codes
      </button>
      <LoginError>{error}</LoginError>
    </Panel>
  )
}
