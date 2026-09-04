import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Grid2X2, List } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { FilterState } from '../types'
import CarCard from './CarCard'
import FilterPanel from './FilterPanel'
import { useLanguage } from '../context/LanguageContext'

const INITIAL_FILTERS: FilterState = {
  makes: [],
  priceMax: 250000,
  rangeMin: 0,
  sortBy: '',
  searchQuery: '',
  driveType: 'All',
}

const PAGE_SIZE_OPTIONS = [25, 35, 50] as const
type ViewMode = 'grid' | 'list'

export default function CarGrid() {
  const { cars, loading } = useApp()
  const { translateText: tx } = useLanguage()
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(25)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const filtered = useMemo(() => {
    let list = [...cars]

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      list = list.filter(c =>
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      )
    }
    if (filters.makes.length > 0) {
      list = list.filter(c => filters.makes.includes(c.brand))
    }
    if (filters.priceMax < 250000) {
      list = list.filter(c => c.priceEur <= filters.priceMax)
    }
    if (filters.rangeMin > 0) {
      list = list.filter(c => c.rangeKm >= filters.rangeMin)
    }
    if (filters.driveType !== 'All') {
      list = list.filter(c => c.description.includes(filters.driveType))
    }

    if (filters.sortBy === 'range-desc') list.sort((a, b) => b.rangeKm - a.rangeKm)
    else if (filters.sortBy === 'range-asc') list.sort((a, b) => a.rangeKm - b.rangeKm)
    else if (filters.sortBy === 'price-asc') list.sort((a, b) => a.priceEur - b.priceEur)
    else if (filters.sortBy === 'price-desc') list.sort((a, b) => b.priceEur - a.priceEur)
    else if (filters.sortBy === 'battery-desc') list.sort((a, b) => b.batterySize - a.batterySize)
    else if (filters.sortBy === 'name-asc') list.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`))

    return list
  }, [cars, filters])

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleFilterChange(f: FilterState) {
    setFilters(f)
    setPage(1)
  }

  function handlePageSizeChange(nextPageSize: (typeof PAGE_SIZE_OPTIONS)[number]) {
    setPageSize(nextPageSize)
    setPage(1)
  }

  // Build page numbers to show
  function pageNumbers() {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (safePage > 3) pages.push('...')
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i)
      if (safePage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="mt-4">
      <FilterPanel filters={filters} onChange={handleFilterChange} />

      {/* Header row */}
      <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">
            {tx('EV Database')}
          </h2>
          <div className="section-line" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {loading ? tx('Loading...') : `${filtered.length} ${tx('vehicles')}`}
          </p>
          <div className="inline-flex overflow-hidden rounded-lg" style={{ border: '1px solid var(--border-subtle)' }}>
            <button
              className="p-2 transition-colors"
              onClick={() => setViewMode('list')}
              aria-label={tx('List view')}
              aria-pressed={viewMode === 'list'}
              title={tx('List view')}
              style={{ background: viewMode === 'list' ? 'var(--primary)' : 'var(--bg-card)', color: viewMode === 'list' ? '#00131a' : 'var(--text-muted)' }}
            >
              <List size={17} />
            </button>
            <button
              className="p-2 transition-colors"
              onClick={() => setViewMode('grid')}
              aria-label={tx('Grid view')}
              aria-pressed={viewMode === 'grid'}
              title={tx('Grid view')}
              style={{ background: viewMode === 'grid' ? 'var(--primary)' : 'var(--bg-card)', color: viewMode === 'grid' ? '#00131a' : 'var(--text-muted)' }}
            >
              <Grid2X2 size={17} />
            </button>
          </div>
          <select
            aria-label={tx('Vehicles per page')}
            value={pageSize}
            onChange={event => handlePageSizeChange(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
            className="h-9 rounded-lg px-2 text-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            {PAGE_SIZE_OPTIONS.map(option => <option key={option} value={option}>{option} / {tx('page')}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ height: 400, border: '1px solid var(--border-subtle)' }}>
              <div className="skeleton h-full" />
            </div>
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-5xl">🔍</div>
          <p className="font-display text-xl" style={{ color: 'var(--text-secondary)' }}>{tx('No vehicles match your filters')}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{tx('Try adjusting or clearing your filters')}</p>
          <button className="btn-ghost mt-2" onClick={() => handleFilterChange(INITIAL_FILTERS)}>
            {tx('Clear all filters')}
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:max-w-[90%] lg:mx-auto' : 'flex flex-col gap-3'}>
          {paginated.map((car, i) => (
            <div
              key={car.id}
              className="animate-slide-up"
              style={{ animationDelay: `${(i % pageSize) * 0.03}s`, animationFillMode: 'both' }}
            >
              <CarCard car={car} viewMode={viewMode} priority={i < (viewMode === 'grid' ? 3 : 2)} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10">
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            style={{ opacity: safePage === 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>

          {pageNumbers().map((n, i) =>
            n === '...'
              ? <span key={`e${i}`} className="page-btn" style={{ cursor: 'default', pointerEvents: 'none' }}>…</span>
              : (
                <button
                  key={n}
                  className={`page-btn ${safePage === n ? 'active' : ''}`}
                  onClick={() => setPage(n as number)}
                >
                  {n}
                </button>
              )
          )}

          <button
            className="page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            style={{ opacity: safePage === totalPages ? 0.4 : 1 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
