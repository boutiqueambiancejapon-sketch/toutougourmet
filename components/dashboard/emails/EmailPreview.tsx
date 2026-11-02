import Link from 'next/link'
import type { ReactNode } from 'react'
import { SITE_URL } from '@/lib/i18n/config'
import { SectionTitle } from '../Panel'

// @cdc e-mails — aperçu exact d'un e-mail (HTML envoyé, en iframe srcdoc isolée) en largeur
// ordinateur et mobile, son objet, sa version texte et le bouton d'envoi de test. Seule retouche :
// les images du site passent en chemin relatif, car la CSP (img-src 'self') du tableau de bord,
// servi sur dashboard.toutou-gourmet.com, bloquerait https://www.toutou-gourmet.com/images/….
const previewHtml = (html: string): string => html.replaceAll(`${SITE_URL}/images/`, '/images/')

const DEFAULT_TARGET = 'NEWSLETTER_TEST_EMAIL'
const DEFAULT_REQUIREMENTS = 'NEWSLETTER_TEST_EMAIL, NEWSLETTER_SECRET, BREVO_API_KEY ou BREVO_SENDER_EMAIL'

function testMessage(status: string, target: string, requirements: string): { text: string; tone: string } | undefined {
  if (status === 'ok') return { text: `Test envoyé à ${target}.`, tone: 'bg-green-bg text-green-ink' }
  if (status === 'config') return { text: `Test impossible : ${requirements} manque.`, tone: 'bg-amber-bg text-amber-ink' }
  if (status === 'error') return { text: "Brevo a refusé l'envoi : voir le journal du site.", tone: 'bg-rose-bg text-rose-ink' }
  return undefined
}

interface EmailPreviewProps {
  title: string
  intro: string
  subject: string
  previewText?: string
  html: string
  text: string
  testAction: () => Promise<void>
  testStatus?: string
  /** Destinataire du test (nom de la variable), NEWSLETTER_TEST_EMAIL par défaut */
  testTarget?: string
  /** Variables nécessaires au test, citées si l'une manque */
  testRequirements?: string
  /** Bloc affiché avant l'aperçu (ex. campagnes programmées) */
  children?: ReactNode
}

function Frame({ label, html, widthClass }: { label: string; html: string; widthClass: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm font-semibold text-ink-2">{label}</figcaption>
      <iframe title={`Aperçu ${label}`} srcDoc={previewHtml(html)} sandbox="allow-popups allow-popups-to-escape-sandbox" className={`h-[1100px] rounded-box border border-line bg-paper ${widthClass}`} />
    </figure>
  )
}

export function EmailPreview(props: EmailPreviewProps) {
  const { title, intro, subject, previewText, html, text, testAction, testStatus, children } = props
  const target = props.testTarget ?? DEFAULT_TARGET
  const message = testStatus ? testMessage(testStatus, target, props.testRequirements ?? DEFAULT_REQUIREMENTS) : undefined
  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-2 px-4 pb-16 md:px-8">
      <p className="pt-6 text-sm">
        <Link href="/tableau-de-bord#emails" className="text-ink-2 underline underline-offset-2">
          Retour au tableau de bord
        </Link>
      </p>
      <h1 className="font-display text-3xl font-black text-ink">{title}</h1>
      <p className="max-w-prose text-sm text-ink-2">{intro}</p>
      <dl className="mt-2 grid gap-1 rounded-card border border-line bg-paper p-4 text-sm">
        <dt className="font-semibold text-ink-2">Objet</dt>
        <dd className="text-base font-semibold text-ink">{subject}</dd>
        {previewText && (
          <>
            <dt className="mt-2 font-semibold text-ink-2">Texte d&apos;aperçu</dt>
            <dd className="text-ink">{previewText}</dd>
          </>
        )}
      </dl>
      <form action={testAction} className="mt-2 flex flex-wrap items-center gap-3">
        <button type="submit" className="min-h-11 rounded-control bg-orange px-4 font-semibold text-ink hover:underline">
          M&apos;envoyer un test
        </button>
        <span className="text-sm text-ink-2">En transactionnel, à l&apos;adresse de {target}. Jamais à la liste.</span>
      </form>
      {message && (
        <p role="status" className={`rounded-box px-4 py-3 text-sm ${message.tone}`}>
          {message.text}
        </p>
      )}
      {children}
      <SectionTitle id="apercu" title="Aperçu" />
      <div className="mt-2 flex flex-wrap items-start gap-6 overflow-x-auto">
        <Frame label="Ordinateur" html={html} widthClass="w-[680px] max-w-full" />
        <Frame label="Mobile" html={html} widthClass="w-[375px] max-w-full" />
      </div>
      <details className="mt-6 rounded-card border border-line bg-paper p-4">
        <summary className="cursor-pointer font-semibold text-ink">Version texte</summary>
        <pre className="mt-3 whitespace-pre-wrap font-body text-sm text-ink">{text}</pre>
      </details>
    </main>
  )
}
