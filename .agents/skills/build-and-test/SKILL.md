---
name: build-and-test
description: >-
  Use this skill when compiling, running unit tests, linting, formatting code, or checking code coverage for cgmsim-lib.
---

# Build and Test Workflow for cgmsim-lib

This skill provides step-by-step instructions for running tests, static analysis, building the distribution bundle, and validating quality gates for `cgmsim-lib`.

## Steps

### 1. Run Unit Tests & Check Coverage
Execute the Jest test suite:
```bash
cmd /c npm test
```
*Expected Result:* All 19+ test suites pass with >80% line coverage summary.

### 2. Lint and Format Code
Check code for ESLint errors:
```bash
cmd /c npm run lint
```
Auto-format TypeScript source files:
```bash
cmd /c npm run format
```

### 3. Build Distribution Bundle
Compile TypeScript to JavaScript (`dist/` directory):
```bash
cmd /c npm run build
```
*Expected Result:* `dist/index.js` and declaration files `dist/*.d.ts` generated without compiler errors.

### 4. Generate API Documentation (Optional)
Generate standard TypeDoc documentation:
```bash
cmd /c npm run doc
```
Output will be generated under `doc/`.
