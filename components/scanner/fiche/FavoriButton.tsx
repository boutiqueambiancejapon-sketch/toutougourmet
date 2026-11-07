'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useInviteTracking, useSignedIn } from '@/components/cro/useSignupInvite'
import { track } from '@/lib/analytics'
import { signupHref } from '@/lib/signup-places'

// @cdc compte — « Ajouter à mes aliments ». Sans compte : l'invitation dit ce qu'on gagne à s'inscrire.

const CLASSE = 'inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-control border-2 border-ink bg-paper px-4 text-[15px] font-semibold text-ink no-underline hover:underline'

let liste: Promise<string[]> | null = null
const charger = () => (liste ??= fetch('/api/compte/aliments', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { slugs: [] })).then((b: { slugs: string[] }) => b.slugs).catch(() => []))

export function FavoriButton({ slug }: { slug: string }) {
  const connecte = useSignedIn()
  const retour = usePathname()
  const { ref, onClick } = useInviteTracking<HTMLAnchorElement>('fiche-favori', !connecte)
  const [garde, setGarde] = useState<boolean | null>(null)

  useEffect(() => {
    if (!connecte) return
    let vivant = true
    void charger().then((s) => vivant && setGarde(s.includes(slug)))
    return () => {
      vivant = false
    }
  }, [connecte, slug])

  if (!connecte) {
    return <Link ref={ref} href={signupHref('fiche-favori', retour)} onClick={onClick} className={CLASSE}>Enregistrer cet aliment</Link>
  }
  if (garde === null) return null
  async function basculer() {
    const voulu = !garde
    setGarde(voulu)
    const res = await fetch('/api/compte/aliments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, garder: voulu }) })
    if (!res.ok) setGarde(!voulu)
    else if (voulu) track('Food Saved', {})
    liste = null
  }
  return (
    <button type="button" onClick={() => void basculer()} aria-pressed={garde} className={CLASSE}>
      {garde ? 'Dans mes aliments ✓' : 'Ajouter à mes aliments'}
    </button>
  )
}
