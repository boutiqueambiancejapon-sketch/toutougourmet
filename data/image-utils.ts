import { getSlotById, type ImageSlot } from '@/data/images-manifest'
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
