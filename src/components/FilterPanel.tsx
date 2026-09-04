import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { FilterState } from '../types'
import { useLanguage } from '../context/LanguageContext'

interface Props {
  filters: FilterState
  onChange: (f: FilterState) => void
}

const SORT_OPTIONS = [
  { value: '', label: 'Default order' },
  { value: 'range-desc', label: 'Range: High → Low' },
  { value: 'range-asc', label: 'Range: Low → High' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'battery-desc', label: 'Battery: High → Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
]

const DRIVE_TYPES = ['All', 'AWD', 'RWD', 'FWD']

export default function FilterPanel({ filters, onChange }: Props) {
  const { cars } = useApp()
  const { translateText: tx } = useLanguage()
  const [showMakes, setShowMakes] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const brandList = useMemo(
    () => [...new Set(cars.map(c => c.brand))].sort(),
    [cars]
  )

  function toggleBrand(brand: string) {
    const next = filters.makes.includes(brand)
      ? filters.makes.filter(b => b !== brand)
      : [...filters.makes, brand]
    onChange({ ...filters, makes: next })
  }

  function clearAll() {
    onChange({
      makes: [],
      priceMax: 250000,
      rangeMin: 0,
      sortBy: '',
      searchQuery: '',
      driveType: 'All',
    })
  }

  const hasFilters = filters.makes.length > 0
    || filters.rangeMin > 0
    || filters.priceMax < 250000
    || filters.searchQuery
    || filters.driveType !== 'All'
    || filters.sortBy

  return (
    <div
      className="mb-6 rounded-2xl"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {/* Top row */}
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder={tx('Search brand, model...')}
            value={filters.searchQuery}
            onChange={e => onChange({ ...filters, searchQuery: e.target.value })}
            className="input-field pl-9"
          />
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={e => onChange({ ...filters, sortBy: e.target.value })}
          className="input-field sm:w-52"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{tx(o.label.replace(' → ', ' to '))}</option>
          ))}
        </select>

        {/* Makes dropdown toggle */}
        <button
          onClick={() => setShowMakes(v => !v)}
          className="btn-ghost flex-shrink-0"
          style={{ borderColor: showMakes ? 'rgba(0,212,255,0.4)' : undefined }}
        >
          {tx('Brands')}
          {filters.makes.length > 0 && (
            <span
              className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'var(--primary)', color: '#000d18' }}
            >
              {filters.makes.length}
            </span>
          )}
          <ChevronDown
            size={14}
            style={{ transition: 'transform 0.2s', transform: showMakes ? 'rotate(180deg)' : 'none' }}
          />
        </button>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(v => !v)}
          className="btn-ghost flex-shrink-0"
          style={{ borderColor: showAdvanced ? 'rgba(139,92,246,0.4)' : undefined }}
        >
          <SlidersHorizontal size={14} />
          {tx('Filters')}
          {showAdvanced && <span style={{ color: 'var(--secondary)' }}>▴</span>}
        </button>

        {/* Clear */}
        {hasFilters && (
          <button onClick={clearAll} className="btn-danger flex-shrink-0">
            <X size={13} />
            {tx('Clear')}
          </button>
        )}
      </div>

      {/* Brand chips */}
      {showMakes && (
        <div
          className="px-4 pb-4 flex flex-wrap gap-2"
          style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}
        >
          {brandList.map(brand => {
            const active = filters.makes.includes(brand)
            return (
              <button
                key={brand}
                onClick={() => toggleBrand(brand)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  background: active ? 'rgba(0,212,255,0.15)' : 'var(--chip-inactive-bg)',
                  border: `1px solid ${active ? 'rgba(0,212,255,0.45)' : 'var(--chip-inactive-border)'}`,
                }}
              >
                {brand}
              </button>
            )
          })}
        </div>
      )}

      {/* Advanced filters */}
      {showAdvanced && (
        <div
          className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-5"
          style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}
        >
          {/* Price */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
              {tx('Max Price')}: {filters.priceMax >= 250000 ? tx('Any') : `€${(filters.priceMax / 1000).toFixed(0)}k`}
            </label>
            <input
              type="range"
              min={10000} max={250000} step={5000}
              value={filters.priceMax}
              onChange={e => onChange({ ...filters, priceMax: +e.target.value })}
              style={{
                background: `linear-gradient(to right, var(--primary) ${((filters.priceMax - 10000) / (250000 - 10000)) * 100}%, var(--slider-empty) 0%)`,
              }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>€10k</span><span>€250k+</span>
            </div>
          </div>

          {/* Range */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
              {tx('Min Range')}: {filters.rangeMin > 0 ? `${filters.rangeMin} km` : tx('Any')}
            </label>
            <input
              type="range"
              min={0} max={700} step={25}
              value={filters.rangeMin}
              onChange={e => onChange({ ...filters, rangeMin: +e.target.value })}
              style={{
                background: `linear-gradient(to right, var(--secondary) ${(filters.rangeMin / 700) * 100}%, var(--slider-empty) 0%)`,
              }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>0 km</span><span>700 km</span>
            </div>
          </div>

          {/* Drive type */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
              {tx('Drive Type')}
            </label>
            <div className="flex flex-wrap gap-2">
              {DRIVE_TYPES.map(dt => {
                const active = filters.driveType === dt
                return (
                  <button
                    key={dt}
                    onClick={() => onChange({ ...filters, driveType: dt })}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      fontFamily: 'Space Grotesk',
                      background: active ? 'rgba(16,185,129,0.2)' : 'var(--chip-inactive-bg)',
                      border: `1px solid ${active ? 'rgba(16,185,129,0.5)' : 'var(--chip-inactive-border)'}`,
                    }}
                  >
                    {tx(dt)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
