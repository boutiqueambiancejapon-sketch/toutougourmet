import type { Metadata } from 'next'
import Link from 'next/link'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { MonChienDemo } from '@/components/compte/MonChienDemo'
import { IconBowl, IconCheck, IconDog, IconHeart, IconScale, IconScan } from '@/components/icons'
import { FREE_MONTHLY_SCANS } from '@/lib/scanner/config'
import { signupHref } from '@/lib/signup-places'

// @cdc compte — page qui présente l'espace gratuit (plan du 2026-11-07). Statique, sans session : le bouton mène à
// l'inscription, qui renvoie vers l'ajout du chien.

export const metadata: Metadata = {
  title: { absolute: 'Mon chien : son alimentation au même endroit | Toutou Gourmet' },
  description: 'Crée le profil de ton chien : ses aliments notés, sa ration, sa courbe de poids et, sur chaque fiche, si le produit lui convient. Gratuit.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/mon-chien' },
}

const INSCRIPTION = signupHref('page-mon-chien', '/compte/chien/nouveau')
const BOUTON = 'inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-control bg-orange px-6 font-semibold text-ink no-underline shadow-[4px_4px_0_var(--ink)] hover:underline'

const ATOUTS = [
  { Icon: IconDog, titre: 'Son profil', texte: 'Race, âge, poids, activité, stérilisation et allergies. Les outils du site se remplissent tout seuls.' },
  { Icon: IconCheck, titre: 'Vérifier pour lui', texte: 'Sur chaque fiche produit, une réponse pour ton chien : convient, à vérifier ou à éviter, avec les raisons.' },
  { Icon: IconBowl, titre: 'Ses aliments', texte: 'Garde ses croquettes, pâtées et friandises avec leur note, pour les retrouver et les comparer.' },
  { Icon: IconScale, titre: 'Son poids', texte: 'Chaque pesée rejoint sa courbe, à côté de la fourchette de sa race, et sa ration suit.' },
  { Icon: IconScan, titre: 'Ses scans', texte: `L'historique de tes analyses, et ${FREE_MONTHLY_SCANS} analyses d'étiquette par photo chaque mois.` },
  { Icon: IconHeart, titre: 'Sa fiche de garde', texte: 'Repas, habitudes et numéros utiles sur une page à laisser au pet sitter.' },
]

export default function MonChienPage() {
  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-12 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h1 className="m-0 font-display text-[clamp(2rem,5vw,3rem)] font-black leading-[1.05] tracking-tight text-ink">Toute l&apos;alimentation de ton chien, au même endroit</h1>
          <p className="m-0 text-lg leading-relaxed text-ink-2">Crée son profil une fois : sa ration, son poids et ses aliments se suivent ici, et chaque fiche produit te dit si elle lui convient.</p>
          <p className="m-0 flex flex-col items-start gap-2">
            <Link href={INSCRIPTION} className={BOUTON}>Créer mon espace gratuit</Link>
            <span className="text-sm text-ink-2">Gratuit, sans engagement. Ton compte s&apos;ouvre tout de suite.</span>
          </p>
        </div>
        <MonChienDemo />
      </section>
      <section aria-labelledby="atouts" className="flex flex-col gap-5">
        <h2 id="atouts" className="m-0 font-display text-3xl font-black text-ink">Que trouves-tu dans ton espace ?</h2>
        <ul role="list" className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {ATOUTS.map(({ Icon, titre, texte }) => (
            <li key={titre} className="flex flex-col gap-2 rounded-card border border-line bg-paper p-4">
              <span aria-hidden="true" className="grid size-10 place-items-center rounded-box bg-amber text-ink"><Icon className="size-5" /></span>
              <p className="m-0 font-display text-lg font-black text-ink">{titre}</p>
              <p className="m-0 text-[15px] leading-relaxed text-ink-2">{texte}</p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="faq" className="flex max-w-prose flex-col">
        <h2 id="faq" className="m-0 font-display text-3xl font-black text-ink">Questions fréquentes sur l&apos;espace Mon chien</h2>
        <FaqList>
          <FaqItem question="Est-ce vraiment gratuit ?">Oui. Le compte, le profil de ton chien, sa courbe de poids et ses aliments sont gratuits, sans carte bancaire.</FaqItem>
          <FaqItem question="Puis-je enregistrer plusieurs chiens ?">Oui, chaque chien a son profil, sa ration et sa courbe de poids.</FaqItem>
          <FaqItem question="Que faites-vous des données de mon chien ?">Elles servent à ses outils et à rien d&apos;autre. Elles ne sont ni vendues, ni utilisées pour de la publicité, et tu peux supprimer ton compte à tout moment depuis tes réglages.</FaqItem>
          <FaqItem question="Est-ce un conseil de vétérinaire ?">Non. On compare les étiquettes au profil de ton chien. Pour un chien malade, un chiot très jeune ou une chienne gestante, demande l&apos;avis de ton vétérinaire.</FaqItem>
        </FaqList>
      </section>
      <section className="flex flex-col items-start gap-3 rounded-card bg-ink p-6 sm:p-8">
        <p className="m-0 font-display text-2xl font-black text-paper sm:text-3xl">Crée l&apos;espace de ton chien</p>
        <p className="m-0 text-base text-cream">Trois champs pour le compte, puis son profil.</p>
        <Link href={INSCRIPTION} className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-control bg-amber px-6 font-semibold text-ink no-underline shadow-[4px_4px_0_var(--orange)] hover:underline">Créer mon espace gratuit</Link>
      </section>
    </div>
  )
}
