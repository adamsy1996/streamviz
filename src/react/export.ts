export const safeExportName = (value: string) =>
  String(value || 'visualize-widget').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').slice(0, 80) || 'visualize-widget'

export const buildExportDocument = (source: string, title: string) => {
  const html = String(source || '')
  if (/<html[\s>]/i.test(html)) return html
  return ['<!doctype html>', '<html lang="zh-CN">', '<head>', '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${title.replace(/[<&>]/g, '') || 'Visualize Widget'}</title>`,
    '</head>', '<body>', html, '</body>', '</html>'].join('\n')
}

export const downloadTextFile = (source: string, fileName: string) => {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return
  const url = URL.createObjectURL(new Blob([source], { type: 'text/html;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export const writePngDataUrlToClipboard = async (
  dataUrl: string,
  writer?: (dataUrl: string) => Promise<boolean> | boolean,
) => {
  if (writer) return Boolean(await writer(dataUrl))
  if (typeof ClipboardItem === 'undefined') return false
  const blob = await (await fetch(dataUrl)).blob()
  await navigator.clipboard?.write([new ClipboardItem({ 'image/png': blob })])
  return true
}
