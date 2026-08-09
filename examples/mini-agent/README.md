# StreamViz mini-agent

This repository-only TypeScript runtime exercises the real StreamViz prompt and function-call protocol without becoming part of the published package.

## Realtime debug UI

Start the local chat-style workbench:

```bash
npm run agent:dev
```

Open `http://127.0.0.1:5186`. The browser sends prompts only to the local Vite middleware; API credentials remain in the Node process. Model text, tool calls, partial widget arguments, the final visualization, and run events stream into the page. The clear action aborts the active request and resets all local UI state.

## Live API run

Set `OPENAI_API_KEY`, then run from the repository root:

```bash
npm run agent:debug -- "Create a compact six-month revenue chart"
```

Optional environment variables:

- `OPENAI_MODEL` defaults to `gpt-5.6-sol`.
- `OPENAI_BASE_URL` points the OpenAI SDK at a compatible gateway.

CLI flags include `--model`, `--reasoning`, and `--max-turns`.

### DeepSeek

The runtime also has a native Chat Completions adapter for DeepSeek V4:

```bash
DEEPSEEK_API_KEY=... npm run agent:debug -- \
  --provider deepseek \
  --model deepseek-v4-flash \
  "Create a compact six-month revenue chart"
```

Set `AGENT_PROVIDER=deepseek` in `.env` to make it the default. DeepSeek uses a separate driver because its OpenAI-compatible endpoint is Chat Completions rather than Responses.

## Credential-free run

```bash
npm run agent:debug:mock
```

Mock mode executes the same prompt, tool registry, tool handlers, event sink, trace writer, and stopping logic. Only the model transport is replaced.

## Debug output

Every run writes ignored development artifacts under `.streamviz/`:

- `runs/<run-id>/trace.jsonl` appends the event timeline without rewriting long streams.
- `runs/<run-id>/result.json` records the final text and widget metadata.
- `runs/<run-id>/*.html` contains the generated widget fragments.
- `latest.json` points to the newest completed run.

The runtime uses `store: false`, limits tool turns, disables parallel function calls for deterministic traces, and never reads credentials from source files.
