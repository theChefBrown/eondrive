export interface CarTrim {
  name: string
  batterySize: number
  rangeKm: number
  rangeMiles: number
  priceEur: number
  priceUsd: number
}

export interface Car {
  id: number
  brand: string
  model: string
  description: string
  rangeKm: number
  rangeMiles: number
  batterySize: number
  year: number
  priceEur: number
  priceUsd: number
  image: string
  specFile: string
  discontinued?: boolean
  trims?: CarTrim[]
}

export interface Specification {
  [category: string]: {
    [spec: string]: string
  }
}

export interface CarSpecs {
  id: number
  specifications: Specification
}

export interface FilterState {
  makes: string[]
  priceMax: number
  rangeMin: number
  sortBy: string
  searchQuery: string
  driveType: string
}

export type UnitSystem = 'metric' | 'imperial'

export type Theme = 'dark' | 'light'

export type ActiveSection = 'cars' | 'compare' | 'calculator' | 'engineering-lab'

export interface CalculatorSettings {
  carId: number | null
  temperature: number
  speed: number
  drivingStyle: 'eco' | 'normal' | 'highway' | 'sport'
  hvac: 'off' | 'heat' | 'ac'
  passengers: number
  cargo: 'none' | 'light' | 'medium' | 'heavy'
  terrain: 'flat' | 'hilly' | 'mountainous'
  wind: 'none' | 'lightHead' | 'strongHead' | 'tailwind'
  batteryHealth: number
  tripDistance: number
}

export interface CalculatorResult {
  estimatedRange: number
  effectiveConsumption: number
  percentOfWltp: number
  chargingStops: number
  totalChargingTimeMin: number
  factors: {
    temperature: number
    speed: number
    style: number
    hvac: number
    load: number
    terrain: number
    wind: number
    batteryHealth: number
  }
}
