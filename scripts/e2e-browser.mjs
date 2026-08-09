import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const root = process.cwd()
const siteBuildId = path.join(root, 'apps/web/.next/BUILD_ID')
const visualIndex = path.join(root, 'examples/basic/dist/index.html')
const visualBaselineDir = path.join(root, 'tests/visual-baselines')
const updateVisuals = process.env.STREAMVIZ_UPDATE_VISUALS === '1'
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

const startNextServer = async () => {
  const port = 45000 + (process.pid % 1000)
  const url = `http://127.0.0.1:${port}/`
  const child = spawn('npm', [
    '--prefix', 'apps/web', 'run', 'start', '--',
    '--hostname', '127.0.0.1', '--port', String(port),
  ], {
    cwd: root,
    env: process.env,
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  let stderr = ''
  child.stderr?.setEncoding('utf8')
  child.stderr?.on('data', (chunk) => { stderr += chunk })
  await waitFor(() => new Promise((resolve) => {
    http.get(url, (response) => {
      response.resume()
      resolve(response.statusCode === 200)
    }).on('error', () => resolve(false))
  }), { timeoutMs: 15000, message: `Next server did not start.\n${stderr}` })
  return { process: child, url }
}

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
assert(fs.existsSync(siteBuildId), 'apps/web/.next/BUILD_ID is missing. Run npm run site:build first.')
assert(fs.existsSync(visualIndex), 'examples/basic/dist/index.html is missing. Run npm run example:build first.')

const compareOrUpdateScreenshot = (name, base64) => {
  const baselinePath = path.join(visualBaselineDir, `${name}.png`)
  const currentBuffer = Buffer.from(base64, 'base64')
  if (updateVisuals) {
    fs.mkdirSync(visualBaselineDir, { recursive: true })
    fs.writeFileSync(baselinePath, currentBuffer)
    return { updated: true, ratio: 0 }
  }
  assert(fs.existsSync(baselinePath), `Missing visual baseline ${baselinePath}. Run npm run test:visual:update.`)
  const baseline = PNG.sync.read(fs.readFileSync(baselinePath))
  const current = PNG.sync.read(currentBuffer)
  assert(
    baseline.width === current.width && baseline.height === current.height,
    `${name} dimensions changed: ${baseline.width}x${baseline.height} -> ${current.width}x${current.height}`,
  )
  const changed = pixelmatch(baseline.data, current.data, null, baseline.width, baseline.height, { threshold: 0.12 })
  return { updated: false, ratio: changed / (baseline.width * baseline.height) }
}

const captureStableScreenshot = async (browser, sessionId) => {
  let previous
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await sleep(250)
    const shot = await browser.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
      fromSurface: true,
    }, sessionId)
    if (previous) {
      const before = PNG.sync.read(Buffer.from(previous, 'base64'))
      const after = PNG.sync.read(Buffer.from(shot.data, 'base64'))
      const changed = pixelmatch(before.data, after.data, null, before.width, before.height, { threshold: 0.12 })
      if (changed / (before.width * before.height) <= 0.001) return shot.data
    }
    previous = shot.data
  }
  throw new Error('Visual fixture did not reach a stable paint')
}

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
let visualServer
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

  siteServer = await startNextServer()
  await browser.send('Page.navigate', { url: `${siteServer.url}playground/?e2e=1` }, sessionId)
  await waitFor(async () => {
    return evaluate(browser, sessionId, 'document.readyState === "complete"')
  }, { timeoutMs: 10000, message: 'Site did not finish loading' })

  await waitFor(async () => {
    return evaluate(browser, sessionId, 'Boolean(document.querySelector(\'[aria-label="StreamViz streaming playground"]\'))')
  }, { timeoutMs: 10000, message: 'Playground content did not render' })

  const hasRealRoute = await evaluate(browser, sessionId, 'location.pathname === "/playground/" && !location.hash')
  assert(hasRealRoute, 'Playground must use a real pathname route without a hash')

  await waitFor(async () => {
    return evaluate(browser, sessionId, `
      document.body.innerText.includes('03 · LIVE RENDER')
        && Boolean(document.querySelector('button[aria-label="Restart replay"], button[aria-label="Replay stream"]'))
    `)
  }, {
    timeoutMs: 10000,
    message: 'Playground must render the deterministic local replay without requiring model credentials',
  })

  visualServer = await startStaticServer(path.dirname(visualIndex))
  const visualCases = [
    { name: 'release-light', theme: 'light', width: 860, height: 760 },
    { name: 'release-dark', theme: 'dark', width: 860, height: 760 },
    { name: 'release-mobile', theme: 'light', width: 390, height: 844 },
  ]
  for (const visualCase of visualCases) {
    await browser.send('Emulation.setEmulatedMedia', { media: 'screen', features: [] }, sessionId)
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width: visualCase.width,
      height: visualCase.height,
      deviceScaleFactor: 1,
      mobile: visualCase.width < 500,
    }, sessionId)
    await browser.send('Page.navigate', {
      url: `${visualServer.url}?visual=1&theme=${visualCase.theme}`,
    }, sessionId)
    await waitFor(async () => evaluate(browser, sessionId, `
      document.readyState === 'complete'
        && Boolean(document.querySelector('[data-visual-regression="${visualCase.theme}"]'))
        && Boolean(document.querySelector('.visualize-widget-actions'))
    `), { timeoutMs: 10000, message: `${visualCase.name} did not stabilize` })
    await evaluate(browser, sessionId, 'scrollTo(0, 0)')
    const screenshot = await captureStableScreenshot(browser, sessionId)
    const comparison = compareOrUpdateScreenshot(visualCase.name, screenshot)
    assert(comparison.ratio <= 0.02, `${visualCase.name} changed by ${(comparison.ratio * 100).toFixed(2)}%`)
  }

  await browser.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'forced-colors', value: 'active' }],
  }, sessionId)
  await browser.send('Page.navigate', { url: `${visualServer.url}?visual=1&theme=dark` }, sessionId)
  await waitFor(async () => evaluate(browser, sessionId, `
    matchMedia('(forced-colors: active)').matches
      && Boolean(document.querySelector('.visualize-widget-actions'))
  `), { timeoutMs: 10000, message: 'Forced-colors mode did not activate' })
  const forcedColorHost = await evaluate(browser, sessionId, `(() => {
    const action = document.querySelector('.visualize-widget-action')
    const style = getComputedStyle(action)
    return { color: style.color, border: style.borderTopColor }
  })()`)
  assert(forcedColorHost.color !== 'rgba(0, 0, 0, 0)', 'Forced-colors action text must remain visible')
  assert(forcedColorHost.border !== 'rgba(0, 0, 0, 0)', 'Forced-colors action border must remain visible')

  console.log(`Browser runtime, ${visualCases.length} visual baselines, and forced-colors mode verified.`)
} finally {
  browser?.close()
  if (siteServer?.process.exitCode === null) {
    siteServer.process.kill()
    await new Promise((resolve) => {
      siteServer.process.once('exit', resolve)
      setTimeout(resolve, 2000)
    })
  }
  await new Promise((resolve) => visualServer?.server.close(resolve) || resolve())
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
