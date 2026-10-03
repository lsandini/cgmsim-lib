# Testing & Code Coverage Guidelines

## Test Framework & Tools

- **Framework:** Jest (`jest`) with `ts-jest` preset.
- **Custom Environment:** `jest.customEnv.js` (handles Node environment context variables `dirBase`, `fileBase`, `extBase`).
- **Snapshot Testing:** `jest-image-snapshot` for D3 visualization output tests (`test/d3/`).

## Verification Rules

1. **Running Tests:**
   - Execute all tests: `cmd /c npm test`
   - Run a single test file: `npx jest test/bolus.test.ts`
   - Update image snapshots if SVG/D3 rendering intentionally changes: `npx jest -u`

2. **Coverage Enforcement:**
   - Global code coverage must remain at or above **80%**.
   - Do not delete, skip, or disable tests to bypass coverage checks.

3. **Diagnosing Test Failures:**
   - Inspect full error logs and stack trace prior to editing code.
   - Trace mathematical divergence back to specific simulation steps if a numerical assertion fails.
