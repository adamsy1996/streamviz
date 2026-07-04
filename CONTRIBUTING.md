# Contributing

Thanks for improving `streamviz`.

## Development

From the repository root:

```bash
npm install
npm run typecheck
npm run build
```

## Design Rules

- Keep protocol, core, and renderer concerns separate.
- Do not add host-app dependencies to the package.
- Treat generated widget code as untrusted input.
- Keep React as a peer dependency.
- Prefer small public APIs with explicit host adapters.

## Pull Requests

Before opening a PR:

- Run typecheck and build.
- Add or update docs for public API changes.
- Update `CHANGELOG.md` for user-visible changes.
