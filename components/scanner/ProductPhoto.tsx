import Image from 'next/image'

// @cdc scanner — photo du produit dans un rond, quand le fichier Maxi Zoo en donne une. Décorative :
// le nom du produit est toujours écrit à côté. Rien si l'image manque.

export function ProductPhoto({ src, size = 'sm' }: { src?: string | null; size?: 'sm' | 'lg' }) {
  if (!src) return null
  const px = size === 'lg' ? 80 : 44
  return (
    <Image
      src={src}
      alt=""
      width={px}
      height={px}
      sizes={`${px}px`}
      className={`shrink-0 rounded-full border border-line bg-paper object-contain p-0.5 ${size === 'lg' ? 'size-20' : 'size-11'}`}
    />
  )
}
