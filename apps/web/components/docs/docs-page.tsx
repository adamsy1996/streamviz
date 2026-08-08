import { Grid } from '@astryxdesign/core/Grid'
import { Card, HStack, StackItem, VStack } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Section } from '@astryxdesign/core/Section'
import { Heading, Text } from '@astryxdesign/core/Text'
import type { ReactNode } from 'react'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { DocsToc } from '@/components/docs/docs-toc'
import { SiteContainer } from '@/components/site-container'
import { SiteFrame } from '@/components/site-frame'
import { flatDocs } from '@/lib/docs-navigation'
import type { Locale } from '@/lib/site'

type TocItem = { title: ReactNode; url: string; depth: number }

export function DocsPage({ locale, title, description, toc, slug, children }: { locale: Locale; title: string; description?: string; toc: TocItem[]; slug: string; children: ReactNode }) {
  const pages = flatDocs(locale)
  const index = pages.findIndex(page => page.slug === slug)
  const previous = index > 0 ? pages[index - 1] : null
  const next = index >= 0 && index < pages.length - 1 ? pages[index + 1] : null

  return (
    <SiteFrame locale={locale} sideNav={<DocsSidebar locale={locale} />}>
      <HStack align="start" width="100%">
        <StackItem size="fill">
          <Section variant="section" padding={10}>
            <SiteContainer size="content">
              <VStack as="article" gap={8}>
                <VStack gap={3}>
                  <Text type="supporting" color="accent" weight="bold">STREAMVIZ DOCUMENTATION</Text>
                  <Heading level={1} type="display-2">{title}</Heading>
                  {description ? <Text type="large" color="secondary">{description}</Text> : null}
                </VStack>
                <VStack gap={4}>{children}</VStack>
                <Grid columns={{ minWidth: 260, max: 2 }} gap={3}>
                  {previous ? <Card padding={4} variant="muted"><VStack gap={1}><Text type="supporting">{locale === 'zh' ? '上一页' : 'Previous'}</Text><Link href={previous.href} isStandalone weight="bold">← {previous.title}</Link></VStack></Card> : <Card variant="transparent" />}
                  {next ? <Card padding={4} variant="muted"><VStack gap={1} hAlign="end"><Text type="supporting">{locale === 'zh' ? '下一页' : 'Next'}</Text><Link href={next.href} isStandalone weight="bold">{next.title} →</Link></VStack></Card> : null}
                </Grid>
              </VStack>
            </SiteContainer>
          </Section>
        </StackItem>
        <DocsToc items={toc} locale={locale} />
      </HStack>
    </SiteFrame>
  )
}
