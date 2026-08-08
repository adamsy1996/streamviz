'use client'

import { Banner } from '@astryxdesign/core/Banner'
import { CodeBlock } from '@astryxdesign/core/CodeBlock'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { Card, HStack, VStack } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Section } from '@astryxdesign/core/Section'
import { Heading, Text } from '@astryxdesign/core/Text'
import { Braces, Clipboard, Download, MessageSquare, Palette, PanelsTopLeft, ShieldCheck } from 'lucide-react'
import { SiteContainer } from '@/components/site-container'
import { SiteFooter } from '@/components/site-footer'
import { SiteFrame } from '@/components/site-frame'
import { pathFor, type Locale } from '@/lib/site'

const text = {
  en: {
    title: 'Built for streaming visual interfaces.', body: 'From incomplete HTML to a secure interactive artifact—without waiting for the final token.', architecture: 'Read the architecture', playground: 'Open playground',
    pipeline: [['HTML tokens', 'Tokens stream from the model'], ['Recover', 'Repair structure as it arrives'], ['Sanitize', 'Remove unsafe content and URLs'], ['Render', 'Update the document incrementally'], ['Interact', 'Connect safe host callbacks']],
    features: [['Render before completion.', 'StreamViz repairs structure and releases meaningful visual content as soon as it can be rendered.'], ['Secure by construction.', 'Strict sanitization, CSP, and iframe isolation ensure that only safe, intended content can run.'], ['Host-controlled by design.', 'Apps keep control of themes, clipboard, exports, prompts, and notifications through typed callbacks.']],
    runtimeTitle: 'One runtime, every artifact.', runtimeBody: 'Charts, tables, dashboards, diagrams, forms, and purpose-built tools—streamed, secured, and interactive.',
  },
  zh: {
    title: '专为流式可视化界面构建。', body: '从尚未完成的 HTML 到安全可交互的产物——不必等待最后一个 token。', architecture: '阅读架构说明', playground: '打开体验场',
    pipeline: [['HTML tokens', '模型持续输出 tokens'], ['恢复', '到达时修复结构'], ['净化', '移除不安全内容与 URL'], ['渲染', '增量更新 document'], ['交互', '接通安全宿主 callback']],
    features: [['在完成之前开始渲染。', 'StreamViz 会修复结构，并在视觉内容具备可渲染条件时立即释放。'], ['从结构上保证安全。', '严格净化、CSP 与 iframe 隔离确保只有安全且符合预期的内容可以运行。'], ['由宿主明确掌控。', '应用通过 typed callbacks 管理主题、剪贴板、导出、提示词与通知。']],
    runtimeTitle: '一个 runtime，承载每一种产物。', runtimeBody: '图表、表格、仪表盘、关系图、表单与专用工具——全部支持流式、安全与交互。',
  },
} as const

const pipelineIcons = [Braces, Braces, ShieldCheck, PanelsTopLeft, MessageSquare]
const hostCapabilities = [[Palette, 'Theme'], [Clipboard, 'Copy'], [Download, 'Export'], [MessageSquare, 'Prompt']] as const

export function FeaturesPage({ locale = 'en' }: { locale?: Locale }) {
  const t = text[locale]
  return (
    <SiteFrame locale={locale}>
      <Section variant="muted" dividers={['bottom']} padding={10}>
        <SiteContainer size="marketing">
          <Grid columns={{ minWidth: 420, max: 2 }} gap={10}>
            <VStack gap={5} vAlign="center">
              <Heading level={1} type="display-1">{t.title}</Heading>
              <Text type="large" color="secondary">{t.body}</Text>
              <HStack gap={4} wrap="wrap">
                <Link href={pathFor(locale, '/docs/streaming-html')} isStandalone weight="bold">{t.architecture} →</Link>
                <Link href={pathFor(locale, '/playground')} isStandalone color="secondary">{t.playground}</Link>
              </HStack>
            </VStack>
            <Card padding={6} elevation="med">
              <VStack gap={4}>
                <Text type="supporting" weight="bold" color="accent">STREAM PROCESSING PIPELINE</Text>
                {t.pipeline.map(([label, detail], index) => (
                  <HStack key={label} gap={4} vAlign="center">
                    <Icon icon={pipelineIcons[index]} color={index === 2 ? 'success' : 'accent'} />
                    <VStack gap={1}><Text weight="bold">{label}</Text><Text type="supporting">{detail}</Text></VStack>
                  </HStack>
                ))}
              </VStack>
            </Card>
          </Grid>
        </SiteContainer>
      </Section>

      <Section padding={10}>
        <SiteContainer size="marketing">
          <VStack gap={8}>
            <Grid columns={{ minWidth: 300, max: 3 }} gap={4}>
              {t.features.map(([title, body], index) => (
                <Card key={title} padding={6} elevation="low">
                  <VStack gap={3}><Text type="code" color="secondary">0{index + 1}</Text><Heading level={2}>{title}</Heading><Text color="secondary">{body}</Text></VStack>
                </Card>
              ))}
            </Grid>
            <Grid columns={{ minWidth: 420, max: 2 }} gap={6}>
              <Banner status="success" title={locale === 'zh' ? '安全边界' : 'Security boundary'} description={locale === 'zh' ? '净化、严格 CSP 与 sandboxed iframe 共同隔离模型生成内容。' : 'Sanitization, strict CSP, and a sandboxed iframe isolate model-generated content.'} />
              <Card padding={5} variant="muted">
                <VStack gap={4}>
                  <Text weight="bold">{locale === 'zh' ? '宿主控制面' : 'Host control surface'}</Text>
                  <HStack gap={4} wrap="wrap">{hostCapabilities.map(([CapabilityIcon, label]) => <HStack key={label} gap={1} vAlign="center"><Icon icon={CapabilityIcon} color="accent" size="sm" /><Text type="supporting">{label}</Text></HStack>)}</HStack>
                  <CodeBlock code={'onCopy · onExport · onSendPrompt · onNotify'} language="typescript" width="100%" isWrapped size="sm" />
                </VStack>
              </Card>
            </Grid>
          </VStack>
        </SiteContainer>
      </Section>

      <Section variant="muted" dividers={['top']} padding={10}>
        <SiteContainer size="marketing">
          <HStack gap={8} hAlign="between" vAlign="center" wrap="wrap">
            <VStack gap={2}><Heading level={2} type="display-3">{t.runtimeTitle}</Heading><Text color="secondary">{t.runtimeBody}</Text></VStack>
            <Link href={pathFor(locale, '/docs/api-reference')} isStandalone weight="bold">{locale === 'zh' ? '查看 API' : 'Explore the API'} →</Link>
          </HStack>
        </SiteContainer>
      </Section>
      <SiteFooter locale={locale} />
    </SiteFrame>
  )
}
