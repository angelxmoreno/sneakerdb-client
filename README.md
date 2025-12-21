# SneakerDB Client

[![Maintainability](https://qlty.sh/gh/angelxmoreno/projects/sneakerdb-client/maintainability.svg)](https://qlty.sh/gh/angelxmoreno/projects/sneakerdb-client)
[![Code Coverage](https://qlty.sh/gh/angelxmoreno/projects/sneakerdb-client/coverage.svg)](https://qlty.sh/gh/angelxmoreno/projects/sneakerdb-client)
[![codecov](https://codecov.io/gh/angelxmoreno/sneakerdb-client/graph/badge.svg?token=vhU44wLf2A)](https://codecov.io/gh/angelxmoreno/sneakerdb-client)
[![Build on Main](https://github.com/angelxmoreno/sneakerdb-client/actions/workflows/manual-build.yml/badge.svg)](https://github.com/angelxmoreno/sneakerdb-client/actions/workflows/manual-build.yml)
[![License](https://img.shields.io/github/license/angelxmoreno/sneakerdb-client?label=License)](https://github.com/angelxmoreno/sneakerdb-client/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/angelxmoreno/sneakerdb-client?label=Last%20Commit)](https://github.com/angelxmoreno/sneakerdb-client/commits/main)
[![dependencies](https://img.shields.io/librariesio/release/npm/sneakerdb-client?color=%23007a1f&style=flat-square)](https://libraries.io/npm/sneakerdb-client)

Node.js client for interacting with the Sneaker Database API.

See `AGENTS.md` for repository guidelines covering structure, workflows, and contributor conventions.

## Installation

```bash
npm install sneakerdb-client
```

## Usage

```ts
const { TheSneakerDatabaseClient } = require('sneakerdb-client');

// Create a client instance with your API key
const client = new TheSneakerDatabaseClient({ rapidApiKey: 'your-api-key' });

// Example: Get sneakers
client.getSneakers({ limit: 15 }).then(result => {
  if (result.success) {
    console.log(result.response);
  }
});

// Example: Filter and sort
client.getSneakers({
  brand: 'Jordan',
  releaseYear: '2025',
  filters: { field: 'retailPrice', operator: 'lte', value: 400 }, // filterable fields: releaseDate, releaseYear, retailPrice
  sort: { field: 'retailPrice', order: 'desc' }, // allowed fields: name, silhouette, retailPrice, releaseDate, releaseYear
}).then(result => {
  if (result.success) {
    console.log(result.response);
  }
});

// Note: The Sneaker Database API expects query parameters like `brand`, `gender`, or `releaseYear`
// directly on the URL, and comparison filters are sent using the field name plus an operator
// (e.g., `releaseYear=gte:2019` or `releaseDate=2024-08-21`). The `filters` helper above simply
// formats those query parameters for you and validates the allowed fields.
```

## Development

Run local tooling with [Bun](https://bun.sh/):

```bash
bun run build        # bun build + tsc --emitDeclarationOnly
bun lint             # Biome lint
bun lint:fix         # auto-fix with Biome
bun test             # Bun:test runner
bun test --coverage
# Run live RapidAPI checks (requires RAPID_API_KEY and RUN_E2E=true)
RUN_E2E=true RAPID_API_KEY=... bun test src/TheSneakerDatabaseClient.e2e.test.ts
```

Release builds run `bun run build`, which cleans `dist/`, bundles `src/index.ts` with `bun build`, and emits type declarations via `tsc --emitDeclarationOnly`.

### Automated releases

- `.github/workflows/release-please.yml` runs on every push to `main` (and via `workflow_dispatch`). The Release Please action keeps `.release-please-manifest.json` in sync with tags, opens a release PR with the changelog/package bumps, and tags `vX.Y.Z` once the PR merges.
- Enable npm Trusted Publishing for this repo (package settings → Publishing → GitHub Actions). No `NPM_TOKEN` secret is required—GitHub issues an OIDC token that npm trusts.
- `GITHUB_TOKEN` is provided automatically in CI. If you need to re-run Release Please manually, trigger the workflow from the Actions tab with the same token.

### Automated maintenance

- Dependabot runs weekly for npm dependencies and GitHub Actions.
- Successful Dependabot PRs are auto-merged once "Node.js CI with Codecov" passes, keeping tooling up to date.

### Static analysis & coverage

- Code Climate Quality integrations have been removed ahead of the July 18, 2025 sunset. Configure [Qlty](https://docs.qlty.sh/migration/guide) (via the `qlty` CLI and workspace gates) to restore maintainability/diff coverage checks once your workspace is provisioned.
- Until Qlty coverage uploads are wired in, Codecov remains the source of truth for coverage signals in CI.

## API
There are 4 methods available on the client instance:
- getSneakers: gets a list of sneakers based on the provided options.
- getSneakerById: gets a sneaker by its TheSneakerDatabase ID.
- getBrands: Gets the list of brands
- getGenders: get the list of genders
- search: search for sneakers based on the provided options.

For more information on the available options, please refer to the [API documentation](https://rapidapi.com/tg4-solutions-tg4-solutions-default/api/the-sneaker-database).
## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
