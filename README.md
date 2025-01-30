# cgmsim-lib

![example workflow](https://github.com/lsandini/cgmsim-lib/actions/workflows/update-dist.yml/badge.svg)
[![Quality Gate Status](https://sonar.cgmsim.com/api/project_badges/measure?project=lsandini_cgmsim-lib_dcb733af-979c-4bcd-88af-267d99139342&metric=alert_status&token=sqb_8348c08b04628f1043d15c2e83294a75d2a28e33)](https://sonar.cgmsim.com/dashboard?id=lsandini_cgmsim-lib_dcb733af-979c-4bcd-88af-267d99139342)

![Branches](./badges/coverage-branches.svg)
![Functions](./badges/coverage-functions.svg)
![Lines](./badges/coverage-lines.svg)
![Statements](./badges/coverage-statements.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

<img src="https://cgmsim.com/auth/images/pigscout_white75.gif" alt="Library Logo" width="75" style="max-width: 100%;">

# CGMSim Diabetic Patient Simulation Library

A TypeScript library for simulating diabetic patient data and scenarios. This library provides functionalities to generate realistic continuous glucose monitoring (CGM) data, insulin dosages, and other relevant parameters for diabetic patient simulations.

This library is used by the [CGMSIM v.3 cloud-based simulation](https://cgmsim.com), but can also be run locally using our [Runner application](https://github.com/lsandini/cgmsim-runner-ui) written with [Electron](https://www.electronjs.org/).

## Features🌟

- 📊 **CGM Data Generation:** Simulate realistic continuous glucose monitoring data over time.
- 💉 **Insulin (bolus/basal) Dosage Simulation:** Model insulin dosages and their effects on blood glucose levels.
- 🏃 **Physical Activity Simulation:** Introduce simulations of various physical activities and their impact on glucose levels.
- 🍺 **Alcohol Consumption Simulation:** Model the effects of alcohol consumption on blood glucose levels.
- 💊 **Corticosteroid Therapy Simulation:** Simulate the impact of cortisone therapy on glucose regulation.

## Installation 🚀

```bash
npm install @lsandini/cgmsim-lib
```

## Documentation 📚

[Types definition](doc/README.md)
