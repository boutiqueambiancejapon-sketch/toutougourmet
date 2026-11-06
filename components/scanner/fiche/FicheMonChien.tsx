'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useInviteTracking, useSignedIn } from '@/components/cro/useSignupInvite'
import { loadProfile } from '@/components/outils/useAccountPrefill'
import { verifierPourChien, type ChienProfil, type ProduitProfil, type Statut } from '@/lib/scanner/compatibilite'
import { signupHref } from '@/lib/signup-places'

// @cdc profil chien — « Vérifier pour mon chien » sur une fiche. La note générale reste publique ; la réponse pour le chien
// du lecteur demande un compte, car elle lit son profil. Aucune requête pour un visiteur sans compte.

const CARTE = 'flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-4'
const BOUTON = 'inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-control bg-ink px-5 font-semibold text-cream no-underline hover:underline sm:self-start'
const TITRE = 'm-0 font-display text-xl font-black text-ink'
const TEXTE = 'm-0 text-[15px] leading-relaxed text-ink-2'
const STATUT: Record<Statut, { label: string; classe: string }> = {
  convient: { label: 'Convient', classe: 'bg-green-bg text-green-ink' },
  verifier: { label: 'À vérifier', classe: 'bg-amber-bg text-amber-ink' },
  eviter: { label: 'À éviter', classe: 'bg-rose-bg text-rose-ink' },
}

function Visiteur() {
  const retour = usePathname()
  const { ref, onClick } = useInviteTracking<HTMLElement>('fiche-chien')
  return (
    <section ref={ref} aria-labelledby="mon-chien" className={CARTE}>
      <h2 id="mon-chien" className={TITRE}>Ce produit convient-il à ton chien&nbsp;?</h2>
      <p className={TEXTE}>Crée ton compte gratuit et renseigne ton chien : on compare ce produit à son âge, son poids, son activité et ses allergies.</p>
      <Link href={signupHref('fiche-chien', retour)} onClick={onClick} className={BOUTON}>Vérifier pour mon chien</Link>
    </section>
  )
}

export function FicheMonChien({ produit }: { produit: ProduitProfil }) {
  const connecte = useSignedIn()
  const [chiens, setChiens] = useState<ChienProfil[] | null>(null)
  const [choisi, setChoisi] = useState(0)

  useEffect(() => {
    if (!connecte) return
    let alive = true
    void loadProfile().then((p) => {
      if (alive) setChiens(p?.chiens ?? [])
    })
    return () => {
      alive = false
    }
  }, [connecte])

  if (!connecte) return <Visiteur />
  if (chiens === null) return null
  if (chiens.length === 0) {
    return (
      <section aria-labelledby="mon-chien" className={CARTE}>
        <h2 id="mon-chien" className={TITRE}>Ce produit convient-il à ton chien&nbsp;?</h2>
        <p className={TEXTE}>Renseigne ton chien, puis reviens sur cette page pour voir la réponse.</p>
        <Link href="/compte/chien/nouveau" className={BOUTON}>Ajouter mon chien</Link>
      </section>
    )
  }
  const chien = chiens[Math.min(choisi, chiens.length - 1)]
  const v = verifierPourChien(produit, chien)
  return (
    <section aria-labelledby="mon-chien" className={CARTE}>
      <h2 id="mon-chien" className={TITRE}>{`Pour ${chien.name}`}</h2>
      {chiens.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {chiens.map((c, i) => (
            <button key={c.id} type="button" onClick={() => setChoisi(i)} aria-pressed={c.id === chien.id} className={`min-h-11 whitespace-nowrap rounded-pill border border-line px-3 text-sm font-semibold ${c.id === chien.id ? 'bg-ink text-cream' : 'bg-paper text-ink'}`}>{c.name}</button>
          ))}
        </div>
      ) : null}
      <p className="m-0"><span className={`inline-block rounded-pill px-3 py-1 text-sm font-bold ${STATUT[v.statut].classe}`}>{STATUT[v.statut].label}</span></p>
      {v.raisons.length ? (
        <ul className="m-0 flex flex-col gap-1 pl-5 text-[15px] leading-relaxed text-ink-2">{v.raisons.map((r) => <li key={r}>{r}</li>)}</ul>
      ) : (
        <p className={TEXTE}>{`Rien sur l'étiquette ne pose problème avec le profil de ${chien.name}.`}</p>
      )}
      {v.manque.length ? <p className={TEXTE}>{`Ajoute ${v.manque.join(' et ')} à son profil pour une réponse plus précise.`} <Link href={`/compte/chien/${chien.id}`} className="font-semibold text-orange-ink underline underline-offset-2">Compléter</Link></p> : null}
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        On compare l&apos;étiquette à son profil : ce n&apos;est pas un conseil de vétérinaire. S&apos;il est malade, demande-lui d&apos;abord.{' '}
        <Link href="/outils/ration" className="font-semibold text-orange-ink underline underline-offset-2">Calculer sa ration</Link>
      </p>
    </section>
  )
}
