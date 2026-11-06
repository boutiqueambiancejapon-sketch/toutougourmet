import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FicheIndexList } from '@/components/dashboard/review/FicheIndexList'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { filtrerLignes, lignesIndex, TYPE_LABEL, type TypeFiche } from '@/lib/server/dashboard-fiche-index'
import { getDb } from '@/lib/server/drizzle'

// @cdc tableau de bord — toutes les fiches du scanner, indexées ou non, filtrables par marque, type et état. Privée.

export const dynamic = 'force-dynamic'

const PAR_PAGE = 50
const CHAMP = 'min-h-11 rounded-box border border-line bg-paper px-3 text-sm text-ink'

type Props = { searchParams: Promise<Record<string, string | undefined>> }

export default async function FichesPage({ searchParams }: Props) {
  if (!(await dashboardAllowed()) || !getDb()) notFound()
  const f = await searchParams
  const toutes = await lignesIndex()
  const lignes = filtrerLignes(toutes, f)
  const page = Math.max(1, Number(f.page) || 1)
  const pages = Math.max(1, Math.ceil(lignes.length / PAR_PAGE))
  const marques = [...new Set(toutes.map((l) => l.marque))].sort((a, b) => a.localeCompare(b, 'fr'))
  const lien = (p: number) => `/tableau-de-bord/fiches?${new URLSearchParams(Object.entries({ ...f, page: String(p) }).filter((e): e is [string, string] => Boolean(e[1]))).toString()}`
  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-4 px-4 pb-16 md:px-8">
      <p className="m-0 pt-6 text-sm"><Link href="/tableau-de-bord/contenu" className="text-ink-2 underline underline-offset-2">Retour au contenu</Link></p>
      <header className="flex flex-col gap-1">
        <h1 className="m-0 font-display text-3xl font-black text-ink">Fiches produit et Google</h1>
        <p className="m-0 text-sm text-ink-2">{`${toutes.filter((l) => l.indexee).length} indexées sur ${toutes.length} recettes. Une recette regroupe tous ses formats. Le changement arrive tout de suite sur le site, puis Google met quelques jours.`}</p>
      </header>
      <form method="get" className="grid gap-2 sm:grid-cols-5">
        <select name="marque" defaultValue={f.marque ?? ''} aria-label="Marque" className={CHAMP}>
          <option value="">Toutes les marques</option>
          {marques.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select name="type" defaultValue={f.type ?? ''} aria-label="Type de produit" className={CHAMP}>
          <option value="">Tous les types</option>
          {(Object.keys(TYPE_LABEL) as TypeFiche[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
        <select name="statut" defaultValue={f.statut ?? ''} aria-label="État pour Google" className={CHAMP}>
          <option value="">Indexées et noindex</option>
          <option value="indexee">Indexées</option>
          <option value="noindex">Noindex</option>
        </select>
        <input type="search" name="q" defaultValue={f.q ?? ''} placeholder="Chercher un produit" aria-label="Chercher un produit" className={CHAMP} />
        <button type="submit" className="min-h-11 whitespace-nowrap rounded-box bg-ink px-3 text-sm font-semibold text-paper">Filtrer</button>
      </form>
      <p className="m-0 text-sm text-ink-2">{`${lignes.length} résultat${lignes.length > 1 ? 's' : ''}`}</p>
      <FicheIndexList lignes={lignes.slice((page - 1) * PAR_PAGE, page * PAR_PAGE)} />
      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-between text-sm">
          {page > 1 ? <Link href={lien(page - 1)} className="py-2 font-semibold text-ink underline underline-offset-2">Précédente</Link> : <span />}
          <span className="text-ink-2">{`Page ${page} sur ${pages}`}</span>
          {page < pages ? <Link href={lien(page + 1)} className="py-2 font-semibold text-ink underline underline-offset-2">Suivante</Link> : <span />}
        </nav>
      ) : null}
    </main>
  )
}
