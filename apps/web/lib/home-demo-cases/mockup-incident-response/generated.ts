const mockupIncidentResponseHtml = String.raw`<style>
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.inc{max-width:760px;font-family:var(--sv-font-sans);color:var(--sv-text-primary);display:flex;flex-direction:column;gap:10px;padding:4px 0;font-size:14px;line-height:1.45}
.hdr{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start}
.htitle{font-size:15px;font-weight:500;margin:0 0 6px;display:flex;align-items:center;gap:8px}
.live{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;color:var(--sv-text-danger)}
.livedot{width:7px;height:7px;border-radius:50%;background:var(--sv-text-danger);animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.badges{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;padding:3px 9px;border-radius:var(--sv-radius-md);border:.5px solid var(--sv-border-subtle);background:var(--sv-bg-muted);color:var(--sv-text-secondary)}
.badge .ti{font-size:14px}
.b-danger{background:var(--sv-bg-danger);color:var(--sv-text-danger);border-color:var(--sv-border-danger)}
.mono{font-family:var(--sv-font-mono)}
.hdr-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
.elabel{font-size:12px;color:var(--sv-text-muted)}
.etime{font-family:var(--sv-font-mono);font-size:20px;font-weight:500;line-height:1}
.estate{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--sv-text-success);background:var(--sv-bg-success);border:.5px solid var(--sv-border-success);padding:3px 9px;border-radius:var(--sv-radius-md)}
.estate .ti{font-size:14px}
.mgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.metric{background:var(--sv-bg-surface);border:.5px solid var(--sv-border-subtle);border-radius:var(--sv-radius-lg);padding:9px 12px;display:flex;flex-direction:column;gap:2px}
.mrow{display:flex;justify-content:space-between;align-items:flex-start;gap:6px}
.mlabel{font-size:12px;color:var(--sv-text-muted)}
.mval{font-size:20px;font-weight:500;line-height:1.15}
.munit{font-size:12px;font-weight:400;color:var(--sv-text-secondary)}
.mmeta{font-size:12px}
.sp{display:block}
.card{background:var(--sv-bg-surface);border:.5px solid var(--sv-border-subtle);border-radius:var(--sv-radius-lg);padding:11px 14px}
.chead{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap}
.ctitle{font-size:13px;font-weight:500}
.csub{font-size:12px;color:var(--sv-text-muted)}
.topo-scroll{overflow-x:auto}
.topo-scroll svg{display:block;width:100%;min-width:560px}
.legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:12px;color:var(--sv-text-secondary);align-items:center}
.lg{display:inline-flex;align-items:center;gap:5px}
.sw{width:10px;height:10px;border-radius:3px;display:inline-block}
.tl{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;position:relative}
.tl::before{content:"";position:absolute;top:11px;left:10px;right:10px;height:2px;background:var(--sv-border-default)}
.step{position:relative;padding-top:30px;min-width:0}
.step .ic{position:absolute;top:0;left:0;width:24px;height:24px;border-radius:50%;background:var(--sv-bg-surface);border:2px solid var(--sv-border-default);display:flex;align-items:center;justify-content:center;z-index:1}
.step .ic .ti{font-size:14px}
.ic-danger{border-color:var(--sv-border-danger)!important;color:var(--sv-text-danger)}
.ic-warn{border-color:var(--sv-border-warning)!important;color:var(--sv-text-warning)}
.ic-info{border-color:var(--sv-border-info)!important;color:var(--sv-text-info)}
.ic-success{border-color:var(--sv-border-success)!important;color:var(--sv-text-success)}
.s-time{font-family:var(--sv-font-mono);font-size:12px;color:var(--sv-text-muted);margin-bottom:2px}
.s-title{font-size:13px;font-weight:500;margin-bottom:1px}
.s-note{font-size:12px;color:var(--sv-text-muted)}
.action{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.action p{font-size:12.5px;color:var(--sv-text-secondary);margin:0;max-width:440px}
button.ab{font-family:inherit;font-size:13px;font-weight:500;color:var(--sv-text-primary);background:transparent;border:.5px solid var(--sv-border-default);border-radius:var(--sv-radius-md);padding:8px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
button.ab:hover{background:var(--sv-bg-muted)}
:root{--sp-teal:#1D9E75;--sp-red:#E24B4A;--sp-amber:#BA7517;--sp-gray:#888780}
@media(prefers-color-scheme:dark){:root{--sp-teal:#5DCAA5;--sp-red:#F09595;--sp-amber:#EF9F27;--sp-gray:#B4B2A9}}
</style>
<h2 class="sr-only">Live incident dashboard for INC-4821, checkout latency regression in us-east-1. Checkout API v2 is degraded, traffic shifted to healthy v1 replica; P95 latency 212 milliseconds, error rate 0.4 percent, 82 percent of traffic recovered, 2.1 thousand affected sessions draining. Agent timeline: detected, correlated to deploy 4821, mitigated, monitoring.</h2>
<div class="inc">
  <div class="hdr">
    <div>
      <p class="htitle">Checkout latency regression <span class="live"><span class="livedot"></span>LIVE</span></p>
      <div class="badges">
        <span class="badge mono">INC-4821</span>
        <span class="badge b-danger"><i class="ti ti-alert-triangle" aria-hidden="true"></i>SEV-1</span>
        <span class="badge"><i class="ti ti-map-pin" aria-hidden="true"></i>us-east-1</span>
        <span class="badge"><i class="ti ti-route" aria-hidden="true"></i>checkout &rarr; payment</span>
      </div>
    </div>
    <div class="hdr-right">
      <div class="elabel">Elapsed since deploy #4821</div>
      <div class="etime" id="elapsed">14:32</div>
      <span class="estate"><i class="ti ti-shield-check" aria-hidden="true"></i>Traffic shifted &middot; monitoring</span>
    </div>
  </div>
  <div class="mgrid">
    <div class="metric">
      <div class="mrow"><span class="mlabel">P95 latency</span>
        <svg class="sp" width="64" height="22" viewBox="0 0 64 22" aria-hidden="true"><line x1="0" y1="20" x2="64" y2="20" stroke="var(--sp-gray)" stroke-width="1" stroke-dasharray="2 3"/><polyline points="0,20 6,19 12,19 20,2 27,1 34,3 42,7 48,8 56,9 64,9" fill="none" stroke="var(--sp-amber)" stroke-width="1.6"/><circle cx="64" cy="9" r="2" fill="var(--sp-amber)"/></svg>
      </div>
      <div class="mval">212 <span class="munit">ms</span></div>
      <div class="mmeta" style="color:var(--sv-text-warning)">2.5&times; baseline &middot; recovering</div>
    </div>
    <div class="metric">
      <div class="mrow"><span class="mlabel">Error rate</span>
        <svg class="sp" width="64" height="22" viewBox="0 0 64 22" aria-hidden="true"><polyline points="0,20 6,19 12,19 20,2 27,3 34,15 42,19 48,20 56,21 64,21" fill="none" stroke="var(--sp-red)" stroke-width="1.6"/><circle cx="64" cy="21" r="2" fill="var(--sp-red)"/></svg>
      </div>
      <div class="mval">0.4 <span class="munit">%</span></div>
      <div class="mmeta" style="color:var(--sv-text-success)">down from 6.2% peak</div>
    </div>
    <div class="metric">
      <div class="mrow"><span class="mlabel">Recovered traffic</span>
        <svg class="sp" width="64" height="22" viewBox="0 0 64 22" aria-hidden="true"><polyline points="0,20 14,20 22,20 30,8 38,6 46,6 54,5 64,5" fill="none" stroke="var(--sp-teal)" stroke-width="1.6"/><circle cx="64" cy="5" r="2" fill="var(--sp-teal)"/></svg>
      </div>
      <div class="mval">82 <span class="munit">%</span></div>
      <div class="mmeta" style="color:var(--sv-text-success)">on healthy v1 replica</div>
    </div>
    <div class="metric">
      <div class="mrow"><span class="mlabel">Affected sessions</span>
        <svg class="sp" width="64" height="22" viewBox="0 0 64 22" aria-hidden="true"><polyline points="0,7 18,6 28,7 36,9 44,12 52,15 58,17 64,18" fill="none" stroke="var(--sp-gray)" stroke-width="1.6"/><circle cx="64" cy="18" r="2" fill="var(--sp-gray)"/></svg>
      </div>
      <div class="mval">2.1<span class="munit">k active</span></div>
      <div class="mmeta">12.4k peak &middot; draining</div>
    </div>
  </div>
  <div class="card">
    <div class="chead">
      <span class="ctitle">Service impact &middot; checkout path</span>
      <span class="csub">v2 degraded &middot; v1 receiving traffic</span>
    </div>
    <div class="topo-scroll">
      <svg viewBox="0 0 640 140" role="img" aria-labelledby="topo-title topo-desc">
        <title id="topo-title">Checkout service impact topology</title>
        <desc id="topo-desc">Client traffic enters through the edge gateway into Checkout API. The v2 replica is degraded and drained, the healthy v1 replica receives shifted traffic, and the Payment DB is healthy.</desc>
        <defs>
          <marker id="ar-gray" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#888780"/></marker>
          <marker id="ar-red" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#E24B4A"/></marker>
          <marker id="ar-teal" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#1D9E75"/></marker>
        </defs>
        <line x1="104" y1="74" x2="130" y2="74" stroke="#888780" stroke-width="1.5" marker-end="url(#ar-gray)"/>
        <path d="M228,66 C240,66 242,34 252,34" fill="none" stroke="#E24B4A" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#ar-red)"/>
        <path d="M228,82 C240,82 242,116 252,116" fill="none" stroke="#1D9E75" stroke-width="1.8" marker-end="url(#ar-teal)"/>
        <path d="M406,31 C428,31 438,64 468,72" fill="none" stroke="#E24B4A" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#ar-red)"/>
        <path d="M406,109 C428,109 438,84 468,76" fill="none" stroke="#1D9E75" stroke-width="1.8" marker-end="url(#ar-teal)"/>
        <text x="250" y="22" text-anchor="end" class="ts" style="fill:var(--sv-text-muted);font-size:11.5px">drained</text>
        <text x="250" y="134" text-anchor="end" class="ts" style="fill:var(--sv-text-success);font-size:11.5px">shifted</text>
        <g class="c-gray">
          <rect x="8" y="58" width="96" height="32" rx="6"/>
          <text x="56" y="72" text-anchor="middle" class="th" style="font-size:12.5px">Clients</text>
          <text x="56" y="85" text-anchor="middle" class="ts" style="font-size:11.5px">web + mobile</text>
        </g>
        <g class="c-gray">
          <rect x="132" y="58" width="96" height="32" rx="6"/>
          <text x="180" y="72" text-anchor="middle" class="th" style="font-size:12.5px">Edge gateway</text>
          <text x="180" y="85" text-anchor="middle" class="ts" style="font-size:11.5px">us-east-1</text>
        </g>
        <g class="c-red">
          <rect x="256" y="12" width="150" height="38" rx="6"/>
          <text x="331" y="29" text-anchor="middle" class="th" style="font-size:12.5px">Checkout API</text>
          <text x="331" y="41" text-anchor="middle" class="ts" style="font-size:11.5px">v2 &middot; degraded</text>
        </g>
        <g class="c-teal">
          <rect x="256" y="90" width="150" height="38" rx="6"/>
          <text x="331" y="107" text-anchor="middle" class="th" style="font-size:12.5px">Checkout API</text>
          <text x="331" y="119" text-anchor="middle" class="ts" style="font-size:11.5px">v1 &middot; healthy</text>
        </g>
        <g class="c-teal">
          <rect x="470" y="58" width="150" height="32" rx="6"/>
          <text x="545" y="72" text-anchor="middle" class="th" style="font-size:12.5px">Payment DB</text>
          <text x="545" y="85" text-anchor="middle" class="ts" style="font-size:11.5px">healthy &middot; primary</text>
        </g>
      </svg>
    </div>
    <div class="legend">
      <span class="lg"><span class="sw" style="background:var(--sp-teal)"></span>healthy</span>
      <span class="lg"><span class="sw" style="background:var(--sp-red)"></span>impacted &middot; drained</span>
      <span class="lg"><span class="sw" style="background:var(--sp-gray)"></span>neutral entry</span>
    </div>
  </div>
  <div class="card">
    <div class="chead">
      <span class="ctitle">Agent response timeline</span>
      <span class="csub">auto-mitigated in 9 min</span>
    </div>
    <div class="tl">
      <div class="step">
        <span class="ic ic-danger"><i class="ti ti-alert-triangle" aria-hidden="true"></i></span>
        <div class="s-time">T+0:00</div>
        <div class="s-title">Detection</div>
        <div class="s-note">P95 threshold breached</div>
      </div>
      <div class="step">
        <span class="ic ic-warn"><i class="ti ti-link" aria-hidden="true"></i></span>
        <div class="s-time">T+0:04</div>
        <div class="s-title">Correlation</div>
        <div class="s-note">linked to deploy #4821</div>
      </div>
      <div class="step">
        <span class="ic ic-info"><i class="ti ti-arrow-right" aria-hidden="true"></i></span>
        <div class="s-time">T+0:09</div>
        <div class="s-title">Mitigation</div>
        <div class="s-note">traffic shifted to v1</div>
      </div>
      <div class="step">
        <span class="ic ic-success"><i class="ti ti-activity" aria-hidden="true"></i></span>
        <div class="s-time">T+0:14</div>
        <div class="s-title">Monitoring</div>
        <div class="s-note">watching 5-min recovery</div>
      </div>
    </div>
  </div>
  <div class="action">
    <p>Hold for monitoring until error rate &lt; 0.2% and P95 &lt; 100 ms, then close the incident.</p>
    <button class="ab" onclick="sendPrompt('Draft a concise stakeholder update for INC-4821: checkout latency regression in us-east-1 triggered by deploy 4821 at 09:41 UTC. Traffic shifted to the healthy v1 replica; error rate down from 6.2 percent to 0.4 percent, 82 percent of traffic recovered, P95 latency 212 ms and declining. Status: monitoring recovery.')">Draft stakeholder update &nearr;</button>
  </div>
</div>
<script>
(function(){var s=872;var el=document.getElementById('elapsed');var start=Date.now()-s*1000;function tick(){var d=Math.max(0,Math.floor((Date.now()-start)/1000));var m=Math.floor(d/60),sec=d%60;el.textContent=(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec;}tick();setInterval(tick,1000);})();
</script>`

export default mockupIncidentResponseHtml
