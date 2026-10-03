---
name: refactor-library
description: >-
  Use this skill when refactoring TypeScript modules, updating exported signatures, restructuring imports/exports, or preparing a release for cgmsim-lib.
---

# Library Refactoring & Release Preparation Guide

This skill provides guidelines for refactoring code inside `cgmsim-lib` while preserving backwards compatibility for consumers.

## Guidelines

1. **Exports Verification:**
   - Ensure all public-facing classes, functions, and interfaces are re-exported in `src/index.ts`.
   - Avoid breaking changes to interface signatures in `src/Types.ts` without explicit migration paths.

2. **Refactoring Checklist:**
   - [ ] Check usage across `src/` to ensure internal consumers are updated.
   - [ ] Run `cmd /c npm run lint` to catch unused imports or formatting issues.
   - [ ] Run `cmd /c npm test` to verify zero regression in test suites.
   - [ ] Run `cmd /c npm run build` to confirm TypeScript compilation succeeds cleanly.
   - [ ] Run `cmd /c npm run doc` to update API reference documentation.
