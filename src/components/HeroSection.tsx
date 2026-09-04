import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Pause, Play, Zap, Battery, TrendingUp, FlaskConical } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const prog = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - prog, 3)
      setVal(Math.round(target * eased))
      if (prog < 1) requestAnimationFrame(step)
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return <>{val.toLocaleString()}</>
}

export default function HeroSection() {
  const { cars, loading, setActiveSection } = useApp()
  const { t, translateText: tx } = useLanguage()
  const [visualPaused, setVisualPaused] = useState(false)
  const [isLoopTransition, setIsLoopTransition] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (visualPaused) video.pause()
    else void video.play().catch(() => setVisualPaused(true))
  }, [visualPaused])

  function restartCinematic() {
    const video = videoRef.current
    if (!video) return
    setIsLoopTransition(true)
    window.setTimeout(() => {
      video.currentTime = 0
      void video.play()
      setIsLoopTransition(false)
    }, 450)
  }

  const brands = new Set(cars.map(c => c.brand)).size
  const maxRange = Math.max(...(cars.length ? cars.map(c => c.rangeKm) : [0]))
  const avgEfficiency = cars.length
    ? Math.round(cars.reduce((s, c) => s + (c.batterySize / c.rangeKm) * 100, 0) / cars.length * 10) / 10
    : 0

  return (
    <section
      className="hero-section relative pt-32 pb-20 overflow-hidden"
      style={{ minHeight: 'clamp(560px, 80vh, 820px)' }}
    >
      {/* Background layers */}
      <div className="hero-bg absolute inset-0" />
      <video ref={videoRef} className={`hero-cinematic ${isLoopTransition ? 'is-transitioning' : ''}`} src="/videos/hero/ev-cinematic.mp4" autoPlay muted playsInline onEnded={restartCinematic} aria-label="Electric vehicle cinematic" />
      <div className="hero-cinematic-tint" />
      <div className="grid-overlay" />

      {/* Glowing orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 65%)',
          top: '-100px',
          left: '-80px',
          filter: 'blur(2px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 65%)',
          bottom: '-60px',
          right: '-60px',
          filter: 'blur(2px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl animate-slide-up">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.25)',
              color: 'var(--primary)',
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
            <Zap size={11} />
            {t('heroTag')}
          </div>

          <h1
            className="font-display font-bold leading-none mb-5"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', letterSpacing: '-0.03em' }}
          >
                <span style={{ color: 'var(--text-primary)' }}>{t('driveThe')}</span>{' '}
                <span className="gradient-text">{t('electric')}</span>
            <br />
                <span style={{ color: 'var(--text-primary)' }}>{t('future')}</span>
          </h1>

          <p className="mb-8 text-base sm:text-lg leading-relaxed max-w-2xl"
            style={{ color: 'var(--text-secondary)' }}>
            {t('heroLead')}
          </p>

          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => setActiveSection('cars')}>
              <Zap size={15} />
              {t('browseEvs')}
            </button>
            <button className="btn-secondary" onClick={() => setActiveSection('calculator')}>
              <Battery size={15} />
              {t('rangeCalculator')}
            </button>
            <button className="btn-ghost" onClick={() => setActiveSection('engineering-lab')}>
              <FlaskConical size={15} />
              {t('engineeringLab')}
            </button>
          </div>
        </div>

        <button className="hero-visual-control" onClick={() => setVisualPaused(value => !value)} title={visualPaused ? 'Play animation' : 'Pause animation'} aria-label={visualPaused ? 'Play animation' : 'Pause animation'}>
          {visualPaused ? <Play size={15} /> : <Pause size={15} />}
        </button>

        {/* Stats row */}
        <div className="mt-12 flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="stat-pill">
            <span className="font-display font-bold text-2xl" style={{ color: 'var(--primary)' }}>
              {loading ? '—' : <AnimatedCounter target={cars.length} />}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('electricVehicles')}</span>
          </div>
          <div className="stat-pill">
            <span className="font-display font-bold text-2xl" style={{ color: 'var(--secondary)' }}>
              {loading ? '—' : <AnimatedCounter target={brands} />}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('evBrands')}</span>
          </div>
          <div className="stat-pill">
            <span className="font-display font-bold text-2xl gradient-text">
              {loading ? '—' : <><AnimatedCounter target={maxRange} />km</>}
            </span>
            <span className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <TrendingUp size={11} />
              {t('maxWltpRange')}
            </span>
          </div>
          <div className="stat-pill">
            <span className="font-display font-bold text-2xl" style={{ color: 'var(--accent)' }}>
              {loading ? '—' : <>{avgEfficiency}<span className="text-sm font-normal"> kWh/100km</span></>}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('averageEfficiency')}</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-14 flex justify-start pl-2">
          <button
            onClick={() => {
              document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="flex flex-col items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Scroll down"
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
              {tx('Explore')}
            </span>
            <ChevronDown
              size={20}
              style={{ color: 'var(--primary)', animation: 'float 2s ease-in-out infinite' }}
            />
          </button>
        </div>
      </div>
    </section>
  )
}
