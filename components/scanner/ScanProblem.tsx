import type { ScannerErrorCode } from '@/lib/scanner/types'
import { AnalysisArt, IngredientsArt, WrongPhotoArt } from './illustrations'

// @cdc lot 6 — réponse à une photo inutilisable, sans décompte : pas une étiquette (exemple de
// la bonne photo), texte flou (conseils de prise de vue), aliment pour chat ou friandise
// (explication, pas de note). Les autres erreurs affichent leur message seul.

const BLUR_TIPS = [
  'Rapproche-toi : le texte doit remplir la photo, à 15 ou 20 cm du sac.',
  'Coupe le flash et incline un peu le sac pour éviter le reflet du plastique.',
  'Cadre seulement le texte, sac posé à plat, téléphone immobile.',
]

export function ScanProblem({ code, message }: { code: ScannerErrorCode; message: string }) {
  const tone = code === 'cat_food' || code === 'treat' || code === 'not_found' ? 'bg-blue-bg text-blue-ink' : 'bg-rose-bg text-rose-ink'
  return (
    <div role="alert" className={`flex flex-col gap-3 rounded-box p-3 text-[15px] leading-relaxed ${tone}`}>
      <p className="m-0">{message}</p>
      {code === 'not_a_label' ? (
        <div className="flex items-center gap-3">
          <figure className="m-0 w-20 shrink-0">
            <WrongPhotoArt />
            <figcaption className="pt-1 text-center text-xs">Envoyée</figcaption>
          </figure>
          <figure className="m-0 flex w-40 shrink-0 gap-2">
            <IngredientsArt />
            <AnalysisArt />
          </figure>
          <p className="m-0 text-sm">Attendu : la composition et le tableau des constituants analytiques, au dos du sac.</p>
        </div>
      ) : null}
      {code === 'blurry' ? (
        <ul role="list" className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm">
          {BLUR_TIPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
