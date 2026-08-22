'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_MEASUREMENT_ID = 'G-MDHMHXVJRZ'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

// Le site navigue en client-side (Next.js <Link>), donc gtag('config', ...)
// n'envoie automatiquement un page_view qu'au tout premier chargement complet
// d'une page. Sans ce composant, toute page visitee ensuite via la nav
// interne (menu, cartes, liens du blog...) n'est jamais remontee a GA4 —
// seule la home (ou la page d'entree) apparaissait dans les rapports.
// On envoie donc un evenement page_view manuel a chaque changement de
// pathname ou de query string. Le page_view automatique est desactive
// cote layout (send_page_view: false) pour ne pas compter deux fois la
// toute premiere page.
function GoogleAnalyticsPageViewInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname || typeof window.gtag !== 'function') return

    const query = searchParams?.toString()
    const url = query ? `${pathname}?${query}` : pathname

    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    })
  }, [pathname, searchParams])

  return null
}

export default function GoogleAnalyticsPageView() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsPageViewInner />
    </Suspense>
  )
}
