# Physiological Simulation Models & Mathematical Conventions

## Domain Architecture

`cgmsim-lib` models diabetic patient physiology, continuous glucose monitoring (CGM), and treatment dynamics.

### Core Modules & Simulation Components
- **`CGMSIMsimulator.ts` & `UVAsimulator.ts`:** Main entry points for calculating glucose trajectories over time.
- **`SolverRK.ts`:** 4th order Runge-Kutta numerical differential equation solver.
- **`carbs.ts` / `bolus.ts` / `basal.ts`:** Pharmacokinetics / pharmacodynamics (PK/PD) for carbohydrate absorption and insulin activity (basal, rapid-acting bolus, long-acting insulins such as Degludec, Detemir, Glargine, Toujeo).
- **`physical.ts` / `alcohol.ts` / `cortisone.md` / `drug.ts`:** Secondary physiological influences affecting insulin sensitivity or hepatic glucose output.
- **`sgv.ts` / `arrows.ts`:** Sensor Glucose Value (SGV) calculation, noise addition, and trend arrow computation.

## Simulation Guidelines

1. **Numerical Precision & Stability:**
   - Numerical integration must maintain step sizes appropriate for physiological stability.
   - Avoid non-deterministic random state generation without seed or reproducible configuration where test expectations rely on deterministic outputs.

2. **Data Structure Consistency:**
   - Time representation: Ensure consistency between ISO strings (`TypeDateISO.ts`) and epoch timestamps (ms/seconds).
   - Units: Glucose levels in `mg/dL`, insulin in `Units (U)`, carbs in `grams (g)`.

3. **Modifying Equations:**
   - Any change to physiological equations (e.g., insulin sensitivity multipliers, clearance rates, absorption half-lives) must be regression-tested against reference scenario snapshots.
