# CGMSim-Lib - Antigravity Agent Guidelines

Welcome to `@lsandini/cgmsim-lib`, a core TypeScript library for simulating diabetic patient data (continuous glucose monitoring, insulin absorption, carbohydrate kinetics, physical activity, alcohol, cortisone, and physiological solvers).

## Project Overview

- **Package Name:** `@lsandini/cgmsim-lib`
- **Main Entrypoint:** `src/index.ts` -> `dist/index.js`
- **Target Runtime:** Node.js `>= 16.0.0`
- **Language & Compiler:** TypeScript (`tsconfig.json`, `tsconfig-build.json`)
- **Key Dependencies:** D3, Pino, Moment, Node-Fetch, JSDOM, Sharp

---

## Workspace Rules & Development Standards

### 1. Verification Commands
Always verify changes using the following commands:
- **Run Unit Tests:** `cmd /c npm test` (or `npx jest`)
- **Build Production Bundle:** `cmd /c npm run build`
- **Lint Codebase:** `cmd /c npm run lint`
- **Format Code:** `cmd /c npm run format`
- **Generate TypeDoc Documentation:** `cmd /c npm run doc`

> **Note on Windows Shell:** On Windows environments, run npm commands via `cmd /c npm <script>` or directly via `npx` to prevent PowerShell execution policy restrictions.

### 2. Code & Typing Rules
- **Language & Communication:** All written code comments, TypeDoc docstrings, commit messages, and technical communications MUST be in English.
- **Strict TypeScript:** Prefer explicit types over `any`. All exported functions and interfaces must be typed and documented.
- **API Preservation:** `cgmsim-lib` is consumed by downstream apps (`cgmsim-runner-ui`, cloud services). Preserve public exported signatures in `src/index.ts` and `src/Types.ts`.
- **Pure & Deterministic Simulation Logic:** Ensure numerical stability and determinism in simulation functions (`SolverRK.ts`, `CGMSIMsimulator.ts`, `UVAsimulator.ts`).

### 3. Testing Requirements
- Maintain code coverage above the 80% global line threshold specified in `jest.config.js`.
- Always run `cmd /c npm test` after modifying logic in `src/`.
- Do NOT delete or comment out existing tests or assertions to pass tests.

---

## Sub-Rules & Skills

- Rules: See [.agents/rules/](file:///.agents/rules) for granular guidelines.
  - [typescript-and-style.md](file:///.agents/rules/typescript-and-style.md)
  - [simulation-models.md](file:///.agents/rules/simulation-models.md)
  - [testing-and-coverage.md](file:///.agents/rules/testing-and-coverage.md)
- Skills: See [.agents/skills/](file:///.agents/skills) for runbooks and workflows.
  - [build-and-test](file:///.agents/skills/build-and-test/SKILL.md)
  - [cgmsim-simulator](file:///.agents/skills/cgmsim-simulator/SKILL.md)
  - [refactor-library](file:///.agents/skills/refactor-library/SKILL.md)
