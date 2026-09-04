import { describe, expect, it } from 'vitest'
import { createChargingPlan } from './route-planner'
import { estimateTripEnergy } from './energy-model'

const vehicle = { id: 1, name: 'Test EV', batteryCapacityKwh: 80, wltpRangeKm: 400 }
const charging = { chargerPowerKw: 100 }

function estimateFor(distanceKm: number, startingSocPercent = 100) {
  const trip = { distanceKm, ambientTemperatureC: 20, averageSpeedKmh: 90, passengerCount: 1, cargoKg: 0, startingSocPercent, arrivalReservePercent: 10 }
  return { trip, estimate: estimateTripEnergy(vehicle, trip) }
}

describe('createChargingPlan', () => {
  it('does not add a stop when the starting charge covers the trip and reserve', () => {
    const { trip, estimate } = estimateFor(200)
    const plan = createChargingPlan(trip, charging, estimate)

    expect(plan.chargingRequired).toBe(false)
    expect(plan.chargingStops).toBe(0)
    expect(plan.finalSocPercent).toBeGreaterThanOrEqual(10)
  })

  it('plans charging for insufficient starting charge', () => {
    const { trip, estimate } = estimateFor(500)
    const plan = createChargingPlan(trip, charging, estimate)

    expect(plan.chargingRequired).toBe(true)
    expect(plan.energyToAddKwh).toBeCloseTo(35.2)
    expect(plan.chargingStops).toBe(1)
    expect(plan.totalChargingDurationMinutes).toBeCloseTo(21.12)
  })

  it('splits a long journey over multiple charging stops', () => {
    const { trip, estimate } = estimateFor(1000)
    const plan = createChargingPlan(trip, charging, estimate)

    expect(plan.chargingStops).toBeGreaterThan(1)
  })
})