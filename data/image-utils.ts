import { getSlotById, imageSlots, type ImageSlot } from '@/data/images-manifest'
import { getExtraSlotById } from '@/data/extra-image-slots'

/** Build the public path for a slot's image file. */
export function getSlotPath(slot: ImageSlot): string {
  const ext = slot.ext ?? 'webp'
  return `/images/${slot.group}/${slot.id}.${ext}`
}

/** Slot du manifest principal, sinon du registre additionnel (comme <Illustration>). */
export function resolveSlot(id: string): ImageSlot | undefined {
  return getSlotById(id) ?? getExtraSlotById(id)
}

/**
 * Images neutres déjà produites (portraits de chiens de la série « race »), réutilisées pour les
 * articles sans image dédiée, en plus de la cover de leur rubrique : décision du propriétaire
 * (2026-11-01), pas de génération payante pour eux. Les covers des autres rubriques sont exclues
 * (elles illustrent un sujet précis).
 */
const NEUTRAL_POOL: readonly string[] = imageSlots
  .filter((s) => s.imageReady && s.group === 'breeds')
  .map((s) => s.id)

/** Hash FNV-1a d'un slug : même article → même image à chaque build. */
function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Image d'un article sans slot dédié : la cover de sa rubrique ou une image neutre, au hasard mais stable. */
export function fallbackSlotFor(slug: string, categorySlot: string): string {
  const pool = [categorySlot, ...NEUTRAL_POOL.filter((id) => id !== categorySlot)]
  return pool[hash(slug) % pool.length]
}
