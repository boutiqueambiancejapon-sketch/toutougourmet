import Link from 'next/link'
import type { ComponentProps } from 'react'

// @cdc affiliation — liens écrits en Markdown dans les articles : les liens partenaires
// reçoivent rel="sponsored noopener" et s'ouvrent dans un nouvel onglet ; les liens internes
// passent par next/link. data-cta="article-lien" : emplacement du clic partenaire mesuré
// (components/analytics/Tracking.tsx), sans lui le clic partait sans `place`.
const AFFILIATE = /^https?:\/\/(www\.)?(dogchef\.com|c3po\.link|tidd\.ly|amzn\.to|amazon\.fr)\//i

export function MdxLink({ href = '', children, ...rest }: ComponentProps<'a'>) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    )
  }
  if (AFFILIATE.test(href)) {
    return (
      <a href={href} target="_blank" rel="sponsored noopener" data-cta="article-lien" {...rest}>
        {children}
      </a>
    )
  }
  const external = /^https?:\/\//.test(href)
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener' } : {})} {...rest}>
      {children}
    </a>
  )
}
