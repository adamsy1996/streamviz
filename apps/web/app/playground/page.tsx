import type { Metadata } from 'next'
import { PlaygroundPage } from '@/components/playground-page'

export const metadata: Metadata = {
  title: 'Streaming Playground',
  description: 'Replay StreamViz tool streams, inspect partial widget payloads, and watch visual artifacts render without a model or API key.',
}

export default function Page() { return <PlaygroundPage /> }
