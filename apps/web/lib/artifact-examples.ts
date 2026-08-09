export type ArtifactExample = {
  id: 'revenue' | 'research' | 'launch' | 'sequence'
  title: string
  description: string
  code: string
}

const runtimeStyles = `
  <style>
    *{box-sizing:border-box}body{margin:0}.sv-root{display:grid;gap:12px;color:var(--sem-text-primary);font-family:var(--font-sans,ui-sans-serif,system-ui)}
    .sv-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(210px,.6fr);gap:12px}.sv-panel{border:1px solid var(--sem-border-subtle);border-radius:10px;background:var(--sem-bg-card);padding:16px}
    .sv-label{margin:0 0 12px}.sv-chart svg{display:block;width:100%;height:auto}.sv-metrics{display:grid;gap:13px}
    .sv-metric{border-bottom:1px solid var(--sem-border-subtle);padding:0 0 12px;background:transparent}.sv-metric:last-child{border:0;padding:0}.sv-metric span{display:block;color:var(--sem-text-tertiary);font-size:11px}.sv-metric strong{display:block;margin-top:3px;font-size:21px;font-variant-numeric:tabular-nums}.sv-metric em{color:var(--sem-status-success);font-size:11px;font-style:normal}
    .sv-map{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;align-items:center;min-height:130px}.sv-column{display:grid;gap:8px}.sv-node{border:1px solid var(--sem-border-default);border-radius:7px;background:var(--sem-bg-surface);padding:9px;color:var(--sem-text-secondary);font-size:11px;text-align:center}.sv-node.live{border-color:var(--sem-accent-primary);color:var(--sem-text-primary)}
    .sv-action{display:flex;width:100%;justify-content:space-between;padding:12px 14px}.sv-list{display:grid;gap:8px}.sv-row{display:grid;grid-template-columns:1.2fr .8fr auto;gap:10px;align-items:center;border-bottom:1px solid var(--sem-border-subtle);padding:11px 0;font-size:11px}.sv-row:last-child{border:0}.sv-row span{color:var(--sem-text-secondary)}.sv-status{color:var(--sem-status-success);font-size:11px}
    .sv-progress{height:7px;overflow:hidden;border-radius:999px;background:var(--sem-bg-muted)}.sv-progress i{display:block;height:100%;border-radius:inherit;background:var(--sem-accent-primary)}
    @media(max-width:680px){.sv-grid{grid-template-columns:1fr}.sv-map{min-height:100px}}
  </style>`

const revenueCode = `<section class="sv-root" data-artifact="revenue-cockpit">
${runtimeStyles}
  <article class="sv-panel sv-chart">
    <p class="sv-label">Revenue over time</p>
    <svg viewBox="0 0 720 190" role="img" aria-label="Revenue trend">
      <path d="M26 42H694M26 88H694M26 134H694M26 174H694" fill="none" stroke="var(--sem-border-subtle)" stroke-dasharray="4 7" />
      <path d="M26 160C86 150 116 113 174 120C236 127 266 84 326 92C390 100 424 59 482 68C544 78 592 36 640 47C668 53 684 31 694 25" fill="none" stroke="var(--sv-chart-series-1)" stroke-width="4" stroke-linecap="round" />
      <path d="M26 174C92 165 128 140 188 146C250 152 286 119 350 125C414 132 452 98 512 106C572 114 626 83 694 74" fill="none" stroke="var(--sv-chart-series-2)" stroke-width="3" stroke-linecap="round" />
      <circle cx="694" cy="25" r="6" fill="var(--sv-chart-series-1)" />
      <circle cx="694" cy="74" r="5" fill="var(--sv-chart-series-2)" />
    </svg>
  </article>
  <div class="sv-grid">
    <article class="sv-panel"><p class="sv-label">Revenue drivers map</p><div class="sv-map">
      <div class="sv-node live">Revenue</div>
      <div class="sv-column"><div class="sv-node live">New customers</div><div class="sv-node">ARPU</div><div class="sv-node">Expansion</div></div>
      <div class="sv-column"><div class="sv-node live">Signups</div><div class="sv-node">Activation rate</div><div class="sv-node">Price / plan mix</div></div>
    </div></article>
    <article class="sv-panel"><p class="sv-label">Key metrics</p><div class="sv-metrics">
      <div class="sv-metric"><span>Total revenue</span><strong>$8.42M</strong><em>↑ 12.4%</em></div>
      <div class="sv-metric"><span>New customers</span><strong>1,243</strong><em>↑ 8.7%</em></div>
      <div class="sv-metric"><span>ARPU</span><strong>$127.36</strong><em>↑ 5.3%</em></div>
    </div></article>
  </div>
  <button class="sv-action" id="ask-agent"><span>Explain risk drivers</span><span>→</span></button>
  <script>document.getElementById('ask-agent')?.addEventListener('click',()=>sendPrompt('Explain the revenue risk behind this artifact'))</script>
</section>`

