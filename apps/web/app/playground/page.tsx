import type { Metadata } from 'next'
import { PlaygroundPage } from '@/components/playground-page'

export const metadata: Metadata = {
  title: 'Mini Agent Debugger',
  description: 'Run the server-side StreamViz mini agent, inspect its event stream, and render live model-generated artifacts.',
}

export default function Page() { return <PlaygroundPage /> }
