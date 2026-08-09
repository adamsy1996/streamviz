import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'

const invocationRoot = process.env.INIT_CWD
const candidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), 'apps/agent/.env'),
  ...(invocationRoot
    ? [
        resolve(invocationRoot, '.env'),
        resolve(invocationRoot, 'apps/agent/.env'),
      ]
    : []),
]

for (const candidate of new Set(candidates)) {
  if (!existsSync(candidate)) continue
  loadEnvFile(candidate)
}

export const env = {
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  deepseekModel: process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash',
  storageUrl: process.env.MASTRA_STORAGE_URL ?? 'file:./.mastra/streamviz.db',
  resourceId: process.env.MASTRA_RESOURCE_ID ?? 'local-user',
}
