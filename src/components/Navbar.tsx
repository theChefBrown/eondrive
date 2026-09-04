import { useState, useEffect } from 'react'
import { Zap, BarChart3, Calculator, Menu, X, Sun, Moon, FlaskConical } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { ActiveSection } from '../types'
import { useLanguage } from '../context/LanguageContext'

const SECTION_TABS: { id: ActiveSection; label: 'evDatabase' | 'compare' | 'calculator' | 'engineeringLab'; icon: typeof Zap }[] = [
  { id: 'cars',       label: 'evDatabase',  icon: Zap },
  { id: 'compare',    label: 'compare',      icon: BarChart3 },
  { id: 'calculator', label: 'calculator',   icon: Calculator },
  { id: 'engineering-lab', label: 'engineeringLab', icon: FlaskConical },
]

export default function Navbar() {
  const { activeSection, setActiveSection, selectedForCompare, unitSystem, setUnitSystem, theme, setTheme } = useApp()
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function handleTabClick(id: ActiveSection) {
    setActiveSection(id)
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5000,
        transition: 'all 0.3s',
        background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
        borderBottom: scrolled
          ? '1px solid var(--nav-border-scrolled)'
          : '1px solid var(--nav-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(139,92,246,0.25))',
                border: '1px solid rgba(0,212,255,0.35)',
              }}
            >
              <Zap size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <span
              className="font-display font-bold text-lg tracking-tight"
              style={{ letterSpacing: '-0.01em' }}
            >
              <span className="gradient-text">EON</span>
              <span style={{ color: 'var(--text-primary)' }}>DRIVE</span>
            </span>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {SECTION_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`nav-tab ${activeSection === id ? 'active' : ''}`}
              >
                <Icon size={14} className="inline-block mr-1.5" style={{ verticalAlign: 'middle' }} />
                {t(label)}
                {id === 'compare' && selectedForCompare.length > 0 && (
                  <span className="compare-badge">{selectedForCompare.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Unit toggle */}
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: unitSystem === 'metric' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: unitSystem === 'metric' ? 600 : 400 }}>
                KM/€
              </span>
              <button
                onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
                className={`toggle-track ${unitSystem === 'imperial' ? 'on' : ''}`}
                aria-label="Toggle units"
              >
                <span className="toggle-thumb" />
              </button>
              <span style={{ color: unitSystem === 'imperial' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: unitSystem === 'imperial' ? 600 : 400 }}>
                MI/$
              </span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-ghost"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              style={{ padding: '0.45rem 0.6rem' }}
            >
              {theme === 'dark'
                ? <Sun size={16} style={{ color: '#f59e0b' }} />
                : <Moon size={16} style={{ color: 'var(--secondary)' }} />
              }
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden btn-ghost"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden pb-4 animate-slide-up"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex flex-col gap-1 pt-3">
              {SECTION_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabClick(id)}
                  className={`nav-tab text-left w-full py-3 ${activeSection === id ? 'active' : ''}`}
                >
                  <Icon size={14} className="inline-block mr-2" style={{ verticalAlign: 'middle' }} />
                  {t(label)}
                  {id === 'compare' && selectedForCompare.length > 0 && (
                    <span className="compare-badge">{selectedForCompare.length}</span>
                  )}
                </button>
              ))}
              <div className="flex items-center gap-2 text-xs pt-2 px-2" style={{ color: 'var(--text-secondary)' }}>
                <span>KM/€</span>
                <button
                  onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
                  className={`toggle-track ${unitSystem === 'imperial' ? 'on' : ''}`}
                  aria-label="Toggle units"
                >
                  <span className="toggle-thumb" />
                </button>
                <span>MI/$</span>
              </div>
              <div className="flex items-center gap-2 text-xs pt-1 px-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="btn-ghost w-full justify-start text-xs"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark'
                    ? <><Sun size={14} style={{ color: '#f59e0b' }} /> Light mode</>
                    : <><Moon size={14} style={{ color: 'var(--secondary)' }} /> Dark mode</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
