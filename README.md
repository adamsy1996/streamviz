# streamviz

[English](https://github.com/adamsy1996/streamviz/blob/main/README.md) | [简体中文](https://github.com/adamsy1996/streamviz/blob/main/README.zh-CN.md)

Render AI-generated dashboards, charts, diagrams, and interactive artifacts while tool-call arguments are still streaming.

[![CI](https://github.com/adamsy1996/streamviz/actions/workflows/ci.yml/badge.svg)](https://github.com/adamsy1996/streamviz/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/streamviz.svg)](https://www.npmjs.com/package/streamviz)
[![React 18+](https://img.shields.io/badge/React-18%2B-149eca)](https://react.dev/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

`streamviz` is a small React renderer and protocol toolkit for visual output from AI agents. It extracts useful artifact code from incomplete JSON, renders it in a sandboxed iframe, and enables interactivity only after the tool call is final.

It is designed for agent output, not as a general-purpose HTML renderer.

## Why streamviz

Rendering generated UI safely is harder than rendering generated text:

- Tool-call JSON may be incomplete for most of the response.
- HTML can become renderable before the tool call is finished.
- Scripts must not execute repeatedly as chunks arrive.
- Generated content should not receive privileged host APIs.
- Iframe height, theme, export, and follow-up actions need an explicit host bridge.

`streamviz` handles those concerns behind one React component while keeping transport, model choice, and conversation state in the host application.

## Features

- Streaming-aware extraction from partial tool-call JSON.
- Sandboxed iframe rendering with CSP and active-content filtering.
- Final-only script execution for stable interactive artifacts.
- Built-in light and dark runtime themes.
- Typed semantic theme overrides and host CSS-variable forwarding.
- Automatic height measurement and caching.
- HTML export, screenshot copy adapters, and widget-to-host prompts.
- Optional model protocol helpers and packaged authoring guidance.
- React 18+ support with no required UI framework or CSS framework.

## Installation

```bash
npm install streamviz
```

React and React DOM are peer dependencies:

```bash
npm install react react-dom
```

Import the host component stylesheet once in your application:

```tsx
import 'streamviz/styles.css'
```

The sandboxed iframe runtime CSS is bundled into the renderer automatically.

## Quick start

Normalize the host's tool-call object and pass the resulting payload to `StreamVisualization`:

```tsx
import {
  StreamVisualization,
  extractVisualizeWidgetPayload,
} from 'streamviz'
import 'streamviz/styles.css'

type ArtifactProps = {
  toolCall: Record<string, unknown>
  onFollowUp?: (prompt: string) => void
}

export function Artifact({ toolCall, onFollowUp }: ArtifactProps) {
  const payload = extractVisualizeWidgetPayload(toolCall)

  return (
    <StreamVisualization
      title={payload.title}
      code={payload.code}
      exportCode={payload.exportCode}
      loadingMessage={payload.loadingMessage}
      loadingMessages={payload.loadingMessages}
      final={payload.final}
      onSendPrompt={onFollowUp}
    />
  )
}
```

`extractVisualizeWidgetPayload()` understands common running and persisted tool-call shapes, including `arguments`, `input`, `metadata`, `state.input`, `state.metadata`, `tool_raw_input`, `raw_input`, and `state.raw`.

`VisualizeWidgetFrame` remains available as a compatibility alias. New integrations should use `StreamVisualization`.

## How streaming works

```text
incomplete tool-call JSON
          ↓
partial artifact extraction
          ↓
safe HTML rendering in a sandboxed iframe
          ↓
final tool call → scripts and interactions enabled once
```

During streaming, the renderer extracts the first usable `widget_code`, removes active content, and keeps scripts inert. When `final` becomes `true`, the complete artifact is rendered and its scripts execute once.

## Theming

Every iframe receives a complete built-in light or dark theme. Override only the semantic values your host needs:

```tsx
<StreamVisualization
  {...payload}
  theme={{
    mode: 'system',
    tokens: {
      backgroundSurface: '#101114',
      textPrimary: '#f5f5f5',
      accent: '#635bff',
      statusSuccess: '#159570',
      statusWarning: '#d97706',
      statusDanger: '#d64045',
      radiusLarge: '14px',
      chartSeries: ['#635bff', '#159570', '#d64045'],
    },
  }}
/>
```

Theme values are applied in this order:

```text
built-in runtime tokens
→ forwarded host CSS variables
→ theme.tokens overrides
```

Unspecified tokens retain their built-in values. The public `--sv-*` semantic variables are the stable CSS contract; internal palette variables are implementation details. `cssVarNames` is available as an advanced adapter for hosts that already expose a CSS-variable design system.

Themes can change colors, fonts, radii, and chart series. They cannot replace sandboxing, sanitization, streaming visibility, iframe measurement, or other runtime behavior.

See the [API reference](./docs/API.md) for the complete theme token type.

## Host adapters

The renderer has dependency-free defaults. Production hosts can replace UI and platform-specific behavior explicitly:

```tsx
<StreamVisualization
  {...payload}
  renderIcon={(name) => <Icon name={name} />}
  notify={(message, variant) => toast({ message, variant })}
  writeImageToClipboard={async (dataUrl) => {
    const blob = await (await fetch(dataUrl)).blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
    return true
  }}
  onSendPrompt={(prompt) => submitFollowUpPrompt(prompt)}
/>
```

Generated widgets can call the narrow global bridge `sendPrompt(text)`. The host receives the string through `onSendPrompt`; no arbitrary host object is exposed inside the iframe.

## Optional agent protocol

The React renderer can be used with any backend or tool schema. Hosts that want a shared model-facing contract can use the optional protocol exports:

```ts
import {
  VISUALIZE_READ_ME_TOOL_NAME,
  VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  buildVisualizeSystemPrompt,
  buildVisualizeWidgetMetadata,
} from 'streamviz/protocol'

const systemPrompt = buildVisualizeSystemPrompt()

const metadata = buildVisualizeWidgetMetadata({
  title: 'Risk matrix',
  widget_code: '<section>...</section>',
  loading_messages: ['Preparing visualization'],
})
```

The package also ships its model authoring guide:

```ts
const authoringGuide = import.meta.resolve('streamviz/visualize.readme.md')
```

Expose this file through a read-style tool, then layer application-specific visualization rules above it.

## Security model

Generated artifacts are untrusted content. `streamviz` provides defense in depth:

- Widgets run in an iframe with `sandbox="allow-scripts allow-forms"`.
- The runtime document includes a Content Security Policy.
- Active content and event-handler attributes are removed while streaming.
- `javascript:` URLs and unsafe embedded elements are removed.
- Inline scripts execute only after the artifact is final.
- Remote resources are restricted to the runtime allowlist.
- Host communication is limited to explicit `postMessage` protocols.

The host must keep the iframe sandbox enabled and must not expose privileged APIs to generated code. Review [SECURITY.md](./SECURITY.md) before changing the CSP, resource allowlist, script lifecycle, or host bridge.

## Package entrypoints

| Entrypoint | Purpose |
| --- | --- |
| `streamviz` | Recommended public API: React renderer, core helpers, and protocol helpers. |
| `streamviz/react` | React component and theme types. |
| `streamviz/core` | Streaming payload extraction and height-cache helpers. |
| `streamviz/protocol` | Optional agent protocol constants and builders. |
| `streamviz/styles.css` | Host-side renderer controls and loading styles. |
| `streamviz/visualize-widget-runtime.css` | Raw iframe runtime stylesheet for advanced integrations. |
| `streamviz/visualize-widget-utilities.css` | Semantic `sv-*` authoring primitives bundled into the iframe runtime. |
| `streamviz/visualize.readme.md` | Packaged model authoring guide. |

## Requirements and compatibility

- React 18 or newer.
- React DOM 18 or newer.
- Modern browsers with iframe `srcdoc`, CSS custom properties, `postMessage`, and `ResizeObserver` support.
- ESM-compatible build tooling.

Clipboard image support depends on host and browser capabilities. Provide `writeImageToClipboard` when the default browser API is unavailable, such as in Electron.

## Examples

- [`examples/basic`](./examples/basic): minimal Vite and React integration with simulated streaming.
- [`apps/web`](./apps/web): the production Next.js website, MDX documentation, feature pages, and interactive playground.

Run the minimal example or the complete website locally:

```bash
npm install
npm --prefix examples/basic run dev
# or
npm run site:dev
```

## Documentation

### Local agent debugging

The repository includes a private TypeScript mini-agent that exercises the actual visualization prompt and function-call loop without adding runtime code to the package:

```bash
npm run agent:debug:mock
OPENAI_API_KEY=... npm run agent:debug -- "Create a revenue chart"
DEEPSEEK_API_KEY=... npm run agent:debug -- --provider deepseek --model deepseek-v4-flash "Create a revenue chart"
```

OpenAI Responses and DeepSeek Chat Completions are separate drivers behind the same runtime. Runs are traced under `.streamviz/`. See [`examples/mini-agent/README.md`](examples/mini-agent/README.md) for provider configuration and the event and artifact layout.

- [API reference](./docs/API.md)
- [Integration guide](./docs/INTEGRATION.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Testing](./docs/TESTING.md)
- [Release checklist](./docs/RELEASE.md)
- [Roadmap](./docs/ROADMAP.md)
- [Changelog](./CHANGELOG.md)

## Development

```bash
npm install
npm run check
```

`npm run check` runs type checking, unit tests, package and website production builds, export verification, bundle-size reporting, benchmarks, the basic example, headless browser E2E, and an npm package dry run.

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md), [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md), and [SUPPORT.md](./SUPPORT.md) before opening a pull request or issue.

## License

Apache-2.0 © streamviz contributors.
