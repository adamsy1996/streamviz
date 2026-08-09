# Release Checklist

1. Update `version` in `package.json`.
2. Update `CHANGELOG.md`.
3. Run package checks:

```bash
npm run check
npm --cache /tmp/streamviz-npm-cache pack --dry-run
```

4. Verify the dry-run tarball contains:

- `dist/*.js`
- `dist/**/*.d.ts`
- `dist/visualize-widget-runtime.css`
- `dist/visualize-widget-utilities.css`
- `dist/styles.css`
- `src/protocol/visualize.readme.md`
- `README.md`
- `LICENSE`
- `NOTICE`
- `THIRD_PARTY_NOTICES.md`
- `CONTRIBUTING.md`
- `DCO.md`

The `check` command also imports the built public entrypoints and verifies the exported CSS and model-facing markdown asset paths.
It also runs the headless Chrome iframe runtime test. Set `CHROME_PATH` if Chrome is not installed in a standard location.

5. Test in a host app before publishing.

6. Build the production website if it is being deployed:

```bash
npm run site:build
```

7. Deploy `apps/web` as a Next.js server application and configure the selected provider key as a server-only environment variable if the website should update with this release.

8. Prefer GitHub trusted publishing. Trusted publishing uses short-lived OIDC
credentials and automatically generates npm provenance when the repository and
package are public. For an initial manual publication, use:

```bash
npm publish --access public
```

The `release.yml` GitHub Actions workflow is the package's trusted publisher.
Keep the npm trusted-publisher configuration aligned with that filename and
repository if either one changes.

The package is ESM-only.
