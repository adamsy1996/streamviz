type AnyRecord = Record<string, any>

const visualizeWidgetHeightCache = new Map<string, number>()
const VISUALIZE_WIDGET_HEIGHT_STORAGE_PREFIX = 'visualize-widget-height:'
const VISUALIZE_WIDGET_MAX_CACHED_HEIGHT = 3600
const DEFAULT_VISUALIZE_LOADING_MESSAGE = '正在生成可视化代码'

const isObject = (value: unknown): value is AnyRecord =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value))

export const visualizeWidgetSourceKey = (value: unknown) => {
  const source = String(value || '')
  if (!source) return ''
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `${source.length}:${(hash >>> 0).toString(36)}`
}

export const getCachedVisualizeWidgetHeight = (key: string) => {
  const normalizedKey = String(key || '')
  if (!normalizedKey) return null
  const memoryHeight = visualizeWidgetHeightCache.get(normalizedKey)
  if (typeof memoryHeight === 'number' && Number.isFinite(memoryHeight) && memoryHeight > 0) {
    return Math.min(memoryHeight, VISUALIZE_WIDGET_MAX_CACHED_HEIGHT)
  }
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const stored = Number(window.localStorage.getItem(`${VISUALIZE_WIDGET_HEIGHT_STORAGE_PREFIX}${normalizedKey}`))
    if (Number.isFinite(stored) && stored > 0) {
      const trusted = Math.min(stored, VISUALIZE_WIDGET_MAX_CACHED_HEIGHT)
      visualizeWidgetHeightCache.set(normalizedKey, trusted)
      return trusted
    }
  } catch (_error) {
    return null
  }
  return null
}

export const setCachedVisualizeWidgetHeight = (key: string, value: number) => {
  const normalizedKey = String(key || '')
  const normalizedValue = Math.min(Math.ceil(Number(value) || 0), VISUALIZE_WIDGET_MAX_CACHED_HEIGHT)
  if (!normalizedKey || normalizedValue <= 0) return
  visualizeWidgetHeightCache.set(normalizedKey, normalizedValue)
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.setItem(`${VISUALIZE_WIDGET_HEIGHT_STORAGE_PREFIX}${normalizedKey}`, String(normalizedValue))
  } catch (_error) {
    // Height cache is only a performance hint.
  }
}

const decodePartialJsonString = (value: string) => {
  let output = ''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (char !== '\\') {
      output += char
      continue
    }
    const next = value[index + 1]
    if (!next) break
    index += 1
    if (next === 'n') output += '\n'
    else if (next === 'r') output += '\r'
    else if (next === 't') output += '\t'
    else if (next === 'b') output += '\b'
    else if (next === 'f') output += '\f'
    else if (next === '"' || next === '\\' || next === '/') output += next
    else if (next === 'u') {
      const hex = value.slice(index + 1, index + 5)
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        output += String.fromCharCode(Number.parseInt(hex, 16))
        index += 4
      } else {
        break
      }
    } else {
      output += next
    }
  }
  return output
}

export const extractPartialJsonString = (raw: string, key: string) => {
  const source = String(raw || '')
  const target = `"${key}"`
  const keyIndex = source.indexOf(target)
  if (keyIndex < 0) return ''
  const colonIndex = source.indexOf(':', keyIndex + target.length)
  if (colonIndex < 0) return ''
  let quoteIndex = colonIndex + 1
  while (quoteIndex < source.length && /\s/.test(source[quoteIndex])) quoteIndex += 1
  if (source[quoteIndex] !== '"') return ''
  let escaped = false
  let value = ''
  for (let index = quoteIndex + 1; index < source.length; index += 1) {
    const char = source[index]
    if (escaped) {
      value += `\\${char}`
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') return decodePartialJsonString(value)
    value += char
  }
  if (escaped) value += '\\'
  return decodePartialJsonString(value)
}

export const extractPartialJsonStringArray = (raw: string, key: string) => {
  const source = String(raw || '')
  const target = `"${key}"`
  const keyIndex = source.indexOf(target)
  if (keyIndex < 0) return []
  const colonIndex = source.indexOf(':', keyIndex + target.length)
  if (colonIndex < 0) return []
  let index = colonIndex + 1
  while (index < source.length && /\s/.test(source[index])) index += 1
  if (source[index] !== '[') return []
  index += 1
  const items: string[] = []
  while (index < source.length) {
    while (index < source.length && /[\s,]/.test(source[index])) index += 1
    if (source[index] === ']') break
    if (source[index] !== '"') break
    index += 1
    let escaped = false
    let value = ''
    let closed = false
    for (; index < source.length; index += 1) {
      const char = source[index]
      if (escaped) {
        value += `\\${char}`
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === '"') {
        closed = true
        index += 1
        break
      }
      value += char
    }
    if (escaped) value += '\\'
    const decoded = decodePartialJsonString(value).trim()
    if (decoded) items.push(decoded)
    if (!closed) break
  }
  return items
}

const normalizeStringList = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : []

const firstObject = (...values: unknown[]) => {
  for (const value of values) {
    if (isObject(value)) return value
  }
  return {}
}

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    const text = String(value || '')
    if (text.trim()) return text
  }
  return ''
}

export const extractVisualizeWidgetPayload = (tool: AnyRecord = {}) => {
  const state = firstObject(tool.state)
  const args = firstObject(tool.arguments, tool.input, state.input, state.arguments)
  const metadata = firstObject(tool.metadata, state.metadata)
  const raw = firstString(tool.tool_raw_input, tool.raw_input, tool.raw, state.raw)
  const status = firstString(tool.tool_status, tool.status, state.status).trim().toLowerCase()
  const finalCode = firstString(metadata.widget_code, args.widget_code)
  const partialCode = finalCode || extractPartialJsonString(raw, 'widget_code')
  const title = firstString(
      metadata.title,
      args.title,
      extractPartialJsonString(raw, 'title') ||
      '可视化预览'
  ).trim()
  const loadingMessages = [
    ...normalizeStringList(metadata.loading_messages),
    ...normalizeStringList(args.loading_messages),
    ...extractPartialJsonStringArray(raw, 'loading_messages'),
  ]
  return {
    title,
    code: partialCode,
    exportCode: finalCode || partialCode,
    loadingMessage: loadingMessages[0] || DEFAULT_VISUALIZE_LOADING_MESSAGE,
    loadingMessages: loadingMessages.length ? Array.from(new Set(loadingMessages)) : [DEFAULT_VISUALIZE_LOADING_MESSAGE],
    final: Boolean(finalCode) && !['running', 'pending', 'queued', 'in_progress', 'executing'].includes(status),
    status,
  }
}
