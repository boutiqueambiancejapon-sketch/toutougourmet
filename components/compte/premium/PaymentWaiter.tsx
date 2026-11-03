'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FormNotice } from '../fields'

// @cdc premium — retour du paiement (/compte?premium=merci) avant que le webhook Stripe n'ait
// activé Premium : la page se recharge côté serveur toutes les 3 secondes, 10 fois au plus.
// Ce message ne donne aucun accès : seul le webhook active Premium.

const DELAY_MS = 3000
const MAX_TRIES = 10

export function PaymentWaiter() {
  const router = useRouter()
  const [tries, setTries] = useState(0)
  const done = tries >= MAX_TRIES
  useEffect(() => {
    if (done) return
    const t = window.setTimeout(() => {
      setTries((n) => n + 1)
      router.refresh()
    }, DELAY_MS)
    return () => window.clearTimeout(t)
  }, [tries, done, router])
  return (
    <FormNotice tone="info">
      {done
        ? 'Merci ! Stripe confirme encore le paiement : recharge la page dans une minute. Le reçu arrive par e-mail.'
        : 'Merci ! Paiement reçu, Premium s’active dans quelques secondes…'}
    </FormNotice>
  )
}
