import type { Pool } from 'pg'
import type { CsvValue } from '@/lib/dashboard/csv'
import type { Filters, RawParams } from '../filters'
import { GOOGLE_DATASETS } from './datasets-google'
import { OTHER_DATASETS } from './datasets-other'
import { SOURCES_DATASETS } from './datasets-sources'

// @cdc tableau de bord SEO — export CSV : chaque tableau de l'écran a son jeu de données ici, lu par la même
// fonction que l'écran. La route /tableau-de-bord/export/[id] le diffuse ligne par ligne.

export interface Dataset {
  file: string
  header: string[]
  rows: (pool: Pool, f: Filters, params: RawParams) => Promise<CsvValue[][]>
}

export const DATASETS: Record<string, Dataset> = { ...GOOGLE_DATASETS, ...OTHER_DATASETS, ...SOURCES_DATASETS }
