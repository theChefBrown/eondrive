import type { TripInputs } from '../domain/trip'
import { baselineConsumptionKwhPer100Km, type EngineeringVehicle } from '../domain/vehicle'

export interface EnergyAssumptions {
  usableCapacityRatio: number
  referenceTemperatureC: number
  referenceSpeedKmh: number
  passengerMassKg: number
  temperaturePenaltyPerDegree: number
  speedPenaltyPerTenKmh: number
  passengerPenaltyPer100Kg: number
  cargoPenaltyPer100Kg: number
}

export interface EnergyEstimate {
  baselineConsumptionKwhPer100Km: number
  adjustedConsumptionKwhPer100Km: number
  usableBatteryCapacityKwh: number
  tripEnergyRequiredKwh: number
  expectedRangeKm: number
  factors: {
    temperature: number
    speed: number
    passengers: number
    cargo: number
  }
  assumptions: EnergyAssumptions
}

export const DEFAULT_ENERGY_ASSUMPTIONS: EnergyAssumptions = {
  usableCapacityRatio: 0.9,
  referenceTemperatureC: 20,
  referenceSpeedKmh: 90,
  passengerMassKg: 75,
  temperaturePenaltyPerDegree: 0.012,
  speedPenaltyPerTenKmh: 0.06,
  passengerPenaltyPer100Kg: 0.015,
  cargoPenaltyPer100Kg: 0.01,
}

export function estimateTripEnergy(
  vehicle: EngineeringVehicle,
  trip: TripInputs,
  assumptions: EnergyAssumptions = DEFAULT_ENERGY_ASSUMPTIONS,
): EnergyEstimate {
  const temperatureDifference = Math.abs(trip.ambientTemperatureC - assumptions.referenceTemperatureC)
  const speedDifference = trip.averageSpeedKmh - assumptions.referenceSpeedKmh
  const passengerMassKg = Math.max(0, trip.passengerCount - 1) * assumptions.passengerMassKg

  const factors = {
    temperature: 1 + temperatureDifference * assumptions.temperaturePenaltyPerDegree,
    speed: Math.max(0.7, 1 + (speedDifference / 10) * assumptions.speedPenaltyPerTenKmh),
    passengers: 1 + (passengerMassKg / 100) * assumptions.passengerPenaltyPer100Kg,
    cargo: 1 + (trip.cargoKg / 100) * assumptions.cargoPenaltyPer100Kg,
  }
  const baselineConsumption = baselineConsumptionKwhPer100Km(vehicle)
  const adjustedConsumption = baselineConsumption * Object.values(factors).reduce((total, factor) => total * factor, 1)
  const usableBatteryCapacityKwh = vehicle.batteryCapacityKwh * assumptions.usableCapacityRatio

  return {
    baselineConsumptionKwhPer100Km: baselineConsumption,
    adjustedConsumptionKwhPer100Km: adjustedConsumption,
    usableBatteryCapacityKwh,
    tripEnergyRequiredKwh: (trip.distanceKm / 100) * adjustedConsumption,
    expectedRangeKm: (usableBatteryCapacityKwh / adjustedConsumption) * 100,
    factors,
    assumptions,
  }
}