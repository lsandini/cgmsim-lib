# cgmsim-lib

![example workflow](https://github.com/lsandini/cgmsim-lib/actions/workflows/update-dist.yml/badge.svg)

![Branches](./badges/coverage-branches.svg)
![Functions](./badges/coverage-functions.svg)
![Lines](./badges/coverage-lines.svg)
![Statements](./badges/coverage-statements.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

# CGMSim Diabetic Patient Simulation Library

<img src="https://cgmsim.com/auth/images/pigscout_white75.gif" alt="Library Logo" width="75" style="max-width: 100%;">

A TypeScript library for simulating diabetic patient data and scenarios. This library provides functionalities to generate realistic continuous glucose monitoring (CGM) data, insulin dosages, and other relevant parameters for diabetic patient simulations.

## Features

- **CGM Data Generation:** Simulate realistic continuous glucose monitoring data over time.
- **Insulin (bolus/basal) Dosage Simulation:** Model insulin dosages and their effects on blood glucose levels.
- **Physical Activity Simulation:** Introduce simulations of various physical activities and their impact on glucose levels.
- **Alcohol Consumption Simulation:** Model the effects of alcohol consumption on blood glucose levels.
- **Corticosteroid Therapy Simulation:** Simulate the impact of cortisone therapy on glucose regulation.

## Configure npm registry

Create a .npmrc file in the root of your project and add the following lines:

```bash
@lsandini:registry=https://npm.pkg.github.com
```

## Installation

```bash
npm install @lsandini/cgmsim-lib
```

## Documentation

[Types definition](doc/README.md)
