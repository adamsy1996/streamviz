import type { Metadata } from 'next'
import { ChatPage } from '@/components/chat-page'

export const metadata: Metadata = {
  title: 'StreamViz Chat',
  description: 'Chat with the Mastra-powered StreamViz agent and render live model-generated artifacts.',
}

export default function Page() {
  return <ChatPage />
}
