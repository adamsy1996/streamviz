'use client'

import { Check, Copy } from 'lucide-react'
import { useRef, useState, type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

export function DocsCodeBlock(props: ComponentProps<'pre'>) {
  const codeRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    const value = codeRef.current?.innerText ?? ''
    setCopied(true)
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const field = document.createElement('textarea')
      field.value = value
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="docs-code-block">
      <pre ref={codeRef} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="docs-code-copy"
        aria-label={copied ? 'Code copied' : 'Copy code'}
        onClick={copyCode}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}
