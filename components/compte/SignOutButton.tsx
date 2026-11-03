import { signOutAction } from '@/app/(fr)/compte/actions'
import { IconLogout } from '@/components/icons'
import { btnOutline } from './espace/ui'

// @cdc lot 4 — déconnexion par action serveur : fonctionne sans JavaScript.
export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className={btnOutline}>
        <IconLogout className="size-5" />
        Se déconnecter
      </button>
    </form>
  )
}
