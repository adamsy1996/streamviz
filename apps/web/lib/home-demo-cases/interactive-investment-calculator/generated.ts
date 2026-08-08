const interactiveInvestmentCalculatorHtml = String.raw`<h2 class="sr-only">Interactive long-term investment calculator comparing total contributions, portfolio value after fees, purchasing power after inflation, and fee drag versus a zero-fee scenario under constant assumptions.</h2>
<style>
.ctl{margin-bottom:8px}
.ctl:last-child{margin-bottom:0}
.ctl input[type=range]{width:100%;margin-top:2px}
.sv-value{font-variant-numeric:tabular-nums}
output{font-variant-numeric:tabular-nums}
#legend svg{flex:none}
@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}
</style>
<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;">
  <div style="display:flex;align-items:center;gap:8px;">
    <i class="ti ti-trending-up" style="font-size:18px;color:var(--sv-text-secondary);" aria-hidden="true"></i>
    <span style="font-size:16px;font-weight:500;">Long-term investment calculator</span>
  </div>
  <span class="sv-badge sv-badge-info">Illustrative</span>
</div>
<div class="sv-grid" style="grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;">
  <div class="sv-metric" style="min-width:0;padding:10px 12px;display:flex;flex-direction:column;gap:2px;">
    <span class="sv-label">Total contributions</span>
    <span class="sv-value" id="mContrib" style="font-size:22px;">$250,000</span>
  </div>
  <div class="sv-metric" style="min-width:0;padding:10px 12px;display:flex;flex-direction:column;gap:2px;">
    <span class="sv-label">Projected value, after fees</span>
    <span class="sv-value" id="mNominal" style="font-size:22px;">$651,625</span>
  </div>
  <div class="sv-metric" style="min-width:0;padding:10px 12px;display:flex;flex-direction:column;gap:2px;">
    <span class="sv-label">Purchasing power today</span>
    <span class="sv-value" id="mPower" style="font-size:22px;">$351,471</span>
  </div>
  <div class="sv-metric" style="min-width:0;padding:10px 12px;display:flex;flex-direction:column;gap:2px;">
    <span class="sv-label">Fee drag vs zero-fee</span>
    <span class="sv-value" id="mDrag" style="font-size:22px;">$70,950</span>
  </div>
</div>
<div class="sv-grid" style="grid-template-columns:minmax(0,10fr) minmax(0,11fr);gap:14px;margin-top:14px;">
  <div class="sv-card" style="padding:12px 14px;">
    <div class="sv-label" style="margin-bottom:8px;">Assumptions</div>
    <div class="ctl">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
        <label for="sl-invest" style="font-size:12.5px;color:var(--sv-text-secondary);">Initial investment</label>
        <output id="out-invest" style="font-size:12.5px;font-weight:500;">$25,000</output>
      </div>
      <input type="range" id="sl-invest" min="0" max="200000" step="5000" value="25000">
    </div>
    <div class="ctl">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
        <label for="sl-contrib" style="font-size:12.5px;color:var(--sv-text-secondary);">Monthly contribution</label>
        <output id="out-contrib" style="font-size:12.5px;font-weight:500;">$750</output>
      </div>
      <input type="range" id="sl-contrib" min="0" max="5000" step="50" value="750">
    </div>
    <div class="ctl">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
        <label for="sl-years" style="font-size:12.5px;color:var(--sv-text-secondary);">Time horizon</label>
        <output id="out-years" style="font-size:12.5px;font-weight:500;">25 years</output>
      </div>
      <input type="range" id="sl-years" min="1" max="40" step="1" value="25">
    </div>
    <div class="ctl">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
        <label for="sl-ret" style="font-size:12.5px;color:var(--sv-text-secondary);">Expected annual return</label>
        <output id="out-ret" style="font-size:12.5px;font-weight:500;">7%</output>
      </div>
      <input type="range" id="sl-ret" min="0" max="12" step="0.25" value="7">
    </div>
    <div class="ctl">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
        <label for="sl-fee" style="font-size:12.5px;color:var(--sv-text-secondary);">Annual fee</label>
        <output id="out-fee" style="font-size:12.5px;font-weight:500;">0.6%</output>
      </div>
      <input type="range" id="sl-fee" min="0" max="3" step="0.1" value="0.6">
    </div>
    <div class="ctl">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">
        <label for="sl-infl" style="font-size:12.5px;color:var(--sv-text-secondary);">Inflation</label>
        <output id="out-infl" style="font-size:12.5px;font-weight:500;">2.5%</output>
      </div>
      <input type="range" id="sl-infl" min="0" max="6" step="0.1" value="2.5">
    </div>
  </div>
  <div>
    <div id="legend" style="display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--sv-text-secondary);margin-bottom:6px;"></div>
    <div id="chartBox" style="border:0.5px solid var(--sv-border-subtle);border-radius:var(--sv-radius-md);padding:8px 8px 4px;"></div>
    <div style="font-size:12px;color:var(--sv-text-muted);margin-top:6px;">Chart shows nominal values, not inflation-adjusted.</div>
  </div>
</div>
<div style="display:flex;align-items:center;gap:6px;margin-top:12px;font-size:12px;color:var(--sv-text-muted);">
  <i class="ti ti-info-circle" style="font-size:14px;" aria-hidden="true"></i>
  <span>Illustrative scenario from constant assumptions — not a forecast or investment advice.</span>
</div>
<script>
(function(){
  var css=function(){return getComputedStyle(document.documentElement);};
  var fmt0=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
  function money(v){if(v>=1e6){return '$'+parseFloat((v/1e6).toFixed(2))+'M';}return fmt0.format(Math.round(v));}
  function pct(v){return String(Math.round(v*100)/100).replace(/(\.\d*?)0+$/,'$1')+'%';}
  function compact(v){if(v>=1e6)return '$'+parseFloat((v/1e6).toFixed(1))+'M';if(v>=5000)return '$'+Math.round(v/1000)+'k';return '$'+Math.round(v);}
  function niceCeil(v){if(v<=0)return 1;var e=Math.floor(Math.log10(v)),b=Math.pow(10,e),m=v/b;return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*b;}
  var els={invest:document.getElementById('sl-invest'),contrib:document.getElementById('sl-contrib'),years:document.getElementById('sl-years'),ret:document.getElementById('sl-ret'),fee:document.getElementById('sl-fee'),infl:document.getElementById('sl-infl')};
  var outs={invest:document.getElementById('out-invest'),contrib:document.getElementById('out-contrib'),years:document.getElementById('out-years'),ret:document.getElementById('out-ret'),fee:document.getElementById('out-fee'),infl:document.getElementById('out-infl')};
  var state={};
  function grow(g,n){return g===1?n:(Math.pow(g,n)-1)/(g-1);}
  function compute(v){
    var months=v.years*12;
    var rm=Math.pow(1+v.ret,1/12)-1;
    var gm=1+rm-v.fee/12,zm=1+rm;
    var val=function(g,m){return v.invest*Math.pow(g,m)+v.contrib*grow(g,m);};
    var afterF=val(gm,months),zeroF=val(zm,months);
    var contribT=v.invest+v.contrib*months;
    var step=Math.max(1,Math.round(months/64));
    var after=[],zero=[],princ=[],last=0;
    function push(m){after.push(val(gm,m));zero.push(val(zm,m));princ.push(v.invest+v.contrib*m);}
    for(var m=0;m<=months;m+=step){push(m);last=m;}
    if(last!==months)push(months);
    state={yearsN:v.years,after:after,zero:zero,princ:princ,contrib:contribT,afterF:afterF,zeroF:zeroF,power:afterF/Math.pow(1+v.infl,v.years),drag:zeroF-afterF};
  }
  function draw(){
    var cs=css();
    var c1=cs.getPropertyValue('--sv-chart-series-1').trim()||'#378ADD';
    var c2=cs.getPropertyValue('--sv-chart-series-2').trim()||'#BA7517';
    var c3=cs.getPropertyValue('--sv-chart-series-3').trim()||'#888780';
    var tm=cs.getPropertyValue('--sv-text-muted').trim()||'#888780';
    var gc=cs.getPropertyValue('--sv-border-subtle').trim()||'rgba(128,128,128,0.25)';
    var W=330,H=214,L=44,R=10,T=10,B=32,iw=W-L-R,ih=H-T-B;
    var maxV=niceCeil(state.zeroF),n=state.after.length;
    var px=function(i){return L+iw*(i/(n-1));},py=function(v){return T+ih*(1-v/maxV);};
    var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block;" role="img" aria-label="Line chart over '+state.yearsN+' years comparing contributed principal, portfolio value after fees, and a zero-fee portfolio value.">';
    [0,.25,.5,.75,1].forEach(function(f){
      var yy=py(maxV*f);
      s+='<line x1="'+L+'" y1="'+yy+'" x2="'+(W-R)+'" y2="'+yy+'" stroke="'+gc+'" stroke-width="1"/>';
      s+='<text x="'+(L-6)+'" y="'+(yy+3.5)+'" text-anchor="end" font-size="11" fill="'+tm+'">'+compact(maxV*f)+'</text>';
    });
    var prev=-1;
    [0,.25,.5,.75,1].forEach(function(f){
      var yr=Math.round(f*state.yearsN);
      if(yr===prev)return;prev=yr;
      var i=Math.round(f*(n-1));
      s+='<text x="'+px(i)+'" y="'+(H-12)+'" text-anchor="middle" font-size="11" fill="'+tm+'">'+yr+'</text>';
    });
    s+='<text x="'+(L+iw/2)+'" y="'+(H-2)+'" text-anchor="middle" font-size="11" fill="'+tm+'">years</text>';
    var afterPts=[],zeroPts=[],princPts=[];
    for(var i=0;i<n;i++){afterPts.push(px(i)+','+py(state.after[i]));zeroPts.push(px(i)+','+py(state.zero[i]));princPts.push(px(i)+','+py(state.princ[i]));}
    var area=[px(0)+','+py(0)].concat(afterPts).concat([px(n-1)+','+py(0)]).join(' ');
    s+='<polygon points="'+area+'" fill="'+c1+'" fill-opacity="0.10"/>';
    s+='<polyline points="'+afterPts.join(' ')+'" fill="none" stroke="'+c1+'" stroke-width="2"/>';
    s+='<polyline points="'+zeroPts.join(' ')+'" fill="none" stroke="'+c2+'" stroke-width="2" stroke-dasharray="6 4"/>';
    s+='<polyline points="'+princPts.join(' ')+'" fill="none" stroke="'+c3+'" stroke-width="1.5" stroke-dasharray="2 4"/>';
    s+='<circle cx="'+px(n-1)+'" cy="'+py(state.after[n-1])+'" r="3" fill="'+c1+'"/>';
    s+='<circle cx="'+px(n-1)+'" cy="'+py(state.zero[n-1])+'" r="3" fill="'+c2+'"/>';
    s+='<circle cx="'+px(n-1)+'" cy="'+py(state.princ[n-1])+'" r="2.5" fill="'+c3+'"/>';
    s+='</svg>';
    document.getElementById('chartBox').innerHTML=s;
    document.getElementById('legend').innerHTML=
      '<span style="display:flex;align-items:center;gap:5px;"><svg width="20" height="6" aria-hidden="true"><line x1="0" y1="3" x2="20" y2="3" stroke="'+c1+'" stroke-width="2"/></svg>After fees</span>'+
      '<span style="display:flex;align-items:center;gap:5px;"><svg width="20" height="6" aria-hidden="true"><line x1="0" y1="3" x2="20" y2="3" stroke="'+c2+'" stroke-width="2" stroke-dasharray="6 4"/></svg>Zero fee</span>'+
      '<span style="display:flex;align-items:center;gap:5px;"><svg width="20" height="6" aria-hidden="true"><line x1="0" y1="3" x2="20" y2="3" stroke="'+c3+'" stroke-width="1.5" stroke-dasharray="2 4"/></svg>Contributions</span>';
  }
  function setMetrics(){
    document.getElementById('mContrib').textContent=money(state.contrib);
    document.getElementById('mNominal').textContent=money(state.afterF);
    document.getElementById('mPower').textContent=money(state.power);
    document.getElementById('mDrag').textContent=money(state.drag);
  }
  function update(){
    var v={invest:+els.invest.value,contrib:+els.contrib.value,years:+els.years.value,ret:+els.ret.value,fee:+els.fee.value,infl:+els.infl.value};
    outs.invest.textContent=money(v.invest);
    outs.contrib.textContent=money(v.contrib);
    outs.years.textContent=v.years+(v.years===1?' year':' years');
    outs.ret.textContent=pct(v.ret);
    outs.fee.textContent=pct(v.fee);
    outs.infl.textContent=pct(v.infl);
    compute({invest:v.invest,contrib:v.contrib,years:v.years,ret:v.ret/100,fee:v.fee/100,infl:v.infl/100});setMetrics();draw();
  }
  Object.keys(els).forEach(function(k){els[k].addEventListener('input',update);});
  try{window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){if(state.after)draw();});}catch(e){}
  update();
})();
</script>`

export default interactiveInvestmentCalculatorHtml
