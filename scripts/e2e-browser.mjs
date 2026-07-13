import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const root = process.cwd()
const siteIndex = path.join(root, 'apps/web/out/index.html')
const chromeCandidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitFor = async (fn, options = {}) => {
  const timeoutMs = options.timeoutMs || 10000
  const intervalMs = options.intervalMs || 100
  const started = Date.now()
  let lastError
  while (Date.now() - started < timeoutMs) {
    try {
      const value = await fn()
      if (value) return value
    } catch (error) {
      lastError = error
    }
    await sleep(intervalMs)
  }
  throw lastError || new Error(options.message || 'Timed out waiting for browser condition')
}

const requestJson = (url) => new Promise((resolve, reject) => {
  http.get(url, (response) => {
    let body = ''
    response.setEncoding('utf8')
    response.on('data', (chunk) => {
      body += chunk
    })
    response.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
  }).on('error', reject)
})

const contentTypes = new Map([
  ['.html', 'text/html;charset=utf-8'],
  ['.js', 'text/javascript;charset=utf-8'],
  ['.css', 'text/css;charset=utf-8'],
  ['.svg', 'image/svg+xml'],
])

const startStaticServer = (rootDir) => new Promise((resolve, reject) => {
  const server = http.createServer((request, response) => {
    try {
      const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
      const pathname = decodeURIComponent(requestUrl.pathname)
      const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
      const requestedPath = path.resolve(rootDir, relativePath)
      const filePath = fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()
        ? path.join(requestedPath, 'index.html')
        : requestedPath
      if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        response.writeHead(404)
        response.end('Not found')
        return
      }
      response.writeHead(200, {
        'content-type': contentTypes.get(path.extname(filePath)) || 'application/octet-stream',
      })
      fs.createReadStream(filePath).pipe(response)
    } catch (error) {
      response.writeHead(500)
      response.end(String(error?.message || error))
    }
  })
  server.on('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    const port = typeof address === 'object' && address ? address.port : null
    if (!port) {
      server.close()
      reject(new Error('Unable to start static server'))
      return
    }
    resolve({ server, url: `http://127.0.0.1:${port}/` })
  })
})

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.nextId = 1
    this.pending = new Map()
    this.handlers = new Map()
  }

  async connect() {
    assert(typeof WebSocket === 'function', 'Node.js WebSocket global is required for browser e2e tests.')
    this.socket = new WebSocket(this.wsUrl)
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data || '{}'))
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)))
        else resolve(message.result)
        return
      }
      const handlers = this.handlers.get(message.method) || []
      handlers.forEach((handler) => handler(message.params || {}, message.sessionId))
    })
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true })
      this.socket.addEventListener('error', reject, { once: true })
    })
  }

  on(method, handler) {
    const handlers = this.handlers.get(method) || []
    handlers.push(handler)
    this.handlers.set(method, handlers)
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++
    const payload = { id, method, params }
    if (sessionId) payload.sessionId = sessionId
    this.socket.send(JSON.stringify(payload))
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
    })
  }

  close() {
    this.socket?.close()
  }
}

const evaluate = async (client, sessionId, expression, contextId) => {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    ...(contextId ? { contextId } : {}),
  }, sessionId)
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed')
  }
  return result.result?.value
}

const chromePath = chromeCandidates.find((candidate) => fs.existsSync(candidate))
assert(chromePath, 'Chrome executable not found. Set CHROME_PATH to run browser e2e tests.')
assert(fs.existsSync(siteIndex), 'apps/web/out/index.html is missing. Run npm run site:build first.')

const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'streamviz-chrome-'))
const debuggingPort = Number(process.env.STREAMING_VISUALIZATION_CHROME_PORT || (43000 + (process.pid % 1000)))
const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${debuggingPort}`,
  '--remote-debugging-address=127.0.0.1',
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] })

let browser
let siteServer
let chromeStderr = ''
chrome.stderr?.setEncoding('utf8')
chrome.stderr?.on('data', (chunk) => {
  chromeStderr += chunk
})

try {
  const version = await waitFor(() => {
    if (chrome.exitCode !== null) {
      throw new Error(`Chrome exited before DevTools was ready.\n${chromeStderr}`)
    }
    return requestJson(`http://127.0.0.1:${debuggingPort}/json/version`).catch(() => null)
  }, { timeoutMs: 10000, message: `Timed out waiting for Chrome DevTools on port ${debuggingPort}.\n${chromeStderr}` })
  browser = new CdpClient(version.webSocketDebuggerUrl)
  await browser.connect()

  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true })
  await browser.send('Page.enable', {}, sessionId)
  await browser.send('Runtime.enable', {}, sessionId)

  siteServer = await startStaticServer(path.dirname(siteIndex))
  await browser.send('Page.navigate', { url: `${siteServer.url}playground/?e2e=1` }, sessionId)
  await waitFor(async () => {
    return evaluate(browser, sessionId, 'document.readyState === "complete"')
  }, { timeoutMs: 10000, message: 'Site did not finish loading' })

  await waitFor(async () => {
    return evaluate(browser, sessionId, 'document.body.innerText.includes("StreamViz Playground")')
  }, { timeoutMs: 5000, message: 'Playground content did not render' })

  const hasRealRoute = await evaluate(browser, sessionId, 'location.pathname === "/playground/" && !location.hash')
  assert(hasRealRoute, 'Playground must use a real pathname route without a hash')

  await waitFor(async () => {
    return evaluate(browser, sessionId, 'Boolean(document.querySelector("iframe.visualize-widget-frame"))')
  }, { timeoutMs: 9000, message: 'Streaming visualization iframe did not render' })

  const sandbox = await evaluate(browser, sessionId, 'document.querySelector("iframe.visualize-widget-frame")?.getAttribute("sandbox")')
  assert(sandbox === 'allow-scripts allow-forms', `Unexpected iframe sandbox: ${sandbox}`)

  const srcdocHasCsp = await evaluate(browser, sessionId, 'document.querySelector("iframe.visualize-widget-frame")?.srcdoc.includes("Content-Security-Policy")')
  assert(srcdocHasCsp, 'Iframe srcdoc must include Content-Security-Policy')

  await waitFor(async () => {
    return evaluate(browser, sessionId, 'Boolean(document.querySelector(".visualize-widget-actions"))')
  }, { timeoutMs: 12000, message: 'Final artifact actions did not appear' })

  await waitFor(async () => {
    return evaluate(browser, sessionId, 'document.body.innerText.includes("Browser e2e prompt")')
  }, { timeoutMs: 5000, message: 'Final iframe script did not trigger sendPrompt bridge' })

  console.log('Browser iframe runtime verified.')
} finally {
  browser?.close()
  await new Promise((resolve) => siteServer?.server.close(resolve) || resolve())
  if (chrome.exitCode === null) {
    chrome.kill()
    await new Promise((resolve) => {
      chrome.once('exit', resolve)
      setTimeout(resolve, 2000)
    })
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true })
      break
    } catch (error) {
      if (attempt === 4) throw error
      await sleep(150)
    }
  }
}
