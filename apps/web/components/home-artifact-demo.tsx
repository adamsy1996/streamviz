'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useTheme } from 'next-themes'
import { StreamVisualization } from 'streamviz/react'
import { SignalMark } from '@/components/signal-logo'
import { revenueArtifact } from '@/lib/artifact-examples'

export function HomeArtifactDemo({ locale = 'en' }: { locale?: 'en' | 'zh' }) {
  const [progress, setProgress] = useState(72)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => current >= 100 ? current : Math.min(100, current + 4))
    }, 260)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (progress < 100) return undefined
    const timer = window.setTimeout(() => setProgress(34), 3200)
    return () => window.clearTimeout(timer)
  }, [progress])

  const code = useMemo(() => revenueArtifact.code.slice(0, Math.floor(revenueArtifact.code.length * progress / 100)), [progress])
  const final = progress === 100

  return (
    <div className="home-artifact">
      <header>
        <strong>{locale === 'zh' ? revenueArtifact.titleZh : revenueArtifact.title}</strong>
        <span><i />{final ? (locale === 'zh' ? '可交互' : 'Interactive') : (locale === 'zh' ? '生成中' : 'Streaming')}</span>
        <em><SignalMark />{locale === 'zh' ? '实时产物' : 'Live artifact'}</em>
      </header>
      <div className="home-artifact-body">
        <div className="home-code-signal" aria-hidden="true">
          <span>&lt;section</span><b style={{ '--stream-progress': `${progress}%` } as CSSProperties} /><i />
        </div>
        <StreamVisualization
          title={locale === 'zh' ? revenueArtifact.titleZh : revenueArtifact.title}
          code={code}
          exportCode={revenueArtifact.code}
          loadingMessage={locale === 'zh' ? '正在接收流式 HTML' : 'Receiving streamed HTML'}
          loadingMessages={locale === 'zh' ? ['正在接收流式 HTML', '正在恢复可渲染界面', '正在启用交互'] : ['Receiving streamed HTML', 'Recovering renderable UI', 'Enabling interactions']}
          final={final}
          theme={{ mode: resolvedTheme === 'dark' ? 'dark' : 'light' }}
        />
      </div>
    </div>
  )
}
