# Changelog

## Unreleased

- Replaced browser-dependent runtime system colors with a stable light/dark semantic palette.
- Added a typed `theme` API for mode selection and safe semantic-token injection.
- Added stable public `--sv-*` tokens while retaining compatibility aliases for existing widgets and hosts.
- Added coordinated chart-series tokens and aligned model-facing chart guidance with them.
- Synchronized diagram ramp classes with the documented palette.
- Made theme fallback follow the user's system preference when the host does not provide a theme.

## 0.1.0

- Initial package extraction.
- Added `StreamVisualization` as the recommended public React API.
- Added `streamviz/styles.css` as the public stylesheet entrypoint.
- Added protocol helpers for visualization tools.
- Added streamed payload parsing helpers.
- Added sandboxed React iframe renderer.
- Added model-facing `visualize.readme.md` rules.
- Added package-level tests, bundle size reporting, benchmark script, example app, and CI workflow.
- Added React integration coverage for the recommended `StreamVisualization` API.
- Upgraded the basic example into a looping streamed tool-call demo.
- Added public export verification for package release safety.
- Added host integration guide for agent backend and React UI wiring.
- Added documentation-style demo site source and wired it into package checks.
- Added GitHub Pages workflow for the streamviz demo site.
- Extended issue and pull request templates for streamviz package work.
- Added headless Chrome browser test for the iframe runtime and `sendPrompt` bridge.
