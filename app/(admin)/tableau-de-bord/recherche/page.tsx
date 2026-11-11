import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { parsePeriod } from '@/lib/dashboard/period'
import { getRecherche } from '@/lib/server/dashboard-recherche'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { TableGsc } from '@/components/dashboard/recherche/RechercheTables'
import { NouvellesPages } from '@/components/dashboard/recherche/NouvellesPages'
import { getNouvellesPages } from '@/lib/server/dashboard-nouvelles-pages'

// @cdc tableau de bord — Recherche Google (Search Console), sous-page de l'onglet Contenu. Jamais indexée.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Recherche Google — Tableau de bord' },
  robots: { index: false, follow: false, nocache: true },
}

const nf = new Intl.NumberFormat('fr-FR')
const date = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

function Tuile({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <div className="rounded-card border border-line bg-paper p-3">
      <dt className="text-sm font-semibold text-ink-2">{libelle}</dt>
      <dd className="m-0 mt-1 font-display text-3xl font-black tabular-nums text-ink">{valeur}</dd>
    </div>
  )
}

export default async function RecherchePage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  if (!(await dashboardAllowed())) notFound()
  const sp = await searchParams
  const [r, nouvelles] = await Promise.all([getRecherche(typeof sp.q === 'string' ? sp.q.slice(0, 100) : ''), getNouvellesPages()])
  return (
    <DashboardShell
      period={parsePeriod(undefined).key}
      current="contenu"
      title="Recherche Google"
      intro={`Ce que les gens tapent dans Google avant d’arriver sur le site, du ${date(r.debut)} au ${date(r.fin)} (Google publie avec deux jours de retard).`}
      notice={r.ok ? null : 'La Search Console n’a pas répondu. Les chiffres reviendront au prochain chargement.'}
    >
      <p className="m-0 mt-3 text-sm"><Link href="/tableau-de-bord/contenu" className="text-ink-2 underline underline-offset-2">Retour à l’onglet Contenu</Link></p>
      <form method="get" role="search" className="mt-4 flex gap-2">
        <label className="flex grow">
          <span className="sr-only">Mot-clé ou adresse</span>
          <input name="q" defaultValue={r.q} placeholder="Mot-clé ou bout d’adresse : chocolat, /codes-promo…" className="min-h-11 w-full rounded-box border border-line bg-paper px-3 text-base text-ink" />
        </label>
        <button type="submit" className="min-h-11 shrink-0 whitespace-nowrap rounded-control bg-ink px-4 font-semibold text-cream">Chercher</button>
        {r.q ? <Link href="/tableau-de-bord/recherche" className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-ink-2 underline underline-offset-2">Effacer</Link> : null}
      </form>
      <dl className="m-0 mt-4 grid grid-cols-3 gap-3">
        <Tuile valeur={nf.format(r.clics)} libelle="Clics depuis Google" />
        <Tuile valeur={nf.format(r.impressions)} libelle="Affichages dans Google" />
        <Tuile valeur={r.position === null ? '?' : r.position.toFixed(1).replace('.', ',')} libelle="Position moyenne" />
      </dl>
      <div className="mt-4 flex flex-col gap-4">
        {r.q ? <TableGsc titre={`Recherches Google qui contiennent « ${r.q} »`} intro="Chaque recherche avec la page du site que Google montre, triées par affichages (100 au plus). Les tableaux suivants sont filtrés aussi." lignes={r.resultats} /> : null}
        {r.q ? null : <NouvellesPages pages={nouvelles.pages} />}
        <TableGsc titre="Questions longues (assistants d’IA)" intro="Recherches de 8 mots ou plus, souvent tapées par ChatGPT ou le mode IA de Google pour préparer une réponse : le profil exact du chien et la page que Google montre. Une page générale qui répond à une question précise est une idée d’article ou de section." lignes={r.longues} />
        <TableGsc titre="Presque en première page" intro="Position 8 à 20, déjà vues au moins 20 fois : un article renforcé ou mieux relié peut les faire monter. Les meilleures occasions." lignes={r.presque} />
        <TableGsc titre="Bien placées mais peu cliquées" intro="En première page, plus de 50 affichages, moins de 2 % de clics : le titre ou la description donne peu envie." lignes={r.peuCliquees} />
        <TableGsc titre="Recherches qui amènent le plus de clics" lignes={r.requetes} />
        <TableGsc titre="Pages qui reçoivent le plus de clics" lignes={r.pages} page />
      </div>
    </DashboardShell>
  )
}
