import { existsSync } from 'node:fs'
import { join } from 'node:path'
import Image from 'next/image'
import {
  getSlotById,
  RATIO_DIMENSIONS,
  type ImageGroup,
  type ImageSlot,
} from '@/data/images-manifest'
import { DecorativeOverlay } from './DecorativeOverlay'
import { IllustratedPlaceholder, type PlaceholderVariant } from './IllustratedPlaceholder'
import { cn } from '@/lib/utils'

interface IllustrationProps {
  /** Slot id declared in data/images-manifest.ts */
  slot: string
  /** Image alt text (required for a11y) */
  alt: string
  /** Set true on the single above-the-fold LCP image per page */
  priority?: boolean
  /** Constrain max rendered height (ex. hero banners). Falls back to slot ratio. */
  className?: string
  /** Override overlay intensity when placing over busy hero photos */
  overlayIntensity?: 'soft' | 'normal'
}

const GROUP_TO_VARIANT: Record<ImageGroup, PlaceholderVariant> = {
  hero: 'landscape',
  brands: 'food',
  breeds: 'dog',
  articles: 'editorial',
  social: 'landscape',
}

/** Build the expected public path for a slot — `/images/{group}/{id}.webp` */
function expectedSrc(slot: ImageSlot): string {
  return `/images/${slot.group}/${slot.id}.webp`
}

/** Check at server-render time if the image file exists in /public */
function imageExists(src: string): boolean {
  try {
    return existsSync(join(process.cwd(), 'public', src))
  } catch {
    return false
  }
}

export function Illustration({
  slot: slotId,
  alt,
  priority = false,
  className,
  overlayIntensity = 'normal',
}: IllustrationProps) {
  const slot = getSlotById(slotId)
  if (!slot) {
    throw new Error(
      `Illustration: unknown slot "${slotId}". Declare it in data/images-manifest.ts.`
    )
  }

  const { w, h } = RATIO_DIMENSIONS[slot.ratio]
  const src = expectedSrc(slot)
  const hasRealImage = imageExists(src)
  const variant = GROUP_TO_VARIANT[slot.group]

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-[var(--bg-surface-2)]',
        className
      )}
      style={{ aspectRatio: `${w} / ${h}` }}
      data-slot={slot.id}
      data-has-image={hasRealImage ? 'true' : 'false'}
    >
      {hasRealImage ? (
        <Image
          src={src}
          alt={alt}
          width={w}
          height={h}
          priority={priority}
          sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <IllustratedPlaceholder variant={variant} tone={slot.tone} />
      )}
      <DecorativeOverlay
        tone={slot.tone}
        decorations={slot.decorations}
        intensity={hasRealImage ? overlayIntensity : 'normal'}
      />
    </div>
  )
}
