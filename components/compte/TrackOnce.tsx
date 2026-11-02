'use client'

import { useEffect } from 'react'
import { track, type AnalyticsEvent } from '@/lib/analytics'

// Envoie un événement de mesure une fois, à l'affichage (ex. « Premium Activated » après
// l'activation, rendue par une action serveur puis une redirection).
export function TrackOnce({ event, props }: { event: AnalyticsEvent; props?: Record<string, string> }) {
  const key = JSON.stringify(props ?? {})
  useEffect(() => {
    track(event, JSON.parse(key) as Record<string, string>)
    // Retire le paramètre de l'adresse : recharger la page ne compte pas l'événement deux fois.
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.hash)
  }, [event, key])
  return null
}
