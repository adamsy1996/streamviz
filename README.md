# streamviz

A drop-in React renderer for AI-generated visual artifacts, optimized for streaming tool calls.

[![npm version](https://img.shields.io/npm/v/streamviz)](https://www.npmjs.com/package/streamviz)

## Overview

AI agents are no longer limited to streaming text. They can generate dashboards, charts, controls, diagrams, reports, and small interactive tools. The hard part is rendering those artifacts while the tool-call arguments are still incomplete, without exposing the host app to unsafe generated code.

`streamviz` packages the runtime that sits between an agent tool call and a user-visible artifact:

- Drop-in React component for streamed visual artifacts.
- Partial JSON extraction for incomplete tool-call arguments.
- Sandboxed iframe rendering with a locked-down runtime document.
- Progressive loading states before the artifact is renderable.
- Final-only script execution so interactive widgets do not run mid-stream.
- Height measurement, height caching, HTML export, screenshot copy, and widget-to-host prompt callbacks.
- Shared protocol helpers for backend tools such as `visualize_read_me` and `visualize_show_widget`.

This is not a general HTML renderer. It is a specialized renderer for AI agent visual artifacts.

## Installation

```bash
npm install streamviz
```

React is a peer dependency:

```bash
npm install react react-dom
```

Import the package stylesheet once in your app:

```tsx
import 'streamviz/styles.css'
```

## Usage

```tsx
import {
  StreamVisualization,
  extractVisualizeWidgetPayload,
} from 'streamviz'
import 'streamviz/styles.css'

export function Artifact({ toolCall }: { toolCall: unknown }) {
  const payload = extractVisualizeWidgetPayload(toolCall as Record<string, unknown>)

  return (
    <StreamVisualization
      title={payload.title}
      code={payload.code}
      exportCode={payload.exportCode}
      loadingMessage={payload.loadingMessage}
      loadingMessages={payload.loadingMessages}
      final={payload.final}
      onSendPrompt={(prompt) => console.log('prompt from widget:', prompt)}
    />
  )
}
```

`VisualizeWidgetFrame` is still exported as a compatibility name, but new integrations should use `StreamVisualization`.

## Agent Protocol

Backends can share the same tool names, prompt text, and metadata shape:

```ts
import {
  VISUALIZE_READ_ME_TOOL_NAME,
  VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  buildVisualizeSystemPrompt,
  buildVisualizeWidgetMetadata,
} from 'streamviz/protocol'

const systemPrompt = buildVisualizeSystemPrompt()

const metadata = buildVisualizeWidgetMetadata({
  title: 'Risk Matrix',
  widget_code: '<section>...</section>',
  loading_messages: ['Generating visualization'],
})

console.log(systemPrompt, metadata)
console.log(VISUALIZE_READ_ME_TOOL_NAME, VISUALIZE_SHOW_WIDGET_TOOL_NAME)
```

The model-facing authoring guide ships with the package:

```ts
const readmeUrl = import.meta.resolve('streamviz/visualize.readme.md')
```

Hosts can expose this file through a `visualize_read_me` style tool, then layer project-specific visualization rules above it.

## Styling

The iframe runtime stylesheet is exported as:

```tsx
import 'streamviz/styles.css'
```

The renderer also forwards selected host CSS variables into the iframe. Production hosts can pass extra variable names with `cssVarNames`.

## Host Adapters

`StreamVisualization` can run with defaults, but production hosts should inject app-specific adapters:

```tsx
<StreamVisualization
  {...payload}
  renderIcon={(name) => <Icon name={name} />}
  notify={(message, variant) => toast({ message, variant })}
  writeImageToClipboard={async (dataUrl) => {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': await (await fetch(dataUrl)).blob() }),
    ])
    return true
  }}
  getTheme={() => document.documentElement.dataset.theme || 'dark'}
/>
```

## Security Model

Generated widgets are untrusted content.

- Widgets run in a sandboxed iframe.
- The iframe document includes a Content Security Policy.
- During streaming, scripts and event-handler attributes are stripped.
- Inline scripts execute only after the artifact is final.
- Remote scripts and assets are limited to the runtime allowlist.
- `iframe`, `object`, `embed`, and `base` are removed from streamed content.

Keep the iframe sandbox enabled and avoid forwarding privileged host APIs into generated widgets.

## Package Entrypoints

| Entrypoint | Purpose |
| --- | --- |
| `streamviz` | Main public API: `StreamVisualization`, core helpers, and protocol helpers. |
| `streamviz/styles.css` | Public stylesheet for the iframe runtime. |
| `streamviz/core` | Streamed tool payload parsing and height cache helpers. |
| `streamviz/protocol` | Tool names, prompt builders, metadata builders, protocol constants. |
| `streamviz/react` | React renderer exports. |
| `streamviz/visualize.readme.md` | Model-facing visual artifact authoring guide. |

## Example

See [examples/basic](./examples/basic) for a minimal Vite + React integration.

See [examples/site](./examples/site) for a documentation-style demo site with a live streamed tool-call artifact.

## Documentation

- [API reference](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Integration guide](./docs/INTEGRATION.md)
- [Release checklist](./docs/RELEASE.md)
- [Roadmap](./docs/ROADMAP.md)
- [Testing](./docs/TESTING.md)

## Development

```bash
npm install
npm run check
npm run site:build
```

## License

Apache-2.0
