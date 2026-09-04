import { PlusCircle, CheckCircle, Info, Zap, Battery, Gauge } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Car } from '../types'
import { useLanguage } from '../context/LanguageContext'

const BRAND_COLORS: Record<string, { gradient: string; text: string }> = {
  Tesla:    { gradient: 'linear-gradient(135deg,#cc0000,#ff4444)', text: '#ff6b6b' },
  BMW:      { gradient: 'linear-gradient(135deg,#003f8c,#0066cc)', text: '#6eb5ff' },
  Mercedes: { gradient: 'linear-gradient(135deg,#2a2a2a,#555555)', text: '#c0c0c0' },
  Volkswagen: { gradient: 'linear-gradient(135deg,#001e6c,#0040c0)', text: '#6699ff' },
  Audi:     { gradient: 'linear-gradient(135deg,#800000,#c0392b)', text: '#ff8080' },
  Hyundai:  { gradient: 'linear-gradient(135deg,#003087,#00529b)', text: '#5599ff' },
  Kia:      { gradient: 'linear-gradient(135deg,#c0392b,#e74c3c)', text: '#ff9999' },
  Porsche:  { gradient: 'linear-gradient(135deg,#8B0000,#cc0000)', text: '#ffaa88' },
  Polestar: { gradient: 'linear-gradient(135deg,#006633,#00aa55)', text: '#44dd88' },
  Volvo:    { gradient: 'linear-gradient(135deg,#00395d,#006699)', text: '#88ccff' },
  Rivian:   { gradient: 'linear-gradient(135deg,#006642,#00994d)', text: '#55ee99' },
  Lucid:    { gradient: 'linear-gradient(135deg,#4a0080,#7700cc)', text: '#cc88ff' },
  Rimac:    { gradient: 'linear-gradient(135deg,#1a0033,#440088)', text: '#9955ff' },
}

const DEFAULT_BRAND = { gradient: 'linear-gradient(135deg,#00364a,#005a7a)', text: 'var(--primary)' }

function brandStyle(brand: string) {
  return BRAND_COLORS[brand] ?? DEFAULT_BRAND
}

interface Props {
  car: Car
  viewMode?: 'grid' | 'list'
  priority?: boolean
}

