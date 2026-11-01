import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Rejoins la meute',
  description: 'Une question, un retour, une idée d\'article ? Écris-nous, on lit tout.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/contact' },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[560px] mx-auto">
        <h1 className="page-title mb-3">Rejoins la meute</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Une question, un retour, une idée d&apos;article ? On lit tout.
        </p>
        <ContactForm />
      </div>
    </div>
  )
}
