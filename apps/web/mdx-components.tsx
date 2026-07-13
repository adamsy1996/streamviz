import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import { DocsCodeBlock } from '@/components/docs/docs-code-block'

function DocsLink({ href = '', ...props }: ComponentProps<'a'>) {
  if (href.startsWith('/')) {
    return <Link href={href} {...props} />
  }

  const external = href.startsWith('http://') || href.startsWith('https://')
  return <a href={href} {...props} {...(external ? { rel: 'noreferrer', target: '_blank' } : {})} />
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    a: DocsLink,
    pre: DocsCodeBlock,
    ...components,
  }
}
