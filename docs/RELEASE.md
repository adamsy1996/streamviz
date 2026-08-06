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

The `check` command also imports the built public entrypoints and verifies the exported CSS and model-facing markdown asset paths.
It also runs the headless Chrome iframe runtime test. Set `CHROME_PATH` if Chrome is not installed in a standard location.

5. Test in a host app before publishing.

6. Build the production website if it is being deployed:

```bash
npm run site:build
```

7. Deploy `apps/web/out` through the `streamviz site` GitHub Actions workflow if the website should update with this release.

8. Prefer GitHub trusted publishing with npm provenance. If publishing manually, use:

```bash
npm publish --access public --provenance
```

The package is ESM-only.
