import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de Toutou Gourmet.',
  robots: { index: false },
}

const linkClass = 'text-orange-ink underline'

function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id}>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function ContactLink() {
  return (
    <Link href="/contact" className={linkClass}>
      formulaire de contact
    </Link>
  )
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[720px] mx-auto">
        <h1 className="page-title mb-8">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Dernière mise à jour : novembre 2026</p>

        <div className="flex flex-col gap-8 text-[var(--text-secondary)]">
          <Section title="Données collectées">
            <p className="mb-2">Toutou Gourmet collecte uniquement :</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Ton adresse email si tu t&apos;inscris à la newsletter, avec double opt-in obligatoire</li>
              <li>Ton prénom, ton adresse email et ton message si tu nous écris par le formulaire de contact</li>
              <li>Ton prénom, ton adresse email, ton mot de passe haché et les profils de tes chiens si tu ouvres un compte</li>
              <li>Des statistiques de visite anonymes, mesurées sur nos propres serveurs (sans cookie). Pour compter les visiteurs, on calcule une empreinte de ton adresse et de ton navigateur, qui change chaque jour et ne permet pas de te retrouver</li>
            </ul>
          </Section>

          <Section title="Mesure d'audience et formulaire de contact">
            <p className="mb-2">
              Nous comptons les pages vues, les clics sur les liens partenaires et les résultats des outils
              avec notre propre outil, hébergé sur notre serveur. Il ne dépose aucun cookie et n&apos;enregistre
              pas ton adresse IP. Au moment de la visite, il en déduit seulement ton pays avec une base
              installée sur notre serveur (DB-IP), puis l&apos;adresse est oubliée : seul le code du pays
              (par exemple FR) est gardé. Aucune de ces données ne part chez un service tiers.
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
          </Section>

          <Section title="Ton compte">
            <p className="mb-2">Quand tu ouvres un compte, nous gardons dans notre base de données, sur notre serveur :</p>
            <ul className="list-disc pl-5 space-y-1 text-sm mb-2">
              <li>ton adresse email et ton prénom ;</li>
              <li>ton mot de passe, haché : nous ne le connaissons pas et ne pouvons pas le lire ;</li>
              <li>les profils de tes chiens (nom, race, date de naissance, poids, activité, stérilisation) et leurs pesées ;</li>
              <li>les fiches de garde que tu crées (repas, friandises, allergies, médicaments, habitudes, ton téléphone, celui de ton vétérinaire, dates d&apos;absence). Elles sont lisibles par toute personne à qui tu envoies leur lien privé, jusqu&apos;au lendemain de ton retour. Rien n&apos;est gardé sur la personne qui garde ton chien ;</li>
              <li>pour chaque connexion, sa date, ton adresse IP et le nom de ton navigateur, qui servent à protéger le compte.</li>
            </ul>
            <p className="mb-2">
              Ces données servent à faire fonctionner ton compte : te connecter, pré-remplir les outils avec
              le profil de ton chien, suivre son poids. Elles ne sont ni vendues, ni utilisées pour de la publicité.
            </p>
            <p className="mb-2">
              Nous les gardons tant que ton compte existe. Un compte dont l&apos;adresse n&apos;a jamais été
              confirmée est supprimé après 30 jours, lors du nettoyage hebdomadaire suivant. Une connexion expire après 30 jours, puis ses
              données sont effacées.
            </p>
            <p className="mb-2">
              Les emails liés au compte (confirmation d&apos;adresse, mot de passe oublié, confirmation de
              suppression) partent par Brevo (Sendinblue SAS, France), qui reçoit ton adresse email et le
              contenu du message pour l&apos;envoyer. Ces emails ne contiennent aucune publicité.
            </p>
            <p className="mb-2">
              Si ton compte confirmé ne contient pas encore de chien, nous pouvons t&apos;envoyer deux rappels
              au plus pour t&apos;inviter à ajouter son profil. Ils s&apos;arrêtent dès que tu l&apos;ajoutes, et le lien
              de désinscription présent dans chacun les coupe.
            </p>
            <p className="mb-2">
              Scanner d&apos;étiquette : les photos que tu envoies sont traitées en mémoire puis oubliées, jamais
              enregistrées sur notre serveur. Pour lire l&apos;étiquette, elles sont transmises à l&apos;API Gemini
              de Google (Google Ireland Limited). Nous gardons le texte lu sur l&apos;étiquette et la note, qui forment
              une fiche produit publique sans aucune information sur toi, et, dans ton compte, la liste de tes
              analyses, leur nombre ce mois-ci et tes signalements d&apos;erreur. Cet historique part avec ton compte.
            </p>
            <p className="mb-2">
              La lecture du code-barres à la caméra se fait dans ton navigateur : aucune image du flux de la caméra
              n&apos;est envoyée ni gardée, seuls les chiffres lus nous parviennent. Pour un produit que notre base ne
              connaît pas encore, notre serveur interroge Open Pet Food Facts (association Open Food Facts, France) en
              n&apos;envoyant que ce code-barres : ni ton adresse IP, ni rien qui te concerne.
            </p>
            <p>
              Depuis <Link href="/compte" className={linkClass}>ton compte</Link>, tu peux télécharger toutes
              tes données dans un fichier JSON, corriger les profils de tes chiens et leurs pesées, et supprimer
              ton compte : l&apos;effacement est immédiat et complet, et un email te le confirme. Pour corriger
              ton prénom ou ton adresse email, écris-nous par le <ContactLink />.
            </p>
          </Section>

          <Section title="Newsletter">
            <p className="mb-2">
              Si tu t&apos;inscris à notre newsletter, ton email est uniquement utilisé pour t&apos;envoyer nos
              communications. Il n&apos;est jamais vendu, ni partagé avec des tiers à des fins commerciales.
              Tu peux te désabonner à tout moment en un clic.
            </p>
            <p>
              Seul le responsable du site voit les adresses inscrites à la lettre et celles des comptes, dans
              un espace privé protégé par mot de passe. Il s&apos;en sert pour gérer la lettre et les comptes
              (répondre à une demande, retirer une adresse), et pour rien d&apos;autre.
            </p>
          </Section>

          <Section title="Suivi des emails envoyés">
            <p className="mb-2">
              Pour savoir quel email t&apos;a été envoyé et quand, nous gardons pour chacun son type, son objet,
              sa date et s&apos;il est parti ou non. Nous ne relevons ni les ouvertures ni les clics dans ce journal.
              Il ne contient pas ton adresse, seulement une empreinte calculée à partir d&apos;elle avec une clé
              secrète : nous ne pouvons relier une ligne à une adresse que si nous connaissons encore cette
              adresse, par la liste de la lettre ou par un compte. Seul le responsable du site consulte ce suivi,
              dans le même espace privé.
            </p>
            <p>
              Ces lignes sont effacées après 24 mois. Si tu supprimes ton compte ou si tu quittes la lettre,
              elles restent jusqu&apos;à cette échéance sous forme d&apos;empreinte, sans ton adresse. Quand tu te
              désinscris, nous gardons aussi l&apos;empreinte de ton adresse, sans limite de durée, pour ne plus
              t&apos;écrire. Ce suivi repose sur notre intérêt légitime à prouver et à contrôler nos envois.
            </p>
          </Section>

          <Section title="Tes droits">
            <p>
              Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification, de suppression
              et de portabilité de tes données. Pour les exercer, écris-nous par le <ContactLink /> du site.
              Tu peux aussi adresser une réclamation à la CNIL (cnil.fr).
            </p>
          </Section>

          <Section title="Cookies" id="cookies">
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
          </Section>
        </div>
      </div>
    </div>
  )
}
