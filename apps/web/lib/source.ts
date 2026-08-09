import { loader } from 'fumadocs-core/source'
import { docs } from 'collections/server'

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
})
