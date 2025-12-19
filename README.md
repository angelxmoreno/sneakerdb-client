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
  filters: { field: 'releaseYear', operator: 'gte', value: 2019 }, // filterable fields: releaseDate, releaseYear, retailPrice, estimatedMarketValue
  sort: { field: 'retailPrice', order: 'desc' }, // allowed fields: name, silhouette, retailPrice, releaseDate, releaseYear
}).then(result => {
  if (result.success) {
    console.log(result.response);
  }
});

// Note: The Sneaker Database API currently accepts a single filter expression per request.
// Supported filter fields: releaseDate, releaseYear, retailPrice, estimatedMarketValue.
// Passing multiple filters or unsupported fields will cause the client (or API) to throw an "Invalid query parameter filters" error.
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

- The `.github/workflows/release.yml` workflow runs on every push to `main` (including Dependabot auto-merges) and executes tests, build, and `semantic-release` (using Node 22+ as required by v25).
- `semantic-release` determines the next version from Conventional Commit history, updates `CHANGELOG.md`, tags the repo, publishes to npm, and opens a GitHub Release.
- Enable npm Trusted Publishing for this repo (package settings → Publishing → GitHub Actions). No `NPM_TOKEN` secret is required—GitHub issues an OIDC token that npm trusts.
- `GITHUB_TOKEN` is provided automatically in CI. For local debugging, set `GITHUB_TOKEN` and run `bun run release -- --dry-run`.

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
