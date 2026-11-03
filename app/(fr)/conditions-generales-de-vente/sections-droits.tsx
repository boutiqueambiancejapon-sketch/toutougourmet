import Link from 'next/link'
import type { CgvSection } from './sections-vente'

// @cdc premium — CGV, deuxième partie : rétractation, remboursement, garantie, données,
// réclamations et médiation, droit applicable. Médiateur et juridiction : [À compléter].

const link = 'font-semibold text-[var(--accent-1)] underline'

export const RIGHTS_SECTIONS: CgvSection[] = [
  {
    id: 'retractation',
    title: '7. Droit de rétractation',
    body: (
      <>
        <p className="mb-2">
          La loi donne au consommateur 14 jours pour se rétracter d&apos;un achat à distance. Premium est un service
          numérique fourni dès le paiement : avant de payer, tu demandes expressément cet accès immédiat et tu
          reconnais renoncer à ton droit de rétractation, en cochant la case « Je demande l&apos;accès immédiat et
          renonce à mon droit de rétractation de 14 jours ». Sans cette case, la commande ne peut pas aboutir.
        </p>
        <p>La date de ton accord est enregistrée avec ton abonnement et figure dans l&apos;export de tes données.</p>
      </>
    ),
  },
  {
    id: 'remboursement',
    title: '8. Remboursement',
    body: (
      <p>
        Une somme prélevée par erreur (double paiement, prélèvement après une résiliation) est remboursée en entier,
        sur le moyen de paiement utilisé, dans les 14 jours qui suivent ta demande. [À compléter si souhaité : autres
        cas de remboursement, par exemple une panne prolongée du service.] Écris-nous par le{' '}
        <Link href="/contact" className={link}>
          formulaire de contact
        </Link>
        .
      </p>
    ),
  },
  {
    id: 'garantie',
    title: '9. Garantie de conformité',
    body: (
      <p>
        Tu bénéficies de la garantie légale de conformité des contenus et services numériques prévue par le droit de
        la consommation de ton pays de résidence. En cas de défaut, signale-le par le formulaire de contact : nous
        corrigeons le service ou, à défaut, te remboursons tout ou partie du prix.
      </p>
    ),
  },
  {
    id: 'donnees',
    title: '10. Données personnelles',
    body: (
      <p>
        Le traitement de tes données, y compris par Stripe pour le paiement, est décrit dans la{' '}
        <Link href="/politique-de-confidentialite#paiement" className={link}>
          politique de confidentialité
        </Link>
        .
      </p>
    ),
  },
  {
    id: 'mediation',
    title: '11. Réclamations et médiation',
    body: (
      <>
        <p className="mb-2">
          Pour toute réclamation, écris-nous d&apos;abord par le formulaire de contact. Si la réponse ne te convient pas, tu peux saisir gratuitement le médiateur de la consommation :
        </p>
        <p>
          [À compléter : nom du médiateur]
          <br />
          [À compléter : adresse postale et site internet du médiateur]
        </p>
      </>
    ),
  },
  {
    id: 'droit',
    title: '12. Droit applicable',
    body: (
      <p>
        Les présentes conditions sont soumises au droit belge. Si tu résides dans un autre pays de l&apos;Union
        européenne, tu gardes la protection des règles impératives de la consommation de ce pays, et tu peux saisir
        les tribunaux de ton lieu de résidence. [À compléter : tribunal compétent pour les litiges avec un
        professionnel.]
      </p>
    ),
  },
  {
    id: 'version',
    title: '13. Version des conditions',
    body: (
      <p>
        Les conditions applicables sont celles en ligne au jour de la commande. En cas de modification, les abonnés sont
        prévenus par e-mail au moins 30 jours avant leur entrée en vigueur et peuvent résilier d&apos;ici là.
      </p>
    ),
  },
]
