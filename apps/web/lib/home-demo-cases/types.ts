export type HomeDemoCase = {
  id: string
  callId: string
  visualizeType: 'diagram' | 'chart' | 'interactive' | 'mockup' | 'art'
  title: string
  titleZh: string
  prompt: string
  promptZh: string
  readyMessage: string
  readyMessageZh: string
  loadingMessages: readonly [string, string, string]
  loadingMessagesZh: readonly [string, string, string]
  code: string
  codeAtProgress: (progress: number) => string
}
