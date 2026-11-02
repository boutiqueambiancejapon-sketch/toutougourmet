// @cdc tableau de bord — bandeau d'état du serveur en haut de page : alertes en clair,
// ou une ligne verte discrète quand tout va bien. Détail dans la section « Serveur ».

export function HealthBanner({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) {
    return (
      <p className="mt-4 inline-flex items-center gap-2 rounded-pill bg-green-bg px-3 py-1 text-sm text-green-ink">
        <span aria-hidden="true">✓</span>
        <span>
          Serveur en bonne santé. <a href="#serveur" className="underline underline-offset-2">Détail</a>
        </span>
      </p>
    )
  }
  return (
    <section role="alert" aria-labelledby="alerte-serveur" className="mt-4 rounded-box border border-rose bg-rose-bg px-4 py-3 text-sm text-rose-ink">
      <h2 id="alerte-serveur" className="font-semibold">
        <span aria-hidden="true">⚠ </span>
        {alerts.length === 1 ? 'Un point à vérifier sur le serveur' : `${alerts.length} points à vérifier sur le serveur`}
      </h2>
      <ul className="mt-1 list-disc pl-5">
        {alerts.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <a href="#serveur" className="mt-1 inline-block font-semibold underline underline-offset-2">
        Voir la section Serveur
      </a>
    </section>
  )
}
