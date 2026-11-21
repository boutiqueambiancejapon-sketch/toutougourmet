import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { filterQuery, parseFilters, type Filters, type RawParams } from '../filters'

// @cdc tableau de bord SEO — ouverture d'une page : accès revérifié (le proxy peut sauter, voir guard.ts), filtres
// lus dans l'adresse.

export interface SeoPageProps {
  searchParams: Promise<RawParams>
}

export interface Opened {
  filters: Filters
  params: RawParams
  /** « ?periode=… » à recopier dans les liens de la page. */
  query: string
}

export async function openSeoPage(props: SeoPageProps): Promise<Opened> {
  if (!(await dashboardAllowed())) notFound()
  const params = await props.searchParams
  const filters = parseFilters(params)
  return { filters, params, query: filterQuery(filters) }
}

export const param = (params: RawParams, key: string): string => {
  const v = params[key]
  return (Array.isArray(v) ? v[0] : v) ?? ''
}