export default function CarCard({ car, viewMode = 'grid', priority = false }: Props) {
  const { selectedForCompare, toggleCompare, openModal, unitSystem, trimSelections, setCarTrim } = useApp()
  const { translateText: tx, translateSpecification } = useLanguage()
  const isSelected = selectedForCompare.some(c => c.id === car.id)
  const bs = brandStyle(car.brand)

  // Active trim index & derived values
  const activeTrimIdx = car.trims ? (trimSelections[car.id] ?? 0) : 0
  const activeTrim = car.trims?.[activeTrimIdx]
  const rangeKm     = activeTrim?.rangeKm     ?? car.rangeKm
  const rangeMiles  = activeTrim?.rangeMiles  ?? car.rangeMiles
  const batterySize = activeTrim?.batterySize ?? car.batterySize
  const priceEur    = activeTrim?.priceEur    ?? car.priceEur
  const priceUsd    = activeTrim?.priceUsd    ?? car.priceUsd

  const maxRange = 900
  const rangePercent = Math.min((rangeKm / maxRange) * 100, 100)
  const rangeDisplay = unitSystem === 'imperial' ? `${rangeMiles} mi` : `${rangeKm} km`
  const priceDisplay = unitSystem === 'imperial'
    ? `$${priceUsd.toLocaleString()}`
    : `€${priceEur.toLocaleString()}`

  function handleCompareClick(e: React.MouseEvent) {
    e.stopPropagation()
    toggleCompare(car)
  }

  function handleTrimClick(e: React.MouseEvent, idx: number) {
    e.stopPropagation()
    setCarTrim(car.id, idx)
  }

  return (
    <div
      className={`card flex cursor-pointer group ${viewMode === 'list' ? 'flex-col md:flex-row' : 'flex-col'}`}
      onClick={() => openModal(car)}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && openModal(car)}
      role="button"
      aria-label={`View specs for ${car.brand} ${car.model}`}
    >
      {/* Image area */}
      <div
        className={`relative overflow-hidden flex-shrink-0 ${viewMode === 'list' ? 'w-full md:w-64' : 'w-full'}`}
        style={{ height: '162px', background: '#060b1a' }}
      >
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          width="600"
          height="360"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={e => {
            const img = e.target as HTMLImageElement
            img.onerror = null
            img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22%3E%3Crect fill=%22%230a1020%22 width=%22100%25%22 height=%22100%25%22/%3E%3C/svg%3E'
          }}
        />
        {/* Brand badge overlay */}
        <div
          className="absolute top-3 left-3 brand-badge text-white text-opacity-90"
          style={{ background: bs.gradient, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          {car.brand}
        </div>

        {/* Year badge */}
        <div
          className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(0,0,0,0.65)', color: 'var(--text-secondary)', backdropFilter: 'blur(4px)' }}
        >
          {car.year}
        </div>

        {/* Discontinued overlay */}
        {car.discontinued && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}
            >
              {tx('Discontinued')}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Title */}
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
            {activeTrim ? activeTrim.name : car.description}
          </p>
          <h3
            className="font-display font-bold text-base leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {car.brand} {car.model}
          </h3>
        </div>

        {/* Trim / battery selector — shown only when multiple options exist */}
        {car.trims && car.trims.length > 1 && (
          <div
            className="flex flex-wrap gap-1"
            onClick={e => e.stopPropagation()}
          >
            {car.trims.map((trim, idx) => {
              const active = idx === activeTrimIdx
              return (
                <button
                  key={idx}
                  onClick={e => handleTrimClick(e, idx)}
                  className="text-xs px-2 py-0.5 rounded-full transition-all duration-200 font-medium"
                  style={{
                    background: active ? 'var(--primary)' : 'var(--chip-inactive-bg)',
                    color: active ? '#000' : 'var(--text-muted)',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--chip-inactive-border)'}`,
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {trim.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-xl"
            style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.12)' }}>
            <Zap size={13} style={{ color: 'var(--primary)' }} />
            <span className="font-bold text-sm mt-0.5" style={{ color: 'var(--primary)', fontFamily: 'Space Grotesk' }}>
              {rangeDisplay}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx('Range')}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.12)' }}>
            <Battery size={13} style={{ color: 'var(--secondary)' }} />
            <span className="font-bold text-sm mt-0.5" style={{ color: 'var(--secondary)', fontFamily: 'Space Grotesk' }}>
              {batterySize} kWh
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{translateSpecification('Battery')}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <Gauge size={13} style={{ color: 'var(--accent)' }} />
            <span className="font-bold text-sm mt-0.5" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
              {unitSystem === 'imperial'
                ? ((batterySize / rangeMiles) * 100).toFixed(1)
                : ((batterySize / rangeKm) * 100).toFixed(1)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{unitSystem === 'imperial' ? 'kWh/100mi' : 'kWh/100km'}</span>
          </div>
        </div>

        {/* Range bar */}
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>{translateSpecification('WLTP Range')}</span>
            <span style={{ color: bs.text }}>{rangeDisplay}</span>
          </div>
          <div className="range-bar-track">
            <div
              className="range-bar-fill"
              style={{ width: `${rangePercent}%`, background: bs.gradient }}
            />
          </div>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx('Starting from')}</p>
            <p className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              {priceDisplay}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCompareClick}
              title={tx(isSelected ? 'Remove from compare' : 'Add to compare')}
              className="p-2 rounded-lg transition-all"
              style={{
                background: isSelected ? 'rgba(16,185,129,0.2)' : 'var(--chip-inactive-bg)',
                border: `1px solid ${isSelected ? 'rgba(16,185,129,0.5)' : 'var(--chip-inactive-border)'}`,
                color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); openModal(car) }}
              title={tx('View full specs')}
              className="p-2 rounded-lg transition-all"
              style={{
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.2)',
                color: 'var(--primary)',
              }}
            >
              <Info size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
