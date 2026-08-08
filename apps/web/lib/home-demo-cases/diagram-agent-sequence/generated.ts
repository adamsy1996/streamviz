const diagramAgentSequenceHtml = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 520" width="100%" role="img" style="display:block;height:auto;font-family:var(--sv-font-sans)">
<title>Agent conversation streaming sequence diagram</title>
<desc>Eight numbered messages flow left to right from the Chat UI through the Agent Runtime, the LLM and the Tool Registry into StreamViz, crossing the raw SSE to parsed metadata and HTML boundary, and a live artifact streams back into the same conversation before generation completes. Colors mark the interface, runtime, model, tool and rendering roles.</desc>
<defs>
<marker id="ah-gray" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#888780"/></marker>
<marker id="ah-purple" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#7F77DD"/></marker>
<marker id="ah-blue" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#378ADD"/></marker>
<marker id="ah-teal" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#1D9E75"/></marker>
<marker id="ah-coral" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#D85A30"/></marker>
</defs>
<line x1="120" y1="66" x2="120" y2="478" style="stroke:var(--sv-border-subtle)"/>
<line x1="265" y1="66" x2="265" y2="478" style="stroke:var(--sv-border-subtle)"/>
<line x1="410" y1="66" x2="410" y2="478" style="stroke:var(--sv-border-subtle)"/>
<line x1="555" y1="66" x2="555" y2="478" style="stroke:var(--sv-border-subtle)"/>
<line x1="700" y1="66" x2="700" y2="478" style="stroke:var(--sv-border-subtle)"/>
<rect x="467.5" y="70" width="30" height="408" style="fill:var(--sv-bg-muted)"/>
<line x1="482.5" y1="70" x2="482.5" y2="478" stroke="#888780" stroke-width="1.2" stroke-dasharray="5 4"/>
<g class="c-gray"><rect x="400" y="84" width="70" height="24" rx="12"/><text x="435" y="100" text-anchor="middle" class="t" style="font-size:11px">raw SSE</text></g>
<g class="c-coral"><rect x="495" y="84" width="146" height="24" rx="12"/><text x="568" y="100" text-anchor="middle" class="t" style="font-size:11px">parsed metadata + HTML</text></g>
<g class="c-gray"><rect x="68" y="18" width="104" height="44" rx="4"/><text x="120" y="37" text-anchor="middle" class="t" style="font-size:14px;font-weight:500">Chat UI</text><text x="120" y="52" text-anchor="middle" class="ts" style="font-size:11px">interface</text></g>
<g class="c-purple"><rect x="213" y="18" width="104" height="44" rx="4"/><text x="265" y="37" text-anchor="middle" class="t" style="font-size:14px;font-weight:500">Agent Runtime</text><text x="265" y="52" text-anchor="middle" class="ts" style="font-size:11px">runtime</text></g>
<g class="c-blue"><rect x="358" y="18" width="104" height="44" rx="4"/><text x="410" y="37" text-anchor="middle" class="t" style="font-size:14px;font-weight:500">LLM</text><text x="410" y="52" text-anchor="middle" class="ts" style="font-size:11px">model</text></g>
<g class="c-teal"><rect x="503" y="18" width="104" height="44" rx="4"/><text x="555" y="37" text-anchor="middle" class="t" style="font-size:14px;font-weight:500">Tool Registry</text><text x="555" y="52" text-anchor="middle" class="ts" style="font-size:11px">tool</text></g>
<g class="c-coral"><rect x="648" y="18" width="104" height="44" rx="4"/><text x="700" y="37" text-anchor="middle" class="t" style="font-size:14px;font-weight:500">StreamViz</text><text x="700" y="52" text-anchor="middle" class="ts" style="font-size:11px">render</text></g>
<line x1="120" y1="100" x2="265" y2="100" stroke="#888780" marker-end="url(#ah-gray)"/>
<line x1="265" y1="148" x2="410" y2="148" stroke="#7F77DD" marker-end="url(#ah-purple)"/>
<line x1="410" y1="196" x2="265" y2="196" stroke="#378ADD" stroke-dasharray="5 4" marker-end="url(#ah-blue)"/>
<line x1="265" y1="244" x2="555" y2="244" stroke="#7F77DD" marker-end="url(#ah-purple)"/>
<line x1="555" y1="292" x2="265" y2="292" stroke="#1D9E75" marker-end="url(#ah-teal)"/>
<line x1="265" y1="340" x2="700" y2="340" stroke="#7F77DD" marker-end="url(#ah-purple)"/>
<line x1="700" y1="462" x2="120" y2="462" stroke="#D85A30" stroke-dasharray="5 4" marker-end="url(#ah-coral)"/>
<rect x="148" y="64" width="88" height="26" rx="8" style="fill:var(--sv-bg-surface);stroke:var(--sv-border-subtle)"/><text x="192" y="81" text-anchor="middle" class="t" style="font-size:12px">user prompt</text>
<rect x="275" y="102" width="124" height="36" rx="8" style="fill:var(--sv-bg-surface);stroke:var(--sv-border-subtle)"/><text x="337" y="118" text-anchor="middle" class="t" style="font-size:12px">streaming request</text><text x="337" y="130" text-anchor="middle" class="ts" style="font-size:11px">OpenAI-compatible</text>
<rect x="282" y="150" width="110" height="36" rx="8" style="fill:var(--sv-bg-surface);stroke:var(--sv-border-subtle)"/><text x="337" y="166" text-anchor="middle" class="t" style="font-size:12px">SSE stream</text><text x="337" y="178" text-anchor="middle" class="ts" style="font-size:11px">tokens + tool call</text>
<rect x="342" y="198" width="136" height="36" rx="8" style="fill:var(--sv-bg-surface);stroke:var(--sv-border-subtle)"/><text x="410" y="214" text-anchor="middle" class="t" style="font-size:12px">resolve tool</text><text x="410" y="226" text-anchor="middle" class="ts" style="font-size:11px">visualize_show_widget</text>
<rect x="340" y="256" width="140" height="26" rx="8" style="fill:var(--sv-bg-surface);stroke:var(--sv-border-subtle)"/><text x="410" y="273" text-anchor="middle" class="t" style="font-size:12px">handler → StreamViz</text>
<rect x="418" y="304" width="129" height="26" rx="8" style="fill:var(--sv-bg-surface);stroke:var(--sv-border-subtle)"/><text x="482.5" y="321" text-anchor="middle" class="t" style="font-size:12px">stream widget_code</text>
<rect x="349" y="416" width="122" height="36" rx="8" style="fill:var(--sv-bg-surface);stroke:var(--sv-border-subtle)"/><text x="410" y="432" text-anchor="middle" class="t" style="font-size:12px">live artifact</text><text x="410" y="444" text-anchor="middle" class="ts" style="font-size:11px">back in conversation</text>
<line x1="700" y1="390" x2="696" y2="390" stroke="#D85A30" marker-end="url(#ah-coral)"/>
<line x1="700" y1="424" x2="696" y2="424" stroke="#D85A30"/>
<rect x="546" y="380" width="150" height="48" rx="8" style="fill:var(--sv-bg-surface);stroke:var(--sv-border-subtle)"/><text x="621" y="400" text-anchor="middle" class="t" style="font-size:11px">recover partial HTML</text><text x="621" y="416" text-anchor="middle" class="ts" style="font-size:11px">render in isolated iframe</text>
<circle cx="138" cy="100" r="9" fill="#888780"/><text x="138" y="103.5" text-anchor="middle" class="t" style="font-size:11px;fill:#fff">1</text>
<circle cx="281" cy="148" r="9" fill="#888780"/><text x="281" y="151.5" text-anchor="middle" class="t" style="font-size:11px;fill:#fff">2</text>
<circle cx="394" cy="196" r="9" fill="#888780"/><text x="394" y="199.5" text-anchor="middle" class="t" style="font-size:11px;fill:#fff">3</text>
<circle cx="281" cy="244" r="9" fill="#888780"/><text x="281" y="247.5" text-anchor="middle" class="t" style="font-size:11px;fill:#fff">4</text>
<circle cx="539" cy="292" r="9" fill="#888780"/><text x="539" y="295.5" text-anchor="middle" class="t" style="font-size:11px;fill:#fff">5</text>
<circle cx="281" cy="340" r="9" fill="#888780"/><text x="281" y="343.5" text-anchor="middle" class="t" style="font-size:11px;fill:#fff">6</text>
<circle cx="716" cy="404" r="9" fill="#888780"/><text x="716" y="407.5" text-anchor="middle" class="t" style="font-size:11px;fill:#fff">7</text>
<circle cx="684" cy="462" r="9" fill="#888780"/><text x="684" y="465.5" text-anchor="middle" class="t" style="font-size:11px;fill:#fff">8</text>
<line x1="40" y1="486" x2="720" y2="486" style="stroke:var(--sv-border-subtle)"/>
<rect x="187" y="497" width="10" height="10" rx="2" fill="#888780"/><text x="203" y="504" class="ts" style="font-size:11px">interface</text>
<rect x="260" y="497" width="10" height="10" rx="2" fill="#7F77DD"/><text x="276" y="504" class="ts" style="font-size:11px">runtime</text>
<rect x="323" y="497" width="10" height="10" rx="2" fill="#378ADD"/><text x="339" y="504" class="ts" style="font-size:11px">model</text>
<rect x="379" y="497" width="10" height="10" rx="2" fill="#1D9E75"/><text x="395" y="504" class="ts" style="font-size:11px">tool</text>
<rect x="423" y="497" width="10" height="10" rx="2" fill="#D85A30"/><text x="439" y="504" class="ts" style="font-size:11px">render</text>
<circle cx="488" cy="502" r="7" fill="#888780"/><text x="488" y="505" text-anchor="middle" class="t" style="font-size:11px;fill:#fff">1</text><text x="501" y="504" class="ts" style="font-size:11px">order</text>
<line x1="553" y1="502" x2="567" y2="502" stroke="#888780" stroke-dasharray="4 3"/><text x="573" y="504" class="ts" style="font-size:11px">stream</text>
</svg>`

export default diagramAgentSequenceHtml
