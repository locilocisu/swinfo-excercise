# AGENTS.md

Project-level instructions for AI coding agents working in this repository. See [README.md](./README.md) for full architecture and domain context.

## Commands
- **Dev server**: `npm start`
- **Unit tests (single run)**: `npx ng test --watch=false`
- **Production build**: `npm run build`
- Always run both `npx ng test --watch=false` and `npm run build` to verify changes before finishing a task.

## Architectural Guardrails
- **Service Anti-Corruption Layer (`src/app/core/services/swapi.service.ts`)**:
  - `SwapiService` normalizes all SWAPI responses inside `getByUrl()` **before** `shareReplay(1)` via `normalizeEntity()`, populating `id` and converting all relational URL fields into plain IDs.
  - Keep `getByUrl()` and `extractSwapiId()` `private`. Consumers must use `getCategoryList()`, `getCategoryItem()`, or the typed category methods (`getPeople()`, `getFilms()`, etc.) and must never parse SWAPI URLs in UI components.
  - When adding or modifying a SWAPI model in `src/app/core/models/swapi.models.ts`, update its corresponding normalizer in `SwapiService.normalizeEntity()`.
- **Template Formatting (`src/app/core/pipes/swapi-pipes.ts`)**:
  - Implement display formatters as pure standalone Angular pipes (`SwapiMetricPipe`, `EpisodeRomanPipe`, `AurebeshTextPipe`) rather than static utility classes or component methods.
  - Pass numeric strings from SWAPI through `swapiMetric` so placeholder strings (`"unknown"`, `"n/a"`, `"none"`) are handled safely.
- **State & UI (`src/app/features/character-datapad/`)**:
  - Use native Angular Signals (`signal`, `computed`, `effect`) and standalone Angular Material components.
  - Keep loading and error states isolated per section (`Species`, `Homeworld`, `Films`, `Starships`, `Vehicles`).
  - Decorative Aurebesh text must retain `aria-hidden="true"` and be hidden when the underlying value is `"unknown"` or `"unspecified"`.

## Git Conventions
- Use Conventional Commits (`feat(scope): ...`, `refactor(scope): ...`, `docs(scope): ...`).
- Keep the top summary line brief; only add a bulleted body when non-obvious rationale isn't already clear from the diff.
