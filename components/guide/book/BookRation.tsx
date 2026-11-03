import { rationRows, RATION_TIPS } from '@/lib/guide/ration'
import { BookPage, FillImage, Source } from './BookPage'

// @cdc guide — chapitre 1 « Combien lui donner » : repères calculés avec la formule de
// /outils/ration (lib/calculators), chien adulte à activité normale.

const g = (n: number) => `${n.toLocaleString('fr-FR')} g`

export function BookRation({ number, chapter }: { number: number; chapter: number }) {
  const rows = rationRows()
  return (
    <BookPage number={number}>
      <header className="bk-head">
        <p className="bk-kicker">Chapitre {chapter}</p>
        <h2 className="bk-h2">Combien lui donner</h2>
        <p className="bk-lead">
          Repères par jour pour un chien adulte à activité normale. Son poids, son âge et son activité suffisent : le calculateur du site
          ajuste pour un chiot, un senior ou un chien sportif.
        </p>
      </header>
      <table className="bk-table">
        <thead>
          <tr>
            <th>Poids</th>
            <th className="r">Besoin</th>
            <th className="r">Croquettes</th>
            <th className="r">Stérilisé</th>
            <th className="r">Repas frais</th>
            <th className="r">Friandises au plus</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.kg}>
              <td className="strong">{r.kg} kg</td>
              <td className="r">{r.kcal.toLocaleString('fr-FR')} kcal</td>
              <td className="r strong">{g(r.kibble)}</td>
              <td className="r">{g(r.sterilizedKibble)}</td>
              <td className="r">{g(r.fresh)}</td>
              <td className="r">{r.treatsKcal} kcal</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bk-tips">
        {RATION_TIPS.map((tip) => (
          <div key={tip.title} className="bk-tip">
            <h3 className="bk-h3">{tip.title}</h3>
            <p>{tip.text}</p>
          </div>
        ))}
      </div>
      <Source path="/outils/ration" label="La ration au gramme près pour ton chien" />
      <FillImage src="/images/articles/art-croquettes-a-volonte-ou-rationnees.jpeg" />
    </BookPage>
  )
}
