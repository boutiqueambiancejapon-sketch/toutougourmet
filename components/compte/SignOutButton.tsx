import { signOutAction } from '@/app/(fr)/compte/actions'

// @cdc lot 4 — déconnexion par action serveur : fonctionne sans JavaScript.
export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="min-h-11 text-[15px] font-semibold text-ink underline underline-offset-2">
        Se déconnecter
      </button>
    </form>
  )
}
