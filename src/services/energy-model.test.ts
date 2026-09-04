import { describe, expect, it } from 'vitest'
import { createEngineeringVehicle } from '../domain/vehicle'
import { validateTripInputs } from '../domain/trip'
import { validateChargingInputs } from '../domain/charging'
import { estimateTripEnergy } from './energy-model'

const vehicle = createEngineeringVehicle({ id: 1, name: 'Test EV', batteryCapacityKwh: 80, wltpRangeKm: 400 }).vehicle!
const normalTrip = validateTripInputs({
  distanceKm: 100,
  ambientTemperatureC: 20,
  averageSpeedKmh: 90,
  passengerCount: 1,
  cargoKg: 0,
  startingSocPercent: 90,
  arrivalReservePercent: 10,
}).inputs!

describe('estimateTripEnergy', () => {
  it('calculates a baseline normal journey', () => {
    const result = estimateTripEnergy(vehicle, normalTrip)

    expect(result.baselineConsumptionKwhPer100Km).toBe(20)
    expect(result.adjustedConsumptionKwhPer100Km).toBe(20)
    expect(result.tripEnergyRequiredKwh).toBe(20)
    expect(result.expectedRangeKm).toBe(360)
  })

  it('increases consumption for cold weather, higher speed, passengers, and cargo', () => {
    const result = estimateTripEnergy(vehicle, {
      ...normalTrip,
      ambientTemperatureC: -10,
      averageSpeedKmh: 130,
      passengerCount: 4,
      cargoKg: 200,
    })

    expect(result.adjustedConsumptionKwhPer100Km).toBeGreaterThan(20)
    expect(result.expectedRangeKm).toBeLessThan(360)
    expect(result.factors.temperature).toBeGreaterThan(1)
    expect(result.factors.speed).toBeGreaterThan(1)
  })
})

describe('domain validation', () => {
  it('rejects incomplete vehicle data and invalid trip values', () => {
    expect(createEngineeringVehicle({ id: 2, name: '', batteryCapacityKwh: 0, wltpRangeKm: 0 }).errors).toHaveLength(3)
    expect(validateTripInputs({ ...normalTrip, distanceKm: -1, cargoKg: -5, startingSocPercent: 110 }).errors).not.toHaveLength(0)
    expect(validateChargingInputs({ chargerPowerKw: 0 }).errors).not.toHaveLength(0)
  })
})