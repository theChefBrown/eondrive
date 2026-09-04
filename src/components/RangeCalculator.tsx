import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Thermometer, Gauge, Wind, Users, Package,
  Mountain, Zap, Battery, AlertCircle, MapPin, Info,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { CalculatorSettings, CalculatorResult } from '../types'
import { useLanguage } from '../context/LanguageContext'

/* ─── Calculation logic ──────────────────────────────────────── */

function calcTempFactor(t: number): number {
  // Based on real-world EV studies & Recurrent data
  if (t >= 20 && t <= 25) return 1.0
  if (t < -20) return 0.60
  if (t < 0)   return 0.65 + ((t + 20) / 20) * 0.15  // 0.65→0.80 at 0°C
  if (t < 20)  return 0.80 + (t / 20) * 0.20          // 0.80→1.00
  if (t <= 35) return 1.0  - ((t - 25) / 10) * 0.06   // 1.00→0.94
  return 0.94 - ((t - 35) / 10) * 0.06                 // >35°C gets worse
}

function calcSpeedFactor(kmh: number): number {
  // Aerodynamic drag ∝ v³ — calibrated against real EV measurements
  const base: Record<number, number> = {
    30:  1.22,
    50:  1.10,
    80:  1.00,
    100: 0.91,
    120: 0.79,
    130: 0.72,
    150: 0.62,
  }
  return base[kmh] ?? 1.0
}

function calcStyleFactor(style: string, temp: number): number {
  const isExtreme = temp < 0 || temp > 35
  const factors: Record<string, { normal: number; extreme: number }> = {
    eco:     { normal: 1.15, extreme: 1.08 },
    normal:  { normal: 1.00, extreme: 1.00 },
    highway: { normal: 0.95, extreme: 0.92 },
    sport:   { normal: 0.78, extreme: 0.70 },
  }
  return factors[style]?.[isExtreme ? 'extreme' : 'normal'] ?? 1.0
}

function calcHvacFactor(mode: string, temp: number): number {
  if (mode === 'off') return 1.0
  if (mode === 'heat') {
    if (temp < -10) return 0.72
    if (temp < 0)   return 0.78
    if (temp < 10)  return 0.85
    return 0.92
  }
  // AC
  if (temp > 35) return 0.86
  if (temp > 28) return 0.90
  return 0.95
}

function calcLoadFactor(passengers: number, cargo: string): number {
  // Each extra 75 kg ≈ -1 % range; cargo: 0/25/75/150 kg
  const passengerWeight = (passengers - 1) * 75
  const cargoWeight = { none: 0, light: 20, medium: 75, heavy: 150 }[cargo] ?? 0
  const totalKg = passengerWeight + cargoWeight
  return Math.max(0.85, 1 - totalKg * 0.00014)
}

function calcTerrainFactor(terrain: string): number {
  return { flat: 1.0, hilly: 0.91, mountainous: 0.80 }[terrain] ?? 1.0
}

function calcWindFactor(wind: string): number {
  return { none: 1.0, lightHead: 0.94, strongHead: 0.85, tailwind: 1.06 }[wind] ?? 1.0
}

function calculateResult(s: CalculatorSettings, baseRange: number, batteryKwh: number): CalculatorResult {
  const factors = {
    temperature:   calcTempFactor(s.temperature),
    speed:         calcSpeedFactor(s.speed),
    style:         calcStyleFactor(s.drivingStyle, s.temperature),
    hvac:          calcHvacFactor(s.hvac, s.temperature),
    load:          calcLoadFactor(s.passengers, s.cargo),
    terrain:       calcTerrainFactor(s.terrain),
    wind:          calcWindFactor(s.wind),
    batteryHealth: s.batteryHealth / 100,
  }

  const totalFactor = Object.values(factors).reduce((a, b) => a * b, 1)
  const estimatedRange = Math.round(baseRange * totalFactor)
  const effectiveConsumption = Math.round((batteryKwh / estimatedRange) * 100 * 10) / 10
  const percentOfWltp = Math.round(totalFactor * 100)

  let chargingStops = 0
  let totalChargingTimeMin = 0
  if (s.tripDistance > 0 && estimatedRange > 0) {
    // Assume 20% remaining battery at stop, charge to 80%
    const usablePerLeg = estimatedRange * 0.8
    const legs = Math.ceil(s.tripDistance / usablePerLeg)
    chargingStops = Math.max(0, legs - 1)
    // Rough charge time: ~30 min per stop for 150 kW fast charger
    totalChargingTimeMin = chargingStops * 30
  }

  return { estimatedRange, effectiveConsumption, percentOfWltp, chargingStops, totalChargingTimeMin, factors }
}

