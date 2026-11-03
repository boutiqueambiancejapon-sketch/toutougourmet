import Link from 'next/link'

// @cdc fiche de garde — lien expiré, supprimé ou mal copié.
export default function SitterNotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-3 px-4 py-12">
      <h1 className="m-0 font-display text-3xl font-black leading-tight text-ink">Cette fiche n&apos;est plus disponible</h1>
      <p className="m-0 text-base leading-relaxed text-ink-2">
        Le lien a expiré après le retour du propriétaire, ou la fiche a été supprimée. Demande-lui un nouveau lien.
      </p>
      <Link href="/" className="font-semibold text-orange-ink underline underline-offset-2">
        toutou-gourmet.com
      </Link>
    </main>
  )
}
