import type { Metadata } from 'next'
import Link from 'next/link'
import { verifyUnsubscribeToken } from '@/lib/emails/unsubscribe'
import { unsubscribe } from './actions'

// @cdc e-mails — page de désinscription de la lettre, ouverte depuis le lien signé des e-mails.
// Le retrait se fait au clic sur le bouton (formulaire POST), pas à l'ouverture du lien : les
// antivirus de messagerie ouvrent les liens des e-mails et désinscriraient les lecteurs à leur insu.
// Jamais indexée, absente du sitemap.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Désinscription de la lettre',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
}

interface PageProps {
  searchParams: Promise<{ e?: string | string[]; t?: string | string[]; etat?: string | string[] }>
}

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const email = one(sp.e)
  const token = one(sp.t)
  const state = one(sp.etat)
  const valid = verifyUnsubscribeToken(email, token, process.env.NEWSLETTER_SECRET ?? '')

  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-12">
      <h1 className="page-title mb-4">Désinscription de la lettre</h1>
      {!valid && (
        <p className="text-ink-2">
          Ce lien de désinscription n&apos;est pas valide ou a été coupé par ta messagerie. Pour te désinscrire, utilise le lien en bas
          d&apos;un e-mail plus récent, ou écris-nous via le{' '}
          <Link href="/contact" className="underline underline-offset-2">
            formulaire de contact
          </Link>
          .
        </p>
      )}
      {valid && state === 'fait' && (
        <p role="status" className="rounded-box border border-line bg-green-bg px-4 py-3 text-green-ink">
          C&apos;est fait : {email} ne recevra plus la lettre ni les rappels de Toutou Gourmet.
        </p>
      )}
      {valid && state === 'erreur' && (
        <p role="alert" className="mb-6 rounded-box border border-line bg-rose-bg px-4 py-3 text-rose-ink">
          La désinscription n&apos;a pas abouti. Réessaie dans quelques minutes, ou écris-nous via le formulaire de contact.
        </p>
      )}
      {valid && state !== 'fait' && (
        <form action={unsubscribe} className="flex flex-col items-start gap-4">
          <p className="text-ink-2">
            L&apos;adresse {email} ne recevra plus la lettre mensuelle, les offres partenaires ni les rappels. Si tu as un compte, les e-mails de
            connexion et de mot de passe continuent.
          </p>
          <input type="hidden" name="e" value={email} />
          <input type="hidden" name="t" value={token} />
          <button type="submit" className="min-h-12 rounded-control bg-orange px-5 font-semibold text-ink hover:underline">
            Me désinscrire
          </button>
        </form>
      )}
    </div>
  )
}
