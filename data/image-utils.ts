import type { ImageSlot } from '@/data/images-manifest'

/** Build the public path for a slot's image file. */
export function getSlotPath(slot: ImageSlot): string {
  const ext = slot.ext ?? 'webp'
  return `/images/${slot.group}/${slot.id}.${ext}`
}
