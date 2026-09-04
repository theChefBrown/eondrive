import { useState } from 'react'
import { AlertCircle, BatteryCharging, Calculator, FlaskConical, Route } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { ChargingInputs } from '../domain/charging'
import type { TripInputs } from '../domain/trip'
import { validateChargingInputs } from '../domain/charging'
import { validateTripInputs } from '../domain/trip'
import { createEngineeringVehicle } from '../domain/vehicle'
import { estimateTripEnergy } from '../services/energy-model'
import { createChargingPlan } from '../services/route-planner'
import { useLanguage } from '../context/LanguageContext'

const KM_PER_MILE = 1.609344
const KG_PER_POUND = 0.45359237

const DEFAULT_TRIP: TripInputs = {
  distanceKm: 300,
  ambientTemperatureC: 15,
  averageSpeedKmh: 100,
  passengerCount: 2,
  cargoKg: 40,
  startingSocPercent: 90,
  arrivalReservePercent: 15,
}

const DEFAULT_CHARGING: ChargingInputs = { chargerPowerKw: 150 }

function round(value: number, digits = 1) {
  return Number(value.toFixed(digits))
}

export default function EngineeringLab() {
  const { cars, loading, getEffectiveCar, unitSystem, setUnitSystem } = useApp()
  const { t } = useLanguage()
  const [carId, setCarId] = useState<number | null>(null)
  const [trip, setTrip] = useState<TripInputs>(DEFAULT_TRIP)
  const [charging, setCharging] = useState<ChargingInputs>(DEFAULT_CHARGING)
  const [showFormulae, setShowFormulae] = useState(false)

  const selectedCar = cars.find(car => car.id === carId)
  const effectiveCar = selectedCar ? getEffectiveCar(selectedCar) : null
  const vehicleResult = selectedCar
    ? createEngineeringVehicle({
      id: selectedCar.id,
      name: `${selectedCar.brand} ${selectedCar.model}`,
      batteryCapacityKwh: effectiveCar!.batterySize,
      wltpRangeKm: effectiveCar!.rangeKm,
    })
    : { errors: ['Select a vehicle to calculate a journey.'] }
  const tripResult = validateTripInputs(trip)
  const chargingResult = validateChargingInputs(charging)
  const errors = [...vehicleResult.errors, ...tripResult.errors, ...chargingResult.errors]
  const estimate = vehicleResult.vehicle && tripResult.inputs
    ? estimateTripEnergy(vehicleResult.vehicle, tripResult.inputs)
    : null
  const plan = estimate && tripResult.inputs && chargingResult.inputs
    ? createChargingPlan(tripResult.inputs, chargingResult.inputs, estimate)
    : null
  const isImperial = unitSystem === 'imperial'

  function setTripValue(key: keyof TripInputs, value: number) {
    setTrip(current => ({ ...current, [key]: value }))
  }

  return (
    <div className="pt-24 animate-fade-in">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
            <FlaskConical size={14} /> {t('simulationWorkspace')}
          </div>
          <h2 className="mt-1 text-3xl font-bold">{t('engineeringLab')}</h2>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('transparentJourney')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg p-1" style={{ background: 'var(--surface-inner)', border: '1px solid var(--border-inner)' }} aria-label="Units">
            <UnitPill active={!isImperial} label={t('km')} onClick={() => setUnitSystem('metric')} />
            <UnitPill active={isImperial} label={t('mi')} onClick={() => setUnitSystem('imperial')} />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('planningEstimate')}</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.4fr)]">
        <section className="glass rounded-lg p-5">
          <h3 className="flex items-center gap-2 font-semibold"><Calculator size={17} style={{ color: 'var(--primary)' }} /> {t('journeyInputs')}</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Field label={t('vehicle')}>
              <select className="input-field" value={carId ?? ''} disabled={loading} onChange={event => setCarId(event.target.value ? Number(event.target.value) : null)}>
                <option value="">{loading ? t('loadingVehicles') : t('selectEv')}</option>
                {[...cars].sort((left, right) => `${left.brand} ${left.model}`.localeCompare(`${right.brand} ${right.model}`)).map(car => (
                  <option key={car.id} value={car.id}>{car.brand} {car.model}</option>
                ))}
              </select>
            </Field>
            <NumberField label={t('journeyDistance')} unit={isImperial ? 'mi' : 'km'} value={trip.distanceKm} toDisplay={value => isImperial ? value / KM_PER_MILE : value} fromDisplay={value => isImperial ? value * KM_PER_MILE : value} onChange={value => setTripValue('distanceKm', value)} />
            <NumberField label={t('ambientTemperature')} unit={isImperial ? 'F' : 'C'} value={trip.ambientTemperatureC} toDisplay={value => isImperial ? (value * 9) / 5 + 32 : value} fromDisplay={value => isImperial ? ((value - 32) * 5) / 9 : value} onChange={value => setTripValue('ambientTemperatureC', value)} />
            <NumberField label={t('averageSpeed')} unit={isImperial ? 'mph' : 'km/h'} value={trip.averageSpeedKmh} toDisplay={value => isImperial ? value / KM_PER_MILE : value} fromDisplay={value => isImperial ? value * KM_PER_MILE : value} onChange={value => setTripValue('averageSpeedKmh', value)} />
            <NumberField label={t('passengers')} unit={t('people')} value={trip.passengerCount} onChange={value => setTripValue('passengerCount', value)} />
            <NumberField label={t('cargoLoad')} unit={isImperial ? 'lb' : 'kg'} value={trip.cargoKg} toDisplay={value => isImperial ? value / KG_PER_POUND : value} fromDisplay={value => isImperial ? value * KG_PER_POUND : value} onChange={value => setTripValue('cargoKg', value)} />
            <NumberField label={t('startingCharge')} unit="%" value={trip.startingSocPercent} onChange={value => setTripValue('startingSocPercent', value)} />
            <NumberField label={t('arrivalReserve')} unit="%" value={trip.arrivalReservePercent} onChange={value => setTripValue('arrivalReservePercent', value)} />
            <NumberField label={t('chargerPower')} unit="kW" value={charging.chargerPowerKw} onChange={value => setCharging({ chargerPowerKw: value })} />
          </div>
        </section>

        <section className="glass rounded-lg p-5">
          <h3 className="flex items-center gap-2 font-semibold"><Route size={17} style={{ color: 'var(--accent)' }} /> {t('energyPlan')}</h3>
          {errors.length > 0 ? (
            <div className="mt-5 rounded-lg border p-4" style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
              <div className="flex gap-2 text-sm font-semibold" style={{ color: '#fca5a5' }}><AlertCircle size={17} /> Calculation needs attention</div>
              <ul className="mt-2 list-disc pl-5 text-sm" style={{ color: 'var(--text-secondary)' }}>{errors.map(error => <li key={error}>{error}</li>)}</ul>
            </div>
          ) : estimate && plan ? (
            <>
              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
                <Metric label={t('adjustedConsumption')} value={`${round(isImperial ? estimate.adjustedConsumptionKwhPer100Km / (1 / KM_PER_MILE) : estimate.adjustedConsumptionKwhPer100Km)} kWh/100${isImperial ? 'mi' : 'km'}`} />
                <Metric label={t('usableBattery')} value={`${round(estimate.usableBatteryCapacityKwh)} kWh`} />
                <Metric label={t('expectedRange')} value={`${round(isImperial ? estimate.expectedRangeKm / KM_PER_MILE : estimate.expectedRangeKm)} ${isImperial ? 'mi' : 'km'}`} />
                <Metric label={t('tripEnergy')} value={`${round(estimate.tripEnergyRequiredKwh)} kWh`} />
                <Metric label={t('finalCharge')} value={`${round(plan.finalSocPercent)}%`} />
                <Metric label={t('chargingStops')} value={String(plan.chargingStops)} accent={plan.chargingRequired ? '#f59e0b' : 'var(--accent)'} />
                <Metric label={t('vehiclePrice')} value={isImperial ? `$${effectiveCar!.priceUsd.toLocaleString()}` : `EUR ${effectiveCar!.priceEur.toLocaleString()}`} />
              </div>
              <div className="mt-5 rounded-lg p-4" style={{ background: 'var(--surface-inner)', border: '1px solid var(--border-inner)' }}>
                <div className="flex items-center gap-2 text-sm font-semibold"><BatteryCharging size={17} style={{ color: 'var(--primary)' }} /> {plan.chargingRequired ? t('chargingRequired') : t('noChargingRequired')}</div>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Add {round(plan.energyToAddKwh)} kWh across {plan.chargingStops} stop{plan.chargingStops === 1 ? '' : 's'}; estimated total charging time: {round(plan.totalChargingDurationMinutes)} minutes at {charging.chargerPowerKw} kW.
                </p>
              </div>
              <button className="btn-ghost mt-5 w-full justify-between" onClick={() => setShowFormulae(current => !current)} aria-expanded={showFormulae}>
                {t('assumptions')} <span>{showFormulae ? t('hide') : t('show')}</span>
              </button>
              {showFormulae && <FormulaDetails estimate={estimate} />}
            </>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}><span className="mb-1.5 block">{label}</span>{children}</label>
}

