import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCachedVisualizeWidgetHeight,
  setCachedVisualizeWidgetHeight,
  visualizeWidgetSourceKey,
} from '../core'
import importedVisualizeWidgetRuntimeCss from '../theme/visualize-widget-runtime.css?raw'

const VISUALIZE_WIDGET_RUNTIME_CSS_FALLBACK = [
  ':root{',
  '--color-background-' + 'primary:Canvas;',
  '--border-radius-' + 'md:0;',
  '}',
  '.c-purple{}',
  '.sr-only{}',
  '.t,.ts,.th{}',
].join('')
const visualizeWidgetRuntimeCss = String(importedVisualizeWidgetRuntimeCss || '').trim() || VISUALIZE_WIDGET_RUNTIME_CSS_FALLBACK

export type VisualizeWidgetFrameProps = {
  title: string
  code: string
  exportCode: string
  loadingMessage: string
  loadingMessages?: string[]
  final: boolean
  onSendPrompt?: (prompt: string) => void
  renderIcon?: (name: 'check' | 'copy' | 'download' | 'code-xml', options: { className?: string }) => React.ReactNode
  notify?: (message: string, variant: 'success' | 'error') => void
  writeImageToClipboard?: (dataUrl: string) => Promise<boolean> | boolean
  getTheme?: () => 'light' | 'dark' | string
  cssVarNames?: string[]
}

const VISUALIZE_WIDGET_VARS = [
  '--sem-bg-page',
  '--sem-bg-surface',
  '--sem-bg-card',
  '--sem-border-subtle',
  '--sem-border-default',
  '--sem-border-strong',
  '--sem-text-primary',
  '--sem-text-secondary',
  '--sem-text-tertiary',
  '--sem-accent-primary',
  '--sem-status-info',
  '--sem-status-success',
  '--sem-status-warning',
  '--sem-status-danger',
  '--blue-9',
  '--cyan-9',
  '--green-9',
  '--amber-9',
  '--orange-9',
  '--red-9',
  '--violet-9',
  '--pink-9',
  '--shadow-lg',
  '--text-sm',
  '--font-sans',
  '--font-mono',
  '--spacing',
]

const spacingPx = (steps: number) => steps * 4
const COPY_FEEDBACK_DURATION_MS = 1000
const VISUALIZE_WIDGET_MIN_HEIGHT = spacingPx(12)
const VISUALIZE_WIDGET_MAX_HEIGHT = 1536
const DEFAULT_VISUALIZE_LOADING_MESSAGE = '正在生成可视化代码'
const VISUALIZE_LOADING_MESSAGE_DWELL_MS = 1000
const VISUALIZE_WIDGET_HEIGHT_SHRINK_TOLERANCE = spacingPx(8)
const VISUALIZE_WIDGET_SNAPSHOT_TIMEOUT_MS = 8000

const clampHeight = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.ceil(value)))

const estimateWidgetHeight = (source: string, final: boolean) => {
  if (!final) return VISUALIZE_WIDGET_MIN_HEIGHT
  const html = String(source || '')
  if (!html.trim()) return VISUALIZE_WIDGET_MIN_HEIGHT
  const visibleSource = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
  const text = visibleSource
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const blockCount = (visibleSource.match(/<(?:section|article|header|footer|div|p|li|tr|h[1-6])\b/gi) || []).length
  const svgCount = (visibleSource.match(/<svg\b/gi) || []).length
  const tableRows = (visibleSource.match(/<tr\b/gi) || []).length
  const controlCount = (visibleSource.match(/<(?:button|input|select|textarea)\b/gi) || []).length
  const textHeight = Math.ceil(text.length / 88) * spacingPx(6)
  const structuralHeight = blockCount * spacingPx(2.5)
    + tableRows * spacingPx(6)
    + controlCount * spacingPx(5)
    + svgCount * spacingPx(48)
  return clampHeight(spacingPx(24) + textHeight + structuralHeight, spacingPx(44), 1280)
}

const widgetSourceHasRenderableContent = (source: string) => {
  const html = String(source || '').trim()
  if (!html) return false
  if (typeof DOMParser !== 'undefined') {
    try {
      const parsed = new DOMParser().parseFromString(html, 'text/html')
      const body = parsed.body
      if (!body) return false
      body.querySelectorAll('style,script,template,title,meta,link').forEach((node) => node.remove())
      const visibleText = String(body.textContent || '')
        .replace(/\s+/g, '')
        .trim()
      if (visibleText) return true
      return Boolean(body.querySelector('svg,canvas,img,picture,video,table,ul,ol,button,input,select,textarea,progress'))
    } catch (_error) {
      return false
    }
  }
  const fallbackSource = html
    .replace(/<head[\s\S]*?(?:<\/head>|$)/gi, '')
    .replace(/<style[\s\S]*?(?:<\/style>|$)/gi, '')
    .replace(/<script[\s\S]*?(?:<\/script>|$)/gi, '')
    .replace(/<template[\s\S]*?(?:<\/template>|$)/gi, '')
    .replace(/<title[\s\S]*?(?:<\/title>|$)/gi, '')
    .replace(/<(?:meta|link)\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, '')
    .trim()
  return Boolean(fallbackSource)
}

