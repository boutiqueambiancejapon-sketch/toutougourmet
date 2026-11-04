import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FICHE_VUES, LATEST_SHOWN, latestPool, listStats, lowFiches, parseVue, topFiches, type FicheVue } from '@/lib/scanner/fiche-lists'
import type { ProductKind } from '@/lib/scanner/score'
import { listFiches } from '@/lib/server/scanner-lists'
import { FicheRows } from './FicheRows'

// @cdc scanner — page de consultation (croquettes et pâtées, ou friandises) : hors Google, sans
// bouton de scan. Trois onglets par adresse, servis par le serveur, statistiques de vrais comptes.

export interface Category {
  kind: ProductKind
  path: string
  title: string
  method: string
}

const NOTES: Record<FicheVue, string> = {
  dernieres: "Analyse automatique de l'étiquette : une erreur de lecture reste possible. « Scanné » veut dire qu'une personne a scanné ce produit sur le site.",
  top: "Classement par note de composition, en analyse automatique. Il ne dit rien du goût de ton chien, ni de ce qu'il tolère. Trois fiches au plus par marque, marques vues en France d'abord.",
  moins: "Notes sous 55, selon la composition affichée et en analyse automatique. Une recette peut changer : compare avec ton paquet. Trois fiches au plus par marque, marques vues en France d'abord.",
}

const EMPTY: Record<FicheVue, string> = {
  dernieres: 'Aucune fiche pour le moment.',
  top: "Aucune fiche n'a encore passé le contrôle pour ce classement.",
  moins: 'Aucune fiche contrôlée sous 55 pour le moment.',
}

function Tabs({ path, current }: { path: string; current: FicheVue }) {
  return (
    <nav aria-label="Listes de fiches" className="grid grid-cols-[auto_auto_auto] gap-0.5 rounded-control bg-cream-2 p-1">
      {FICHE_VUES.map((t) => (
        <Link
          key={t.vue}
          href={`${path}${t.query}`}
          aria-current={t.vue === current ? 'page' : undefined}
          className={`flex min-h-11 items-center justify-center whitespace-nowrap rounded-box px-1.5 text-[13px] font-semibold no-underline sm:text-sm ${t.vue === current ? 'bg-paper text-ink' : 'text-ink-2'}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  )
}

function Stats({ count, average }: { count: number; average: number | null }) {
  return (
    <dl className="m-0 grid grid-cols-2 gap-2">
      <div className="flex flex-col-reverse rounded-box border border-line bg-paper px-3 py-2">
        <dt className="text-[13px] text-ink-2">{count > 1 ? 'produits notés' : 'produit noté'}</dt>
        <dd className="m-0 font-display text-xl font-black tabular-nums text-ink">{count}</dd>
      </div>
      <div className="flex flex-col-reverse rounded-box border border-line bg-paper px-3 py-2">
        <dt className="text-[13px] text-ink-2">note moyenne</dt>
        <dd className="m-0 font-display text-xl font-black tabular-nums text-ink">{average}</dd>
      </div>
    </dl>
  )
}

export async function CategoryView({ category, vueParam }: { category: Category; vueParam: string | string[] | undefined }) {
  const vue = parseVue(vueParam)
  const all = await listFiches()
  const pool = latestPool(all, category.kind)
  const stats = listStats(pool)
  const items = vue === 'top' ? topFiches(all, category.kind) : vue === 'moins' ? lowFiches(all, category.kind) : pool.slice(0, LATEST_SHOWN)
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-4 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <BreadcrumbNav items={[{ label: 'Scanner', href: '/scanner' }, { label: category.title }]} />
      <h1 className="m-0 font-display text-[clamp(1.75rem,5vw,2.5rem)] font-black leading-[1.05] tracking-tight text-ink">{category.title}</h1>
      {vue === 'dernieres' && stats.count > 0 ? <Stats count={stats.count} average={stats.average} /> : null}
      <Tabs path={category.path} current={vue} />
      {items.length > 0 ? <FicheRows items={items} ranked={vue !== 'dernieres'} /> : <p className="m-0 rounded-box bg-cream-2 p-4 text-[15px] leading-relaxed text-ink-2">{EMPTY[vue]}</p>}
      <p className="m-0 text-sm leading-relaxed text-ink-2">{NOTES[vue]}</p>
      <p className="m-0 flex flex-wrap gap-x-4 text-sm">
        <Link href={category.method} className="inline-flex min-h-11 items-center text-ink-2 underline underline-offset-2">
          Comment la note est calculée
        </Link>
        <Link href="/scanner" className="inline-flex min-h-11 items-center text-ink-2 underline underline-offset-2">
          Revenir au scanner
        </Link>
      </p>
    </div>
  )
}
