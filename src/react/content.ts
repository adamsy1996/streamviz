export const clampHeight = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.ceil(value)))

export const estimateWidgetHeight = (source: string, final: boolean) => {
  if (!final) return 48
  const html = String(source || '')
  if (!html.trim()) return 48
  const visibleSource = html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '')
  const text = visibleSource.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const blockCount = (visibleSource.match(/<(?:section|article|header|footer|div|p|li|tr|h[1-6])\b/gi) || []).length
  const svgCount = (visibleSource.match(/<svg\b/gi) || []).length
  const tableRows = (visibleSource.match(/<tr\b/gi) || []).length
  const controlCount = (visibleSource.match(/<(?:button|input|select|textarea)\b/gi) || []).length
  const textHeight = Math.ceil(text.length / 88) * 24
  const structuralHeight = blockCount * 10 + tableRows * 24 + controlCount * 20 + svgCount * 192
  return clampHeight(96 + textHeight + structuralHeight, 176, 1280)
}

export const widgetSourceHasRenderableContent = (source: string) => {
  const html = String(source || '').trim()
  if (!html) return false
  if (typeof DOMParser !== 'undefined') {
    try {
      const body = new DOMParser().parseFromString(html, 'text/html').body
      if (!body) return false
      body.querySelectorAll('style,script,template,title,meta,link').forEach((node) => node.remove())
      if (String(body.textContent || '').replace(/\s+/g, '').trim()) return true
      return Boolean(body.querySelector('svg,canvas,img,picture,video,table,ul,ol,button,input,select,textarea,progress'))
    } catch (_error) {
      return false
    }
  }
  return Boolean(html
    .replace(/<head[\s\S]*?(?:<\/head>|$)/gi, '')
    .replace(/<style[\s\S]*?(?:<\/style>|$)/gi, '')
    .replace(/<script[\s\S]*?(?:<\/script>|$)/gi, '')
    .replace(/<template[\s\S]*?(?:<\/template>|$)/gi, '')
    .replace(/<title[\s\S]*?(?:<\/title>|$)/gi, '')
    .replace(/<(?:meta|link)\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, '').trim())
}
