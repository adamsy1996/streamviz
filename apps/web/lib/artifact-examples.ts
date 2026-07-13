export type ArtifactExample = {
  id: 'revenue' | 'research' | 'launch'
  title: string
  titleZh: string
  description: string
  descriptionZh: string
  code: string
}

const runtimeStyles = `
  <style>
    *{box-sizing:border-box}body{margin:0}.sv-root{display:grid;gap:12px;color:var(--sem-text-primary);font-family:var(--font-sans,ui-sans-serif,system-ui)}
    .sv-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(210px,.6fr);gap:12px}.sv-panel{border:1px solid var(--sem-border-subtle);border-radius:10px;background:var(--sem-bg-card);padding:16px}
    .sv-label{margin:0 0 12px;color:var(--sem-text-secondary);font-size:12px;font-weight:650}.sv-chart svg{display:block;width:100%;height:auto}.sv-metrics{display:grid;gap:13px}
    .sv-metric{border-bottom:1px solid var(--sem-border-subtle);padding-bottom:12px}.sv-metric:last-child{border:0;padding:0}.sv-metric span{display:block;color:var(--sem-text-tertiary);font-size:10px}.sv-metric strong{display:block;margin-top:3px;font-size:21px}.sv-metric em{color:var(--sem-status-success);font-size:10px;font-style:normal}
    .sv-map{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;align-items:center;min-height:130px}.sv-column{display:grid;gap:8px}.sv-node{border:1px solid var(--sem-border-default);border-radius:7px;background:var(--sem-bg-surface);padding:9px;color:var(--sem-text-secondary);font-size:11px;text-align:center}.sv-node.live{border-color:var(--sem-accent-primary);color:var(--sem-text-primary)}
    .sv-action{display:flex;width:100%;align-items:center;justify-content:space-between;border:1px solid var(--sem-border-default);border-radius:9px;background:var(--sem-bg-surface);color:var(--sem-text-primary);padding:12px 14px;font:650 12px var(--font-sans,ui-sans-serif,system-ui);cursor:pointer}.sv-action:hover{border-color:var(--sem-accent-primary);color:var(--sem-accent-primary)}
    .sv-list{display:grid;gap:8px}.sv-row{display:grid;grid-template-columns:1.2fr .8fr auto;gap:10px;align-items:center;border-bottom:1px solid var(--sem-border-subtle);padding:11px 0;font-size:11px}.sv-row:last-child{border:0}.sv-row span{color:var(--sem-text-secondary)}.sv-status{color:var(--sem-status-success);font-size:10px}
    .sv-progress{height:7px;overflow:hidden;border-radius:999px;background:var(--sem-bg-muted)}.sv-progress i{display:block;height:100%;border-radius:inherit;background:var(--sem-accent-primary)}
    @media(max-width:680px){.sv-grid{grid-template-columns:1fr}.sv-map{min-height:100px}}
  </style>`

const revenueCode = `<section class="sv-root" data-artifact="revenue-cockpit">
${runtimeStyles}
  <article class="sv-panel sv-chart">
    <p class="sv-label">Revenue over time</p>
    <svg viewBox="0 0 720 190" role="img" aria-label="Revenue trend">
      <path d="M26 42H694M26 88H694M26 134H694M26 174H694" fill="none" stroke="var(--sem-border-subtle)" stroke-dasharray="4 7" />
      <path d="M26 160C86 150 116 113 174 120C236 127 266 84 326 92C390 100 424 59 482 68C544 78 592 36 640 47C668 53 684 31 694 25" fill="none" stroke="var(--sem-accent-primary)" stroke-width="4" stroke-linecap="round" />
      <path d="M26 174C92 165 128 140 188 146C250 152 286 119 350 125C414 132 452 98 512 106C572 114 626 83 694 74" fill="none" stroke="var(--sem-status-info)" stroke-width="3" stroke-linecap="round" />
      <circle cx="694" cy="25" r="6" fill="var(--sem-accent-primary)" />
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

export const artifactExamples: ArtifactExample[] = [
  { id: 'revenue', title: 'Revenue cockpit', titleZh: '营收驾驶舱', description: 'Chart, driver map, metrics, and a follow-up action.', descriptionZh: '图表、驱动关系、指标与追问动作。', code: revenueCode },
  { id: 'research', title: 'Research landscape', titleZh: '研究全景图', description: 'Evidence relationships with confidence and source coverage.', descriptionZh: '带置信度与来源覆盖的研究关系图。', code: researchCode },
  { id: 'launch', title: 'Launch control', titleZh: '发布控制台', description: 'Readiness, release timing, and the critical path.', descriptionZh: '发布就绪度、时间窗口与关键路径。', code: launchCode },
]

export const revenueArtifact = artifactExamples[0]
