'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/chien', label: 'Guides' },
  { href: '/chien/race', label: 'Races' },
  { href: '/comparateur', label: 'Comparateur' },
  { href: '/chien/marque', label: 'Marques' },
  { href: '/outils', label: 'Outils' },
  { href: '/blog', label: 'Blog' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-surface)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">

        {/* Logo textuel */}
        <Link
          href="/"
          className="flex items-center gap-2"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          <span className="text-xl font-black tracking-tight text-[var(--text-primary)]">
            Toutou
          </span>
          <span
            className="text-xl font-black tracking-tight px-2 py-0.5 rounded-[var(--radius-sm)] bg-[#FFD6E3] text-[var(--text-primary)]"
          >
            Gourmet
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/quiz" className="btn-primary text-sm py-2 px-5">
            Faire le quiz →
          </Link>
        </div>

        {/* Burger mobile */}
        <button
          className="md:hidden p-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-surface-2)]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-surface)] px-6 py-5 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-semibold text-[var(--text-primary)] py-3 border-b border-[var(--border)] last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/quiz" onClick={() => setMenuOpen(false)} className="btn-primary text-center mt-4">
            Faire le quiz →
          </Link>
        </div>
      )}
    </header>
  )
}
