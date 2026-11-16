# Atlas — Country Search

A TypeScript country explorer with live search, immediate request cancellation,
debounce, timeout handling and accessible country details.

- [Deployment](https://xmasfoxy.github.io/country-search/)
- [Assignment](https://github.com/rolling-scopes-school/tasks/blob/master/fullstack-engineering/tasks/country-search/README.md)
- [Architecture and design](./DESIGN.md)

## Local development

Requires Node.js 24 and npm.

```sh
npm ci
npm test
npm run lint
npm run build
npx --yes serve dist
```

Open the URL printed by the static server. The application calls
`https://countries.dev/name/{query}` directly; no key or backend is needed.
Search requires network access. Flags are loaded from the API's HTTPS URLs.

`npm run format` formats source files. `npm test` runs Vitest once with mocked
network requests and fake timers. `npm run build` compiles ES modules using `tsc`
and copies the static entry point and stylesheet to `dist/`.

GitHub Pages serves the compiled application from the `gh-pages` branch. Run
lint, tests and compilation before publishing `dist/` to that branch. The current
GitHub token cannot create Actions workflows, so deployment uses the branch-based
Pages builder. Leave the `country-search` PR into `main` unmerged.
