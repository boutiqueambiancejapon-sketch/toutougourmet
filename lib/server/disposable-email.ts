import domains from '@/data/disposable-domains.json'

// @cdc sécurité — adresses jetables refusées à l'inscription (compte et lettre) : elles servent
// aux robots pour confirmer des comptes à la chaîne et vider les scans gratuits. Liste CC0
// mise à jour par scripts/update-disposable-domains.mjs. Les sous-domaines sont couverts.

const BLOCKED: ReadonlySet<string> = new Set(domains as string[])

export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf('@')
  if (at < 0) return false
  const parts = email.slice(at + 1).trim().toLowerCase().replace(/\.$/, '').split('.')
  for (let i = 0; i < parts.length - 1; i++) {
    if (BLOCKED.has(parts.slice(i).join('.'))) return true
  }
  return false
}
