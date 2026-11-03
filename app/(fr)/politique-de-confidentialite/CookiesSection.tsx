// Section « Cookies » de la politique de confidentialité (sortie de page.tsx : composant < 150 lignes).

export function CookiesSection() {
  return (
    <section id="cookies">
      <h2 className="mb-3 font-display text-xl font-bold text-[var(--text-primary)]">Cookies</h2>
      <p>
        Si tu acceptes la mesure d&apos;audience, Google Analytics dépose les cookies <code>_ga</code> et
        <code>_ga_*</code>, conservés 13 mois au plus. Si tu refuses, aucun cookie de mesure n&apos;est
        déposé et le site fonctionne de la même façon. Ton choix est gardé 6 mois dans ton navigateur ;
        tu peux le changer à tout moment avec le lien « Gérer les cookies » en bas de chaque page.
        Aucun cookie publicitaire n&apos;est utilisé.
      </p>
      <p>
        Le compte utilise deux cookies, seulement si tu te connectes : un cookie de session, illisible
        par les scripts de la page, et un témoin qui indique au site qu&apos;un compte est ouvert, sans
        aucune donnée personnelle. Ils disparaissent quand tu te déconnectes.
      </p>
    </section>
  )
}
