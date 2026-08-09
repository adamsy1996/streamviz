import { Grid } from '@astryxdesign/core/Grid'
import { VStack } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Section } from '@astryxdesign/core/Section'
import { Text } from '@astryxdesign/core/Text'
import { SignalLogo } from '@/components/signal-logo'
import { SiteContainer } from '@/components/site-container'
import { siteCopy } from '@/lib/site'

export function SiteFooter() {
  const copy = siteCopy
  return (
    <Section variant="muted" dividers={['top']} padding={8}>
      <SiteContainer size="marketing">
        <Grid columns={{ minWidth: 240, max: 3 }} gap={8}>
          <VStack gap={2}>
            <SignalLogo />
            <Text color="secondary">{copy.footer}</Text>
            <Text type="supporting">Apache-2.0 · Open source</Text>
          </VStack>
          <VStack gap={2}>
            <Text weight="bold">{copy.resources}</Text>
            <Link href="/docs">{copy.nav.docs}</Link>
            <Link href="/playground">{copy.nav.playground}</Link>
          </VStack>
          <VStack gap={2}>
            <Text weight="bold">{copy.community}</Text>
            <Link href="https://github.com/adamsy1996/streamviz" isExternalLink>GitHub</Link>
            <Link href="https://github.com/adamsy1996/streamviz/blob/main/CONTRIBUTING.md" isExternalLink>Contributing</Link>
            <Link href="https://github.com/adamsy1996/streamviz/blob/main/CODE_OF_CONDUCT.md" isExternalLink>Code of Conduct</Link>
          </VStack>
        </Grid>
      </SiteContainer>
    </Section>
  )
}
