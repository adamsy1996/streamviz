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

const copy = {
    eyebrow: 'Open-source streaming UI runtime', title: 'Turn model output into live interfaces.',
    body: 'StreamViz recovers partial model-generated HTML, isolates it safely, and renders interactive visualizations inside your React conversation—before generation finishes.',
    primary: 'Get started', secondary: 'View on GitHub', demoLabel: 'One stream. Three visible stages.',
    demoBody: 'Watch a function call become an interactive artifact without hiding the model-to-interface boundary.',
    proof: ['React 19 ready', 'Secure iframe boundary', 'Partial HTML recovery'], benefitsTitle: 'The missing runtime between tokens and UI.',
    benefits: [['Render during generation', 'Recover useful structure from incomplete HTML and update the same artifact as new tokens arrive.'], ['Secure by default', 'Sanitize generated markup and execute each artifact inside a restrictive iframe sandbox.'], ['Host-controlled', 'Keep themes, exports, clipboard, prompts, and notifications inside your application boundary.']],
    installEyebrow: 'React integration', installTitle: 'One component. Every streamed chunk.', installBody: 'Pass the accumulated HTML as it arrives, then set final when the stream ends. StreamViz recovers and renders every useful state in between.', readApi: 'Read the React API',
} as const

const integrationCode = `import { StreamVisualization } from 'streamviz-react/react'

return (
  <StreamVisualization
    code={streamedHtml}
    final={isComplete}
  />
)`

export function HomePage() {
  const t = copy
  return (
    <SiteFrame>
      <Section variant="muted" dividers={['bottom']} padding={10}>
        <VStack gap={8} hAlign="center" width="100%">
          <SiteContainer size="marketing">
            <VStack hAlign="center" width="100%">
              <VStack gap={5} hAlign="center" width="100%" maxWidth={860}>
              <Text type="supporting" color="accent" weight="bold">{t.eyebrow}</Text>
              <Heading level={1} type="display-1" justify="center">{t.title}</Heading>
              <Text type="large" color="secondary" justify="center">{t.body}</Text>
              <HStack gap={4} wrap="wrap" hAlign="center">
                <Link href="/docs/getting-started" isStandalone weight="bold">{t.primary} →</Link>
                <Link href="https://github.com/adamsy1996/streamviz" isExternalLink isStandalone color="secondary">
                  <HStack gap={1} vAlign="center"><Icon icon={MarkGithubIcon} size="sm" />{t.secondary}</HStack>
                </Link>
              </HStack>
              <VStack width="100%" maxWidth={420} gap={3}>
                <InstallCommand />
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
              <HomeArtifactDemo />
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
              <Link href="/docs/api-reference" isStandalone weight="bold">{t.readApi} →</Link>
            </VStack>
            <CodeBlock code={integrationCode} language="tsx" title="app.tsx" width="100%" hasCopyButton hasLineNumbers highlightLines={[4, 5]} />
          </Grid>
        </SiteContainer>
      </Section>
      <SiteFooter />
    </SiteFrame>
  )
}
