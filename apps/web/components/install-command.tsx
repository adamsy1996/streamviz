'use client'

import { Card } from '@astryxdesign/core/Card'
import { Icon } from '@astryxdesign/core/Icon'
import { IconButton } from '@astryxdesign/core/IconButton'
import { HStack, StackItem } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { useState } from 'react'

export function InstallCommand({ locale = 'en' }: { locale?: 'en' | 'zh' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText('npm install streamviz')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  const label = locale === 'zh' ? '复制安装命令' : 'Copy install command'

  return (
    <Card padding={3} elevation="low" width="100%">
      <HStack gap={3} vAlign="center">
        <Text type="code" color="secondary">$</Text>
        <StackItem size="fill"><Text type="code" display="block" maxLines={1}>npm install streamviz</Text></StackItem>
        <IconButton label={label} tooltip={label} size="sm" variant="ghost" icon={<Icon icon={copied ? 'check' : 'copy'} size="sm" />} onClick={copy} />
      </HStack>
    </Card>
  )
}