function NumberField({ label, unit, value, toDisplay = value => value, fromDisplay = value => value, onChange }: { label: string; unit: string; value: number; toDisplay?: (value: number) => number; fromDisplay?: (value: number) => number; onChange: (value: number) => void }) {
  return <Field label={label}><div className="relative"><input className="input-field number-input pr-20" type="number" value={round(toDisplay(value), 2)} onChange={event => onChange(fromDisplay(Number(event.target.value)))} /><span className="pointer-events-none absolute right-3 top-3 text-xs" style={{ color: 'var(--text-muted)' }}>{unit}</span></div></Field>
}

function UnitPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="rounded-md px-3 py-1.5 text-xs font-bold transition-colors" style={{ background: active ? 'var(--primary)' : 'transparent', color: active ? '#001019' : 'var(--text-secondary)' }}>{label}</button>
}

function Metric({ label, value, accent = 'var(--primary)' }: { label: string; value: string; accent?: string }) {
  return <div className="rounded-lg p-3" style={{ background: 'var(--surface-inner)', border: '1px solid var(--border-inner)' }}><div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div><div className="mt-1 font-mono text-lg font-bold" style={{ color: accent }}>{value}</div></div>
}

function FormulaDetails({ estimate }: { estimate: ReturnType<typeof estimateTripEnergy> }) {
  const factors = Object.entries(estimate.factors).map(([name, value]) => `${name} x ${round(value, 3)}`).join(' x ')
  return <div className="mt-3 rounded-lg p-4 text-xs leading-6" style={{ background: 'var(--surface-inner)', color: 'var(--text-secondary)', border: '1px solid var(--border-inner)' }}>
    <p>Baseline consumption = battery capacity / WLTP range x 100.</p>
    <p>Adjusted consumption = baseline x {factors}.</p>
    <p>Usable capacity uses a {estimate.assumptions.usableCapacityRatio * 100}% battery window. Temperature penalty is {estimate.assumptions.temperaturePenaltyPerDegree * 100}% per degree from {estimate.assumptions.referenceTemperatureC} C; speed penalty is {estimate.assumptions.speedPenaltyPerTenKmh * 100}% per 10 km/h from {estimate.assumptions.referenceSpeedKmh} km/h.</p>
    <p>Each charge stop assumes a maximum usable addition of 60% of usable capacity. Charging duration excludes charger tapering, traffic, elevation, wind, driving style, and route conditions.</p>
  </div>
}