import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de Toutou Gourmet.',
  robots: { index: false },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[720px] mx-auto">
        <h1 className="mb-8" style={{ fontFamily: "'Fraunces', serif" }}>
          Politique de confidentialité
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Dernière mise à jour : mars 2026</p>

        <div className="flex flex-col gap-8 text-[var(--text-secondary)]">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Données collectées
            </h2>
            <p className="mb-2">Toutou Gourmet collecte uniquement :</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Ton adresse email (si tu t&apos;inscris à la newsletter) — avec double opt-in obligatoire</li>
              <li>Des données de navigation anonymisées via Plausible Analytics (sans cookie, sans données personnelles)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Analytics — Plausible
            </h2>
            <p>
              Nous utilisons <strong className="text-[var(--text-primary)]">Plausible Analytics</strong>, un outil
              respectueux de la vie privée qui ne dépose aucun cookie et ne collecte aucune donnée
              personnelle identifiable. Conforme RGPD par conception. Pas de consentement requis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Newsletter
            </h2>
            <p>
              Si tu t&apos;inscris à notre newsletter, ton email est uniquement utilisé pour t&apos;envoyer nos
              communications. Il n&apos;est jamais vendu, ni partagé avec des tiers à des fins commerciales.
              Tu peux te désabonner à tout moment en un clic.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Tes droits
            </h2>
            <p>
              Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification et de suppression
              de tes données. Pour exercer ces droits, contacte-nous à :{' '}
              <a href="mailto:contact@toutougourmet.fr" className="text-[var(--accent-1)] underline">
                contact@toutougourmet.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Cookies
            </h2>
            <p>
              Ce site n&apos;utilise pas de cookies de traçage ou publicitaires. Aucun consentement
              cookie n&apos;est requis.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
