import { AccountInvite } from './AccountInvite'

// @cdc premium — invitation prête pour la fiche croquette et le résultat de scan sans compte.
// À poser par le chantier scanner (pages /croquettes/*, components/scanner/*) : une seule par page.
export function ScanAccountInvite({ retour }: { retour?: string }) {
  return (
    <AccountInvite
      place="scan"
      title="Garde tes analyses dans ton compte"
      text="Chaque sac scanné reste dans ton historique, à côté du profil et de la courbe de poids de ton chien."
      retour={retour}
    />
  )
}
