'use client'

import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { Card, HStack, VStack } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Section } from '@astryxdesign/core/Section'
import { Heading, Text } from '@astryxdesign/core/Text'
import { MarkGithubIcon } from '@primer/octicons-react'
import { HomeArtifactDemo } from '@/components/home-artifact-demo'
import { InstallCommand } from '@/components/install-command'
import { SiteContainer } from '@/components/site-container'
import { SiteFooter } from '@/components/site-footer'
import { SiteFrame } from '@/components/site-frame'
import { pathFor, type Locale } from '@/lib/site'

const copy = {
  en: {
    eyebrow: 'Open-source streaming UI runtime', title: 'Turn model output into live interfaces.',
    body: 'StreamViz recovers partial model-generated HTML, isolates it safely, and renders interactive visualizations inside your React conversation—before generation finishes.',
    primary: 'Get started', secondary: 'View on GitHub', demoLabel: 'One stream. Three visible stages.',
    demoBody: 'Watch a function call become an interactive artifact without hiding the model-to-interface boundary.',
    proof: ['React 19 ready', 'Secure iframe boundary', 'Partial HTML recovery'], benefitsTitle: 'The missing runtime between tokens and UI.',
    benefits: [['Render during generation', 'Recover useful structure from incomplete HTML and update the same artifact as new tokens arrive.'], ['Secure by default', 'Sanitize generated markup and execute each artifact inside a restrictive iframe sandbox.'], ['Host-controlled', 'Keep themes, exports, clipboard, prompts, and notifications inside your application boundary.']],
    installEyebrow: 'React integration', installTitle: 'One component. Every streamed chunk.', installBody: 'Pass the accumulated HTML as it arrives, then set final when the stream ends. StreamViz recovers and renders every useful state in between.', readApi: 'Read the React API',
  },
  zh: {
    eyebrow: '开源的流式 UI runtime', title: '把模型输出，变成实时可交互界面。', body: 'StreamViz 在生成结束前恢复不完整 HTML、安全隔离执行，并把实时可视化直接渲染在 React 对话流里。',
    primary: '开始使用', secondary: '查看 GitHub', demoLabel: '一条流，三个可见阶段。', demoBody: '清楚展示 function call 如何经过 StreamViz，成为对话中的交互式产物。',
    proof: ['支持 React 19', '安全 iframe 边界', '不完整 HTML 恢复'], benefitsTitle: '补上 tokens 与 UI 之间缺失的 runtime。',
    benefits: [['生成时就开始渲染', '从不完整 HTML 中恢复可用结构，并随新 token 到达更新同一个产物。'], ['默认安全', '净化生成内容，并在受限 iframe sandbox 中执行每个产物。'], ['宿主完全可控', '主题、导出、剪贴板、提示词和通知都留在你的应用边界内。']],
    installEyebrow: 'React 接入', installTitle: '一个组件，接住每个流式分片。', installBody: 'HTML 到达时持续传入累积内容，流结束时标记 final；中间每个可用状态都由 StreamViz 恢复并渲染。', readApi: '查看 React API',
  },
} as const

const integrationCode = `import { StreamVisualization } from 'streamviz/react'

return (
  <StreamVisualization
    code={streamedHtml}
    final={isComplete}
  />
)`

export function HomePage({ locale = 'en' }: { locale?: Locale }) {
  const t = copy[locale]
  return (
    <SiteFrame locale={locale}>
      <Section variant="muted" dividers={['bottom']} padding={10}>
        <VStack gap={8} hAlign="center" width="100%">
          <SiteContainer size="marketing">
            <VStack hAlign="center" width="100%">
              <VStack gap={5} hAlign="center" width="100%" maxWidth={860}>
              <Text type="supporting" color="accent" weight="bold">{t.eyebrow}</Text>
              <Heading level={1} type="display-1" justify="center">{t.title}</Heading>
              <Text type="large" color="secondary" justify="center">{t.body}</Text>
              <HStack gap={4} wrap="wrap" hAlign="center">
                <Link href={pathFor(locale, '/docs/getting-started')} isStandalone weight="bold">{t.primary} →</Link>
                <Link href="https://github.com/adamsy1996/streamviz" isExternalLink isStandalone color="secondary">
                  <HStack gap={1} vAlign="center"><Icon icon={MarkGithubIcon} size="sm" />{t.secondary}</HStack>
                </Link>
              </HStack>
              <VStack width="100%" maxWidth={420} gap={3}>
                <InstallCommand locale={locale} />
                <HStack gap={4} wrap="wrap" hAlign="center">
                  {t.proof.map(item => <HStack key={item} gap={1} vAlign="center"><Icon icon="success" color="success" size="sm" /><Text type="supporting">{item}</Text></HStack>)}
                </HStack>
              </VStack>
              </VStack>
            </VStack>
          </SiteContainer>
          <SiteContainer size="workbench">
            <VStack gap={3} width="100%">
              <HStack gap={6} hAlign="between" vAlign="end" wrap="wrap">
                <Heading level={2}>{t.demoLabel}</Heading>
                <Text color="secondary">{t.demoBody}</Text>
              </HStack>
              <HomeArtifactDemo locale={locale} />
            </VStack>
          </SiteContainer>
        </VStack>
      </Section>

      <Section variant="section" padding={10}>
        <SiteContainer size="marketing">
          <VStack gap={8}>
            <VStack gap={2} maxWidth={720}>
              <Text type="supporting" color="accent" weight="bold">Why StreamViz</Text>
              <Heading level={2} type="display-3">{t.benefitsTitle}</Heading>
            </VStack>
            <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
              {t.benefits.map(([title, body], index) => (
                <Card key={title} padding={6} elevation="low">
                  <VStack as="article" gap={3}>
                    <Text type="code" color="secondary">0{index + 1}</Text>
                    <Heading level={3}>{title}</Heading>
                    <Text color="secondary">{body}</Text>
                  </VStack>
                </Card>
              ))}
            </Grid>
          </VStack>
        </SiteContainer>
      </Section>

      <Section variant="muted" dividers={['top', 'bottom']} padding={10}>
        <SiteContainer size="marketing">
          <Grid columns={{ minWidth: 320, max: 2 }} gap={10} align="center" width="100%">
            <VStack gap={3} maxWidth={480}>
              <Icon icon="wrench" color="accent" size="lg" />
              <Text type="supporting" color="accent" weight="bold">{t.installEyebrow}</Text>
              <Heading level={2} type="display-3">{t.installTitle}</Heading>
              <Text color="secondary">{t.installBody}</Text>
              <Link href={pathFor(locale, '/docs/api-reference')} isStandalone weight="bold">{t.readApi} →</Link>
            </VStack>
            <CodeBlock code={integrationCode} language="tsx" title="app.tsx" width="100%" hasCopyButton hasLineNumbers highlightLines={[4, 5]} />
          </Grid>
        </SiteContainer>
      </Section>
      <SiteFooter locale={locale} />
    </SiteFrame>
  )
}
