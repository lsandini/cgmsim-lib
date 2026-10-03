# TypeScript and Code Style Guidelines

## Coding Principles

1. **Language & Communication:**
   - All code comments, TypeDoc docstrings, commit messages, and technical communications MUST be written in English.

2. **TypeScript Best Practices:**
   - Use strict typing. Avoid `any` unless absolutely necessary (e.g. interacting with untyped legacy JS third-party libraries).
   - Export all types and interfaces from `src/Types.ts` or re-export via `src/index.ts`.
   - Prefer `readonly` for immutable configuration arrays or objects.

3. **Documentation & Comments:**
   - Write TypeDoc compliant comments (`/** ... */`) for exported functions, interfaces, and classes.
   - Retain mathematical formulas in comments when implementing physiological differential equations or absorption curves.

3. **Formatting & Linting:**
   - Run `cmd /c npm run format` to auto-format code with Prettier.
   - Run `cmd /c npm run lint` to enforce ESLint rules defined in `.eslintrc.js`.
