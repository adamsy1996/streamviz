'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function InstallCommand({ locale = 'en', className = '' }: { locale?: 'en' | 'zh'; className?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText('npm install streamviz')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  return (
    <div className={`flex min-h-control-xl items-center gap-3 rounded-lg border bg-card px-3 font-mono text-[13px] shadow-surface-sm ${className}`}>
      <span className="select-none text-muted-foreground">$</span>
      <code className="min-w-0 flex-1 truncate text-foreground">npm install streamviz</code>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="-mr-1 text-muted-foreground hover:text-foreground"
        onClick={copy}
        aria-label={locale === 'zh' ? '复制安装命令' : 'Copy install command'}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}
