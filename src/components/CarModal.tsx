import { useEffect, useRef } from 'react'
import { X, Zap, Battery, Gauge, Car as CarIcon, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Car, CarSpecs } from '../types'
import { useLanguage } from '../context/LanguageContext'

interface Props {
  car: Car
  specs: CarSpecs | null
  onClose: () => void
}

export default function CarModal({ car, specs, onClose }: Props) {
  const { unitSystem } = useApp()
  const { translateSpecification, translateText: tx } = useLanguage()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  const rangeDisplay = unitSystem === 'imperial' ? `${car.rangeMiles} mi` : `${car.rangeKm} km`
  const priceDisplay = unitSystem === 'imperial'
    ? `$${car.priceUsd.toLocaleString()}`
    : `€${car.priceEur.toLocaleString()}`

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal-content glass-hover">
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: 'var(--modal-header-bg)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{car.description}</p>
            <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              {car.brand} {car.model}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost ml-4"
            aria-label={tx('Close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Top content: image + quick stats */}
        <div className="flex flex-col md:flex-row">
          <div
            className="md:w-1/2 flex-shrink-0"
            style={{ background: '#060b1a' }}
          >
            <img
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ maxHeight: 300 }}
              onError={e => {
                const img = e.target as HTMLImageElement
                img.onerror = null
                img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22%3E%3Crect fill=%22%230a1020%22 width=%22100%25%22 height=%22100%25%22/%3E%3C/svg%3E'
              }}
            />
          </div>

          <div className="flex-1 p-6 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ background: 'rgba(0,212,255,0.12)', color: 'var(--primary)', border: '1px solid rgba(0,212,255,0.25)' }}
              >
                {car.year}
              </span>
              {car.discontinued && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  {tx('Discontinued')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: translateSpecification('WLTP Range'), value: rangeDisplay, icon: Zap, color: 'var(--primary)' },
                { label: translateSpecification('Battery'), value: `${car.batterySize} kWh`, icon: Battery, color: 'var(--secondary)' },
                { label: translateSpecification('Efficiency'), value: `${unitSystem === 'imperial' ? ((car.batterySize / car.rangeMiles) * 100).toFixed(1) : ((car.batterySize / car.rangeKm) * 100).toFixed(1)} ${unitSystem === 'imperial' ? 'kWh/100mi' : 'kWh/100km'}`, icon: Gauge, color: 'var(--accent)' },
                { label: tx('Price'), value: priceDisplay, icon: Star, color: '#f59e0b' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label}
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--surface-inner)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={13} style={{ color }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  </div>
                  <p className="font-display font-bold text-base" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specs table */}
        <div className="px-6 pb-6">
          {specs ? (
            Object.entries(specs.specifications).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h3
                  className="font-display font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: 'var(--primary)' }}
                >
                  <span
                    className="inline-block w-5 h-px"
                    style={{ background: 'var(--primary)' }}
                  />
                  {translateSpecification(category)}
                </h3>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--border-subtle)' }}
                >
                  {Object.entries(items).map(([key, val], idx) => (
                    <div
                      key={key}
                      className="flex justify-between items-center px-4 py-2.5"
                      style={{
                        background: idx % 2 === 0 ? 'var(--surface-inner)' : 'transparent',
                        borderBottom: idx < Object.entries(items).length - 1 ? '1px solid var(--border-row)' : 'none',
                      }}
                    >
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{translateSpecification(key)}</span>
                      <span className="text-sm font-semibold text-right" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                        {translateSpecification(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center py-10 gap-3">
              <CarIcon size={32} style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)' }}>{tx('Loading specifications...')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
