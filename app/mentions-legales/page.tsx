import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de Toutou Gourmet.',
  robots: { index: false },
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[720px] mx-auto">
        <h1 className="page-title mb-8">
          Mentions légales
        </h1>
        <div className="flex flex-col gap-8 text-[var(--text-secondary)]">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Éditeur du site
            </h2>
            <p>Le site toutougourmet.fr est édité par :</p>
            <p className="mt-2">
              <strong className="text-[var(--text-primary)]">Toutou Gourmet</strong><br />
              Adresse : France<br />
              Email : contact@toutougourmet.fr<br />
              SIRET : [À compléter]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Hébergement
            </h2>
            <p>
              Le site est hébergé par :<br />
              <strong className="text-[var(--text-primary)]">Vercel Inc.</strong><br />
              340 Pine Street, Suite 701, San Francisco, CA 94104, USA
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, graphismes) est protégé par le droit
              d&apos;auteur. Toute reproduction, même partielle, est interdite sans autorisation écrite
              préalable de l&apos;éditeur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Liens affiliés
            </h2>
            <p>
              Certains liens présents sur ce site sont des liens d&apos;affiliation. Lorsque tu achètes
              via ces liens, nous percevons une commission de la marque concernée, sans surcoût pour
              toi. Ces liens sont clairement identifiés avec la mention &quot;Lien affilié&quot;.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Limitation de responsabilité
            </h2>
            <p>
              Les informations publiées sur toutougourmet.fr sont fournies à titre indicatif. Nous
              ne sommes pas des vétérinaires. En cas de problème de santé pour ton animal, consulte
              toujours un professionnel qualifié.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
