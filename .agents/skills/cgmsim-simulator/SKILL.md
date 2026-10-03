---
name: cgmsim-simulator
description: >-
  Use this skill when modifying, extending, or debugging diabetic simulation algorithms, physiological models (UVA/Hovorka), insulin/carb kinetics, or CGM data generation in cgmsim-lib.
---

# CGMSim Simulator Engine Guide

This skill details how to work with the core simulation engines in `cgmsim-lib`.

## Core Components Architecture

1. **`CGMSIMsimulator.ts` & `UVAsimulator.ts`**
   - Receives patient parameters (`patient`), treatment inputs (`bolus`, `basal`, `carbs`), physical events (`exercise`), and environmental factors (`alcohol`, `cortisone`).
   - Runs time-series iteration to generate glucose levels (`sgv`), trend arrows, active insulin on board (`IOB`), active carbs on board (`COB`), and delta changes.

2. **Runge-Kutta Differential Equations (`SolverRK.ts`)**
   - Solves non-linear ordinary differential equations (ODEs) for compartmental insulin and glucose transport.

3. **Subsystem Modules**
   - `carbs.ts`: Multi-phase gut absorption kinetics.
   - `bolus.ts` & `basal.ts`: Subcutaneous insulin absorption models.
   - `physical.ts`: Heart rate and physical activity impact on insulin sensitivity and non-insulin-mediated glucose uptake.
   - `alcohol.ts`: Hepatic gluconeogenesis inhibition.
   - `cortisone.ts`: Temporary insulin resistance modeling.

## Workflow for Adding or Modifying Features

1. **Update Types:** Define any new patient parameters or event inputs in `src/Types.ts`.
2. **Implement Logic:** Add or update calculations in the corresponding module (e.g. `src/drug.ts` or `src/carbs.ts`).
3. **Integrate in Main Engine:** Update `CGMSIMsimulator.ts` or `UVAsimulator.ts` to pass new parameters to sub-modules.
4. **Add Unit Tests:** Create or update unit tests in `test/` (e.g., `test/simulator.test.ts`).
5. **Verify Stability:** Run tests to confirm physiological outputs remain realistic and free of numerical divergence:
   ```bash
   cmd /c npm test
   ```
