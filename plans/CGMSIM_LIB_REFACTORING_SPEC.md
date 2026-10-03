# CGMSim-Lib Refactoring Specification: Core / NS Modularization

## 1. Executive Summary & Objective

This specification guides the refactoring of [**`cgmsim-lib`**](https://github.com/lsandini/cgmsim-lib) to separate the **pure physiological simulation engine** from the **Nightscout network I/O and server logging layer**.

### The Problem
Currently, `cgmsim-lib` bundles:
1. **Mathematical Simulation Engine**: Empirical OpenAPS/oref0 models, UVA/Padova ODE models, exponential IOB/COB calculation, trend arrow classifiers, physical activity modulation, and cortisone/alcohol effects.
2. **Nightscout & Node.js I/O Layer**: `node-fetch`, `pino`, `pino-pretty`, `@logtail/pino`, `ts-dotenv`, and Nightscout REST API endpoints (`downloads.ts`, `upload-notes.ts`).
3. **Tight Coupling**: Core calculation files (e.g., `CGMSIMsimulator.ts`) directly import `logger` from `utils.ts` and require Nightscout parameters (`user.nsUrl`).

This prevents local-first, on-device mobile applications (such as **`cgmsim-local`** built with Expo/React Native and Hermes) from importing the calculation engine without bundling heavy Node.js dependencies, broken polyfills, or unwanted network loggers.

### The Target Architecture
Split the library into two distinct subpath modules within `@lsandini/cgmsim-lib`:
- **`@lsandini/cgmsim-lib/core`**: Pure, deterministic, zero-dependency calculation engine runnable anywhere (React Native/Expo, Browser, Web Workers, Node.js, Cloudflare Workers).
- **`@lsandini/cgmsim-lib/ns`**: Nightscout integration, REST synchronization, and remote logger configuration.
- **`@lsandini/cgmsim-lib` (root)**: Backwards-compatible aggregator re-exporting both for existing consumers.

---

## 2. Target Directory Structure

```text
cgmsim-lib/
├── src/
│   ├── core/                          # PURE CALCULATION (Zero Node.js dependencies)
│   │   ├── index.ts                   # Core public exports
│   │   ├── types.ts                   # Core domain types (Patient, Treatment, Reading, Direction)
│   │   ├── simulator.ts               # Discrete-time simulation coordinator (refactored CGMSIMsimulator)
│   │   ├── bolus.ts                   # Exponential IOB & activity (oref0 formulas)
│   │   ├── basal.ts                   # Basal profiles, temporary basal rates, basal IOB
│   │   ├── carbs.ts                   # COB and carb absorption curves
│   │   ├── liver.ts                   # Endogenous liver glucose production & suppression
│   │   ├── arrows.ts                  # Dexcom/Abbott rate-of-change trend direction classifier
│   │   ├── physical.ts                # Step count & heart rate ISF modulations
│   │   ├── cortisone.ts               # Corticosteroid glucose spike & resistance
│   │   ├── alcohol.ts                 # Hepatic gluconeogenesis inhibition
│   │   ├── pump.ts                    # Insulin pump profile simulation & deviations
│   │   ├── sgv.ts                     # Single glucose value calculator
│   │   └── uva/                       # UVA/Padova compartmental differential equation model
│   │       ├── UVAsimulator.ts
│   │       └── lt1/
│   │
│   ├── ns/                            # NIGHTSCOUT & I/O LAYER (Node.js & Network)
│   │   ├── index.ts                   # NS public exports
│   │   ├── types.ts                   # Nightscout specific DTOs (DeviceStatus, OpenAPS, NSProfile)
│   │   ├── client.ts                  # Nightscout REST client
│   │   ├── downloads.ts               # Fetch entries, treatments, profiles
│   │   ├── uploads.ts                 # Upload notes, activities, device status
│   │   ├── adapters.ts                # Convert Nightscout DTOs <-> Core domain types
│   │   └── logger.ts                  # Pino / Logtail logger setup
│   │
│   └── index.ts                       # Root backwards-compatible barrel export
├── test/
│   ├── core/                          # Fast, deterministic unit tests (no network/mocks)
│   └── ns/                            # Integration tests with Nightscout mocks
├── package.json
└── tsconfig.json
```

---

## 3. Detailed Refactoring Tasks for the Agent

### Task 1: Decouple Core from Logging and Node Dependencies
1. **Remove `pino` and `ts-dotenv` from core**:
   - In `src/core/`, do NOT import `logger` from `utils.ts` or any Pino instance.
   - If debug information is needed, accept an optional logger interface in the parameters:
     ```typescript
     export interface SimulationLogger {
       debug?(message: string, ...args: unknown[]): void;
       info?(message: string, ...args: unknown[]): void;
       warn?(message: string, ...args: unknown[]): void;
       error?(message: string, ...args: unknown[]): void;
     }
     ```
     Default to a no-op function (`() => {}`).
2. **Remove `moment` from core calculation**:
   - Replace `moment` with native JavaScript `Date` or pure numeric timestamps (`timestamp.getTime()`, minute diffs).
   - Core math only needs minute deltas (`(t1 - t0) / 60000`). Native `Date` is standard and requires 0 dependencies.
3. **Isolate `node-fetch`**:
   - `node-fetch` must ONLY exist in `src/ns/` (or use global `fetch` supported natively in modern Node.js >= 18).

---

### Task 2: Standardize Core Domain Types (`src/core/types.ts`)
Create a clean domain model independent of Nightscout database schemas:

```typescript
export type Direction =
  | 'DoubleDown'
  | 'SingleDown'
  | 'FortyFiveDown'
  | 'Flat'
  | 'FortyFiveUp'
  | 'SingleUp'
  | 'DoubleUp'
  | 'NOT COMPUTABLE';

export interface CorePatient {
  isf: number; // Insulin Sensitivity Factor (mg/dL/U)
  cr: number; // Carb Ratio (g/U)
  dia: number; // Duration of Insulin Action (hours)
  tp: number; // Time to Peak insulin activity (minutes, e.g. 55-75)
  weight?: number;
  age?: number;
  gender?: 'male' | 'female';
}

export interface CoreTreatment {
  timestamp: Date | number;
  type: 'bolus' | 'carb' | 'basal' | 'cortisone' | 'alcohol' | 'note';
  units?: number; // Insulin units
  carbs?: number; // Grams of carbs
  durationMinutes?: number; // For temp basal or extended bolus
}

export interface CoreGlucoseEntry {
  timestamp: Date | number;
  sgv: number;
  direction?: Direction;
}

export interface CoreSimulationParams {
  patient: CorePatient;
  treatments: CoreTreatment[];
  recentEntries: CoreGlucoseEntry[];
  basalProfile: { hour: number; rate: number }[];
  stepsLast24h?: number;
  heartRateAvg?: number;
  targetTime?: Date | number;
  logger?: SimulationLogger;
}

export interface CoreSimulationResult {
  sgv: number;
  direction: Direction;
  deltaMinutes: number;
  iob: number;
  cob: number;
  activity: number;
  timestamp: number;
}
```

---

### Task 3: Nightscout Adapter Layer (`src/ns/adapters.ts`)
Map existing Nightscout JSON structures (e.g. `MealBolusTreatment`, `DeviceStatus`, `NSProfile`) into `CoreTreatment`, `CorePatient`, and `CoreGlucoseEntry`.
- Existing Nightscout sync functions (`downloads.ts`, `upload-notes.ts`) should call these adapters, execute `core/simulator`, and then upload results.

---

### Task 4: Configure Subpath Exports in `package.json`
Update `package.json` with modern Node & bundler export maps:

```json
{
  "name": "@lsandini/cgmsim-lib",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "/dist"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./core": {
      "types": "./dist/core/index.d.ts",
      "default": "./dist/core/index.js"
    },
    "./ns": {
      "types": "./dist/ns/index.d.ts",
      "default": "./dist/ns/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test:core": "jest test/core",
    "test:ns": "jest test/ns",
    "test": "jest --coverage",
    "format": "prettier --write 'src/**/*.ts'"
  }
}
```

Ensure `tsconfig.build.json` outputs the directory structure matching `dist/core/index.d.ts` and `dist/ns/index.d.ts`.

---

## 4. Verification Checklist for the Agent

1. [ ] **No Node Built-ins in Core**: Running `grep -r "node-fetch\|pino\|dotenv\|process\.env" src/core/` yields **0 results**.
2. [ ] **Isolated Unit Tests**: `npm run test:core` passes without any internet connection, mocked HTTP endpoints, or environment variables.
3. [ ] **Clean Build**: `npm run build` generates `dist/core/index.js` and `dist/core/index.d.ts`.
4. [ ] **React Native / Hermes Compatibility**: `dist/core/index.js` can be imported into an Expo SDK 57 project without requiring Node runtime polyfills.
5. [ ] **Backwards Compatibility**: Existing code importing `import simulator from '@lsandini/cgmsim-lib'` continues to function without breaking changes.

---

## 5. Integration Target in `cgmsim-local`

Once published or linked, `cgmsim-local` will consume the library as follows:

```typescript
// In cgmsim-local/store/useSimulationStore.ts or utils/glucoseSimulator.ts
import { 
  simulateGlucose, 
  calculateTrendArrow, 
  calculateExponentialIOB,
  calculateCOB 
} from '@lsandini/cgmsim-lib/core';

// 100% on-device local simulation:
const result = simulateGlucose({
  patient,
  treatments,
  recentEntries,
  basalProfile,
});
```
