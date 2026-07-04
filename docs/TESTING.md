# Testing

`streamviz` tests the package at three levels.

## Core Protocol And Parser Tests

`src/core/visualizeWidgetTool.test.ts` verifies streamed tool-call payload parsing:

- incomplete JSON string values
- incomplete string arrays
- running versus final payload normalization
- stable source keys for height caching

`src/protocol/index.test.ts` verifies the renderer-agnostic agent contract:

- stable tool names and visualization types
- system prompt content
- readme output envelope
- widget metadata envelope
- fallback model-facing readme guidance

## React Integration Tests

`src/react/StreamVisualization.test.tsx` verifies the public React API:

- `StreamVisualization` mounts as the recommended package entrypoint
- the iframe uses sandbox attributes
- the iframe `srcDoc` contains the runtime CSP
- final actions appear only after the iframe reports rendered content
- widget `sendPrompt` messages are forwarded to the host callback
- non-renderable partial markup stays in loading state

These tests run in jsdom. They validate host integration behavior, not browser engine execution inside the iframe.

## Build, Size, Benchmark, And Pack Checks

The package check command runs:

```bash
npm run check
```

That command performs:

- TypeScript typecheck
- Vitest tests
- production library build
- public export verification
- bundle size report
- parser benchmark
- example app build
- documentation site build
- real browser iframe runtime test through Chrome DevTools Protocol
- npm pack dry-run

## Browser Runtime Test

`scripts/e2e-browser.mjs` launches Chrome in headless mode and opens the built demo site from `examples/site/dist`.

It verifies:

- the documentation site renders
- the streamed artifact iframe appears
- the iframe sandbox and CSP are present
- final artifact actions appear after rendering
- final inline scripts execute inside the iframe runtime
- `window.sendPrompt()` inside the iframe reaches the host UI

Set `CHROME_PATH` if Chrome is not installed in a standard location.
