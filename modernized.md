# Modernization Tasks

## Adopt Bun Tooling
- Install Bun (>=1.2.0 per `package.json` engines) and check in the generated `bun.lock` by running `bun install` so contributors have a canonical lockfile.
- Replace npm scripts with Bun equivalents in documentation and CI (e.g., `bun run build`, `bun test`); keep `package.json` scripts temporarily for downstream consumers until the migration is complete.
- Add a `bunfig.toml` capturing environment defaults (Node compatibility flags, test timeouts) and mirror the previous `npm` lifecycle semantics.
- Verify compatibility of TypeScript compilation, Jest/ts-jest (or Bun test runner + coverage), Release It, and Husky/Lefthook hooks; introduce shims if a dependency assumes the Node/npm CLI.
- Update contributor docs (README, AGENTS) to mention Bun installation, commonly used commands, and how to fall back to Node if required.

## Cache Integration Notes
- The client now supports an optional `Keyv` instance passed as the third constructor argument, enabling contributors to use Redis, SQLite, or other storage backends without prescribing a TTL policy.
- Document how cache keys are generated (URI + sorted params JSON) and outline expectations for invalidation so future modernization tasks (e.g., background revalidation, cache busting commands) can build on this foundation.

## Migrate ESLint/Prettier to Biome
- Remove ESLint + Prettier config files and dependencies, adding a project-level `biome.json` that replicates existing rules (4-space indent, single quotes, 120 column width).
- Update lint scripts (`package.json` or Bun equivalents) to run `biome lint`/`biome format`; ensure Husky/lint-staged (or Lefthook) triggers Biome on staged files.

## Replace Husky with Lefthook
- Remove Husky hooks and configs, installing Lefthook and adding a `.lefthook.yml` to run Biome, tests, and type-checks on `pre-commit`/`pre-push`.
- Update contributor docs (`README.md`, `AGENTS.md`) to describe running `lefthook install` and the enforced hooks.

## Configure Dependabot
- Add `.github/dependabot.yml` to monitor npm (or Bun), GitHub Actions, and dev tooling weekly; include reviewers and batching rules to reduce noise.
- Document the Dependabot policy (automerge vs manual review) in contributor guides.

## CI Refresh
- Update GitHub Actions to use Bun runners and Biome steps; ensure caches align with new tooling and add workflows for Dependabot PR checks.
- Enforce status checks for Biome lint, Bun tests, and Lefthook hook validation before merging.
