import type { Metadata } from 'next'
import { FeaturesPage } from '@/components/features-page'

export const metadata: Metadata = { title: 'Features', description: 'Streaming recovery, isolated rendering, and host-controlled visual artifacts.' }

export default function Page() { return <FeaturesPage locale="en" /> }
