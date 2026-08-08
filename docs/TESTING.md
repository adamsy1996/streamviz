# Testing

## Agent protocol debug loop

For interactive browser debugging, start the realtime workbench:

```bash
npm run agent:dev
```

Run the complete mini-agent loop without credentials:

```bash
npm run agent:debug:mock
```

Run the repeatable visualization quality suite with the configured live provider (DeepSeek by default):

```bash
npm run agent:eval
```

This exercises chart, diagram, dashboard, and interactive-layout prompts and writes inspectable JSON artifacts under `.streamviz/evals/`. It checks accessibility hooks, semantic StreamViz tokens/utilities, responsive layout signals, chart palette usage, minimum text sizing, and prohibited visual effects. Use `npm run agent:eval:mock` to validate the evaluation harness without a network call.

## Visual regression and high contrast

`npm run test:browser` compares deterministic light, dark, and mobile renders with the checked-in PNGs under `tests/visual-baselines/`. The harness waits for two stable browser paints, permits at most a 2% pixel delta, and also emulates operating-system forced-colors mode.

After an intentional visual change, inspect all three renders and refresh them with:

```bash
npm run test:visual:update
```

For a live OpenAI Responses API run, set `OPENAI_API_KEY` and pass a visual request:

```bash
npm run agent:debug -- "Create a compact deployment flow diagram"
```

For DeepSeek V4 through Chat Completions:

```bash
DEEPSEEK_API_KEY=... npm run agent:debug -- \
  --provider deepseek \
  --model deepseek-v4-flash \
  "Create a compact deployment flow diagram"
```

Inspect `.streamviz/latest.json` and the referenced trace directory to compare prompts, streamed function arguments, tool outputs, final widget source, token usage, and turn count.

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

`scripts/e2e-browser.mjs` launches the production Next.js server with the credential-free mini-agent mock driver, then opens `/playground/` in headless Chrome.

It verifies:

- the real `/playground` pathname renders without hash routing
- the server-side mini-agent NDJSON route drives the Playground without exposing a model key
- the streamed artifact iframe appears
- the iframe sandbox and CSP are present
- final artifact actions appear after rendering
- final inline scripts execute inside the iframe runtime
- `window.sendPrompt()` inside the iframe reaches the host UI

Set `CHROME_PATH` if Chrome is not installed in a standard location.
