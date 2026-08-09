# Architecture

`streamviz` is split into three layers.

## Protocol Layer

The protocol layer defines the model-facing contract:

- Tool names: `visualize_read_me`, `visualize_show_widget`
- Supported visualization types: `diagram`, `chart`, `interactive`, `mockup`, `art`
- System prompt section
- Readme output envelope
- Widget metadata shape
- Model authoring rules in `visualize.readme.md`

This layer is renderer-agnostic and can be used by a backend, CLI, or agent runtime.

## Mastra Agent Runtime

`apps/agent` is the deployable TypeScript agent service. It uses Mastra for agent orchestration, tool registration, session memory, and traces; DeepSeek supplies the model; and LibSQL provides local persistence. The runtime exposes Mastra's native SSE protocol to the Next.js server, which proxies it to the Playground without exposing provider credentials.

The runtime is a separate private workspace, so Mastra and model-provider dependencies never enter the published `streamviz` package or browser bundles. Its storage adapter can move from local LibSQL to PostgreSQL without changing the package renderer or the web client contract.

## Core Layer

The core layer handles streamed tool state:

- Partial JSON string extraction
- Partial JSON string-array extraction
- Normalization of complete, running, and persisted tool-call shapes
- Source key generation
- Height cache read/write

This layer has no React dependency.

## React Renderer Layer

The React layer provides `StreamVisualization`. `VisualizeWidgetFrame` remains as a compatibility alias.

Its internal modules are separated by responsibility:

- `StreamVisualization.tsx` coordinates the iframe lifecycle and renders the host UI.
- `types.ts` contains the stable public React and theme contracts.
- `theme.ts` validates theme values and serializes host CSS variables.
- `content.ts` detects renderable streamed markup and estimates initial height.
- `export.ts` owns standalone HTML and clipboard export helpers.
- `runtimeDocument.ts` owns the isolated iframe bootstrap document, CSP, sanitization, measurement, and snapshots.
- `VisualizeWidgetFrame.tsx` is a compatibility-only re-export.

The component owns:

- Loading-message dwell timing
- Render release logic
- Iframe document construction
- Host CSS variable transfer
- Message passing between host and iframe
- Height measurement and cache updates
- Snapshot export and HTML export controls

The host owns:

- Tool-call transport
- Toast UI
- Icons
- Clipboard bridge
- Theme source
- Conversation follow-up handling

## Theme System

The iframe always loads a complete built-in runtime stylesheet. Styling is layered in this order:

1. Internal primitive palette values.
2. Stable public `--sv-*` semantic tokens.
3. Compatibility aliases used by earlier generated widgets and host integrations.
4. Forwarded host variables selected through `cssVarNames`.
5. Typed `theme.tokens` overrides, which have final precedence.

The runtime CSS is authored in two source files: `visualize-widget-runtime.css` owns tokens, reset, compatibility selectors, and diagram ramps; `visualize-widget-utilities.css` owns the namespaced `sv-*` authoring primitives. The build concatenates both into the public runtime stylesheet.

The public theme API changes visual semantics only. Sandbox behavior, streaming visibility, measurement, content sanitization, and other runtime invariants are not themeable.

## Iframe Runtime

The iframe runtime receives host messages:

- `visualize-widget:update`
- `visualize-widget:copy-snapshot`

It sends host messages:

- `visualize-widget:ready`
- `visualize-widget:rendered`
- `visualize-widget:size`
- `visualize-widget:snapshot`
- `visualize-widget:send-prompt`

The runtime sanitizes streamed content before rendering, strips active content during streaming, and executes scripts only after the payload is final.

## Security Boundary

The iframe is the security boundary. The package intentionally communicates through narrow `postMessage` messages and does not expose arbitrary host APIs to generated widgets.
