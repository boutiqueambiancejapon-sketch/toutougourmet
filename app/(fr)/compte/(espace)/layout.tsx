import { AccountShell } from '@/components/compte/espace/AccountShell'
import { getSessionUser } from '@/lib/server/auth'
import { getMembership } from '@/lib/server/membership'

// @cdc compte — gabarit des pages connectées de /compte (groupe sans effet sur les adresses).
// Sans session, chaque page renvoie elle-même vers la connexion avec son ?retour= : le gabarit
// se contente alors de rendre la page.
export default async function AccountSpaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) return children
  const membership = await getMembership(user.id)
  return (
    <AccountShell name={user.name} email={user.email} premium={membership?.plan === 'premium'}>
      {children}
    </AccountShell>
  )
}
