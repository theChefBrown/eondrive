import { Fragment, useMemo, useState } from 'react'
import { X, Trophy, Zap, Battery, Gauge, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Car, CarSpecs } from '../types'
import { useLanguage } from '../context/LanguageContext'

function efficiencyKwh(car: Car) {
  return Math.round(((car.batterySize / car.rangeKm) * 100) * 10) / 10
}

function RangeBar({ val, max, color }: { val: number; max: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full mt-1.5" style={{ background: 'var(--border-inner)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min((val / max) * 100, 100)}%`, background: color }}
      />
    </div>
  )
}

const ACCENT_COLORS = ['var(--primary)', 'var(--secondary)', '#f59e0b', 'var(--accent)']

export default function ComparisonSection() {
  const { selectedForCompare, clearCompare, toggleCompare, unitSystem, getEffectiveCar, trimSelections, setCarTrim } = useApp()
  const { translateSpecification, translateText: tx } = useLanguage()

  const [showSpecsTable, setShowSpecsTable] = useState(false)
  const [specsMap, setSpecsMap] = useState<Record<number, CarSpecs | null>>({})
  const [specsLoading, setSpecsLoading] = useState(false)

  const maxRange    = useMemo(() => Math.max(...selectedForCompare.map(c => getEffectiveCar(c).rangeKm), 1), [selectedForCompare, trimSelections])
  const maxBattery  = useMemo(() => Math.max(...selectedForCompare.map(c => getEffectiveCar(c).batterySize), 1), [selectedForCompare, trimSelections])
  const minPrice    = useMemo(() => Math.min(...selectedForCompare.map(c => getEffectiveCar(c).priceEur), Infinity), [selectedForCompare, trimSelections])
  const minEfficiency = useMemo(() => Math.min(...selectedForCompare.map(c => efficiencyKwh(getEffectiveCar(c))), Infinity), [selectedForCompare, trimSelections])

  function isBest(car: Car, key: string) {
    switch (key) {
      case 'rangeKm':     return car.rangeKm === maxRange
      case 'batterySize': return car.batterySize === maxBattery
      case 'priceEur':    return car.priceEur === minPrice
      case 'efficiency':  return efficiencyKwh(car) === minEfficiency
      default: return false
    }
  }

  async function handleToggleSpecsTable() {
    if (!showSpecsTable) {
      setSpecsLoading(true)
      const toFetch = selectedForCompare.filter(c => !(c.id in specsMap))
      if (toFetch.length > 0) {
        const results = await Promise.all(
          toFetch.map(c =>
            fetch(`/specs/${c.specFile}`)
              .then(r => r.ok ? (r.json() as Promise<CarSpecs>) : Promise.resolve(null))
              .catch(() => null as CarSpecs | null)
              .then(data => ({ id: c.id, data }))
          )
        )
        setSpecsMap(prev => {
          const next = { ...prev }
          results.forEach(({ id, data }) => { next[id] = data })
          return next
        })
      }
      setSpecsLoading(false)
    }
    setShowSpecsTable(v => !v)
  }

  // Union of all spec categories + keys across all loaded spec files
  const allCategories = useMemo(() => {
    const catMap = new Map<string, string[]>()
    selectedForCompare.forEach(car => {
      const specs = specsMap[car.id]
      if (!specs?.specifications) return
      Object.entries(specs.specifications).forEach(([cat, items]) => {
        if (!catMap.has(cat)) catMap.set(cat, [])
        const existing = catMap.get(cat)!
        Object.keys(items).forEach(k => { if (!existing.includes(k)) existing.push(k) })
      })
    })
    return Array.from(catMap.entries()).map(([category, keys]) => ({ category, keys }))
  }, [selectedForCompare, specsMap])

  // Core rows from car object data
  const coreRows = useMemo((): { label: string; getValue: (c: Car) => string; isBestFn?: (c: Car) => boolean }[] => [
    {
      label: translateSpecification('WLTP Range'),
      getValue: c => unitSystem === 'imperial' ? `${c.rangeMiles} mi` : `${c.rangeKm} km`,
      isBestFn: c => unitSystem === 'imperial'
        ? c.rangeMiles === Math.max(...selectedForCompare.map(x => x.rangeMiles))
        : c.rangeKm === Math.max(...selectedForCompare.map(x => x.rangeKm)),
    },
    {
      label: translateSpecification('Battery Capacity'),
      getValue: c => `${c.batterySize} kWh`,
      isBestFn: c => c.batterySize === Math.max(...selectedForCompare.map(x => x.batterySize)),
    },
    {
      label: translateSpecification('Efficiency'),
      getValue: c => unitSystem === 'imperial'
        ? `${((c.batterySize / c.rangeMiles) * 100).toFixed(1)} kWh/100mi`
        : `${((c.batterySize / c.rangeKm) * 100).toFixed(1)} kWh/100km`,
      isBestFn: c => {
        const eff = unitSystem === 'imperial' ? c.batterySize / c.rangeMiles : c.batterySize / c.rangeKm
        const best = Math.min(...selectedForCompare.map(x => unitSystem === 'imperial' ? x.batterySize / x.rangeMiles : x.batterySize / x.rangeKm))
        return Math.abs(eff - best) < 0.0001
      },
    },
    {
      label: translateSpecification('Starting Price'),
      getValue: c => unitSystem === 'imperial' ? `$${c.priceUsd.toLocaleString()}` : `€${c.priceEur.toLocaleString()}`,
      isBestFn: c => unitSystem === 'imperial'
        ? c.priceUsd === Math.min(...selectedForCompare.map(x => x.priceUsd))
        : c.priceEur === Math.min(...selectedForCompare.map(x => x.priceEur)),
    },
    {
      label: translateSpecification('Model Year'),
      getValue: c => `${c.year}`,
    },
  ], [selectedForCompare, unitSystem])

  if (selectedForCompare.length === 0) {
    return (
      <div className="mt-10">
        <div className="mb-8">
          <h2 className="section-title">{tx('Compare Vehicles')}</h2>
          <div className="section-line" />
        </div>
        <div
          className="rounded-2xl flex flex-col items-center justify-center py-24 gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderStyle: 'dashed' }}
        >
          <Zap size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p className="font-display text-xl" style={{ color: 'var(--text-secondary)' }}>
            {tx('No vehicles selected')}
          </p>
          <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Go to the EV Database and click the{' '}
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
              style={{ background: 'var(--chip-inactive-bg)', border: '1px solid var(--chip-inactive-border)' }}>
              ✓ compare
            </span>{' '}
            button on up to 4 vehicles.
          </p>
        </div>
      </div>
    )
  }

  const colCount = selectedForCompare.length + 1

  return (
    <div className="mt-10 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="section-title">{tx('Compare Vehicles')}</h2>
          <div className="section-line" />
        </div>
        <button className="btn-danger" onClick={clearCompare}>
          <X size={13} />
          {tx('Clear All')}
        </button>
      </div>

      {/* Car cards grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${selectedForCompare.length}, minmax(0,1fr))` }}
      >
        {selectedForCompare.map((car, idx) => {
          const eff = getEffectiveCar(car)
          const color = ACCENT_COLORS[idx % ACCENT_COLORS.length]
          const price = unitSystem === 'imperial'
            ? `$${eff.priceUsd.toLocaleString()}`
            : `€${eff.priceEur.toLocaleString()}`
          const range = unitSystem === 'imperial' ? `${eff.rangeMiles} mi` : `${eff.rangeKm} km`
          const activeTrimIdx = car.trims ? (trimSelections[car.id] ?? 0) : 0

          return (
            <div key={car.id} className="card flex flex-col" style={{ borderColor: `${color}44` }}>
              {/* Image */}
              <div className="relative">
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-36 object-cover"
                  style={{ background: '#060b1a' }}
                  onError={e => {
                    const img = e.target as HTMLImageElement
                    img.onerror = null
                    img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22%3E%3Crect fill=%22%230a1020%22 width=%22100%25%22 height=%22100%25%22/%3E%3C/svg%3E'
                  }}
                />
                <button
                  onClick={() => toggleCompare(car)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                  title={tx('Remove')}
                >
                  <X size={12} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: color }} />
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{car.description}</p>
                  <h3 className="font-display font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {car.brand} {car.model}
                  </h3>
                </div>

                {/* Trim selector inside compare card */}
                {car.trims && car.trims.length > 1 && (
                  <div className="flex flex-wrap gap-1">
                    {car.trims.map((trim, tIdx) => {
                      const active = tIdx === activeTrimIdx
                      return (
                        <button
                          key={tIdx}
                          onClick={() => setCarTrim(car.id, tIdx)}
                          className="text-xs px-1.5 py-0.5 rounded-full transition-all duration-200"
                          style={{
                            background: active ? color : 'var(--chip-inactive-bg)',
                            color: active ? '#000' : 'var(--text-muted)',
                            border: `1px solid ${active ? color : 'var(--chip-inactive-border)'}`,
                            fontWeight: active ? 700 : 400,
                          }}
                        >
                          {trim.name}
                        </button>
                      )
                    })}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx('Range')} (WLTP)</span>
                    <span className="font-display font-bold text-sm flex items-center gap-1" style={{ color }}>
                      {range}
                      {isBest(eff, 'rangeKm') && <Trophy size={11} className="text-yellow-400" />}
                    </span>
                  </div>
                  <RangeBar val={eff.rangeKm} max={maxRange} color={color} />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{translateSpecification('Battery')}</span>
                    <span className="font-display font-bold text-sm flex items-center gap-1" style={{ color }}>
                      {eff.batterySize} kWh
                      {isBest(eff, 'batterySize') && <Trophy size={11} className="text-yellow-400" />}
                    </span>
                  </div>
                  <RangeBar val={eff.batterySize} max={maxBattery} color={color} />
                </div>

                <div className="p-2.5 rounded-xl" style={{ background: 'var(--surface-inner)', border: '1px solid var(--border-inner)' }}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Gauge size={12} style={{ color }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{translateSpecification('Efficiency')}</span>
                    {isBest(eff, 'efficiency') && <Trophy size={11} className="text-yellow-400 ml-auto" />}
                  </div>
                  <p className="font-display font-bold text-base" style={{ color }}>
                    {unitSystem === 'imperial'
                      ? `${((eff.batterySize / eff.rangeMiles) * 100).toFixed(1)} kWh/100mi`
                      : `${efficiencyKwh(eff)} kWh/100km`}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl" style={{ background: 'var(--surface-inner)', border: '1px solid var(--border-inner)' }}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <DollarSign size={12} style={{ color }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{translateSpecification('Starting Price')}</span>
                    {isBest(eff, 'priceEur') && <Trophy size={11} className="text-yellow-400 ml-auto" />}
                  </div>
                  <p className="font-display font-bold text-base" style={{ color }}>{price}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action row */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <button
          className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={handleToggleSpecsTable}
          disabled={specsLoading}
        >
          {specsLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" />
              {tx('Loading specs...')}
            </>
          ) : showSpecsTable ? (
            <><ChevronUp size={15} /> {tx('Hide Specs Table')}</>
          ) : (
            <><ChevronDown size={15} /> {tx('View Full Specs Comparison')}</>
          )}
        </button>
        {selectedForCompare.length < 4 && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Add up to {4 - selectedForCompare.length} more vehicle{4 - selectedForCompare.length !== 1 ? 's' : ''} from the EV Database
          </p>
        )}
      </div>

      {/* ── Full Specs Comparison Table ─────────────────── */}
      {showSpecsTable && (
        <div
          className="mt-5 animate-slide-up rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' as never }}>
            <table
              style={{
                width: '100%',
                minWidth: `${Math.max(560, 180 + selectedForCompare.length * 185)}px`,
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: 'var(--text-muted)',
                      fontFamily: 'Space Grotesk',
                      borderBottom: '2px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      minWidth: 165,
                    }}
                  >
                    {translateSpecification('Specification')}
                  </th>
                  {selectedForCompare.map((car, idx) => (
                    <th
                      key={car.id}
                      className="px-4 py-3 text-left"
                      style={{
                        borderBottom: `2px solid ${ACCENT_COLORS[idx % ACCENT_COLORS.length]}`,
                        background: 'var(--bg-surface)',
                        minWidth: 175,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-8 rounded-full flex-shrink-0"
                          style={{ background: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}
                        />
                        <div>
                          <p className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{car.brand}</p>
                          <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                            {car.model}
                          </p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Core Performance section */}
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-4 py-2"
                    style={{
                      background: 'linear-gradient(90deg, rgba(0,212,255,0.1), transparent)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)', fontFamily: 'Space Grotesk' }}>
                      {translateSpecification('Core Performance')}
                    </span>
                  </td>
                </tr>
                {coreRows.map((row, rowIdx) => (
                  <tr key={row.label} style={{ background: rowIdx % 2 === 0 ? 'var(--surface-inner)' : 'transparent' }}>
                    <td
                      className="px-4 py-3 text-sm font-medium"
                      style={{
                        color: 'var(--text-secondary)',
                        position: 'sticky', left: 0,
                        background: 'var(--bg-card)',
                        borderBottom: '1px solid var(--border-row)',
                        zIndex: 1,
                        fontFamily: 'Space Grotesk',
                      }}
                    >
                      {row.label}
                    </td>
                    {selectedForCompare.map((car, idx) => {
                      const best = row.isBestFn?.(car) ?? false
                      return (
                        <td
                          key={car.id}
                          className="px-4 py-3 text-sm"
                          style={{
                            borderBottom: '1px solid var(--border-row)',
                            color: best ? ACCENT_COLORS[idx % ACCENT_COLORS.length] : 'var(--text-primary)',
                            fontWeight: best ? 700 : 400,
                            fontFamily: best ? 'Space Grotesk' : undefined,
                          }}
                        >
                          <span className="flex items-center gap-1.5">
                            {row.getValue(car)}
                            {best && <Trophy size={11} style={{ color: '#eab308', flexShrink: 0 }} />}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {/* Spec file categories */}
                {allCategories.map(({ category, keys }) => (
                  <Fragment key={category}>
                    <tr>
                      <td
                        colSpan={colCount}
                        className="px-4 py-2"
                        style={{
                          background: 'linear-gradient(90deg, rgba(139,92,246,0.1), transparent)',
                          borderTop: '1px solid var(--border-subtle)',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}
                      >
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--secondary)', fontFamily: 'Space Grotesk' }}>
                          {translateSpecification(category)}
                        </span>
                      </td>
                    </tr>
                    {keys.map((key, rowIdx) => (
                      <tr key={key} style={{ background: rowIdx % 2 === 0 ? 'var(--surface-inner)' : 'transparent' }}>
                        <td
                          className="px-4 py-2.5 text-sm"
                          style={{
                            color: 'var(--text-secondary)',
                            position: 'sticky', left: 0,
                            background: 'var(--bg-card)',
                            borderBottom: '1px solid var(--border-row)',
                            zIndex: 1,
                          }}
                        >
                          {translateSpecification(key)}
                        </td>
                        {selectedForCompare.map(car => {
                          const val = specsMap[car.id]?.specifications?.[category]?.[key] ?? '—'
                          return (
                            <td
                              key={car.id}
                              className="px-4 py-2.5 text-sm"
                              style={{
                                color: val === '—' ? 'var(--text-muted)' : 'var(--text-primary)',
                                borderBottom: '1px solid var(--border-row)',
                              }}
                            >
                              {translateSpecification(val)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}

                {allCategories.length === 0 && (
                  <tr>
                    <td colSpan={colCount} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      {tx('Detailed specifications not available for the selected vehicles.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
