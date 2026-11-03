'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { hasSessionHint } from '@/lib/account-hint'
import { track } from '@/lib/analytics'
import { EMPTY_DRAFT, loadDraft, saveDraft, type SheetDraft } from '@/lib/garde/draft'
import { signupHref } from '@/lib/signup-places'
import { SheetForm } from './SheetForm'

// @cdc fiche de garde — formulaire de la page publique, sans compte. La saisie reste dans ce
// navigateur (localStorage) : rien n'est envoyé au serveur. Pour obtenir le lien à partager et
// le PDF, on crée un compte gratuit (source « fiche-garde ») ; la saisie est reprise sur
// /compte/garde/reprise après la confirmation de l'e-mail. Un compte connecté y va directement.

export const RESUME_PATH = '/compte/garde/reprise'

const noop = () => () => {}

export function PublicSheetForm() {
  const router = useRouter()
  const signedIn = useSyncExternalStore(noop, hasSessionHint, () => false)
  const [initial, setInitial] = useState<SheetDraft | null>(null)
  const [today, setToday] = useState('')

  // Saisie déjà commencée sur ce navigateur : on la remet (lecture après l'hydratation). La date
  // du jour se lit ici aussi : la page est statique, celle du build serait périmée.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setToday(new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }))
      setInitial(loadDraft() ?? EMPTY_DRAFT)
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  async function onSubmit(_data: unknown, draft: SheetDraft) {
    saveDraft(draft)
    track('Account Invite Click', { place: 'fiche-garde' })
    router.push(signedIn ? RESUME_PATH : signupHref('fiche-garde', RESUME_PATH))
  }

  return (
    <SheetForm
      key={initial ? 'draft' : 'empty'}
      initial={initial ?? EMPTY_DRAFT}
      today={today}
      submitLabel={signedIn ? 'Créer la fiche' : 'Obtenir le lien et le PDF'}
      onSubmit={onSubmit}
      onFirstChange={() => track('Sitter Sheet Started', { place: 'outil' })}
      onChange={saveDraft}
      footer={
        signedIn ? null : (
          <p className="m-0 text-sm leading-relaxed text-ink-2">
            Le lien et le PDF demandent un compte gratuit. Ta saisie reste sur cet appareil en attendant : rien ne nous est envoyé avant
            l&apos;inscription. Ouvre le lien de confirmation sur ce même appareil pour la retrouver.
          </p>
        )
      }
    />
  )
}
