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
  /**
   * Fill mode — the illustration takes 100% width and 100% height of its
   * parent, ignoring the slot aspect-ratio. Parent must be positioned.
   */
  fill?: boolean
  /** Custom `sizes` attribute for next/image; falls back to a sensible default. */
  sizes?: string
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

const DEFAULT_SIZES = '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw'

/** Expected public path for a slot — `/images/{group}/{id}.webp` */
function expectedSrc(slot: ImageSlot): string {
  return `/images/${slot.group}/${slot.id}.webp`
}

export function Illustration({
  slot: slotId,
  alt,
  priority = false,
  fill = false,
  sizes = DEFAULT_SIZES,
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
  const hasRealImage = slot.imageReady === true
  const variant = GROUP_TO_VARIANT[slot.group]

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[var(--bg-surface-2)]',
        fill ? 'w-full h-full' : '',
        className
      )}
      style={fill ? undefined : { aspectRatio: `${w} / ${h}` }}
      data-slot={slot.id}
      data-has-image={hasRealImage ? 'true' : 'false'}
    >
      {hasRealImage ? (
        fill ? (
          <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={w}
            height={h}
            priority={priority}
            sizes={sizes}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      ) : (
        <IllustratedPlaceholder variant={variant} tone={slot.tone} />
      )}
      <DecorativeOverlay
        tone={slot.tone}
        decorations={slot.decorations}
        hasImage={hasRealImage}
        intensity={hasRealImage ? overlayIntensity : 'normal'}
      />
    </div>
  )
}
