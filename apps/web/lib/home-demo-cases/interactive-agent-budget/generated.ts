const interactiveAgentBudgetHtml = String.raw`<h2 class="sr-only">Agent autonomy budget simulator. Two sliders tune maximum tool calls and human-approval threshold; projected metrics, a risk state, a quality frontier chart, and a recommendation update live.</h2>
<style>
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.mc{background:var(--sv-bg-muted);border-radius:var(--sv-radius-md);padding:10px 12px;min-width:0}
.ml{font-size:12px;color:var(--sv-text-muted);display:flex;align-items:center;gap:6px;white-space:nowrap}
.mv{font-size:22px;font-weight:500;margin-top:2px;font-family:var(--sv-font-mono)}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:var(--sv-radius-md);font-size:12px;font-weight:500;white-space:nowrap}
.srow{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px}
.slab{font-size:13px;color:var(--sv-text-secondary)}
.sval{font-size:15px;font-weight:500;font-family:var(--sv-font-mono)}
.send{display:flex;align-items:center;gap:10px}
.smin{font-size:11px;color:var(--sv-text-muted);min-width:72px}
.smax{font-size:11px;color:var(--sv-text-muted);min-width:72px;text-align:right}
.lbl{font-size:13px;color:var(--sv-text-secondary);margin-bottom:6px}
.legend{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--sv-text-muted);margin-top:6px}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:4px;vertical-align:1px}
</style>
<div style="padding:2px 0;">
<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px;">
  <div style="display:flex;align-items:center;gap:10px;min-width:0;">
    <span id="headerProfile" class="badge" style="background:var(--sv-bg-info);color:var(--sv-text-info);">Balanced</span>
    <span id="headerSummary" style="font-size:13px;color:var(--sv-text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">max 8 tool calls · 50% approval threshold</span>
  </div>
  <span id="riskBadge" class="badge" style="background:var(--sv-bg-warning);color:var(--sv-text-warning);flex-shrink:0;"><i class="ti ti-shield" style="font-size:14px;" aria-hidden="true"></i>Medium · 46%</span>
</div>

<div style="background:var(--sv-bg-surface);border:0.5px solid var(--sv-border-subtle);border-radius:var(--sv-radius-lg);padding:10px 12px 12px;margin:0 0 12px;">
  <div style="margin-bottom:12px;">
    <div class="srow">
      <label for="tools" class="slab">Max tool calls per task</label>
      <span id="toolsVal" class="sval">8</span>
    </div>
    <div class="send">
      <span class="smin">1 · tight</span>
      <input id="tools" type="range" min="1" max="15" step="1" value="8" style="flex:1;" aria-label="Maximum tool calls per task" aria-valuetext="8 tool calls" />
      <span class="smax">15 · deep</span>
    </div>
  </div>
  <div style="margin-bottom:12px;">
    <div class="srow">
      <label for="thr" class="slab">Human-approval threshold</label>
      <span id="thrVal" class="sval">50%</span>
    </div>
    <div class="send">
      <span class="smin">0% · gate all</span>
      <input id="thr" type="range" min="0" max="100" step="1" value="50" style="flex:1;" aria-label="Human approval threshold" aria-valuetext="50% approval threshold" />
      <span class="smax">100% · free rein</span>
    </div>
  </div>
  <div style="display:flex;gap:8px;">
    <button onclick="preset(4,15)" style="flex:1;font-size:12px;">Conservative</button>
    <button onclick="preset(8,50)" style="flex:1;font-size:12px;">Balanced</button>
    <button onclick="preset(12,85)" style="flex:1;font-size:12px;">Autonomous</button>
  </div>
</div>

<div id="metrics" aria-live="polite" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 12px;">
  <div class="mc">
    <div class="ml"><i class="ti ti-circle-check" style="font-size:15px;" aria-hidden="true"></i>Completion rate</div>
    <div id="mCompletion" class="mv">85%</div>
  </div>
  <div class="mc">
    <div class="ml"><i class="ti ti-clock" style="font-size:15px;" aria-hidden="true"></i>Median latency</div>
    <div id="mLatency" class="mv">48s</div>
  </div>
  <div class="mc">
    <div class="ml"><i class="ti ti-coin" style="font-size:15px;" aria-hidden="true"></i>Cost per task</div>
    <div id="mCost" class="mv">$3.31</div>
  </div>
  <div class="mc">
    <div class="ml"><i class="ti ti-arrow-up-circle" style="font-size:15px;" aria-hidden="true"></i>Escalation rate</div>
    <div id="mEscalation" class="mv">51%</div>
  </div>
</div>

<div style="display:flex;gap:12px;margin:0 0 12px;align-items:stretch;">
  <div style="flex:3;min-width:0;background:var(--sv-bg-surface);border:0.5px solid var(--sv-border-subtle);border-radius:var(--sv-radius-lg);padding:10px 12px;">
    <div class="lbl">Frontier — autonomy vs quality</div>
    <svg id="frontier" viewBox="0 0 320 120" role="img" aria-label="Frontier chart plotting quality against autonomy. Three preset markers for conservative, balanced and autonomous settings, with a marker for the current settings." style="width:100%;display:block;"></svg>
    <div class="legend">
      <span><span class="dot" style="background:var(--sv-text-success);"></span>Low risk</span>
      <span><span class="dot" style="background:var(--sv-text-warning);"></span>Medium</span>
      <span><span class="dot" style="background:var(--sv-text-danger);"></span>Elevated</span>
      <span><span class="dot" style="background:var(--sv-text-primary);box-shadow:0 0 0 2px var(--sv-bg-surface);"></span>Current</span>
    </div>
  </div>
  <div style="flex:2;min-width:0;background:var(--sv-bg-surface);border:0.5px solid var(--sv-border-subtle);border-radius:var(--sv-radius-lg);padding:10px 12px;display:flex;flex-direction:column;">
    <div class="lbl">Recommendation</div>
    <span id="recBadge" class="badge" style="background:var(--sv-bg-success);color:var(--sv-text-success);align-self:flex-start;">Balanced profile</span>
    <p id="recDesc" style="font-size:13px;color:var(--sv-text-secondary);line-height:1.55;margin:8px 0 0;">Autonomy where safe, approvals where it matters. Recommended default for production.</p>
  </div>
</div>

<button onclick="applyPolicy()" style="width:100%;">Apply this policy to the agent ↗</button>
</div>

<script>
(function(){
  var toolsEl=document.getElementById('tools'), thrEl=document.getElementById('thr');
  var cols={success:['var(--sv-bg-success)','var(--sv-text-success)'],info:['var(--sv-bg-info)','var(--sv-text-info)'],warning:['var(--sv-bg-warning)','var(--sv-text-warning)'],danger:['var(--sv-bg-danger)','var(--sv-text-danger)']};
  var profCols={Conservative:cols.info,Balanced:cols.success,Autonomous:cols.warning};
  function qualityAt(a,u){return 0.74+0.20*(1-Math.exp(-a/5))-0.26*Math.pow(u,1.4);}
  function model(a,t){
    var auto=t/100;
    var toolFactor=1-Math.exp(-a/5);
    var toolsUsed=1+a*0.75;
    var quality=qualityAt(a,auto);
    var completion=Math.min(0.97,Math.max(0.06,0.30+0.68*quality));
    var escalation=Math.min(0.92,Math.max(0.08,0.92-0.82*auto));
    var latency=2.0+2.6*toolsUsed+55*escalation;
    var cost=0.04+0.22*toolsUsed+3.40*escalation;
    var risk=Math.min(0.95,Math.max(0.05,0.08+0.70*auto+0.06*(a/15)));
    var autonomyIndex=0.55*auto+0.45*(a/15);
    return {auto:auto,quality:quality,completion:completion,escalation:escalation,latency:latency,cost:cost,risk:risk,autonomyIndex:autonomyIndex};
  }
  function riskState(r){
    if(r<0.30)return {label:'Low',cls:'success'};
    if(r<0.55)return {label:'Medium',cls:'warning'};
    if(r<0.75)return {label:'Elevated',cls:'danger'};
    return {label:'High',cls:'danger'};
  }
  function profile(ai){
    if(ai<0.34)return {name:'Conservative',desc:'Human review on most tool calls. Best for high-stakes, irreversible actions.'};
    if(ai<0.66)return {name:'Balanced',desc:'Autonomy where safe, approvals where it matters. Recommended default for production.'};
    return {name:'Autonomous',desc:'Agent acts freely with minimal oversight. Fastest and cheapest; monitor risk closely.'};
  }
  function renderFrontier(a,m){
    var svg=document.getElementById('frontier');
    var W=320,H=120,P={l:36,r:6,t:8,b:18};
    var pw=W-P.l-P.r, ph=H-P.t-P.b;
    function X(u){return P.l+u*pw;}
    function Y(q){return P.t+(1-(q-0.45)/0.55)*ph;}
    function cy(v){return Math.max(P.t,Math.min(P.t+ph,v));}
    var s='';
    s+='<line x1="'+P.l+'" y1="'+(P.t+ph)+'" x2="'+(W-P.r)+'" y2="'+(P.t+ph)+'" stroke="var(--sv-border-subtle)"/>';
    s+='<line x1="'+P.l+'" y1="'+P.t+'" x2="'+P.l+'" y2="'+(P.t+ph)+'" stroke="var(--sv-border-subtle)"/>';
    [0.5,0.75,1].forEach(function(q){
      var y=cy(Y(q));
      s+='<line x1="'+P.l+'" y1="'+y+'" x2="'+(W-P.r)+'" y2="'+y+'" stroke="var(--sv-border-subtle)" stroke-dasharray="2 3"/>';
      s+='<text x="'+(P.l-6)+'" y="'+(y+3)+'" text-anchor="end" font-size="11" fill="var(--sv-text-muted)">'+Math.round(q*100)+'%</text>';
    });
    [0,0.5,1].forEach(function(u){
      var x=X(u);
      s+='<line x1="'+x+'" y1="'+P.t+'" x2="'+x+'" y2="'+(P.t+ph)+'" stroke="var(--sv-border-subtle)" stroke-dasharray="2 3"/>';
      s+='<text x="'+x+'" y="'+(H-6)+'" text-anchor="middle" font-size="11" fill="var(--sv-text-muted)">'+u+'</text>';
    });
    var pts='';
    for(var i=0;i<=60;i++){
      var u=i/60;
      pts+=(i?' ':'')+X(u).toFixed(1)+','+cy(Y(qualityAt(a,u))).toFixed(1);
    }
    s+='<polyline points="'+pts+'" fill="var(--sv-bg-info)" fill-opacity="0.25" stroke="var(--sv-text-secondary)" stroke-width="1.5" stroke-linejoin="round"/>';
    var curU=m.auto, curQ=qualityAt(a,curU);
    s+='<line x1="'+X(curU)+'" y1="'+P.t+'" x2="'+X(curU)+'" y2="'+(P.t+ph)+'" stroke="var(--sv-text-muted)" stroke-dasharray="2 2"/>';
    s+='<line x1="'+P.l+'" y1="'+cy(Y(curQ))+'" x2="'+(W-P.r)+'" y2="'+cy(Y(curQ))+'" stroke="var(--sv-text-muted)" stroke-dasharray="2 2"/>';
    var markers=[{u:0.15,fill:'var(--sv-text-success)'},{u:0.5,fill:'var(--sv-text-warning)'},{u:0.85,fill:'var(--sv-text-danger)'}];
    markers.forEach(function(mk){
      var q=qualityAt(a,mk.u);
      s+='<circle cx="'+X(mk.u)+'" cy="'+cy(Y(q))+'" r="4" fill="'+mk.fill+'" stroke="var(--sv-bg-surface)" stroke-width="1.5"/>';
    });
    s+='<circle cx="'+X(curU)+'" cy="'+cy(Y(curQ))+'" r="5" fill="var(--sv-text-primary)" stroke="var(--sv-bg-surface)" stroke-width="2"/>';
    s+='<text x="'+(P.l+4)+'" y="'+(P.t+11)+'" font-size="11" fill="var(--sv-text-muted)">Quality</text>';
    s+='<text x="'+(W-P.r)+'" y="'+(H-6)+'" text-anchor="end" font-size="11" fill="var(--sv-text-muted)">Autonomy →</text>';
    svg.innerHTML=s;
  }
  function render(){
    var a=+toolsEl.value, t=+thrEl.value;
    var m=model(a,t);
    document.getElementById('toolsVal').textContent=a;
    document.getElementById('thrVal').textContent=t+'%';
    toolsEl.setAttribute('aria-valuetext',a+' tool calls');
    thrEl.setAttribute('aria-valuetext',t+'% approval threshold');
    document.getElementById('mCompletion').textContent=Math.round(m.completion*100)+'%';
    document.getElementById('mLatency').textContent=Math.round(m.latency)+'s';
    document.getElementById('mCost').textContent='$'+m.cost.toFixed(2);
    document.getElementById('mEscalation').textContent=Math.round(m.escalation*100)+'%';
    var rs=riskState(m.risk);
    var rb=document.getElementById('riskBadge');
    rb.style.background=cols[rs.cls][0];
    rb.style.color=cols[rs.cls][1];
    rb.innerHTML='<i class="ti ti-shield" style="font-size:14px;" aria-hidden="true"></i>'+rs.label+' · '+Math.round(m.risk*100)+'%';
    var pr=profile(m.autonomyIndex);
    document.getElementById('headerProfile').textContent=pr.name;
    document.getElementById('headerSummary').textContent='max '+a+' tool calls · '+t+'% approval threshold';
    var pb=document.getElementById('recBadge');
    pb.style.background=profCols[pr.name][0];
    pb.style.color=profCols[pr.name][1];
    pb.textContent=pr.name+' profile';
    document.getElementById('recDesc').textContent=pr.desc;
    renderFrontier(a,m);
  }
  window.preset=function(a,t){toolsEl.value=a;thrEl.value=t;render();};
  window.applyPolicy=function(){
    var a=+toolsEl.value, t=+thrEl.value;
    var pr=profile(model(a,t).autonomyIndex);
    sendPrompt('Apply the '+pr.name+' autonomy policy to my production agent: max '+a+' tool calls per task and a '+t+'% human-approval threshold.');
  };
  toolsEl.addEventListener('input',render);
  thrEl.addEventListener('input',render);
  render();
})();
</script>`

export default interactiveAgentBudgetHtml
