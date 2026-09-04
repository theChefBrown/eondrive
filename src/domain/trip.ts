export interface TripInputs {
  distanceKm: number
  ambientTemperatureC: number
  averageSpeedKmh: number
  passengerCount: number
  cargoKg: number
  startingSocPercent: number
  arrivalReservePercent: number
}

export interface TripValidationResult {
  inputs?: TripInputs
  errors: string[]
}

export function validateTripInputs(input: TripInputs): TripValidationResult {
  const errors: string[] = []
  const requiredPositive: Array<[keyof TripInputs, string]> = [
    ['distanceKm', 'Journey distance'],
    ['averageSpeedKmh', 'Average speed'],
    ['passengerCount', 'Passenger count'],
  ]

  for (const [key, label] of requiredPositive) {
    if (!Number.isFinite(input[key]) || input[key] <= 0) errors.push(`${label} must be greater than zero.`)
  }
  if (!Number.isFinite(input.ambientTemperatureC)) errors.push('Ambient temperature must be a number.')
  if (!Number.isFinite(input.cargoKg) || input.cargoKg < 0) errors.push('Cargo load cannot be negative.')
  if (!isPercent(input.startingSocPercent)) errors.push('Starting state of charge must be between 0 and 100%.')
  if (!isPercent(input.arrivalReservePercent)) errors.push('Arrival reserve must be between 0 and 100%.')
  if (input.arrivalReservePercent > input.startingSocPercent) {
    errors.push('Arrival reserve cannot exceed the starting state of charge.')
  }

  return errors.length ? { errors } : { inputs: input, errors }
}

function isPercent(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100
}