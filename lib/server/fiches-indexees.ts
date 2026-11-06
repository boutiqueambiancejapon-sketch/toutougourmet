import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { foodAnalysis, ficheIndex } from '@/db/schema'
import type { FicheIndexee } from '@/lib/scanner/fiches-indexees'
import { getDb } from '@/lib/server/drizzle'

// @cdc seo — lecture de la table app.fiche_index, une fois par rendu. Sans base : aucune fiche indexée.

export const fichesIndexees = cache(async (): Promise<FicheIndexee[]> => {
  const d = getDb()
  if (!d) return []
  try {
    return await d
      .select({ court: ficheIndex.court, slug: foodAnalysis.slug, cle: ficheIndex.cle, nom: ficheIndex.nom, type: ficheIndex.type, actif: ficheIndex.actif })
      .from(ficheIndex)
      .innerJoin(foodAnalysis, eq(foodAnalysis.id, ficheIndex.foodAnalysisId))
  } catch (err) {
    console.error('[fiches indexées] lecture impossible', err instanceof Error ? err.message : err)
    return []
  }
})
