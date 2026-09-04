import type { ChargingInputs } from '../domain/charging'
import type { TripInputs } from '../domain/trip'
import type { EnergyEstimate } from './energy-model'

export interface ChargingPlan {
  chargingRequired: boolean
  energyToAddKwh: number
  chargingStops: number
  totalChargingDurationMinutes: number
  finalSocPercent: number
  arrivalReservePercent: number
}

export function createChargingPlan(
  trip: TripInputs,
  charging: ChargingInputs,
  estimate: EnergyEstimate,
): ChargingPlan {
  const initialEnergyKwh = estimate.usableBatteryCapacityKwh * (trip.startingSocPercent / 100)
  const requiredArrivalEnergyKwh = estimate.usableBatteryCapacityKwh * (trip.arrivalReservePercent / 100)
  const totalRequiredEnergyKwh = estimate.tripEnergyRequiredKwh + requiredArrivalEnergyKwh
  const energyToAddKwh = Math.max(0, totalRequiredEnergyKwh - initialEnergyKwh)
  const maximumEnergyPerStopKwh = estimate.usableBatteryCapacityKwh * 0.6
  const chargingStops = energyToAddKwh === 0 ? 0 : Math.ceil(energyToAddKwh / maximumEnergyPerStopKwh)
  const totalChargingDurationMinutes = (energyToAddKwh / charging.chargerPowerKw) * 60
  const finalEnergyKwh = initialEnergyKwh + energyToAddKwh - estimate.tripEnergyRequiredKwh

  return {
    chargingRequired: energyToAddKwh > 0,
    energyToAddKwh,
    chargingStops,
    totalChargingDurationMinutes,
    finalSocPercent: Math.max(0, (finalEnergyKwh / estimate.usableBatteryCapacityKwh) * 100),
    arrivalReservePercent: trip.arrivalReservePercent,
  }
}