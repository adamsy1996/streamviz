'use client'

import { ChatComposer } from '@astryxdesign/core/Chat'
import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { HStack, Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout'
import { Heading, Text } from '@astryxdesign/core/Text'
import { ToggleButton, ToggleButtonGroup } from '@astryxdesign/core/ToggleButton'
import {
  CalculatorIcon,
  ChartBarIcon,
  PencilSquareIcon,
  PresentationChartLineIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

type ChatLandingProps = {
  prompt: string
  isRunning: boolean
  isConfigured: boolean
  onPromptChange: (value: string) => void
  onSubmit: (value: string) => void
}

const categories = [
  { key: 'charts', label: 'Charts', icon: ChartBarIcon },
  { key: 'diagrams', label: 'Diagrams', icon: PresentationChartLineIcon },
  { key: 'interactive', label: 'Interactive', icon: CalculatorIcon },
  { key: 'visual', label: 'Visual', icon: PencilSquareIcon },
] as const

const suggestions = {
  charts: [
    { heading: 'Compare model performance', body: 'Explore latency, quality, and cost in one chart.', prompt: 'Compare three AI models by latency, quality, and cost.' },
    { heading: 'Analyze a portfolio', body: 'Turn investment assumptions into a useful visual.', prompt: 'Build an interactive calculator comparing two investment plans.' },
  ],
  diagrams: [
    { heading: 'Map a system', body: 'Explain a technical flow with a clear diagram.', prompt: 'Create an agent conversation system sequence diagram.' },
    { heading: 'Explain a process', body: 'Make a complex lifecycle easier to understand.', prompt: 'Explain the urban water cycle as a visual diagram.' },
  ],
  interactive: [
    { heading: 'Investment calculator', body: 'Adjust inputs and compare long-term outcomes.', prompt: 'Build an interactive investment calculator with adjustable assumptions.' },
    { heading: 'Scenario planner', body: 'Test multiple assumptions in a live interface.', prompt: 'Build an interactive scenario planner for a household energy budget.' },
  ],
  visual: [
    { heading: 'Create an illustration', body: 'Turn an explanation into a visual narrative.', prompt: 'Create a visual illustration explaining the urban water cycle.' },
    { heading: 'Design a live dashboard', body: 'Present a changing system as an operational surface.', prompt: 'Create a live dashboard for a city bike sharing network.' },
  ],
} as const

export function ChatLanding({ prompt, isRunning, isConfigured, onPromptChange, onSubmit }: ChatLandingProps) {
  const [category, setCategory] = useState<string | null>('charts')
  const activeSuggestions = category ? suggestions[category as keyof typeof suggestions] : null

  return (
    <Layout
      height="fill"
      contentWidth={720}
      padding={6}
      content={(
        <LayoutContent>
          <VStack gap={8} vAlign="center" height="100%">
            <VStack gap={1}>
              <HStack gap={2} vAlign="center">
                <Icon icon={SparklesIcon} size="md" color="accent" />
                <Text type="large" as="h2">StreamViz</Text>
              </HStack>
              <Text type="display-2" as="h1">What should we visualize?</Text>
            </VStack>

            <ChatComposer
              value={prompt}
              onChange={onPromptChange}
              onSubmit={onSubmit}
              isStopShown={isRunning}
              isDisabled={!isConfigured && !isRunning}
              placeholder="Ask for a chart, diagram, calculator, dashboard, or visual explanation…"
              density="spacious"
              footerActions={<Text type="supporting" color="secondary">Powered by the StreamViz agent runtime</Text>}
            />

            <VStack gap={6} width="100%">
              <ToggleButtonGroup label="Visualization type" value={category} onChange={setCategory} size="lg">
                {categories.map(item => (
                  <ToggleButton key={item.key} value={item.key} label={item.label} icon={<Icon icon={item.icon} size="sm" />} />
                ))}
              </ToggleButtonGroup>

              {activeSuggestions ? (
                <Grid columns={{ minWidth: 280 }} gap={3}>
                  {activeSuggestions.map(item => (
                    <ClickableCard
                      key={item.heading}
                      label={item.heading}
                      variant="muted"
                      padding={3}
                      onClick={() => onPromptChange(item.prompt)}
                    >
                      <VStack gap={0.5}>
                        <Heading level={4}>{item.heading}</Heading>
                        <Text type="body" color="secondary" size="xsm">{item.body}</Text>
                      </VStack>
                    </ClickableCard>
                  ))}
                </Grid>
              ) : null}
            </VStack>
          </VStack>
        </LayoutContent>
      )}
    />
  )
}
