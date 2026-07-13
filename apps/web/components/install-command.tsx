'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function InstallCommand({ locale = 'en' }: { locale?: 'en' | 'zh' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText('npm install streamviz')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  return (
    <div className="install-command">
      <span>$</span><code>npm install streamviz</code>
      <Button variant="ghost" size="icon-sm" onClick={copy} aria-label={locale === 'zh' ? '复制安装命令' : 'Copy install command'}>
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}
