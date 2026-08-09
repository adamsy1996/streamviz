import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { LibSQLStore } from '@mastra/libsql'
import { env } from './env.js'

function resolveAgentRoot() {
  const invocationRoot = process.env.INIT_CWD ?? process.cwd()
  const workspaceAgentRoot = resolve(invocationRoot, 'apps/agent')
  if (existsSync(resolve(workspaceAgentRoot, 'package.json'))) return workspaceAgentRoot
  return invocationRoot
}

const agentRoot = resolveAgentRoot()
const storageUrl = env.storageUrl.startsWith('file:./')
  ? `file:${resolve(agentRoot, env.storageUrl.slice('file:./'.length))}`
  : env.storageUrl

if (storageUrl.startsWith('file:')) {
  mkdirSync(dirname(storageUrl.slice('file:'.length)), { recursive: true })
}

export const storage = new LibSQLStore({
  id: 'streamviz-storage',
  url: storageUrl,
})
