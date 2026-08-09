# streamviz

[English](https://github.com/adamsy1996/streamviz-react/blob/main/README.md) | [简体中文](https://github.com/adamsy1996/streamviz-react/blob/main/README.zh-CN.md)

在工具调用参数仍处于流式生成阶段时，安全渲染由 AI 生成的仪表盘、图表、流程图和交互式可视化内容。

[![CI](https://github.com/adamsy1996/streamviz-react/actions/workflows/ci.yml/badge.svg)](https://github.com/adamsy1996/streamviz-react/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/streamviz.svg)](https://www.npmjs.com/package/streamviz)
[![React 18+](https://img.shields.io/badge/React-18%2B-149eca)](https://react.dev/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

`streamviz` 是一个面向 AI Agent 可视化输出的轻量 React 渲染器与协议工具集。它可以从尚未完成的 JSON 中提取可用的可视化代码，在沙箱 iframe 中安全渲染，并且只在工具调用最终完成后启用脚本与交互能力。

它专门用于渲染 Agent 生成的可视化内容，而不是一个通用 HTML 渲染器。

## 为什么使用 streamviz

安全渲染生成式 UI，比渲染生成式文本更复杂：

- 在响应的大部分时间里，工具调用 JSON 都可能是不完整的。
- HTML 可能在工具调用完成之前就已经具备可渲染内容。
- 脚本不能随着流式分片到达而重复执行。
- 生成内容不应该直接访问宿主应用的高权限 API。
- iframe 高度、主题、导出和后续对话操作都需要明确、受控的宿主桥接。

`streamviz` 将这些问题封装在一个 React 组件之后，同时让传输层、模型选择和会话状态继续由宿主应用负责。

## 主要能力

- 从不完整的工具调用 JSON 中进行流式内容提取。
- 使用 CSP、活动内容过滤和 sandbox iframe 隔离生成代码。
- 只在最终状态执行脚本，确保交互式内容稳定初始化。
- 内置完整的浅色和深色 runtime 主题。
- 支持类型安全的语义主题覆盖，以及宿主 CSS 变量转发。
- 自动测量并缓存 iframe 内容高度。
- 支持 HTML 导出、截图复制适配器和 widget 到宿主的后续提问。
- 提供可选的模型协议工具和随包发布的可视化编写规范。
- 支持 React 18+，不强制依赖任何 UI 框架或 CSS 框架。

## 安装

```bash
npm install streamviz-react
```

React 和 React DOM 是 peer dependencies：

```bash
npm install react react-dom
```

在应用中全局导入一次宿主组件样式：

```tsx
import 'streamviz-react/styles.css'
```

sandbox iframe 使用的 runtime CSS 已经内置在渲染器中，不需要额外导入。

## 快速开始

先将宿主应用的工具调用对象标准化，再把得到的 payload 传给 `StreamVisualization`：

```tsx
import {
  StreamVisualization,
  extractVisualizeWidgetPayload,
} from 'streamviz-react'
import 'streamviz-react/styles.css'

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

`extractVisualizeWidgetPayload()` 可以识别常见的运行中与持久化工具调用结构，包括 `arguments`、`input`、`metadata`、`state.input`、`state.metadata`、`tool_raw_input`、`raw_input` 和 `state.raw`。

`VisualizeWidgetFrame` 仍作为兼容名称导出。新的集成应优先使用 `StreamVisualization`。

## 流式渲染机制

```text
不完整的工具调用 JSON
          ↓
提取部分可视化内容
          ↓
在 sandbox iframe 中安全渲染 HTML
          ↓
工具调用完成 → 仅执行一次脚本并启用交互
```

在流式生成过程中，渲染器会提取第一个可用的 `widget_code`，移除活动内容，并保持脚本不可执行。当 `final` 变为 `true` 后，渲染器会加载完整内容，并且只执行一次其中的脚本。

## 主题定制

每个 iframe 都会获得一套完整的浅色或深色内置主题。宿主只需要覆盖自己的品牌语义值：

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

主题值按以下顺序生效：

```text
内置 runtime tokens
→ 宿主转发的 CSS 变量
→ theme.tokens 覆盖值
```

没有覆盖的 token 会继续使用内置值。公开的 `--sv-*` 语义变量是稳定的 CSS 协议；内部色阶变量属于实现细节。对于已经拥有 CSS 变量设计系统的宿主，可以使用 `cssVarNames` 作为高级适配入口。

主题可以修改颜色、字体、圆角和图表序列色，但不能替换 sandbox、安全过滤、流式内容可见性、iframe 测量或其他 runtime 行为。

完整的主题 token 类型请查看 [API 参考](./docs/API.md)。

## 宿主适配器

渲染器自带零依赖的默认实现。生产环境中的宿主可以显式替换 UI 和平台相关能力：

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

生成的 widget 可以调用受限的全局桥接函数 `sendPrompt(text)`。宿主通过 `onSendPrompt` 接收字符串；iframe 内不会暴露任意宿主对象。

## 可选 Agent 协议

React 渲染器可以配合任意后端或工具协议使用。如果宿主希望共享一套模型侧协议，可以使用可选的 protocol exports：

```ts
import {
  VISUALIZE_READ_ME_TOOL_NAME,
  VISUALIZE_SHOW_WIDGET_TOOL_NAME,
  buildVisualizeSystemPrompt,
  buildVisualizeWidgetMetadata,
} from 'streamviz-react/protocol'

const systemPrompt = buildVisualizeSystemPrompt()

const metadata = buildVisualizeWidgetMetadata({
  title: '风险矩阵',
  widget_code: '<section>...</section>',
  loading_messages: ['正在准备可视化内容'],
})
```

package 同时附带一份模型可视化编写规范：

```ts
const authoringGuide = import.meta.resolve('streamviz-react/visualize.readme.md')
```

宿主可以通过读取类工具向模型提供这份文件，再在它之上叠加应用自身的可视化规则。

## 安全模型

所有生成的可视化内容都应被视为不可信输入。`streamviz` 提供多层防护：

- widget 运行在配置了 `sandbox="allow-scripts allow-forms"` 的 iframe 中。
- runtime document 包含 Content Security Policy。
- 流式生成阶段会移除活动内容和事件处理属性。
- 会移除 `javascript:` URL 和不安全的嵌入元素。
- inline script 只会在内容最终完成后执行。
- 远程资源受到 runtime allowlist 限制。
- 宿主通信仅限于明确的 `postMessage` 协议。

宿主必须保留 iframe sandbox，并且不能向生成代码暴露高权限 API。在修改 CSP、资源 allowlist、脚本生命周期或宿主桥接之前，请先阅读 [SECURITY.md](./SECURITY.md)。

## Package 入口

| 入口 | 用途 |
| --- | --- |
| `streamviz` | 推荐的公共 API：React 渲染器、core helpers 和 protocol helpers。 |
| `streamviz-react/react` | React 组件和主题类型。 |
| `streamviz-react/core` | 流式 payload 提取和高度缓存 helpers。 |
| `streamviz-react/protocol` | 可选的 Agent 协议常量与 builders。 |
| `streamviz-react/styles.css` | 宿主侧渲染器控件和 loading 样式。 |
| `streamviz-react/visualize-widget-runtime.css` | 面向高级集成的原始 iframe runtime stylesheet。 |
| `streamviz-react/visualize-widget-utilities.css` | 内置于 iframe runtime 的语义化 `sv-*` 编写原语。 |
| `streamviz-react/visualize.readme.md` | 随 package 发布的模型可视化编写规范。 |

## 环境要求与兼容性

- React 18 或更高版本。
- React DOM 18 或更高版本。
- 支持 iframe `srcdoc`、CSS 自定义属性、`postMessage` 和 `ResizeObserver` 的现代浏览器。
- 支持 ESM 的构建工具。

图片剪贴板能力取决于宿主环境和浏览器支持。在 Electron 等无法直接使用默认浏览器 API 的环境中，请提供 `writeImageToClipboard`。

## 示例

- [`examples/basic`](./examples/basic)：使用 Vite 和 React 的最小集成，包含模拟流式生成。
- [`apps/web`](./apps/web)：正式的 Next.js 官网、MDX 文档、Features 页面与交互式 Playground。

在本地运行最小示例或完整官网：

```bash
npm install
npm --prefix examples/basic run dev
# 或者
npm run site:dev
```

## 文档

### 本地 Agent Runtime

仓库内置了一个基于 Mastra 和 DeepSeek 的 TypeScript Agent，支持会话记忆、追踪以及 StreamViz 工具注册：

```bash
cp apps/agent/.env.example apps/agent/.env
npm run agent:mastra:dev
npm run site:dev
```

Next.js Playground 会代理 Mastra 原生 SSE 流，模型密钥只保留在服务端。配置与部署说明见 [`apps/agent/README.md`](apps/agent/README.md)。

- [API 参考](./docs/API.md)
- [集成指南](./docs/INTEGRATION.md)
- [架构说明](./docs/ARCHITECTURE.md)
- [测试说明](./docs/TESTING.md)
- [发布清单](./docs/RELEASE.md)
- [路线图](./docs/ROADMAP.md)
- [更新日志](./CHANGELOG.md)

## 开发

```bash
npm install
npm run check
```

`npm run check` 会依次运行类型检查、单元测试、package 与官网生产构建、exports 验证、bundle size 统计、benchmark、最小示例构建、headless browser E2E 和 npm package dry run。

欢迎参与贡献。在提交 Pull Request 或 Issue 之前，请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)、[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) 和 [SUPPORT.md](./SUPPORT.md)。

## 许可证

Apache-2.0 © 2026 Siyuan Duan。另请参阅 [NOTICE](./NOTICE) 和
[第三方许可声明](./THIRD_PARTY_NOTICES.md)。
