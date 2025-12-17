# Repository Guidelines

## Project Structure & Module Organization
Source TypeScript lives in `src/`, with `TheSneakerDatabaseClient.ts` exposing the SDK, `interfaces.ts` for shared types, `utils.ts` for helpers, and `index.ts` re-exporting public modules. Jest specs such as `src/TheSneakerDatabaseClient.test.ts` stay next to their targets using `*.test.ts`. Builds emit to `dist/`; treat it as disposable output, while repository-level configs at the root drive tooling.

## Build, Test, and Development Commands
- `npm run build` – compile with `tsc` into `dist/`.
- `npm test` – execute Jest via ts-jest in Node.
- `npm run test:coverage` – generate coverage summary before PRs.
- `npm run lint` / `npm run lint:fix` – enforce ESLint + Prettier; Husky runs lint-staged.
- `npm run release` – use release-it to bump version/tag; only on clean `main`.

## Coding Style & Naming Conventions
Target Node 18+ and TypeScript strict rules enforced by ESLint’s `universe` preset. Prettier formats with 4-space indent, single quotes, trailing commas, semicolons, and 120-character wraps; do not mix custom styles. Classes stay PascalCase, functions camelCase, exported constants UPPER_SNAKE_CASE, and public APIs should be surfaced through `src/index.ts`.

## Testing Guidelines
Add unit specs alongside code using `*.test.ts`. Use Jest + ts-jest with `axios-mock-adapter` to stub HTTP so tests stay offline. Run `npm test` before commits and `npm run test:coverage` for PRs, keeping new logic within existing coverage expectations shown by badges (~90%).

## Commit & Pull Request Guidelines
Commitlint enforces Conventional Commits; follow patterns like `feat(client): add brand filter` or `fix(utils): guard null`. Squash local WIP, then push review-ready branches with lint/test output included in the PR description plus linked issues and screenshots for README changes. Mention configuration shifts (env vars, release scripts) and request review only after CI passes.

## Security & Configuration Tips
Load RapidAPI keys through environment variables (e.g., `.env` consumed via `dotenv`) and keep secrets out of Git. Validate payloads with the interfaces module before sending requests, and rerun `npm run build` after dependency bumps to confirm compatibility.
