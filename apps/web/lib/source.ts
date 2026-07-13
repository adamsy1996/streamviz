import { loader } from 'fumadocs-core/source'
import { docsEn, docsZh } from 'collections/server'

export const sourceEn = loader({
  baseUrl: '/docs',
  source: docsEn.toFumadocsSource(),
})

export const sourceZh = loader({
  baseUrl: '/zh/docs',
  source: docsZh.toFumadocsSource(),
})

export function docsSource(locale: 'en' | 'zh') {
  return locale === 'zh' ? sourceZh : sourceEn
}
