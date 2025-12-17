# SneakerDB Client


[![Maintainability](https://api.codeclimate.com/v1/badges/b6ea0145e62b94aec72f/maintainability)](https://codeclimate.com/github/angelxmoreno/sneakerdb-client/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b6ea0145e62b94aec72f/test_coverage)](https://codeclimate.com/github/angelxmoreno/sneakerdb-client/test_coverage)
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
const client = new TheSneakerDatabaseClient('your-api-key');

// Example: Get sneakers
client.getSneakers({ limit: 5 }).then(response => {
  console.log(response);
});
```

## Development

Run local tooling with [Bun](https://bun.sh/):

```bash
bun run build   # compile TypeScript to dist/
bun test        # execute Bun:test
bun test --coverage
```

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
