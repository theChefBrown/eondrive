export interface ChargingInputs {
  chargerPowerKw: number
}

export interface ChargingValidationResult {
  inputs?: ChargingInputs
  errors: string[]
}

export function validateChargingInputs(input: ChargingInputs): ChargingValidationResult {
  if (!Number.isFinite(input.chargerPowerKw) || input.chargerPowerKw <= 0) {
    return { errors: ['Charger power must be greater than zero.'] }
  }
  return { inputs: input, errors: [] }
}