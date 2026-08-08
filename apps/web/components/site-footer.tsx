import Link from 'next/link'
import { MarkGithubIcon } from '@primer/octicons-react'
import { SignalLogo } from '@/components/signal-logo'
import { pathFor, siteCopy, type Locale } from '@/lib/site'

export function SiteFooter({ locale = 'en' }: { locale?: Locale }) {
  const copy = siteCopy[locale]
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <SignalLogo locale={locale} />
          <p>{copy.footer}</p>
          <span>Apache-2.0 · Open source</span>
        </div>
        <div className="footer-links">
          <strong>{copy.resources}</strong>
          <Link href={pathFor(locale, '/docs')}>{copy.nav.docs}</Link>
          <Link href={pathFor(locale, '/playground')}>{copy.nav.playground}</Link>
        </div>
        <div className="footer-links">
          <strong>{copy.community}</strong>
          <a href="https://github.com/adamsy1996/streamviz"><MarkGithubIcon />GitHub</a>
          <a href="https://github.com/adamsy1996/streamviz/blob/main/CONTRIBUTING.md">Contributing</a>
          <a href="https://github.com/adamsy1996/streamviz/blob/main/CODE_OF_CONDUCT.md">Code of Conduct</a>
        </div>
      </div>
    </footer>
  )
}
