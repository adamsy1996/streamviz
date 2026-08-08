const artAgentConstellationHtml = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 520" width="100%" style="display:block;max-width:760px;height:auto;margin:0 auto" role="img" aria-labelledby="t d">
<title id="t">The agent constellation</title>
<desc id="d">Abstract map of an AI agent forming an answer: a user signal enters at input, passes through a central reasoning core, branches through memory and tool constellations, and converges into a response.</desc>
<style>
.lns{fill:none;stroke:var(--sv-border-subtle,rgba(120,120,120,.35));stroke-width:1}
.ln1{fill:none;stroke:var(--sv-chart-series-1,#7F77DD);stroke-width:1.5;stroke-linecap:round}
.ln2{fill:none;stroke:var(--sv-chart-series-2,#1D9E75);stroke-width:1.5;stroke-linecap:round}
.ln3{fill:none;stroke:var(--sv-chart-series-3,#378ADD);stroke-width:1.5;stroke-linecap:round}
.ln7{fill:none;stroke:var(--sv-chart-series-7,#888780);stroke-width:.8;stroke-linecap:round;opacity:.55}
.f1{stroke-dasharray:3 9;animation:drift 2.4s linear infinite}
.f2{stroke-dasharray:2 12;animation:drift 3.4s linear infinite}
.fo{stroke-dasharray:2 19;animation:drift 30s linear infinite}
.twk{animation:twk 4.6s ease-in-out infinite}
.n1{fill:var(--sv-chart-series-1,#7F77DD)}
.n2{fill:var(--sv-chart-series-2,#1D9E75)}
.n3{fill:var(--sv-chart-series-3,#378ADD)}
.n7{fill:var(--sv-chart-series-7,#888780)}
.lb{font-family:var(--sv-font-mono,ui-monospace,SFMono-Regular,monospace);font-size:12px;letter-spacing:.14em;fill:var(--sv-text-secondary,#5f5e5a)}
@keyframes drift{to{stroke-dashoffset:-84}}
@keyframes twk{0%,100%{opacity:.15}50%{opacity:.8}}
@media (prefers-reduced-motion:reduce){.f1,.f2,.fo,.twk{animation:none!important}}
</style>
<ellipse class="fo" cx="380" cy="262" rx="336" ry="214"/>
<ellipse class="lns" cx="380" cy="262" rx="300" ry="186"/>
<path class="lns" d="M24 262 H736"/>
<path class="lns" d="M380 38 V486"/>
<path class="ln7" d="M545 142 C 570 250, 560 320, 560 396"/>
<circle class="fo" cx="300" cy="245" r="88"/>
<circle class="lns" cx="300" cy="245" r="64"/>
<circle class="f2" cx="300" cy="245" r="40"/>
<ellipse class="fo" cx="545" cy="128" rx="62" ry="44"/>
<ellipse class="fo" cx="560" cy="402" rx="64" ry="46"/>
<circle class="lns" cx="682" cy="248" r="26"/>
<circle class="f2" cx="682" cy="248" r="13"/>
<path class="ln7" d="M545 128 L498 88 M545 128 L584 92 M545 128 L586 158 M545 128 L508 168 M498 88 L584 92 M586 158 L508 168"/>
<path class="ln7" d="M560 402 L512 362 M560 402 L606 358 M560 402 L606 436 M560 402 L516 438 M512 362 L606 358 M606 436 L516 438"/>
<path class="ln1 f1" d="M16 388 H84"/>
<path class="n1" d="M84 382 L96 388 L84 394 Z"/>
<path class="ln1 f1" d="M102 390 C 178 408, 236 356, 274 268"/>
<path class="ln2 f2" d="M330 207 C 402 150, 456 141, 537 130"/>
<path class="ln3 f2" d="M304 272 C 384 336, 452 386, 551 399"/>
<path class="ln2 f2" d="M556 133 C 612 152, 642 190, 669 234"/>
<path class="ln3 f2" d="M571 392 C 614 356, 644 316, 673 265"/>
<circle class="n1" cx="92" cy="388" r="7"/>
<circle cx="92" cy="388" r="2.4" fill="var(--sv-bg-surface,#fff)" opacity=".85"/>
<circle class="core n1" cx="300" cy="245" r="26"/>
<circle cx="300" cy="245" r="6" fill="var(--sv-bg-surface,#fff)" opacity=".85"/>
<circle class="n1 twk" cx="300" cy="228" r="2" style="animation-delay:.6s"/>
<circle class="n2" cx="545" cy="128" r="9"/>
<circle cx="545" cy="128" r="3" fill="var(--sv-bg-surface,#fff)" opacity=".85"/>
<circle class="n2" cx="498" cy="88" r="5"/>
<circle class="n2" cx="584" cy="92" r="5.5"/>
<circle class="n2" cx="586" cy="158" r="4.5"/>
<circle class="n2" cx="508" cy="168" r="5"/>
<path class="n3" d="M560 391 L571 402 L560 413 L549 402 Z"/>
<circle cx="560" cy="402" r="2.4" fill="var(--sv-bg-surface,#fff)" opacity=".85"/>
<rect class="n3" x="509" y="359" width="6" height="6" rx="1"/>
<rect class="n3" x="603" y="355" width="7" height="7" rx="1"/>
<rect class="n3" x="603" y="433" width="7" height="7" rx="1"/>
<rect class="n3" x="513" y="435" width="6" height="6" rx="1"/>
<circle class="core n1" cx="682" cy="248" r="9"/>
<circle cx="682" cy="248" r="3" fill="var(--sv-bg-surface,#fff)" opacity=".85"/>
<circle class="n1 twk" cx="186" cy="364" r="2"/>
<circle class="n2 twk" cx="428" cy="152" r="2" style="animation-delay:1.1s"/>
<circle class="n3 twk" cx="428" cy="348" r="2" style="animation-delay:2.2s"/>
<circle class="n2 twk" cx="600" cy="180" r="2" style="animation-delay:1.6s"/>
<circle class="n3 twk" cx="612" cy="336" r="2" style="animation-delay:.7s"/>
<circle class="n7 twk" cx="671" cy="155" r="1.8" style="animation-delay:.3s"/>
<circle class="n7 twk" cx="467" cy="55" r="1.6" style="animation-delay:1.9s"/>
<circle class="n7 twk" cx="212" cy="77" r="2" style="animation-delay:2.6s"/>
<circle class="n7 twk" cx="64" cy="335" r="1.7" style="animation-delay:.9s"/>
<circle class="n7 twk" cx="265" cy="463" r="1.6" style="animation-delay:3.1s"/>
<circle class="n7 twk" cx="548" cy="447" r="1.8" style="animation-delay:1.3s"/>
<circle class="n7 twk" cx="367" cy="188" r="1.7" style="animation-delay:2s"/>
<circle class="n7 twk" cx="217" cy="275" r="1.6" style="animation-delay:.5s"/>
<circle class="n7 twk" cx="315" cy="332" r="1.8" style="animation-delay:2.8s"/>
<circle class="n7 twk" cx="589" cy="97" r="1.6" style="animation-delay:1.4s"/>
<circle class="n7 twk" cx="487" cy="143" r="1.7" style="animation-delay:3.4s"/>
<circle class="n7 twk" cx="519" cy="437" r="1.6" style="animation-delay:.2s"/>
<circle class="n7 twk" cx="592" cy="364" r="1.7" style="animation-delay:2.3s"/>
<circle class="n7 twk" cx="150" cy="120" r="1.6" style="animation-delay:1s"/>
<circle class="n7 twk" cx="430" cy="472" r="1.7" style="animation-delay:3.6s"/>
<circle class="n7 twk" cx="700" cy="90" r="1.6" style="animation-delay:2.5s"/>
<circle class="n7 twk" cx="640" cy="120" r="1.6" style="animation-delay:1.7s"/>
<text class="lb" x="74" y="418" text-anchor="end">input</text>
<text class="lb" x="300" y="352" text-anchor="middle">reasoning</text>
<text class="lb" x="545" y="60" text-anchor="middle">memory</text>
<text class="lb" x="560" y="470" text-anchor="middle">tools</text>
<text class="lb" x="682" y="306" text-anchor="middle">response</text>
</svg>`

export default artAgentConstellationHtml
