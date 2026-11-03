import { notFound } from 'next/navigation'
import { dashboardAllowed } from '@/lib/dashboard/guard'
import { premiumLaunchEndEmail, premiumLaunchPreviewInput } from '@/lib/emails/premium-launch-end'
import { EmailPreview } from '@/components/dashboard/emails/EmailPreview'
import { sendPremiumLaunchTest } from '../actions'

// @cdc e-mails — aperçu privé de l'e-mail de fin du Premium gratuit du lancement (protégé par
// proxy.ts). Gabarit prêt, jamais envoyé automatiquement : le test part seulement vers OWNER_EMAIL.

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ test?: string | string[] }>
}

export default async function PremiumLaunchPreviewPage({ searchParams }: PageProps) {
  if (!(await dashboardAllowed())) notFound()
  const test = (await searchParams).test
  const input = premiumLaunchPreviewInput()
  const mail = premiumLaunchEndEmail(input)
  const date = input.configured ? `Date de fin lue dans PREMIUM_LAUNCH_ENDS_AT : ${input.endsOn}.` : `PREMIUM_LAUNCH_ENDS_AT n'est pas réglée : date d'exemple (${input.endsOn}).`
  return (
    <EmailPreview
      title="Fin du Premium gratuit du lancement"
      intro={`À envoyer aux comptes Premium du lancement avant la fin de la gratuité, une fois le paiement en ligne ouvert. Préparé mais pas envoyé : aucun script ni minuterie ne l'expédie. Prénom d'exemple : Camille. ${date}`}
      subject={mail.subject}
      html={mail.html}
      text={mail.text}
      testAction={sendPremiumLaunchTest}
      testStatus={Array.isArray(test) ? test[0] : test}
      testTarget="OWNER_EMAIL"
      testRequirements="OWNER_EMAIL, BREVO_API_KEY ou BREVO_SENDER_EMAIL"
    />
  )
}
