import importedVisualizeWidgetRuntimeCss from '../theme/visualize-widget-runtime.css?raw'
import importedVisualizeWidgetUtilitiesCss from '../theme/visualize-widget-utilities.css?raw'

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
const visualizeWidgetUtilitiesCss = String(importedVisualizeWidgetUtilitiesCss || '').trim()

export const buildRuntimeDocument = (id: string) => {
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
    visualizeWidgetUtilitiesCss,
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

