'use client'

import { Check, Copy } from 'lucide-react'
import { useRef, useState, type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

type HighlightedPreProps = ComponentProps<'pre'> & { icon?: string }

export function DocsCodeBlock({ icon: _icon, ...props }: HighlightedPreProps) {
  const codeRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    const value = codeRef.current?.innerText ?? ''
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="docs-code-shell group relative my-6 overflow-hidden rounded-lg border bg-[var(--slate-2)] shadow-sm">
      <pre ref={codeRef} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-2 border bg-background/85 opacity-70 backdrop-blur transition-opacity hover:opacity-100 group-hover:opacity-100"
        aria-label={copied ? 'Code copied' : 'Copy code'}
        onClick={copyCode}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}
