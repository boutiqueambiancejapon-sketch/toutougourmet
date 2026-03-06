'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'

const navLinks = [
  { href: '/quiz', label: 'Le Quiz' },
  { href: '/comparateur', label: 'Comparateur' },
  { href: '/marques', label: 'Les marques' },
  { href: '/outils', label: 'Outils' },
  { href: '/blog', label: 'Blog' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border)] shadow-[var(--shadow-sm)]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ fontFamily: "'Fraunces', serif", color: 'var(--text-primary)' }}>
          <span className="text-2xl">🐾</span>
          <span>
            Toutou<span style={{ color: 'var(--accent-1)' }}>Gourmet</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-1)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/quiz" className="btn-primary text-sm py-2 px-4">
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
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-medium text-[var(--text-primary)] py-2 border-b border-[var(--border)] last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/quiz"
            onClick={() => setMenuOpen(false)}
            className="btn-primary text-center mt-2"
          >
            Faire le quiz →
          </Link>
        </div>
      )}
    </header>
  )
}
