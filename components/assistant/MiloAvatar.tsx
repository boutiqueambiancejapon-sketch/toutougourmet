import Image from 'next/image'

// @cdc assistant — portrait de Milo, le Shiba de Toutou Gourmet (photo du site recadrée, public/images/milo).

export function MiloAvatar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/milo/milo-avatar.webp"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full border-2 border-ink bg-cream-2 object-cover ${className}`}
    />
  )
}