const safeExportName = (value: string) =>
  String(value || 'visualize-widget')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'visualize-widget'

const buildExportDocument = (source: string, title: string) => {
  const html = String(source || '')
  if (/<html[\s>]/i.test(html)) return html
  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${title.replace(/[<&>]/g, '') || 'Visualize Widget'}</title>`,
    '</head>',
    '<body>',
    html,
    '</body>',
    '</html>',
  ].join('\n')
}

const downloadTextFile = (source: string, fileName: string) => {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return
  const blob = new Blob([source], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

const dataUrlToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl)
  return response.blob()
}

const writePngDataUrlToClipboard = async (
  dataUrl: string,
  writer?: (dataUrl: string) => Promise<boolean> | boolean,
) => {
  if (writer) return Boolean(await writer(dataUrl))
  if (typeof ClipboardItem === 'undefined') return false
  const blob = await dataUrlToBlob(dataUrl)
  await navigator.clipboard?.write([new ClipboardItem({ 'image/png': blob })])
  return true
}

const collectCssVars = (styles: CSSStyleDeclaration, names: string[]) =>
  names
    .map((name) => {
      const value = styles.getPropertyValue(name).trim()
      return value ? `${name}:${value};` : ''
    })
    .join('')

const defaultRenderIcon = (
  name: 'check' | 'copy' | 'download' | 'code-xml',
  options: { className?: string },
) => {
  const label = name === 'check' ? '✓' : name === 'copy' ? '⧉' : name === 'download' ? '↓' : '</>'
  return <span className={options.className} aria-hidden="true">{label}</span>
}

const buildRuntimeDocument = (id: string) => {
  const runtime = `
(() => {
  const widgetId = ${JSON.stringify(id)};
  const root = document.getElementById('root');
  let lastExecuted = '';
  let lastRenderedSource = '';
  const blockedElements = new Set(['iframe', 'object', 'embed', 'base']);
  const urlAttributes = new Set(['href', 'src', 'xlink:href', 'formaction', 'poster']);
  const allowedResourceOrigins = new Set([
    'https://cdnjs.cloudflare.com',
    'https://esm.sh',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
  ]);
  const isAllowedResourceUrl = (value) => {
    try {
      const url = new URL(String(value || ''), document.baseURI);
      return url.protocol === 'https:' && allowedResourceOrigins.has(url.origin);
    } catch (_error) {
      return false;
    }
  };
  const stripActiveContent = (doc) => {
    Array.from(doc.querySelectorAll(Array.from(blockedElements).join(','))).forEach((node) => node.remove());
    Array.from(doc.querySelectorAll('*')).forEach((node) => {
      Array.from(node.attributes || []).forEach((attribute) => {
        const name = String(attribute.name || '').trim().toLowerCase();
        const value = String(attribute.value || '').trim();
        if (name.startsWith('on')) {
          node.removeAttribute(attribute.name);
          return;
        }
        if (urlAttributes.has(name) && /^javascript:/i.test(value)) {
          node.removeAttribute(attribute.name);
        }
      });
    });
  };
  const applyHostCssVars = (cssText, theme) => {
    let style = document.getElementById('host-vars');
    if (!style) {
      style = document.createElement('style');
      style.id = 'host-vars';
      document.head.appendChild(style);
    }
    const normalizedTheme = String(theme || '').trim() === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = normalizedTheme;
    document.documentElement.style.colorScheme = normalizedTheme;
    style.textContent = ':root{' + String(cssText || '') + '}';
  };
  window.sendPrompt = (text) => {
    const prompt = String(text || '').trim().slice(0, 4000);
    if (!prompt) return;
    parent.postMessage({ type: 'visualize-widget:send-prompt', id: widgetId, prompt }, '*');
  };
  const visibleContentNodes = () =>
    Array.from(root?.children || []).filter((node) => !['STYLE', 'SCRIPT', 'TEMPLATE', 'TITLE', 'META', 'LINK'].includes(node.tagName));
  const isTransparentColor = (value) => {
    const color = String(value || '').replace(/\\s+/g, '').toLowerCase();
    if (!color || color === 'transparent') return true;
    if (!color.startsWith('rgb')) return false;
    const channels = color.match(/[\\d.]+/g) || [];
    return channels.length >= 4 && Number(channels[3]) === 0;
  };
  const hasVisiblePaintBox = (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
    const element = node;
    const styles = window.getComputedStyle(element);
    if (styles.display === 'none' || styles.visibility === 'hidden' || Number(styles.opacity) === 0) return false;
    const rects = Array.from(element.getClientRects ? element.getClientRects() : []);
    if (!rects.some((rect) => rect.width > 0 && rect.height > 0)) return false;
    if (element.matches('svg,canvas,img,picture,video,table,ul,ol,button,input,select,textarea,progress')) return true;
    const borderPainted = ['Top', 'Right', 'Bottom', 'Left'].some((side) => Number.parseFloat(styles['border-app' + side + 'Width'] || '0') > 0);
    return borderPainted || styles.backgroundImage !== 'none' || styles.boxShadow !== 'none' || !isTransparentColor(styles.backgroundColor);
  };
  const measureContentHeight = () => {
    if (!root) return 0;
    const nodes = visibleContentNodes();
    if (!nodes.length) return 0;
    const rootRect = root.getBoundingClientRect();
    let bottom = 0;
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      bottom = Math.max(bottom, rect.bottom - rootRect.top);
    });
    const height = Math.max(1, bottom);
    return Number.isFinite(height) ? height : 0;
  };
  const postSize = () => {
    const height = measureContentHeight();
    parent.postMessage({ type: 'visualize-widget:size', id: widgetId, height, hasContent: hasRenderedContent() }, '*');
  };
  const hasRenderedContent = () => {
    if (!root) return false;
    const clone = root.cloneNode(true);
    clone.querySelectorAll?.('style,script,template,title,meta,link').forEach((node) => node.remove());
    const visibleText = String(clone.textContent || '').replace(/\\s+/g, '').trim();
    if (visibleText) return true;
    if (root.querySelector('svg,canvas,img,picture,video,table,ul,ol,button,input,select,textarea,progress')) return true;
    return Array.from(root.querySelectorAll('*')).some((node) => !['STYLE', 'SCRIPT'].includes(node.tagName) && hasVisiblePaintBox(node));
  };
  const htmlHasRenderedContent = (html) => {
    const container = document.createElement('div');
    container.innerHTML = String(html || '');
    container.querySelectorAll('style,script,template,title,meta,link').forEach((node) => node.remove());
    const visibleText = String(container.textContent || '').replace(/\\s+/g, '').trim();
    if (visibleText) return true;
    return Boolean(container.querySelector('svg,canvas,img,picture,video,table,ul,ol,button,input,select,textarea,progress'));
  };
  const normalizeSvgInk = () => {
    if (!root) return;
    const blackInk = new Set(['black', '#' + '000', '#' + '000000']);
    root.querySelectorAll('svg text, svg tspan').forEach((node) => {
      const fill = String(node.getAttribute('fill') || '').trim().toLowerCase();
      if (!fill || blackInk.has(fill)) node.style.fill = 'var(--sem-text-secondary)';
    });
    root.querySelectorAll('svg [stroke]').forEach((node) => {
      const stroke = String(node.getAttribute('stroke') || '').trim().toLowerCase();
      if (blackInk.has(stroke)) node.style.stroke = 'var(--sem-border-default)';
    });
    root.querySelectorAll('svg [fill]').forEach((node) => {
      if (node.matches('text,tspan')) return;
      const fill = String(node.getAttribute('fill') || '').trim().toLowerCase();
      if (blackInk.has(fill)) node.style.fill = 'var(--sem-bg-surface)';
    });
  };
  const snapshotStyleText = () =>
    Array.from(document.querySelectorAll('style')).map((node) => node.textContent || '').join('\\n');
  const canvasDataUrlFromSerializedSvg = (serialized, width, height, background) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(width * scale);
        canvas.height = Math.ceil(height * scale);
        const context = canvas.getContext('2d');
        if (!context) {
          URL.revokeObjectURL(url);
          reject(new Error('missing canvas context'));
          return;
        }
        context.scale(scale, scale);
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('snapshot render failed'));
    };
    image.src = url;
  });
  const directSvgSnapshotElement = () => {
    const nodes = visibleContentNodes();
    if (nodes.length !== 1) return null;
    const only = nodes[0];
    if (only?.matches?.('svg')) return only;
    const children = Array.from(only?.children || []).filter((node) => !['STYLE', 'SCRIPT', 'TEMPLATE', 'TITLE', 'META', 'LINK'].includes(node.tagName));
    if (children.length === 1 && children[0]?.matches?.('svg')) return children[0];
    return null;
  };
  const svgSnapshotSize = (svgNode, fallbackWidth, fallbackHeight) => {
    const rect = svgNode.getBoundingClientRect();
    const viewBox = svgNode.viewBox?.baseVal;
    const attrWidth = Number.parseFloat(svgNode.getAttribute('width') || '');
    const attrHeight = Number.parseFloat(svgNode.getAttribute('height') || '');
    return {
      width: Math.max(1, Math.ceil(viewBox?.width || attrWidth || rect.width || fallbackWidth || 1)),
      height: Math.max(1, Math.ceil(viewBox?.height || attrHeight || rect.height || fallbackHeight || 1)),
    };
  };
  const freezeSvgComputedStyles = (sourceNode, targetNode) => {
    const styleProperties = [
      'color',
      'fill',
      'fill-opacity',
      'stroke',
      'stroke-opacity',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-dasharray',
      'stroke-dashoffset',
      'opacity',
      'font-family',
      'font-size',
      'font-style',
      'font-weight',
      'letter-spacing',
      'text-anchor',
      'dominant-baseline',
      'paint-order',
      'stop-color',
      'stop-opacity',
      'marker-start',
      'marker-mid',
      'marker-end',
    ];
    const sourceNodes = [sourceNode, ...Array.from(sourceNode.querySelectorAll('*'))];
    const targetNodes = [targetNode, ...Array.from(targetNode.querySelectorAll('*'))];
    sourceNodes.forEach((node, index) => {
      const target = targetNodes[index];
      if (!target || node.nodeType !== Node.ELEMENT_NODE) return;
      const styles = window.getComputedStyle(node);
      styleProperties.forEach((property) => {
        const value = styles.getPropertyValue(property);
        if (value) target.style.setProperty(property, value);
      });
    });
  };
  const serializeSvgForSnapshot = (svgNode, width, height) => {
    const clone = svgNode.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    freezeSvgComputedStyles(svgNode, clone);
    const styleText = snapshotStyleText();
    if (styleText) {
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = styleText;
      clone.insertBefore(style, clone.firstChild);
    }
    return new XMLSerializer().serializeToString(clone);
  };
  const buildSnapshotDataUrl = () => new Promise((resolve, reject) => {
    try {
      if (!root) {
        reject(new Error('missing root'));
        return;
      }
      const rootRect = root.getBoundingClientRect();
      const width = Math.max(1, Math.ceil(document.documentElement.clientWidth || root.scrollWidth || rootRect.width || 1));
      const height = Math.max(1, Math.ceil(measureContentHeight() || root.scrollHeight || rootRect.height || 1));
      const rootStyles = window.getComputedStyle(document.documentElement);
      const bodyStyles = window.getComputedStyle(document.body);
      const background = rootStyles.getPropertyValue('--sem-bg-page').trim() || bodyStyles.backgroundColor || 'Canvas';
      const renderForeignObjectSnapshot = () => {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        wrapper.style.width = width + 'px';
        wrapper.style.minHeight = height + 'px';
        wrapper.style.margin = '0';
        wrapper.style.background = background;
        wrapper.style.color = bodyStyles.color || 'CanvasText';
        wrapper.style.font = bodyStyles.font || '14px system-ui';
        wrapper.style.boxSizing = 'border-box';
        const style = document.createElement('style');
        style.textContent = snapshotStyleText() + '\\nhtml,body,#root{overflow:visible!important;background:transparent!important}';
        wrapper.appendChild(style);
        const content = root.cloneNode(true);
        const sourceCanvases = Array.from(root.querySelectorAll('canvas'));
        const snapshotCanvases = Array.from(content.querySelectorAll('canvas'));
        sourceCanvases.forEach((canvas, index) => {
          const target = snapshotCanvases[index];
          if (!target) return;
          try {
            const dataUrl = canvas.toDataURL('image/png');
            if (!String(dataUrl || '').startsWith('data:image/')) return;
            const rect = canvas.getBoundingClientRect();
            const image = document.createElement('img');
            image.src = dataUrl;
            image.className = target.className || '';
            image.style.cssText = target.getAttribute('style') || '';
            image.setAttribute('alt', target.getAttribute('aria-label') || 'Canvas snapshot');
            const width = canvas.getAttribute('width') || String(canvas.width || Math.ceil(rect.width || 0));
            const height = canvas.getAttribute('height') || String(canvas.height || Math.ceil(rect.height || 0));
            if (Number(width) > 0) image.setAttribute('width', width);
            if (Number(height) > 0) image.setAttribute('height', height);
            target.replaceWith(image);
          } catch (_error) {}
        });
        wrapper.appendChild(content);
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('width', '100%');
        foreignObject.setAttribute('height', '100%');
        foreignObject.appendChild(wrapper);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.appendChild(foreignObject);
        return canvasDataUrlFromSerializedSvg(new XMLSerializer().serializeToString(svg), width, height, background);
      };
      const svgCandidate = directSvgSnapshotElement();
      if (svgCandidate) {
        const size = svgSnapshotSize(svgCandidate, width, height);
        canvasDataUrlFromSerializedSvg(serializeSvgForSnapshot(svgCandidate, size.width, size.height), size.width, size.height, background)
          .then(resolve)
          .catch(() => renderForeignObjectSnapshot().then(resolve).catch(reject));
        return;
      }
      renderForeignObjectSnapshot().then(resolve).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
  const sanitizeAndRender = (html, final) => {
    const source = String(html || '');
    if (final && source.trim() && source === lastRenderedSource) {
      postSize();
      parent.postMessage({ type: 'visualize-widget:rendered', id: widgetId, hasContent: hasRenderedContent() }, '*');
      return;
    }
    const parsed = new DOMParser().parseFromString(source, 'text/html');
    const scripts = Array.from(parsed.querySelectorAll('script'));
    scripts.forEach((script) => script.remove());
    stripActiveContent(parsed);
    const headStyles = Array.from(parsed.head?.querySelectorAll('style') || []).map((node) => node.outerHTML).join('');
    const nextHtml = headStyles + (parsed.body ? parsed.body.innerHTML : source);
    if (!final && !htmlHasRenderedContent(nextHtml) && hasRenderedContent()) {
      postSize();
      parent.postMessage({ type: 'visualize-widget:rendered', id: widgetId, hasContent: true }, '*');
      return;
    }
    root.innerHTML = nextHtml;
    if (final && source.trim()) lastRenderedSource = source;
    const firstContent = visibleContentNodes()[0];
    if (firstContent) firstContent.setAttribute('data-visualize-root', '');
    root.insertAdjacentHTML('beforeend', '<style data-visualize-platform-normalize>[data-visualize-root]{background:transparent!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;margin-top:0!important;padding-top:0!important}</style>');
    normalizeSvgInk();
    postSize();
    parent.postMessage({ type: 'visualize-widget:rendered', id: widgetId, hasContent: hasRenderedContent() }, '*');
    if (!final || !source.trim() || source === lastExecuted) return;
    lastExecuted = source;
    const runScripts = async () => {
      for (const script of scripts) {
        const nextScript = document.createElement('script');
        nextScript.async = false;
        if (script.src) {
          if (!isAllowedResourceUrl(script.src)) continue;
          nextScript.src = script.src;
          await new Promise((resolve) => {
            nextScript.onload = resolve;
            nextScript.onerror = resolve;
            document.body.appendChild(nextScript);
          });
          continue;
        }
        nextScript.textContent = script.textContent || '';
        document.body.appendChild(nextScript);
      }
    };
    runScripts().finally(() => {
      requestAnimationFrame(postSize);
      setTimeout(postSize, 80);
      setTimeout(postSize, 300);
    });
    requestAnimationFrame(postSize);
    setTimeout(postSize, 80);
    setTimeout(postSize, 300);
  };
  window.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.id !== widgetId) return;
    if (data.type === 'visualize-widget:copy-snapshot') {
      buildSnapshotDataUrl()
        .then((dataUrl) => parent.postMessage({ type: 'visualize-widget:snapshot', id: widgetId, dataUrl }, '*'))
        .catch((error) => parent.postMessage({ type: 'visualize-widget:snapshot', id: widgetId, error: String(error?.message || error || 'snapshot failed') }, '*'));
      return;
    }
    if (data.type !== 'visualize-widget:update') return;
    applyHostCssVars(data.cssVars, data.theme);
    sanitizeAndRender(data.html, Boolean(data.final));
  });
  window.addEventListener('load', postSize);
  window.addEventListener('resize', postSize);
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(postSize);
    if (root) observer.observe(root);
  }
  parent.postMessage({ type: 'visualize-widget:ready', id: widgetId }, '*');
  requestAnimationFrame(postSize);
})();
`
  const allowedResourceSources = 'https://cdnjs.cloudflare.com https://esm.sh https://cdn.jsdelivr.net https://unpkg.com'
  const csp = "default-src 'none'; script-src 'unsafe-inline' " + allowedResourceSources + "; style-src 'unsafe-inline' " + allowedResourceSources + "; img-src data: blob: " + allowedResourceSources + "; media-src data: blob: " + allowedResourceSources + "; font-src data: " + allowedResourceSources + "; connect-src " + allowedResourceSources + "; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<meta http-equiv="Content-Security-Policy" content="${csp}">`,
    '<style>',
    visualizeWidgetRuntimeCss,
    '</style>',
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.34.1/dist/tabler-icons.min.css">',
    '</head>',
    '<body>',
    '<div id="root"></div>',
    '<script>',
    runtime,
    '</script>',
    '</body>',
    '</html>',
  ].join('\n')
}

