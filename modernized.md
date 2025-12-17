# Modernization Tasks

## Adopt Bun Tooling
- Replace the Node/npm dev workflow with Bun for faster installs and scripts; add a `bunfig.toml` mirroring current npm scripts and update CI workflows accordingly.
- Verify Bun compatibility for TypeScript build (tsc) and Jest; migrate to Bun test runners if coverage is comparable or add polyfills for unsupported APIs.

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