/* ─── Animated number ──────────────────────────────────────────── */
function AnimNum({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    prevRef.current = value
    const start = performance.now()
    let raf: number
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (value - from) * e))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{display}</>
}

/* ─── Circular SVG gauge ──────────────────────────────────────── */
function CircleGauge({ percent, range }: { percent: number; range: number }) {
  const { translateText: tx } = useLanguage()
  const r = 88
  const cx = 110
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(circ * (percent / 100), circ))
  const colorMap = percent >= 85 ? '#10b981' : percent >= 65 ? '#00d4ff' : percent >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <svg width={220} height={220} viewBox="0 0 220 220" aria-label={`${range} km ${tx('Estimated Real-World Range')} `}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border-inner)" strokeWidth={12} />

      {/* Progress arc */}
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke="url(#gaugeGrad)"
        strokeWidth={12}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        filter="url(#glow)"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.25,.46,.45,.94)' }}
      />

      {/* Center text */}
      <text x={cx} y={cx - 12} textAnchor="middle" fill="var(--text-primary)" fontSize={38}
        fontWeight="700" fontFamily="Space Grotesk, sans-serif">
        {range}
      </text>
      <text x={cx} y={cx + 14} textAnchor="middle" fill="var(--text-muted)" fontSize={14}
        fontFamily="Inter, sans-serif">
        km
      </text>
      <text x={cx} y={cx + 34} textAnchor="middle" fontSize={11}
        fontFamily="Space Grotesk" fontWeight={600}
        fill={colorMap}>
        {percent}% {tx('of WLTP')}
      </text>
    </svg>
  )
}

/* ─── Factor row ───────────────────────────────────────────────── */
function FactorRow({ label, value, ideal = 1 }: { label: string; value: number; ideal?: number }) {
  const pct = Math.round((value / (ideal * 1.3)) * 100)
  const diff = Math.round((value - 1) * 100)
  const color = value >= 1 ? 'var(--accent)' : value >= 0.88 ? 'var(--primary)' : value >= 0.72 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-32 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex-1 factor-bar-track">
        <div className="factor-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold w-14 text-right font-mono" style={{ color }}>
        {diff >= 0 ? '+' : ''}{diff}%
      </span>
    </div>
  )
}

/* ─── Slider with label ────────────────────────────────────────── */
function LabeledSlider({
  label, icon: Icon, value, min, max, step = 1,
  display, gradient, onChange,
}: {
  label: string; icon: typeof Zap; value: number; min: number; max: number;
  step?: number; display: string; gradient: string; onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
          <Icon size={13} />
          {label}
        </div>
        <span className="text-xs font-bold font-mono" style={{ color: 'var(--primary)' }}>{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ background: `linear-gradient(to right, ${gradient} ${pct}%, var(--slider-empty) ${pct}%)` }}
      />
    </div>
  )
}

