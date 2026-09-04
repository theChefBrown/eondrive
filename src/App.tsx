import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import CarGrid from './components/CarGrid'
import DashboardFeatures from './components/DashboardFeatures'
import ComparisonSection from './components/ComparisonSection'
import RangeCalculator from './components/RangeCalculator'
import EngineeringLab from './components/EngineeringLab'
import CarModal from './components/CarModal'
import DocumentationModal from './components/DocumentationModal'
import { LanguageProvider } from './context/LanguageContext'
import LanguageSelector from './components/LanguageSelector'
import { useLanguage } from './context/LanguageContext'
import { BookOpen } from 'lucide-react'
import { useState } from 'react'

function AppInner() {
  const { activeSection, modalCar, closeModal, modalSpecs } = useApp()
  const { t, translateText: tx, language } = useLanguage()
  const [showDocumentation, setShowDocumentation] = useState(false)
  const locale = { ro: 'ro-RO', en: 'en-GB', de: 'de-DE', hu: 'hu-HU' }[language]
  const updatedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date())

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />

      <main>
        <HeroSection />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Cars Section */}
          <section
            id="cars"
            style={{ display: activeSection === 'cars' ? 'block' : 'none' }}
          >
            <CarGrid />
          </section>

          {/* Compare Section */}
          <section
            id="compare"
            style={{ display: activeSection === 'compare' ? 'block' : 'none' }}
          >
            <ComparisonSection />
          </section>

          {/* Calculator Section */}
          <section
            id="calculator"
            style={{ display: activeSection === 'calculator' ? 'block' : 'none' }}
          >
            <RangeCalculator />
          </section>

          <section
            id="engineering-lab"
            style={{ display: activeSection === 'engineering-lab' ? 'block' : 'none' }}
          >
            <EngineeringLab />
          </section>

          <DashboardFeatures />
        </div>
      </main>

      {/* Car Specs Modal */}
      {modalCar && (
        <CarModal car={modalCar} specs={modalSpecs} onClose={closeModal} />
      )}
      {showDocumentation && <DocumentationModal onClose={() => setShowDocumentation(false)} />}

      {/* Footer */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © 2026 Eondrive. {t('planningEstimate')}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {updatedDate}
            </span>
            <button className="footer-documentation-link" onClick={() => setShowDocumentation(true)}>
              <BookOpen size={15} /> {tx('Documentation')}
            </button>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Created by{' '}
              <a
                href="https://thechefbrown.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                Chef Brown
              </a>
            </span>
          </div>
        </div>
      </footer>
      <LanguageSelector />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </LanguageProvider>
  )
}
