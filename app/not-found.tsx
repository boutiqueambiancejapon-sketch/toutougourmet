import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 text-center bg-[var(--bg-primary)]">
      <span className="text-7xl mb-6 block">🐾</span>
      <h1
        className="text-3xl md:text-4xl font-black mb-3"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        Aïe, cette page est partie se balader.
      </h1>
      <p className="text-[var(--text-secondary)] mb-8 max-w-md">
        On ne sait pas trop où elle est allée, mais elle reviendra sûrement avec des croquettes.
        En attendant, reviens par ici 🐾
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary">
          Retour à l&apos;accueil →
        </Link>
        <Link href="/quiz" className="btn-outline">
          Faire le quiz →
        </Link>
      </div>
    </div>
  )
}
