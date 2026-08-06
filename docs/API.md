# API Reference

## Main Entrypoint

```ts
import {
  StreamVisualization,
  extractVisualizeWidgetPayload,
} from 'streamviz'
```

The main entrypoint re-exports the public `core`, `protocol`, and `react` APIs.

`VisualizeWidgetFrame` is also exported as a compatibility name for hosts that adopted the package before the public API was productized.

## Core

```ts
import {
  extractPartialJsonString,
  extractPartialJsonStringArray,
  extractVisualizeWidgetPayload,
  getCachedVisualizeWidgetHeight,
  setCachedVisualizeWidgetHeight,
  visualizeWidgetSourceKey,
} from 'streamviz/core'
```

### `extractPartialJsonString(raw, key)`

Extracts a JSON string value even when the surrounding JSON object has not finished streaming.

```ts
extractPartialJsonString('{"widget_code":"<section>hi', 'widget_code')
// '<section>hi'
```

### `extractPartialJsonStringArray(raw, key)`

Extracts completed and currently streaming string-array values.

```ts
extractPartialJsonStringArray(
  '{"loading_messages":["Preparing","Rendering',
  'loading_messages',
)
// ['Preparing', 'Rendering']
```

### `extractVisualizeWidgetPayload(tool)`

Normalizes complete, persisted, and streaming tool-call shapes into the renderer payload.

Returns:

```ts
type VisualizeWidgetPayload = {
  title: string
  code: string
  exportCode: string
  loadingMessage: string
  loadingMessages: string[]
  final: boolean
  status: string
}
```

The helper understands common fields such as `arguments`, `input`, `state.input`, `metadata`, `state.metadata`, `tool_raw_input`, `raw_input`, and `state.raw`.

Use this helper at the boundary between the host app's tool-call data model and `StreamVisualization`.

### `visualizeWidgetSourceKey(value)`

Builds a stable compact key for a widget source string. The key is used by the height cache.

### `getCachedVisualizeWidgetHeight(key)`

Reads the measured iframe height from memory or `localStorage`. Returns `number | null`.

### `setCachedVisualizeWidgetHeight(key, value)`

Stores a measured iframe height in memory and `localStorage`. Values are clamped to the package maximum.

## Protocol

```ts
import {
  VISUALIZE_TYPES,
  VISUALIZE_READ_ME_TOOL_NAME,
  VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  VISUALIZE_WIDGET_KIND,
  VISUALIZE_WIDGET_MODE,
  buildVisualizeSystemPrompt,
  buildVisualizeReadMeTitle,
  buildVisualizeReadMeOutput,
  buildVisualizeReadMeMetadata,
  buildVisualizeShowWidgetOutput,
  buildVisualizeWidgetMetadata,
  fallbackVisualizeReadme,
} from 'streamviz/protocol'
```

### `buildVisualizeSystemPrompt()`

Returns the host system-prompt section that instructs an AI model to use visualization tools for visual artifacts.

### `buildVisualizeWidgetMetadata(input)`

Builds the metadata consumed by the renderer:

```ts
buildVisualizeWidgetMetadata({
  title: 'Roadmap',
  widget_code: '<section>...</section>',
  loading_messages: ['Laying out roadmap'],
})
```

### `buildVisualizeReadMeOutput(input)`

Wraps model-facing visualization rules in the standard `visualize_read_me` output envelope.

## React

```ts
import {
  StreamVisualization,
  STREAM_VISUALIZATION_THEME_TOKEN_NAMES,
  type StreamVisualizationProps,
  VisualizeWidgetFrame,
  type VisualizeWidgetFrameProps,
} from 'streamviz/react'
```

### `StreamVisualization`

The recommended React component for rendering streamed visual artifacts.

Props:

```ts
type StreamVisualizationProps = {
  title: string
  code: string
  exportCode: string
  loadingMessage: string
  loadingMessages?: string[]
  final: boolean
  onSendPrompt?: (prompt: string) => void
  renderIcon?: (
    name: 'check' | 'copy' | 'download' | 'code-xml',
    options: { className?: string },
  ) => React.ReactNode
  notify?: (message: string, variant: 'success' | 'error') => void
  writeImageToClipboard?: (dataUrl: string) => Promise<boolean> | boolean
  theme?: StreamVisualizationTheme
  /** @deprecated Prefer theme.mode. */
  getTheme?: () => 'light' | 'dark' | string
  cssVarNames?: readonly string[]
}
```

`theme` provides the supported customization boundary:

```ts
type StreamVisualizationTheme = {
  mode?: 'light' | 'dark' | 'system'
  tokens?: Partial<{
    backgroundPage: string
    backgroundSurface: string
    backgroundElevated: string
    backgroundMuted: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    borderSubtle: string
    borderDefault: string
    borderStrong: string
    accent: string
    statusInfo: string
    statusSuccess: string
    statusWarning: string
    statusDanger: string
    radiusMedium: string
    radiusLarge: string
    fontSans: string
    fontSerif: string
    fontMono: string
    chartSeries: readonly string[]
    // Background, text, and border semantic status variants are also available.
  }>
}
```

Theme tokens override the built-in runtime defaults and are injected after forwarded host CSS variables. Invalid declaration-breaking values are ignored. Unspecified tokens retain the built-in light/dark values.

`StreamVisualizationThemeTokens` and `STREAM_VISUALIZATION_THEME_TOKEN_NAMES` are the stable public host-theming API. These named keys follow semantic-versioning compatibility. The package's raw palette variables (`--sv-slate-*`, `--sv-indigo-*`, and similar), compatibility aliases (`--sem-*` and `--color-*`), and internal host variables may change between minor releases. Widget authors should use the documented semantic `--sv-*` variables and `sv-*` utilities from `visualize.readme.md` instead of raw ramps.

Operating-system forced-colors mode is supported automatically. Semantic backgrounds, text, borders, and actions are remapped to system colors while preserving their role.

Behavior:

- Shows loading text until streamed content is likely renderable.
- Updates the iframe when chunks arrive.
- Executes scripts only when `final` is true.
- Measures iframe content height and caches it by source key.
- Exposes screenshot copy and HTML export controls after final render.
- Forwards `window.sendPrompt(text)` calls from the widget to `onSendPrompt`.

### `VisualizeWidgetFrame`

Compatibility alias for `StreamVisualization`.