export default function VisualizeWidgetFrame({
  title,
  code,
  exportCode,
  loadingMessage,
  loadingMessages,
  final,
  onSendPrompt,
  renderIcon = defaultRenderIcon,
  notify,
  writeImageToClipboard,
  getTheme,
  cssVarNames = VISUALIZE_WIDGET_VARS,
}: VisualizeWidgetFrameProps) {
  const blockRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const idRef = useRef(`visualize-widget-${Math.random().toString(36).slice(2)}`)
  const [cssVars, setCssVars] = useState('')
  const sourceKey = useMemo(() => visualizeWidgetSourceKey(exportCode || code), [code, exportCode])
  const hasCode = String(code || '').trim().length > 0
  const hasRenderableCode = useMemo(() => widgetSourceHasRenderableContent(code), [code])
  const [height, setHeight] = useState(() =>
    getCachedVisualizeWidgetHeight(sourceKey) || VISUALIZE_WIDGET_MIN_HEIGHT
  )
  const [ready, setReady] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copying, setCopying] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [renderReleased, setRenderReleased] = useState(() => Boolean(final && hasCode))
  const [lockedLoadingMessages, setLockedLoadingMessages] = useState<string[] | null>(null)
  const cssVarsRef = useRef('')
  const latestPayloadRef = useRef({ code: '', final: false })
  const measuredHeightRef = useRef<number | null>(null)
  const measuredHeightKeyRef = useRef('')
  const finalRef = useRef(final)
  finalRef.current = final
  const snapshotRequestRef = useRef<{
    resolve: (value: string) => void
    reject: (error: Error) => void
    timer: number
  } | null>(null)
  const srcDoc = useMemo(() => buildRuntimeDocument(idRef.current), [])
  const providedLoadingMessages = useMemo(() => {
    const messages = Array.isArray(loadingMessages)
      ? loadingMessages.map((message) => String(message || '').trim()).filter(Boolean)
      : []
    const singleMessage = String(loadingMessage || '').trim()
    if (!messages.length && singleMessage && singleMessage !== DEFAULT_VISUALIZE_LOADING_MESSAGE) messages.push(singleMessage)
    return Array.from(new Set(messages))
  }, [loadingMessage, loadingMessages])
  const incomingLoadingMessages = useMemo(() => {
    return providedLoadingMessages.length ? providedLoadingMessages : [DEFAULT_VISUALIZE_LOADING_MESSAGE]
  }, [providedLoadingMessages])
  const effectiveLoadingMessages = lockedLoadingMessages || incomingLoadingMessages
  const activeLoadingMessage = effectiveLoadingMessages[loadingMessageIndex % effectiveLoadingMessages.length] || DEFAULT_VISUALIZE_LOADING_MESSAGE
  const displayCode = renderReleased ? code : ''
  const hasDisplayCode = String(displayCode || '').trim().length > 0
  const loading = !hasDisplayCode
  const showActions = final && rendered && hasDisplayCode

  const postCurrentPayload = () => {
    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow) return
    frameWindow.postMessage({
      type: 'visualize-widget:update',
      id: idRef.current,
      html: latestPayloadRef.current.code,
      final: latestPayloadRef.current.final,
      cssVars: cssVarsRef.current,
      theme: getTheme?.() || document.documentElement.dataset.theme || 'dark',
    }, '*')
  }

  useEffect(() => {
    const node = blockRef.current
    if (!node) return
    const nextCssVars = collectCssVars(window.getComputedStyle(node), cssVarNames)
    cssVarsRef.current = nextCssVars
    setCssVars(nextCssVars)
  }, [cssVarNames])

  useEffect(() => {
    setReady(false)
    setRendered(false)
  }, [srcDoc])

  useEffect(() => {
    setLoadingMessageIndex(0)
  }, [effectiveLoadingMessages])

  useEffect(() => {
    if (lockedLoadingMessages) return
    if (providedLoadingMessages.length) {
      setLockedLoadingMessages(providedLoadingMessages)
      return
    }
    if (hasCode) setLockedLoadingMessages([DEFAULT_VISUALIZE_LOADING_MESSAGE])
  }, [hasCode, lockedLoadingMessages, providedLoadingMessages])

  useEffect(() => {
    if (!hasCode) {
      setRenderReleased(false)
      return undefined
    }
    if (!hasRenderableCode && !final) {
      setRenderReleased(false)
      return undefined
    }
    if (final) {
      setRenderReleased(true)
      return undefined
    }
    if (renderReleased) return undefined
    const dwellMs = Math.max(VISUALIZE_LOADING_MESSAGE_DWELL_MS, effectiveLoadingMessages.length * VISUALIZE_LOADING_MESSAGE_DWELL_MS)
    const timer = window.setTimeout(() => setRenderReleased(true), dwellMs)
    return () => window.clearTimeout(timer)
  }, [effectiveLoadingMessages.length, final, hasCode, hasRenderableCode, renderReleased])

  useEffect(() => {
    if (!loading || effectiveLoadingMessages.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setLoadingMessageIndex((index) => index + 1)
    }, VISUALIZE_LOADING_MESSAGE_DWELL_MS)
    return () => window.clearInterval(timer)
  }, [effectiveLoadingMessages.length, loading])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      const data = event.data || {}
      if (data.id !== idRef.current) return
      if (data.type === 'visualize-widget:ready') {
        setReady(true)
        postCurrentPayload()
        return
      }
      if (data.type === 'visualize-widget:rendered') {
        const hasContent = Boolean(data.hasContent)
        setRendered(hasContent)
        if (!hasContent && !finalRef.current) setRenderReleased(false)
        return
      }
      if (data.type === 'visualize-widget:snapshot') {
        const pending = snapshotRequestRef.current
        if (!pending) return
        window.clearTimeout(pending.timer)
        snapshotRequestRef.current = null
        if (data.error) {
          pending.reject(new Error(String(data.error)))
          return
        }
        pending.resolve(String(data.dataUrl || ''))
        return
      }
      if (data.type === 'visualize-widget:send-prompt') {
        const prompt = String(data.prompt || '').trim().slice(0, 4000)
        if (prompt) onSendPrompt?.(prompt)
        return
      }
      if (data.type !== 'visualize-widget:size') return
      if (data.hasContent === false) {
        measuredHeightRef.current = null
        measuredHeightKeyRef.current = ''
        if (!finalRef.current) {
          setHeight((previous) => previous > VISUALIZE_WIDGET_MIN_HEIGHT ? VISUALIZE_WIDGET_MIN_HEIGHT : previous)
        }
        return
      }
      const nextHeight = clampHeight(Number(data.height) || 0, VISUALIZE_WIDGET_MIN_HEIGHT, VISUALIZE_WIDGET_MAX_HEIGHT)
      measuredHeightRef.current = nextHeight
      measuredHeightKeyRef.current = visualizeWidgetSourceKey(latestPayloadRef.current.code)
      if (sourceKey && nextHeight > VISUALIZE_WIDGET_MIN_HEIGHT) setCachedVisualizeWidgetHeight(sourceKey, nextHeight)
      setHeight((previous) => {
        if (Math.abs(previous - nextHeight) <= 2) return previous
        if (finalRef.current && nextHeight + VISUALIZE_WIDGET_HEIGHT_SHRINK_TOLERANCE < previous) return previous
        return nextHeight
      })
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSendPrompt, sourceKey])

  useEffect(() => () => {
    const pending = snapshotRequestRef.current
    if (!pending) return
    window.clearTimeout(pending.timer)
    snapshotRequestRef.current = null
    pending.reject(new Error('snapshot cancelled'))
  }, [])

  useEffect(() => {
    finalRef.current = final
    if (!hasDisplayCode || !rendered) {
      if (!final) {
        setHeight((previous) => previous === VISUALIZE_WIDGET_MIN_HEIGHT ? previous : VISUALIZE_WIDGET_MIN_HEIGHT)
      }
      if (!hasDisplayCode) setRendered(false)
      if (!hasDisplayCode) {
        measuredHeightRef.current = null
        measuredHeightKeyRef.current = ''
      }
      latestPayloadRef.current = { code: displayCode, final }
      postCurrentPayload()
      const raf = window.requestAnimationFrame(postCurrentPayload)
      const timers = [
        window.setTimeout(postCurrentPayload, 50),
        window.setTimeout(postCurrentPayload, 200),
        window.setTimeout(postCurrentPayload, 600),
      ]
      return () => {
        window.cancelAnimationFrame(raf)
        timers.forEach((timer) => window.clearTimeout(timer))
      }
    }
    const displayHeightKey = visualizeWidgetSourceKey(displayCode)
    const measuredHeight = measuredHeightKeyRef.current === displayHeightKey ? measuredHeightRef.current : null
    const cachedHeight = sourceKey ? getCachedVisualizeWidgetHeight(sourceKey) : null
    const estimatedHeight = measuredHeight || cachedHeight || estimateWidgetHeight(exportCode || displayCode, final)
    setHeight((previous) => {
      if (Math.abs(previous - estimatedHeight) <= 2) return previous
      if (!final && previous > estimatedHeight) return previous
      return estimatedHeight
    })
    if (!hasDisplayCode) setRendered(false)
    latestPayloadRef.current = { code: displayCode, final }
    postCurrentPayload()
    const raf = window.requestAnimationFrame(postCurrentPayload)
    const timers = [
      window.setTimeout(postCurrentPayload, 50),
      window.setTimeout(postCurrentPayload, 200),
      window.setTimeout(postCurrentPayload, 600),
    ]
    return () => {
      window.cancelAnimationFrame(raf)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [cssVars, displayCode, exportCode, final, hasDisplayCode, ready, rendered, sourceKey, srcDoc])

  const exportHtml = () => {
    downloadTextFile(buildExportDocument(exportCode || code, title), `${safeExportName(title)}.html`)
  }

  const requestIframeSnapshotDataUrl = async (frameWindow: Window) => new Promise<string>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (snapshotRequestRef.current) snapshotRequestRef.current = null
      reject(new Error('snapshot timeout'))
    }, VISUALIZE_WIDGET_SNAPSHOT_TIMEOUT_MS)
    snapshotRequestRef.current = { resolve, reject, timer }
    frameWindow.postMessage({ type: 'visualize-widget:copy-snapshot', id: idRef.current }, '*')
  })

  const copySnapshot = async () => {
    if (copying) return
    const frameWindow = iframeRef.current?.contentWindow
    if (!frameWindow) {
      notify?.('复制截图失败', 'error')
      return
    }
    setCopying(true)
    setCopied(false)
    try {
      const dataUrl = await requestIframeSnapshotDataUrl(frameWindow)
      if (!dataUrl) throw new Error('empty snapshot')
      const copiedDataUrl = await writePngDataUrlToClipboard(dataUrl, writeImageToClipboard)
      if (!copiedDataUrl) throw new Error('clipboard unavailable')
      setCopied(true)
      notify?.('已复制到剪贴板', 'success')
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS)
    } catch (_error) {
      notify?.('复制截图失败', 'error')
    } finally {
      setCopying(false)
    }
  }

  return (
    <div
      ref={blockRef}
      className={`visualize-widget-block${loading ? ' is-loading' : ' is-ready'}${final ? ' is-final' : ' is-streaming'}`}
      data-source-key={sourceKey}
    >
      {showActions ? (
        <div className="visualize-widget-actions" aria-label="可视化预览操作">
          <button className={`visualize-widget-action${copied ? ' is-copied' : ''}`} type="button" aria-label="复制可视化截图" data-tooltip={copied ? '已复制截图' : '复制截图'} onClick={copySnapshot}>
            {renderIcon(copied ? 'check' : 'copy', {})}
          </button>
          <button className="visualize-widget-action" type="button" aria-label="导出 HTML" data-tooltip="导出 HTML" onClick={exportHtml}>
            {renderIcon('download', {})}
          </button>
        </div>
      ) : null}
      {loading ? (
        <div className="visualize-widget-loading-inline" aria-live="polite">
          {renderIcon('code-xml', { className: 'visualize-widget-loading-icon' })}
          <span className="visualize-widget-loading-text animate-app-pulse text-[var(--sem-text-tertiary)]">{activeLoadingMessage}</span>
        </div>
      ) : (
        <div
          className="visualize-widget-panel"
          style={{
            '--runtime-visualize-widget-height': `${height}px`,
            '--visualize-widget-height': `${height}px`,
          } as React.CSSProperties}
        >
          <iframe
            ref={iframeRef}
            className="visualize-widget-frame"
            title={title || '可视化预览'}
            sandbox="allow-scripts allow-forms"
            srcDoc={srcDoc}
            onLoad={() => {
              setReady(true)
              window.requestAnimationFrame(postCurrentPayload)
            }}
          />
        </div>
      )}
    </div>
  )
}
