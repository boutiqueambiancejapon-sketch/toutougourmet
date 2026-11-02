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
        <h1 className="page-title mb-8">
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
              <li>Ton prénom, ton adresse email et ton message si tu nous écris par le formulaire de contact</li>
              <li>Des statistiques de visite anonymes, mesurées sur nos propres serveurs (sans cookie)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Mesure d&apos;audience et formulaire de contact
            </h2>
            <p className="mb-2">
              Nous comptons les pages vues, les clics sur les liens partenaires et les résultats des outils
              avec notre propre outil, hébergé sur notre serveur. Il ne dépose aucun cookie et n&apos;enregistre
              pas ton adresse IP. Aucune de ces données ne part chez un service tiers.
            </p>
            <p className="mb-2">
              Nous utilisons aussi Google Analytics 4 (Google Ireland Ltd). Tant que tu n&apos;as pas cliqué
              sur « Accepter » dans la bannière, il ne dépose aucun cookie : Google reçoit seulement des
              signaux de visite sans pouvoir te reconnaître d&apos;une visite à l&apos;autre. Ces données peuvent
              être traitées hors de l&apos;Union européenne, dans le cadre du Data Privacy Framework UE–États-Unis.
            </p>
            <p>
              Les messages envoyés par le formulaire de contact restent dans notre base de données. Ils
              servent uniquement à te répondre et ne sont jamais partagés.
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
              <a href="mailto:contact@toutou-gourmet.com" className="text-[var(--accent-1)] underline">
                contact@toutou-gourmet.com
              </a>
            </p>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
              Cookies
            </h2>
            <p>
              Si tu acceptes la mesure d&apos;audience, Google Analytics dépose les cookies <code>_ga</code> et
              <code>_ga_*</code>, conservés 13 mois au plus. Si tu refuses, aucun cookie de mesure n&apos;est
              déposé et le site fonctionne de la même façon. Ton choix est gardé 6 mois dans ton navigateur ;
              tu peux le changer à tout moment avec le lien « Gérer les cookies » en bas de chaque page.
              Aucun cookie publicitaire n&apos;est utilisé. Les autres cookies sont seulement ceux nécessaires
              au fonctionnement du site (par exemple, rester connecté à ton compte quand cette fonction sera
              ouverte).
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
