# Integration Guide

This guide shows how to wire `streamviz` into an AI agent host.

## 1. Register Visualization Tools

Backends should expose two tools:

- `visualize_read_me`: returns the model-facing artifact rules.
- `visualize_show_widget`: receives `loading_messages`, `widget_code`, and `title`.

Use the protocol helpers to avoid string drift:

```ts
import {
  VISUALIZE_READ_ME_TOOL_NAME,
  VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  buildVisualizeSystemPrompt,
  buildVisualizeReadMeOutput,
  buildVisualizeWidgetMetadata,
} from 'streamviz/protocol'
```

Add `buildVisualizeSystemPrompt()` to the model system prompt. When the model requests `visualize_read_me`, return the packaged `visualize.readme.md` content with `buildVisualizeReadMeOutput()`.

When the model calls `visualize_show_widget`, store the metadata produced by `buildVisualizeWidgetMetadata()` with the tool result.

## 2. Normalize Tool Calls In The UI

The UI should normalize complete and streaming tool-call shapes before rendering:

```tsx
import {
  StreamVisualization,
  extractVisualizeWidgetPayload,
} from 'streamviz'
import 'streamviz/styles.css'

export function ToolArtifact({ toolCall }: { toolCall: unknown }) {
  const payload = extractVisualizeWidgetPayload(toolCall as Record<string, unknown>)

  return (
    <StreamVisualization
      title={payload.title}
      code={payload.code}
      exportCode={payload.exportCode}
      loadingMessage={payload.loadingMessage}
      loadingMessages={payload.loadingMessages}
      final={payload.final}
    />
  )
}
```

`extractVisualizeWidgetPayload()` supports common persisted and streaming shapes, including `arguments`, `input`, `metadata`, `state.input`, `state.metadata`, `tool_raw_input`, `raw_input`, and `state.raw`.

## 3. Inject Host Adapters

Production hosts usually provide app-specific adapters:

```tsx
<StreamVisualization
  {...payload}
  renderIcon={(name) => <AppIcon name={name} />}
  notify={(message, variant) => showToast({ message, variant })}
  writeImageToClipboard={writeImageToClipboardBridge}
  onSendPrompt={(prompt) => submitFollowUpPrompt(prompt)}
  theme={{
    mode: 'system',
    tokens: {
      accent: '#635bff',
      statusSuccess: '#159570',
      chartSeries: ['#635bff', '#159570', '#d64045'],
    },
  }}
/>
```

The runtime always ships a complete default theme. Pass only the semantic tokens your host needs to brand. `cssVarNames` remains available as an advanced adapter for forwarding an existing host design system; the typed `theme` API is the recommended public customization surface.

Do not pass privileged host APIs into the iframe. Keep host communication limited to explicit callbacks.

## 4. Preserve The Security Boundary

Generated artifacts are untrusted. The renderer assumes:

- The iframe sandbox remains enabled.
- Widget code is treated as data until it reaches the iframe runtime.
- Scripts execute only after the payload is final.
- Host callbacks receive strings, not arbitrary executable code.

If you fork the iframe runtime, preserve the CSP, blocked element stripping, event-handler stripping, and `javascript:` URL stripping.

## 5. Test The Host Integration

At minimum, host apps should verify:

- streamed partial tool arguments render loading states
- renderable chunks appear before final completion
- final artifacts show export/copy actions
- `sendPrompt()` callbacks create the expected follow-up message
- failed clipboard writes surface a host notification

## 6. Product Website And Playground

The repository includes a production Next.js website in `apps/web`. It consumes the local workspace package and contains documentation, feature narratives, a mini-agent debugger at `/playground`, and a persistent consumer chat at `/chat`.

```bash
npm run site:dev
```

The playground demonstrates the real integration lifecycle:

- streamed HTML recovered from the host transport
- renderable partial HTML
- final interactive artifacts
- host callbacks and event inspection
