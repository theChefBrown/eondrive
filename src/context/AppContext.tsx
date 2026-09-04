import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Car, CarSpecs, UnitSystem, ActiveSection, Theme } from '../types'

interface AppContextType {
  cars: Car[]
  loading: boolean
  unitSystem: UnitSystem
  setUnitSystem: (u: UnitSystem) => void
  theme: Theme
  setTheme: (t: Theme) => void
  selectedForCompare: Car[]
  toggleCompare: (car: Car) => void
  clearCompare: () => void
  modalCar: Car | null
  modalSpecs: CarSpecs | null
  openModal: (car: Car) => void
  closeModal: () => void
  activeSection: ActiveSection
  setActiveSection: (s: ActiveSection) => void
  trimSelections: Record<number, number>
  setCarTrim: (carId: number, trimIndex: number) => void
  getEffectiveCar: (car: Car) => Car
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
  const [theme, setThemeState] = useState<Theme>('dark')
  const [selectedForCompare, setSelectedForCompare] = useState<Car[]>([])
  const [modalCar, setModalCar] = useState<Car | null>(null)
  const [modalSpecs, setModalSpecs] = useState<CarSpecs | null>(null)
  const [activeSection, setActiveSection] = useState<ActiveSection>('cars')
  const [trimSelections, setTrimSelections] = useState<Record<number, number>>({})

  const setCarTrim = useCallback((carId: number, trimIndex: number) => {
    setTrimSelections(prev => ({ ...prev, [carId]: trimIndex }))
  }, [])

  const getEffectiveCar = useCallback((car: Car): Car => {
    const trimIdx = trimSelections[car.id] ?? 0
    const trim = car.trims?.[trimIdx]
    if (!trim) return car
    return {
      ...car,
      batterySize: trim.batterySize,
      rangeKm: trim.rangeKm,
      rangeMiles: trim.rangeMiles,
      priceEur: trim.priceEur,
      priceUsd: trim.priceUsd,
    }
  }, [trimSelections])

  // Apply theme class to <html> element
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
  }

  useEffect(() => {
    fetch('/cars.json')
      .then(r => r.json())
      .then((data: { cars: Car[] }) => {
        setCars(data.cars)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleCompare = useCallback((car: Car) => {
    setSelectedForCompare(prev => {
      const exists = prev.some(c => c.id === car.id)
      if (exists) return prev.filter(c => c.id !== car.id)
      if (prev.length >= 4) return prev
      return [...prev, car]
    })
  }, [])

  const clearCompare = useCallback(() => setSelectedForCompare([]), [])

  const openModal = useCallback(async (car: Car) => {
    setModalCar(car)
    setModalSpecs(null)
    try {
      const res = await fetch(`/specs/${car.specFile}`)
      if (res.ok) {
        const specs: CarSpecs = await res.json()
        setModalSpecs(specs)
      }
    } catch {
      // specs not available
    }
  }, [])

  const closeModal = useCallback(() => {
    setModalCar(null)
    setModalSpecs(null)
  }, [])

  return (
    <AppContext.Provider value={{
      cars, loading, unitSystem, setUnitSystem,
      theme, setTheme,
      selectedForCompare, toggleCompare, clearCompare,
      modalCar, modalSpecs, openModal, closeModal,
      activeSection, setActiveSection,
      trimSelections, setCarTrim, getEffectiveCar,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
