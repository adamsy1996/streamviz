import type { Metadata } from 'next'
import { PlaygroundPage } from '@/components/playground-page'

export const metadata: Metadata = {
  title: 'StreamViz Playground',
  description: 'Chat with the Mastra-powered StreamViz agent and render live model-generated artifacts.',
}

export default function Page() { return <PlaygroundPage /> }
