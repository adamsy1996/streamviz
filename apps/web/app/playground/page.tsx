import type { Metadata } from 'next'
import { PlaygroundPage } from '@/components/playground-page'

export const metadata: Metadata = { title: 'Playground', description: 'Stream HTML, inspect every state, and interact with the final artifact.' }

export default function Page() { return <PlaygroundPage locale="en" /> }