const researchCode = `<section class="sv-root" data-artifact="research-landscape">
${runtimeStyles}
  <article class="sv-panel"><p class="sv-label">Research landscape</p><div class="sv-map">
    <div class="sv-node live">Streaming UI</div>
    <div class="sv-column"><div class="sv-node live">Partial parsing</div><div class="sv-node">Sandboxing</div><div class="sv-node">Host events</div></div>
    <div class="sv-column"><div class="sv-node live">Remend</div><div class="sv-node">CSP</div><div class="sv-node">Callbacks</div></div>
  </div></article>
  <div class="sv-grid">
    <article class="sv-panel"><p class="sv-label">Evidence map</p><div class="sv-list">
      <div class="sv-row"><strong>Incomplete syntax recovery</strong><span>14 sources</span><em class="sv-status">Strong</em></div>
      <div class="sv-row"><strong>Isolated execution</strong><span>9 sources</span><em class="sv-status">Verified</em></div>
      <div class="sv-row"><strong>Host-controlled actions</strong><span>7 sources</span><em class="sv-status">Emerging</em></div>
    </div></article>
    <article class="sv-panel"><p class="sv-label">Confidence</p><div class="sv-metrics"><div class="sv-metric"><span>Coverage</span><strong>92%</strong><em>28 sources</em></div><div class="sv-progress"><i style="width:92%"></i></div></div></article>
  </div>
  <button class="sv-action" id="research-followup"><span>Compare security models</span><span>→</span></button>
  <script>document.getElementById('research-followup')?.addEventListener('click',()=>sendPrompt('Compare the security models in this research map'))</script>
</section>`

const launchCode = `<section class="sv-root" data-artifact="launch-control">
${runtimeStyles}
  <div class="sv-grid">
    <article class="sv-panel"><p class="sv-label">Launch readiness</p><div class="sv-metrics"><div class="sv-metric"><span>Overall readiness</span><strong>86%</strong><em>↑ 9% this week</em></div><div class="sv-progress"><i style="width:86%"></i></div></div></article>
    <article class="sv-panel"><p class="sv-label">Release window</p><div class="sv-metric"><span>Production rollout</span><strong>Thu 14:00</strong><em>All systems nominal</em></div></article>
  </div>
  <article class="sv-panel"><p class="sv-label">Critical path</p><div class="sv-list">
    <div class="sv-row"><strong>Runtime validation</strong><span>Platform</span><em class="sv-status">Complete</em></div>
    <div class="sv-row"><strong>Documentation review</strong><span>Developer relations</span><em class="sv-status">Complete</em></div>
    <div class="sv-row"><strong>Canary publish</strong><span>Release engineering</span><em class="sv-status">In progress</em></div>
    <div class="sv-row"><strong>Public announcement</strong><span>Community</span><em>Queued</em></div>
  </div></article>
  <button class="sv-action" id="launch-followup"><span>Draft launch brief</span><span>→</span></button>
  <script>document.getElementById('launch-followup')?.addEventListener('click',()=>sendPrompt('Draft a launch brief from this readiness artifact'))</script>
</section>`

