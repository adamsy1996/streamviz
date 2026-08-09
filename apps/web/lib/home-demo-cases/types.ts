export type HomeDemoCase = {
  id: string
  callId: string
  visualizeType: 'diagram' | 'chart' | 'interactive' | 'mockup' | 'art'
  title: string
  prompt: string
  readyMessage: string
  loadingMessages: readonly [string, string, string]
  code: string
  codeAtProgress: (progress: number) => string
}
