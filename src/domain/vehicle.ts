export interface EngineeringVehicle {
  id: number
  name: string
  batteryCapacityKwh: number
  wltpRangeKm: number
}

export interface VehicleValidationResult {
  vehicle?: EngineeringVehicle
  errors: string[]
}

export function createEngineeringVehicle(input: EngineeringVehicle): VehicleValidationResult {
  const errors: string[] = []

  if (!input.name.trim()) errors.push('Vehicle name is required.')
  if (!Number.isFinite(input.batteryCapacityKwh) || input.batteryCapacityKwh <= 0) {
    errors.push('Vehicle battery capacity must be greater than zero.')
  }
  if (!Number.isFinite(input.wltpRangeKm) || input.wltpRangeKm <= 0) {
    errors.push('Vehicle WLTP range must be greater than zero.')
  }

  return errors.length ? { errors } : { vehicle: input, errors }
}

export function baselineConsumptionKwhPer100Km(vehicle: EngineeringVehicle): number {
  return (vehicle.batteryCapacityKwh / vehicle.wltpRangeKm) * 100
}