# Manual 2.0.0 Release Steps

1. Reset repo to 257a2d16420695642d38f8fb10c85057ca7e731b (already done).
2. Ensure working tree clean: `git status`.
3. Build artifacts: `bun run build`.
4. Bump version in package.json to 2.0.0 (using npm version or manual edit) and commit/tags if desired.
5. Publish manually: `npm publish` (or `bun publish`).
6. `git tag 2.0.0` (already done) and push tags: `git push origin 2.0.0`.
7. Create GitHub Release referencing tag 2.0.0.