const sequenceDiagramCode = "<svg viewBox=\"0 0 900 700\" width=\"100%\" role=\"img\" aria-labelledby=\"sd-title sd-desc\" xmlns=\"http://www.w3.org/2000/svg\">\n<title id=\"sd-title\">Agent conversation with StreamViz live artifact rendering</title>\n<desc id=\"sd-desc\">The user sends a prompt through the chat UI to the agent runtime, which streams tokens from the LLM, resolves a tool via the registry, executes StreamViz to stream widget code, recovers partial HTML, isolates it in an iframe, renders a live artifact, and returns an interactive result.</desc>\n<defs>\n<marker id=\"ah\" viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M0 1 L8 5 L0 9 z\" fill=\"#888780\"/></marker>\n<marker id=\"aho\" viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M1 1 L8 5 L1 9 z\" fill=\"none\" stroke=\"#888780\" stroke-width=\"1.4\"/></marker>\n</defs>\n<line x1=\"70\" y1=\"92\" x2=\"70\" y2=\"668\" stroke=\"#B4B2A9\" stroke-width=\"1\" stroke-dasharray=\"3 5\"/>\n<line x1=\"200\" y1=\"92\" x2=\"200\" y2=\"668\" stroke=\"#B4B2A9\" stroke-width=\"1\" stroke-dasharray=\"3 5\"/>\n<line x1=\"330\" y1=\"92\" x2=\"330\" y2=\"668\" stroke=\"#B4B2A9\" stroke-width=\"1\" stroke-dasharray=\"3 5\"/>\n<line x1=\"460\" y1=\"92\" x2=\"460\" y2=\"668\" stroke=\"#B4B2A9\" stroke-width=\"1\" stroke-dasharray=\"3 5\"/>\n<line x1=\"590\" y1=\"92\" x2=\"590\" y2=\"668\" stroke=\"#B4B2A9\" stroke-width=\"1\" stroke-dasharray=\"3 5\"/>\n<line x1=\"720\" y1=\"92\" x2=\"720\" y2=\"668\" stroke=\"#B4B2A9\" stroke-width=\"1\" stroke-dasharray=\"3 5\"/>\n<g class=\"c-gray\"><rect x=\"10\" y=\"44\" width=\"120\" height=\"36\" rx=\"6\"/><text class=\"t\" x=\"70\" y=\"67\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"500\">User</text></g>\n<g class=\"c-gray\"><rect x=\"140\" y=\"44\" width=\"120\" height=\"36\" rx=\"6\"/><text class=\"t\" x=\"200\" y=\"67\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"500\">Chat UI</text></g>\n<g class=\"c-purple\"><rect x=\"270\" y=\"44\" width=\"120\" height=\"36\" rx=\"6\"/><text class=\"t\" x=\"330\" y=\"67\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"500\">Agent Runtime</text></g>\n<g class=\"c-teal\"><rect x=\"400\" y=\"44\" width=\"120\" height=\"36\" rx=\"6\"/><text class=\"t\" x=\"460\" y=\"67\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"500\">LLM</text></g>\n<g class=\"c-coral\"><rect x=\"530\" y=\"44\" width=\"120\" height=\"36\" rx=\"6\"/><text class=\"t\" x=\"590\" y=\"67\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"500\">Tool Registry</text></g>\n<g class=\"c-pink\"><rect x=\"660\" y=\"44\" width=\"120\" height=\"36\" rx=\"6\"/><text class=\"t\" x=\"720\" y=\"67\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"500\">StreamViz</text></g>\n<line x1=\"70\" y1=\"112\" x2=\"200\" y2=\"112\" stroke=\"#888780\" stroke-width=\"1.4\" marker-end=\"url(#ah)\"/><text class=\"ts\" x=\"135\" y=\"106\" text-anchor=\"middle\" font-size=\"12\">send prompt</text>\n<line x1=\"200\" y1=\"152\" x2=\"330\" y2=\"152\" stroke=\"#888780\" stroke-width=\"1.4\" marker-end=\"url(#ah)\"/><text class=\"ts\" x=\"265\" y=\"146\" text-anchor=\"middle\" font-size=\"12\" style=\"font-family: var(--sv-font-mono)\">POST /conversation</text>\n<line x1=\"330\" y1=\"192\" x2=\"460\" y2=\"192\" stroke=\"#888780\" stroke-width=\"1.4\" marker-end=\"url(#ah)\"/><text class=\"ts\" x=\"395\" y=\"186\" text-anchor=\"middle\" font-size=\"12\">call model</text>\n<line x1=\"460\" y1=\"232\" x2=\"330\" y2=\"232\" stroke=\"#888780\" stroke-width=\"1.4\" stroke-dasharray=\"5 4\" marker-end=\"url(#aho)\"/><text class=\"ts\" x=\"395\" y=\"226\" text-anchor=\"middle\" font-size=\"12\">stream tokens</text>\n<line x1=\"330\" y1=\"272\" x2=\"200\" y2=\"272\" stroke=\"#888780\" stroke-width=\"1.4\" stroke-dasharray=\"5 4\" marker-end=\"url(#aho)\"/><text class=\"ts\" x=\"265\" y=\"266\" text-anchor=\"middle\" font-size=\"12\">stream tokens · render</text>\n<line x1=\"460\" y1=\"312\" x2=\"330\" y2=\"312\" stroke=\"#888780\" stroke-width=\"1.4\" marker-end=\"url(#ah)\"/><text class=\"ts\" x=\"395\" y=\"306\" text-anchor=\"middle\" font-size=\"12\">function call: visualize_show_widget</text>\n<line x1=\"330\" y1=\"352\" x2=\"590\" y2=\"352\" stroke=\"#888780\" stroke-width=\"1.4\" marker-end=\"url(#ah)\"/><text class=\"ts\" x=\"460\" y=\"346\" text-anchor=\"middle\" font-size=\"12\">resolve tool</text>\n<line x1=\"590\" y1=\"392\" x2=\"330\" y2=\"392\" stroke=\"#888780\" stroke-width=\"1.4\" stroke-dasharray=\"5 4\" marker-end=\"url(#aho)\"/><text class=\"ts\" x=\"460\" y=\"386\" text-anchor=\"middle\" font-size=\"12\">tool spec + entry</text>\n<line x1=\"330\" y1=\"432\" x2=\"720\" y2=\"432\" stroke=\"#888780\" stroke-width=\"1.4\" marker-end=\"url(#ah)\"/><text class=\"ts\" x=\"525\" y=\"426\" text-anchor=\"middle\" font-size=\"12\">execute visualize_show_widget</text>\n<line x1=\"720\" y1=\"472\" x2=\"330\" y2=\"472\" stroke=\"#888780\" stroke-width=\"1.4\" stroke-dasharray=\"5 4\" marker-end=\"url(#aho)\"/><text class=\"ts\" x=\"525\" y=\"466\" text-anchor=\"middle\" font-size=\"12\" style=\"font-family: var(--sv-font-mono)\">stream widget_code</text>\n<line x1=\"330\" y1=\"512\" x2=\"720\" y2=\"512\" stroke=\"#888780\" stroke-width=\"1.4\" stroke-dasharray=\"5 4\" marker-end=\"url(#aho)\"/><text class=\"ts\" x=\"525\" y=\"506\" text-anchor=\"middle\" font-size=\"12\">partial HTML chunks</text>\n<path d=\"M720 548 L748 548 L748 574 L722 574\" fill=\"none\" stroke=\"#888780\" stroke-width=\"1.4\" marker-end=\"url(#ah)\"/>\n<text class=\"ts\" x=\"756\" y=\"556\" font-size=\"12\">recover partial HTML</text>\n<text class=\"ts\" x=\"756\" y=\"570\" font-size=\"12\">isolate in iframe</text>\n<line x1=\"720\" y1=\"612\" x2=\"200\" y2=\"612\" stroke=\"#888780\" stroke-width=\"1.4\" marker-end=\"url(#ah)\"/><text class=\"ts\" x=\"460\" y=\"606\" text-anchor=\"middle\" font-size=\"12\">render live artifact</text>\n<line x1=\"200\" y1=\"652\" x2=\"70\" y2=\"652\" stroke=\"#888780\" stroke-width=\"1.4\" marker-end=\"url(#ah)\"/><text class=\"ts\" x=\"135\" y=\"646\" text-anchor=\"middle\" font-size=\"12\">interactive result</text>\n<rect x=\"236\" y=\"676\" width=\"16\" height=\"16\" rx=\"4\" class=\"c-gray\"/><text class=\"ts\" x=\"258\" y=\"688\" font-size=\"12\">interface</text>\n<rect x=\"331\" y=\"676\" width=\"16\" height=\"16\" rx=\"4\" class=\"c-purple\"/><text class=\"ts\" x=\"353\" y=\"688\" font-size=\"12\">agent runtime</text>\n<rect x=\"447\" y=\"676\" width=\"16\" height=\"16\" rx=\"4\" class=\"c-teal\"/><text class=\"ts\" x=\"469\" y=\"688\" font-size=\"12\">model</text>\n<rect x=\"520\" y=\"676\" width=\"16\" height=\"16\" rx=\"4\" class=\"c-coral\"/><text class=\"ts\" x=\"542\" y=\"688\" font-size=\"12\">tools</text>\n<rect x=\"593\" y=\"676\" width=\"16\" height=\"16\" rx=\"4\" class=\"c-pink\"/><text class=\"ts\" x=\"615\" y=\"688\" font-size=\"12\">rendering</text>\n</svg>"

export const artifactExamples: ArtifactExample[] = [
  { id: 'sequence', title: 'Agent conversation system', description: 'A generated sequence diagram of the complete agent, tool, and streaming visualization lifecycle.', code: sequenceDiagramCode },
  { id: 'revenue', title: 'Revenue cockpit', description: 'Chart, driver map, metrics, and a follow-up action.', code: revenueCode },
  { id: 'research', title: 'Research landscape', description: 'Evidence relationships with confidence and source coverage.', code: researchCode },
  { id: 'launch', title: 'Launch control', description: 'Readiness, release timing, and the critical path.', code: launchCode },
]

export const revenueArtifact = artifactExamples.find((artifact) => artifact.id === 'revenue')!
export const sequenceArtifact = artifactExamples.find((artifact) => artifact.id === 'sequence')!
