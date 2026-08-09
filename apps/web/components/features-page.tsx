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

const text = {
    title: 'Built for streaming visual interfaces.', body: 'From incomplete HTML to a secure interactive artifact—without waiting for the final token.', architecture: 'Read the architecture', playground: 'Open playground',
    pipeline: [['HTML tokens', 'Tokens stream from the model'], ['Recover', 'Repair structure as it arrives'], ['Sanitize', 'Remove unsafe content and URLs'], ['Render', 'Update the document incrementally'], ['Interact', 'Connect safe host callbacks']],
    features: [['Render before completion.', 'StreamViz repairs structure and releases meaningful visual content as soon as it can be rendered.'], ['Secure by construction.', 'Strict sanitization, CSP, and iframe isolation ensure that only safe, intended content can run.'], ['Host-controlled by design.', 'Apps keep control of themes, clipboard, exports, prompts, and notifications through typed callbacks.']],
    runtimeTitle: 'One runtime, every artifact.', runtimeBody: 'Charts, tables, dashboards, diagrams, forms, and purpose-built tools—streamed, secured, and interactive.',
} as const

const pipelineIcons = [Braces, Braces, ShieldCheck, PanelsTopLeft, MessageSquare]
const hostCapabilities = [[Palette, 'Theme'], [Clipboard, 'Copy'], [Download, 'Export'], [MessageSquare, 'Prompt']] as const

export function FeaturesPage() {
  const t = text
  return (
    <SiteFrame>
      <Section variant="muted" dividers={['bottom']} padding={10}>
        <SiteContainer size="marketing">
          <Grid columns={{ minWidth: 420, max: 2 }} gap={10}>
            <VStack gap={5} vAlign="center">
              <Heading level={1} type="display-1">{t.title}</Heading>
              <Text type="large" color="secondary">{t.body}</Text>
              <HStack gap={4} wrap="wrap">
                <Link href="/docs/streaming-html" isStandalone weight="bold">{t.architecture} →</Link>
                <Link href="/playground" isStandalone color="secondary">{t.playground}</Link>
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
              <Banner status="success" title="Security boundary" description="Sanitization, strict CSP, and a sandboxed iframe isolate model-generated content." />
              <Card padding={5} variant="muted">
                <VStack gap={4}>
                  <Text weight="bold">Host control surface</Text>
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
            <Link href="/docs/api-reference" isStandalone weight="bold">Explore the API →</Link>
          </HStack>
        </SiteContainer>
      </Section>
      <SiteFooter />
    </SiteFrame>
  )
}
