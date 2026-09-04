import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, BarChart3, Calculator, FlaskConical } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { ActiveSection } from '../types'
import { useLanguage } from '../context/LanguageContext'

const features: Array<{ id: ActiveSection; title: string; detail: string; icon: typeof Calculator; color: string }> = [
  { id: 'compare', title: 'Compare EVs', detail: 'Compare range, price, and battery data.', icon: BarChart3, color: 'var(--secondary)' },
  { id: 'calculator', title: 'Range Calculator', detail: 'Model real-world range conditions.', icon: Calculator, color: 'var(--primary)' },
  { id: 'engineering-lab', title: 'Engineering Lab', detail: 'Plan energy use and charging stops.', icon: FlaskConical, color: 'var(--accent)' },
]

export default function DashboardFeatures() {
  const { setActiveSection } = useApp()
  const { translateText: tx } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.2 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  function navigateTo(section: ActiveSection) {
    setActiveSection(section)
    requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return (
    <section ref={sectionRef} className={`dashboard-features ${isVisible ? 'is-visible' : ''}`} aria-label={tx('Explore tools')}>
      <div className="dashboard-features-heading">
        <p>{tx('Explore tools')}</p>
        <span>{tx('Plan, compare, and calculate')}</span>
      </div>
      <div className="dashboard-feature-grid">
        {features.map(({ id, title, detail, icon: Icon, color }, index) => (
          <article key={id} className="dashboard-feature" style={{ '--feature-color': color, '--feature-delay': `${index * 110}ms` } as React.CSSProperties}>
            <div className="dashboard-feature-icon"><Icon size={20} /></div>
            <div><h3>{tx(title)}</h3><p>{tx(detail)}</p></div>
            <button className="dashboard-feature-link" onClick={() => navigateTo(id)} title={tx(`Open ${title}`)} aria-label={tx(`Open ${title}`)}><ArrowUpRight size={18} /></button>
          </article>
        ))}
      </div>
    </section>
  )
}