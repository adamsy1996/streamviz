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

## Developer Certificate of Origin

All contributions must comply with the [Developer Certificate of Origin
1.1](./DCO.md). By adding a `Signed-off-by` line to each commit, you certify
that you have the right to submit the contribution under this project's
Apache-2.0 license.

Sign commits with:

```bash
git commit -s
```

The sign-off must use your real name and an email address you control:

```text
Signed-off-by: Your Name <your.email@example.com>
```

Pull requests containing unsigned commits may be asked to add the missing
sign-offs before they are merged.
