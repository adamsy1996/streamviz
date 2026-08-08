import Link from 'next/link'
import { pathFor, type Locale } from '@/lib/site'

export function SignalMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 34 22" aria-hidden="true">
      <path d="M1 12h7l3-8 5 15 4-11 4 8h9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SignalLogo({ locale = 'en' }: { locale?: Locale }) {
  return (
    <Link className="site-logo" href={pathFor(locale)} aria-label="StreamViz home">
      <SignalMark />
      <span>StreamViz</span>
    </Link>
  )
}