/* ─── Choice row ───────────────────────────────────────────────── */
function Choices<T extends string>({
  label, icon: Icon, options, value, onChange,
}: {
  label: string; icon: typeof Zap; value: T
  options: { value: T; label: string; desc?: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
        <Icon size={13} />
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.desc}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              fontFamily: 'Space Grotesk',
              background: value === opt.value ? 'rgba(0,212,255,0.15)' : 'var(--chip-inactive-bg)',
              border: `1px solid ${value === opt.value ? 'rgba(0,212,255,0.45)' : 'var(--chip-inactive-border)'}`,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────────── */
const DEFAULTS: CalculatorSettings = {
  carId: null,
  temperature: 20,
  speed: 120,
  drivingStyle: 'normal',
  hvac: 'off',
  passengers: 1,
  cargo: 'none',
  terrain: 'flat',
  wind: 'none',
  batteryHealth: 100,
  tripDistance: 0,
}

export default function RangeCalculator() {
  const { cars } = useApp()
  const { translateText: tx } = useLanguage()
  const [s, setS] = useState<CalculatorSettings>(DEFAULTS)

  const selectedCar = cars.find(c => c.id === s.carId) ?? null

  const result: CalculatorResult | null = selectedCar
    ? calculateResult(s, selectedCar.rangeKm, selectedCar.batterySize)
    : null

  function set<K extends keyof CalculatorSettings>(key: K, val: CalculatorSettings[K]) {
    setS(prev => ({ ...prev, [key]: val }))
  }

  // Temperature gradient color
  const tempColor = s.temperature <= 0
    ? '#5bc8ff'
    : s.temperature <= 20
    ? `hsl(${200 - s.temperature * 4}, 80%, 60%)`
    : `hsl(${s.temperature > 35 ? 0 : 200 - (s.temperature - 20) * 10}, 80%, 60%)`

  return (
    <div className="mt-10 animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.2),rgba(139,92,246,0.2))', border: '1px solid rgba(0,212,255,0.3)' }}
          >
            <Gauge size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h2 className="section-title">{tx('Range Calculator')}</h2>
          </div>
        </div>
        <div className="section-line" />
        <p className="mt-4 text-sm max-w-xl" style={{ color: 'var(--text-secondary)' }}>
          {tx('Advanced multi-variable range estimator. Configure real-world conditions to predict your actual driving range with high accuracy.')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── LEFT PANEL: Settings ─────────────────────── */}
        <div className="xl:col-span-3 flex flex-col gap-4">

          {/* Vehicle select */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
              <Zap size={12} className="inline mr-1.5" style={{ verticalAlign: 'middle' }} />
              {tx('SELECT VEHICLE')}
            </label>
            <select
              value={s.carId ?? ''}
              onChange={e => set('carId', e.target.value ? +e.target.value : null)}
              className="input-field"
            >
              <option value="">— {tx('Choose a vehicle')} —</option>
              {[...cars].sort((a, b) =>
                `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
              ).map(c => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.model} — {c.description} ({c.rangeKm} km WLTP)
                </option>
              ))}
            </select>

            {/* Quick car info */}
            {selectedCar && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)' }}>
                <img
                  src={selectedCar.image}
                  alt={selectedCar.model}
                  className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div className="flex gap-4 text-xs">
                  <div><p style={{ color: 'var(--text-muted)' }}>WLTP</p><p className="font-bold font-mono" style={{ color: 'var(--primary)' }}>{selectedCar.rangeKm} km</p></div>
                  <div><p style={{ color: 'var(--text-muted)' }}>{tx('Battery')}</p><p className="font-bold font-mono" style={{ color: 'var(--secondary)' }}>{selectedCar.batterySize} kWh</p></div>
                  <div><p style={{ color: 'var(--text-muted)' }}>{tx('Efficiency')}</p><p className="font-bold font-mono" style={{ color: 'var(--accent)' }}>{((selectedCar.batterySize / selectedCar.rangeKm) * 100).toFixed(1)} kWh/100</p></div>
                </div>
              </div>
            )}
          </div>

          {/* Conditions */}
          <div className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="col-span-full text-xs font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {tx('Environmental Conditions')}
            </div>

            {/* Temperature */}
            <div className="col-span-full">
              <LabeledSlider
                label={tx('Ambient Temperature')}
                icon={Thermometer}
                value={s.temperature}
                min={-30} max={45} step={1}
                display={`${s.temperature}°C`}
                gradient={tempColor}
                onChange={v => set('temperature', v)}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>-30°C ❄️</span>
                <span>0°C</span>
                <span>20°C ✓</span>
                <span>45°C 🔥</span>
              </div>
            </div>

            {/* Speed */}
            <div className="col-span-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
                  <Gauge size={13} />
                  {tx('Average Speed')}
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: 'var(--primary)' }}>{s.speed} km/h</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[30, 50, 80, 100, 120, 130, 150].map(spd => (
                  <button
                    key={spd}
                    onClick={() => set('speed', spd)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: s.speed === spd ? 'rgba(0,212,255,0.15)' : 'var(--chip-inactive-bg)',
                      border: `1px solid ${s.speed === spd ? 'rgba(0,212,255,0.45)' : 'var(--chip-inactive-border)'}`,
                      color: s.speed === spd ? 'var(--primary)' : 'var(--text-secondary)',
                      fontFamily: 'Space Grotesk',
                    }}
                  >
                    {spd} km/h
                  </button>
                ))}
              </div>
            </div>

            {/* Wind */}
            <Choices
              label={tx('Wind Conditions')}
              icon={Wind}
              value={s.wind}
              options={[
                { value: 'none',       label: tx('No Wind') },
                { value: 'tailwind',   label: `↓ ${tx('Tailwind')}`, desc: '+6% range' },
                { value: 'lightHead',  label: `↑ ${tx('Light Headwind')}`, desc: '-6%' },
                { value: 'strongHead', label: `↑↑ ${tx('Strong Headwind')}`, desc: '-15%' },
              ]}
              onChange={v => set('wind', v)}
            />

            {/* Terrain */}
            <Choices
              label={tx('Terrain')}
              icon={Mountain}
              value={s.terrain}
              options={[
                { value: 'flat',         label: `🏙 ${tx('Flat')}` },
                { value: 'hilly',        label: `⛰ ${tx('Hilly')}`, desc: '-9%' },
                { value: 'mountainous',  label: `🏔 ${tx('Mountain')}`, desc: '-20%' },
              ]}
              onChange={v => set('terrain', v)}
            />
          </div>

          {/* Driving & load */}
          <div className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="col-span-full text-xs font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {tx('Driving Style & Load')}
            </div>

            {/* Driving style */}
            <Choices
              label={tx('Driving Style')}
              icon={Gauge}
              value={s.drivingStyle}
              options={[
                { value: 'eco',     label: '🍃 Eco',    desc: '+15% range' },
                { value: 'normal',  label: `🚗 ${tx('Normal')}` },
                { value: 'highway', label: `🛣 ${tx('Highway')}`, desc: '-5%' },
                { value: 'sport',   label: '🏎 Sport',   desc: '-22%' },
              ]}
              onChange={v => set('drivingStyle', v)}
            />

            {/* HVAC */}
            <Choices
              label={tx('Climate Control (HVAC)')}
              icon={Thermometer}
              value={s.hvac}
              options={[
                { value: 'off',  label: tx('Off') },
                { value: 'heat', label: `🔥 ${tx('Heat')}`, desc: 'Up to -28%' },
                { value: 'ac',   label: `❄️ ${tx('A/C')}`,  desc: 'Up to -14%' },
              ]}
              onChange={v => set('hvac', v)}
            />

            {/* Passengers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
                  <Users size={13} />
                  {tx('Passengers')}
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: 'var(--primary)' }}>{s.passengers}</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => set('passengers', n)}
                    className="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: s.passengers === n ? 'rgba(0,212,255,0.15)' : 'var(--chip-inactive-bg)',
                      border: `1px solid ${s.passengers === n ? 'rgba(0,212,255,0.45)' : 'var(--chip-inactive-border)'}`,
                      fontFamily: 'Space Grotesk',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Cargo */}
            <Choices
              label={tx('Cargo Load')}
              icon={Package}
              value={s.cargo}
              options={[
                { value: 'none',   label: tx('None') },
                { value: 'light',  label: tx('Light (~20 kg)') },
                { value: 'medium', label: tx('Medium (~75 kg)') },
                { value: 'heavy',  label: tx('Heavy (~150 kg)') },
              ]}
              onChange={v => set('cargo', v)}
            />
          </div>

          {/* Battery & trip */}
          <div className="rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="col-span-full text-xs font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {tx('Battery & Trip Planning')}
            </div>

            {/* Battery health */}
            <div className="col-span-full">
              <LabeledSlider
                label={tx('Battery State of Health')}
                icon={Battery}
                value={s.batteryHealth}
                min={60} max={100} step={1}
                display={`${s.batteryHealth}%`}
                gradient={s.batteryHealth >= 90 ? 'var(--accent)' : s.batteryHealth >= 75 ? '#f59e0b' : '#ef4444'}
                onChange={v => set('batteryHealth', v)}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {tx('New = 100% • After 3 yrs ~90% • After 8 yrs ~80%')}
              </p>
            </div>

            {/* Trip distance */}
            <div className="col-span-full">
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
                <MapPin size={13} />
                {tx('Trip Distance (optional)')}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0} max={5000} step={10}
                  value={s.tripDistance || ''}
                  placeholder={tx('Enter trip distance in km...')}
                  onChange={e => set('tripDistance', +e.target.value || 0)}
                  className="input-field pr-14"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>km</span>
              </div>
            </div>
          </div>

          {/* Reset */}
          <button className="btn-ghost text-sm w-full" onClick={() => setS(DEFAULTS)}>
            {tx('Reset all settings')}
          </button>
        </div>

        {/* ── RIGHT PANEL: Results ─────────────────────── */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {!selectedCar ? (
            <div
              className="rounded-2xl flex flex-col items-center justify-center py-16 gap-4 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <Battery size={48} style={{ color: 'var(--text-muted)', opacity: 0.35 }} />
              <p className="font-display text-lg" style={{ color: 'var(--text-secondary)' }}>{tx('Select a vehicle')}</p>
              <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
                {tx('Choose a car from the dropdown to see your estimated real-world range.')}
              </p>
            </div>
          ) : result && (
            <>
              {/* Gauge */}
              <div
                className="rounded-2xl p-6 flex flex-col items-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
                  {tx('Estimated Real-World Range')}
                </p>
                <div className="animate-count-up">
                  <CircleGauge percent={result.percentOfWltp} range={result.estimatedRange} />
                </div>
                <div className="mt-4 w-full grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.12)' }}>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{tx('Consumption')}</p>
                    <p className="font-bold text-base font-mono" style={{ color: 'var(--primary)', fontFamily: 'Space Grotesk' }}>
                      {result.effectiveConsumption} kWh/100
                    </p>
                  </div>
                  <div className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.12)' }}>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>vs WLTP</p>
                    <p className={`font-bold text-base font-mono`}
                      style={{ color: result.percentOfWltp >= 80 ? 'var(--accent)' : result.percentOfWltp >= 60 ? '#f59e0b' : '#ef4444', fontFamily: 'Space Grotesk' }}>
                      {result.percentOfWltp >= 100 ? '+' : ''}{result.percentOfWltp - 100}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Factor breakdown */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
                  {tx('Factor Breakdown')}
                </p>
                <FactorRow label={tx('Temperature')} value={result.factors.temperature} />
                <FactorRow label={tx('Speed')} value={result.factors.speed} />
                <FactorRow label={tx('Driving Style')} value={result.factors.style} />
                <FactorRow label="HVAC" value={result.factors.hvac} />
                <FactorRow label={tx('Passengers & Cargo')} value={result.factors.load} />
                <FactorRow label={tx('Terrain')} value={result.factors.terrain} />
                <FactorRow label={tx('Wind')} value={result.factors.wind} />
                <FactorRow label={tx('Battery Health')} value={result.factors.batteryHealth} />

                <div className="mt-1 pt-3 border-t" style={{ borderColor: 'var(--border-inner)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>{tx('Combined Factor')}</span>
                    <span className="font-bold text-sm font-mono" style={{ color: result.percentOfWltp >= 80 ? 'var(--accent)' : result.percentOfWltp >= 60 ? '#f59e0b' : '#ef4444' }}>
                      ×{(result.percentOfWltp / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trip planner result */}
              {s.tripDistance > 0 && (
                <div
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--bg-card)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                    <MapPin size={11} className="inline mr-1" />
                    {tx('Trip')}: {s.tripDistance} km
                  </p>

                  {result.estimatedRange >= s.tripDistance ? (
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)' }}>
                        <span style={{ color: 'var(--accent)', fontSize: 10 }}>✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>{tx('No charging needed!')}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {tx('Estimated')} {Math.round(((result.estimatedRange - s.tripDistance) / result.estimatedRange) * 100)}% {tx('battery remaining on arrival.')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: 'var(--surface-inner)', border: '1px solid var(--border-inner)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx('Charging Stops')}</span>
                        <span className="font-bold text-lg font-mono" style={{ color: 'var(--primary)', fontFamily: 'Space Grotesk' }}>
                          {result.chargingStops}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: 'var(--surface-inner)', border: '1px solid var(--border-inner)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx('Est. Charging Time')}</span>
                        <span className="font-bold text-lg font-mono" style={{ color: '#f59e0b', fontFamily: 'Space Grotesk' }}>
                          ~{result.totalChargingTimeMin} min
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Info size={10} className="inline mr-1" />
                        {tx('Based on 150 kW fast charging, 20→80% per stop.')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Disclaimer */}
              <div className="rounded-xl p-3 flex items-start gap-2"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                <p className="text-xs leading-relaxed" style={{ color: '#d9a94b' }}>
                  {tx('Estimates are based on scientific EV efficiency models. Actual range varies by individual driving patterns, vehicle age, and local conditions.')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
