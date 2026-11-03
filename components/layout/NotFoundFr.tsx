import Link from 'next/link'

export function NotFoundFr() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 text-center bg-[var(--bg-primary)]">
      <h1
        className="text-3xl md:text-4xl font-black mb-3"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        Aïe, cette page est partie se balader.
      </h1>
      <p className="text-[var(--text-secondary)] mb-8 max-w-md">
        L&apos;adresse a peut-être changé ou contient une faute de frappe. L&apos;accueil et le test
        mènent aux guides, aux outils et aux marques.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary">
          Retour à l&apos;accueil →
        </Link>
        <Link href="/quiz" className="btn-outline">
          Faire le test →
        </Link>
      </div>
    </div>
  )
}
