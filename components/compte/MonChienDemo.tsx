import { ScoreBadge } from '@/components/scanner/ScoreBadge'

// @cdc compte — aperçu de l'espace sur /mon-chien, avec un chien d'exemple. Aucune donnée réelle.

export function MonChienDemo() {
  return (
    <figure className="m-0 flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-4 shadow-[6px_6px_0_var(--orange)] sm:p-5">
      <figcaption className="text-sm font-semibold text-ink-2">Exemple : l&apos;espace de Rex</figcaption>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-pill bg-amber font-display text-xl font-black text-ink">R</span>
        <p className="m-0 flex flex-col">
          <span className="font-display text-xl font-black text-ink">Rex</span>
          <span className="text-sm text-ink-2">Beagle, 4 ans, stérilisé</span>
        </p>
      </div>
      <dl className="m-0 grid grid-cols-2 gap-2">
        <div className="flex flex-col-reverse rounded-box border border-line px-3 py-2">
          <dt className="text-[13px] text-ink-2">Dernière pesée</dt>
          <dd className="m-0 font-display text-xl font-black text-ink">14,2 kg</dd>
        </div>
        <div className="flex flex-col-reverse rounded-box border border-line px-3 py-2">
          <dt className="text-[13px] text-ink-2">Sa ration</dt>
          <dd className="m-0 font-display text-xl font-black text-ink">190 g/jour</dd>
        </div>
      </dl>
      <div className="flex items-center gap-3 rounded-box border border-line px-3 py-2">
        <ScoreBadge score={88} />
        <p className="m-0 flex min-w-0 flex-col text-sm">
          <span className="font-semibold text-ink">Ses croquettes</span>
          <span className="text-ink-2">Convient à Rex</span>
        </p>
      </div>
    </figure>
  )
}
