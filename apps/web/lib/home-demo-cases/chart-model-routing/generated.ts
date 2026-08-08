const chartModelRoutingHtml = String.raw`<svg viewBox="0 0 760 520" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="chartTitle chartDesc">
<title id="chartTitle">Model routing performance, dynamic routing versus static baseline</title>
<desc id="chartDesc">Dynamic routing across Swift, Balanced, and Reasoning model tiers over a seven-day launch: blended P95 latency down 30 percent to 545 ms, cost per thousand tasks down 22 percent to 11.80 dollars, task success held at 99.4 percent versus the static baseline.</desc>
<style>
.tp{fill:var(--sv-text-primary)}.ts{fill:var(--sv-text-secondary)}.tm{fill:var(--sv-text-muted)}
.su{fill:var(--sv-text-success)}.subg{fill:var(--sv-bg-success)}
.s1{fill:var(--sv-chart-series-1,#378ADD)}.s2{fill:var(--sv-chart-series-2,#D85A30)}.s3{fill:var(--sv-chart-series-3,#7F77DD)}
.st1{stroke:var(--sv-chart-series-1,#378ADD)}.st2{stroke:var(--sv-chart-series-2,#D85A30)}.st3{stroke:var(--sv-chart-series-3,#7F77DD)}
.gd{stroke:var(--sv-border-subtle)}.bd{stroke:var(--sv-border-default)}.sf{fill:var(--sv-bg-surface)}
.act{cursor:pointer}.act:hover rect{fill:var(--sv-bg-muted)}
svg{font-family:var(--sv-font-sans)}
</style>

<text x="0" y="16" font-size="11" class="tm">StreamViz · model routing · seven-day launch</text>
<text x="760" y="30" font-size="12" class="tm" text-anchor="end">4.2M tasks routed</text>
<text x="0" y="38" font-size="18" font-weight="500" class="tp">Dynamic routing beats static on cost and latency</text>

<rect x="0" y="50" width="240" height="96" rx="10" class="sf bd"/>
<rect x="176" y="56" width="56" height="20" rx="10" class="subg"/>
<text x="204" y="70" font-size="11" class="su" text-anchor="middle">+0.2 pts</text>
<text x="16" y="74" font-size="12" class="tm">Task success</text>
<text x="16" y="100" font-size="24" font-weight="500" class="tp">99.4%</text>
<text x="16" y="120" font-size="12" class="ts">static 99.2%</text>

<rect x="248" y="50" width="240" height="96" rx="10" class="sf bd"/>
<rect x="436" y="56" width="44" height="20" rx="10" class="subg"/>
<text x="458" y="70" font-size="11" class="su" text-anchor="middle">−30%</text>
<text x="264" y="74" font-size="12" class="tm">P95 latency</text>
<text x="264" y="100" font-size="24" font-weight="500" class="tp">545 ms</text>
<text x="264" y="120" font-size="12" class="ts">static 780 ms</text>

<rect x="496" y="50" width="240" height="96" rx="10" class="sf bd"/>
<rect x="684" y="56" width="44" height="20" rx="10" class="subg"/>
<text x="706" y="70" font-size="11" class="su" text-anchor="middle">−22%</text>
<text x="512" y="74" font-size="12" class="tm">Cost per 1k tasks</text>
<text x="512" y="100" font-size="24" font-weight="500" class="tp">$11.80</text>
<text x="512" y="120" font-size="12" class="ts">static $15.20</text>

<text x="56" y="166" font-size="12" class="ts">P95 latency by route · ms</text>
<text x="492" y="166" font-size="12" class="ts">Cost vs success by route</text>

<line x1="56" y1="372" x2="440" y2="372" class="gd"/>
<line x1="56" y1="339.3" x2="440" y2="339.3" class="gd"/>
<line x1="56" y1="306.7" x2="440" y2="306.7" class="gd"/>
<line x1="56" y1="274" x2="440" y2="274" class="gd"/>
<line x1="56" y1="241.3" x2="440" y2="241.3" class="gd"/>
<line x1="56" y1="208.7" x2="440" y2="208.7" class="gd"/>
<line x1="56" y1="176" x2="440" y2="176" class="gd"/>
<line x1="56" y1="176" x2="56" y2="372" class="gd"/>
<text x="46" y="375.5" font-size="11" class="ts" text-anchor="end">300</text>
<text x="46" y="342.8" font-size="11" class="ts" text-anchor="end">500</text>
<text x="46" y="310.2" font-size="11" class="ts" text-anchor="end">700</text>
<text x="46" y="277.5" font-size="11" class="ts" text-anchor="end">900</text>
<text x="46" y="244.8" font-size="11" class="ts" text-anchor="end">1100</text>
<text x="46" y="212.2" font-size="11" class="ts" text-anchor="end">1300</text>
<text x="46" y="179.5" font-size="11" class="ts" text-anchor="end">1500</text>
<text x="56" y="390" font-size="11" class="tm" text-anchor="middle">Mon</text>
<text x="120" y="390" font-size="11" class="tm" text-anchor="middle">Tue</text>
<text x="184" y="390" font-size="11" class="tm" text-anchor="middle">Wed</text>
<text x="248" y="390" font-size="11" class="tm" text-anchor="middle">Thu</text>
<text x="312" y="390" font-size="11" class="tm" text-anchor="middle">Fri</text>
<text x="376" y="390" font-size="11" class="tm" text-anchor="middle">Sat</text>
<text x="440" y="390" font-size="11" class="tm" text-anchor="middle">Sun</text>

<line x1="56" y1="293.6" x2="440" y2="293.6" stroke="var(--sv-text-muted)" stroke-width="1" stroke-dasharray="2 3" opacity="0.65"/>
<text x="56" y="285" font-size="11" class="tm">static baseline 780 ms</text>

<path d="M56,336.1 L120,338.4 L184,340.6 L248,342.9 L312,344.9 L376,347.2 L440,349.1" fill="none" class="st1" stroke-width="2"/>
<circle cx="56" cy="336.1" r="3" class="s1"/><circle cx="120" cy="338.4" r="3" class="s1"/><circle cx="184" cy="340.6" r="3" class="s1"/><circle cx="248" cy="342.9" r="3" class="s1"/><circle cx="312" cy="344.9" r="3" class="s1"/><circle cx="376" cy="347.2" r="3" class="s1"/><circle cx="440" cy="349.1" r="3" class="s1"/>
<path d="M56,306.7 L120,309.9 L184,313.2 L248,316.5 L312,319.4 L376,323 L440,326.3" fill="none" class="st2" stroke-width="2" stroke-dasharray="6 4"/>
<path d="M56,303.2 L59.5,306.7 L56,310.2 L52.5,306.7 Z M120,306.4 L123.5,309.9 L120,313.4 L116.5,309.9 Z M184,309.7 L187.5,313.2 L184,316.7 L180.5,313.2 Z M248,313 L251.5,316.5 L248,320 L244.5,316.5 Z M312,315.9 L315.5,319.4 L312,322.9 L308.5,319.4 Z M376,319.5 L379.5,323 L376,326.5 L372.5,323 Z M440,322.8 L443.5,326.3 L440,329.8 L436.5,326.3 Z" class="s2"/>
<path d="M56,200.5 L120,208.7 L184,215.2 L248,221.7 L312,226.6 L376,229.9 L440,233.2" fill="none" class="st3" stroke-width="2" stroke-dasharray="2 4"/>
<path d="M56,196.9 L59.4,203.1 L52.6,203.1 Z M120,205.1 L123.4,211.3 L116.6,211.3 Z M184,211.6 L187.4,217.8 L180.6,217.8 Z M248,218.1 L251.4,224.3 L244.6,224.3 Z M312,223 L315.4,229.2 L308.6,229.2 Z M376,226.3 L379.4,232.5 L372.6,232.5 Z M440,229.6 L443.4,235.8 L436.6,235.8 Z" class="s3"/>
<text x="434" y="341" font-size="11" class="ts" text-anchor="end">440 ms</text>
<text x="434" y="317" font-size="11" class="ts" text-anchor="end">580 ms</text>
<text x="434" y="224" font-size="11" class="ts" text-anchor="end">1.15 s</text>

<line x1="492" y1="372" x2="744" y2="372" class="gd"/>
<line x1="492" y1="306.7" x2="744" y2="306.7" class="gd"/>
<line x1="492" y1="241.3" x2="744" y2="241.3" class="gd"/>
<line x1="492" y1="176" x2="744" y2="176" class="gd"/>
<line x1="589" y1="176" x2="589" y2="372" class="gd"/>
<line x1="686" y1="176" x2="686" y2="372" class="gd"/>
<line x1="492" y1="176" x2="492" y2="372" class="gd"/>
<text x="482" y="310.2" font-size="11" class="ts" text-anchor="end">99</text>
<text x="482" y="244.8" font-size="11" class="ts" text-anchor="end">99.5</text>
<text x="482" y="179.5" font-size="11" class="ts" text-anchor="end">100</text>
<text x="540.5" y="390" font-size="11" class="tm" text-anchor="middle">5</text>
<text x="589" y="390" font-size="11" class="tm" text-anchor="middle">10</text>
<text x="637.5" y="390" font-size="11" class="tm" text-anchor="middle">15</text>
<text x="686" y="390" font-size="11" class="tm" text-anchor="middle">20</text>
<text x="734.5" y="390" font-size="11" class="tm" text-anchor="middle">25</text>
<text x="476" y="270" font-size="11" class="tm" text-anchor="middle" transform="rotate(-90 476 270)">success %</text>
<text x="618" y="402" font-size="11" class="tm" text-anchor="middle">cost per 1k tasks</text>

<line x1="639.3" y1="280.5" x2="606.3" y2="254.4" stroke="var(--sv-text-muted)" stroke-width="1" stroke-dasharray="3 3"/>
<circle cx="554" cy="319.7" r="4" class="s1"/>
<path d="M614.1,263.5 L618.1,267.5 L614.1,271.5 L610.1,267.5 Z" class="s2"/>
<path d="M719.7,211.6 L723.1,217.8 L716.3,217.8 Z" class="s3"/>
<rect x="635.3" y="276.5" width="8" height="8" fill="var(--sv-text-muted)"/>
<circle cx="606.3" cy="254.4" r="6.5" class="sf" class2="" stroke="var(--sv-chart-series-1,#378ADD)" stroke-width="2"/>
<circle cx="606.3" cy="254.4" r="2.5" class="s1"/>
<text x="554" y="340" font-size="11" class="ts" text-anchor="middle">Swift</text>
<text x="614.1" y="246" font-size="11" class="ts" text-anchor="middle">Balanced</text>
<text x="742" y="200" font-size="11" class="ts" text-anchor="end">Reasoning</text>
<text x="639.3" y="297" font-size="11" class="ts" text-anchor="middle">static</text>
<text x="606.3" y="232" font-size="11" class="ts" text-anchor="middle">dynamic</text>
<text x="623" y="267" font-size="11" class="su" text-anchor="middle">−22%</text>

<line x1="0" y1="444" x2="760" y2="444" class="gd"/>

<line x1="0" y1="412" x2="40" y2="412" class="st1" stroke-width="2"/>
<circle cx="40" cy="412" r="3" class="s1"/>
<text x="50" y="415" font-size="12" font-weight="500" class="tp">Swift<tspan class="ts" font-weight="400"> · 440 ms</tspan></text>
<text x="50" y="431" font-size="11" class="tm">cost $6.40 · success 98.9%</text>
<line x1="252" y1="412" x2="292" y2="412" class="st2" stroke-width="2" stroke-dasharray="6 4"/>
<path d="M292,408.5 L295.5,412 L292,415.5 L288.5,412 Z" class="s2"/>
<text x="302" y="415" font-size="12" font-weight="500" class="tp">Balanced<tspan class="ts" font-weight="400"> · 580 ms</tspan></text>
<text x="302" y="431" font-size="11" class="tm">cost $12.60 · success 99.3%</text>
<line x1="504" y1="412" x2="544" y2="412" class="st3" stroke-width="2" stroke-dasharray="2 4"/>
<path d="M544,408.4 L547.4,414.6 L540.6,414.6 Z" class="s3"/>
<text x="554" y="415" font-size="12" font-weight="500" class="tp">Reasoning<tspan class="ts" font-weight="400"> · 1.15 s</tspan></text>
<text x="554" y="431" font-size="11" class="tm">cost $23.50 · success 99.7%</text>

<text x="0" y="470" font-size="13" class="ts">Dynamic routing cut P95 latency 30% and cost 22% vs static, holding task success at 99.4%.</text>
<g class="act" role="button" tabindex="0" aria-label="Inspect routing policy" onclick="sendPrompt('Show the routing policy behind this seven-day launch, and how tasks are assigned across Swift, Balanced, and Reasoning.')">
<rect x="596" y="452" width="164" height="36" rx="10" class="bd"/>
<text x="678" y="474" font-size="13" font-weight="500" class="tp" text-anchor="middle">Inspect routing policy ↗</text>
</g>
</svg>`

export default chartModelRoutingHtml
