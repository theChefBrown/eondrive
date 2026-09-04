# eondrive
An EV database, comparison tool, range calculator, and Engineering Lab built with React, TypeScript, Vite, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Build the application with `npm run build` and execute the engineering model tests with `npm test`.

## Engineering Lab

The Engineering Lab estimates trip energy demand and a basic charging plan from the selected vehicle's battery capacity and WLTP range. It accepts journey distance, ambient temperature, average speed, passenger count, cargo mass, starting state of charge, desired arrival reserve, and charging power.

The calculation model is deliberately isolated from the React interface:

```text
src/domain/vehicle.ts            Vehicle validation and baseline consumption
src/domain/trip.ts               Trip-input validation
src/domain/charging.ts           Charger-input validation
src/services/energy-model.ts     Pure energy-demand model
src/services/route-planner.ts    Pure charging-plan model
src/components/EngineeringLab.tsx Input and results interface
```

### Model and assumptions

- Baseline consumption: `battery capacity / WLTP range x 100` in kWh/100 km.
- Usable battery capacity: 90% of nominal capacity.
- Consumption is multiplied by temperature, speed, passenger, and cargo factors.
- The reference condition is 20 C, 90 km/h, one passenger, and no cargo.
- A charging stop can add up to 60% of usable capacity. Charging time is energy added divided by charger power; it excludes tapering.

These results are planning estimates, not manufacturer values, route predictions, vehicle-control advice, or safety-critical guidance. They do not model elevation, wind, precipitation, tyre choice, traffic, battery temperature, regenerative braking, or real charger availability.

## Testing

The focused Vitest suite covers baseline trips, cold/high-speed/heavy-load penalties, insufficient initial charge, multiple charging stops, missing vehicle data, and invalid inputs.

```bash
npm test
```

## Data

Vehicle data is stored locally in `data/cars.json` and served to the React app from `public/cars.json`. Detailed per-model specifications are in `data/specs/` and `public/specs/`.
