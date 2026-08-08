const mockupEnergyResilienceHtml = String.raw`<h2 class="sr-only">Northgate neighborhood microgrid is islanded during a heatwave grid outage; solar and battery generation supply 158 kilowatts protecting the hospital, two cooling centers and the water station, while residential demand response curtails flexible load to 39 kilowatts.</h2>
<div style="padding:1rem 0;">
<div class="sv-card" style="display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;margin-bottom:12px;padding:12px 14px;">
<div style="display:flex;align-items:center;gap:10px;">
<span class="sv-badge sv-badge-warning" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;"><i class="ti ti-bolt" aria-hidden="true" style="font-size:14px;"></i>Islanded</span>
<div>
<p style="margin:0;font-size:16px;font-weight:500;color:var(--sv-text-primary);">Northgate microgrid</p>
<p style="margin:0;font-size:12px;color:var(--sv-text-muted);">grid outage since 14:02 · resilient ops</p>
</div>
</div>
<div style="display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;margin-left:auto;">
<div style="display:flex;align-items:center;gap:8px;">
<i class="ti ti-clock" aria-hidden="true" style="font-size:16px;color:var(--sv-text-muted);"></i>
<div>
<p style="margin:0;font-size:14px;font-weight:500;color:var(--sv-text-primary);">14:32</p>
<p style="margin:0;font-size:11px;color:var(--sv-text-muted);">local time</p>
</div>
</div>
<div style="display:flex;align-items:center;gap:8px;">
<i class="ti ti-thermometer" aria-hidden="true" style="font-size:16px;color:var(--sv-text-muted);"></i>
<div>
<p style="margin:0;font-size:14px;font-weight:500;color:var(--sv-text-primary);">38 °C</p>
<p style="margin:0;font-size:11px;color:var(--sv-text-muted);">outside</p>
</div>
</div>
<div style="display:flex;align-items:center;gap:8px;">
<i class="ti ti-timeline" aria-hidden="true" style="font-size:16px;color:var(--sv-text-muted);"></i>
<div>
<p style="margin:0;font-size:14px;font-weight:500;color:var(--sv-text-primary);">≈19:00</p>
<p style="margin:0;font-size:11px;color:var(--sv-text-muted);">grid ETA</p>
</div>
</div>
<span class="sv-badge sv-badge-info" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;"><i class="ti ti-shield-check" aria-hidden="true" style="font-size:14px;"></i>posture: critical protection</span>
</div>
</div>

<div class="sv-card" style="margin-bottom:12px;padding:12px 14px;">
<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:6px;">
<p style="margin:0;font-size:13px;font-weight:500;color:var(--sv-text-secondary);">Live energy flow</p>
<p style="margin:0;font-size:11px;color:var(--sv-text-muted);">SCADA · updated 14:32</p>
</div>
<svg viewBox="0 0 720 178" width="100%" role="img" aria-labelledby="flow-title flow-desc" style="display:block;">
<title id="flow-title">Neighborhood microgrid energy flow</title>
<desc id="flow-desc">Solar PV and battery supply the distribution bus, which feeds the hospital, two cooling centers, the water pumping station and residential blocks at different protection tiers.</desc>
<defs>
<marker id="mg" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#639922"/></marker>
<marker id="ma" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#BA7517"/></marker>
<marker id="mc" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#D85A30"/></marker>
<marker id="mt" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#1D9E75"/></marker>
</defs>
<text class="t" x="18" y="16" font-size="11">generation</text>
<text class="t" x="335" y="16" font-size="11">loads</text>
<line x1="132" y1="46" x2="194" y2="46" stroke="#BA7517" stroke-width="1.5" marker-end="url(#ma)"/>
<line x1="132" y1="114" x2="194" y2="114" stroke="#1D9E75" stroke-width="1.5" marker-end="url(#mt)"/>
<line x1="204" y1="36" x2="328" y2="36" stroke="#639922" stroke-width="1.5" marker-end="url(#mg)"/>
<line x1="204" y1="74" x2="328" y2="74" stroke="#639922" stroke-width="1.5" marker-end="url(#mg)"/>
<line x1="204" y1="112" x2="328" y2="112" stroke="#BA7517" stroke-width="1.5" marker-end="url(#ma)"/>
<line x1="204" y1="150" x2="328" y2="150" stroke="#D85A30" stroke-width="1.5" marker-end="url(#mc)"/>
<g class="c-gray"><rect x="196" y="20" width="8" height="150" rx="3"/></g>
<g class="c-amber">
<rect x="14" y="24" width="118" height="44" rx="8"/>
<text class="th" x="30" y="44" font-size="13">Solar PV</text>
<text class="ts" x="30" y="60" font-size="11">96 kW</text>
</g>
<g class="c-teal">
<rect x="14" y="92" width="118" height="44" rx="8"/>
<text class="th" x="30" y="112" font-size="13">Battery</text>
<text class="ts" x="30" y="128" font-size="11">62 kW · 340 kWh</text>
</g>
<g class="c-green">
<rect x="330" y="20" width="150" height="32" rx="8"/>
<text class="th" x="344" y="35" font-size="13">Hospital</text>
<text class="ts" x="344" y="48" font-size="11">Protected · 44 kW</text>
</g>
<g class="c-green">
<rect x="330" y="58" width="150" height="32" rx="8"/>
<text class="th" x="344" y="73" font-size="13">Cooling centers ×2</text>
<text class="ts" x="344" y="86" font-size="11">Protected · 52 kW</text>
</g>
<g class="c-amber">
<rect x="330" y="96" width="150" height="32" rx="8"/>
<text class="th" x="344" y="111" font-size="13">Water station</text>
<text class="ts" x="344" y="124" font-size="11">Constrained · 16 kW</text>
</g>
<g class="c-coral">
<rect x="330" y="134" width="150" height="32" rx="8"/>
<text class="th" x="344" y="149" font-size="13">Residential blocks</text>
<text class="ts" x="344" y="162" font-size="11">Flexible · 39 kW</text>
</g>
</svg>
<div style="display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:8px;font-size:12px;color:var(--sv-text-secondary);">
<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#639922;"></span>Protected · full supply</span>
<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#BA7517;"></span>Constrained · reduced service</span>
<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#D85A30;"></span>Flexible · demand response</span>
<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#888780;"></span>Distribution bus</span>
</div>
</div>

<div class="sv-grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:12px;">
<div class="sv-card-muted" style="padding:12px 14px;">
<p class="sv-label" style="margin:0 0 4px;display:flex;align-items:center;gap:6px;"><i class="ti ti-sun" aria-hidden="true" style="font-size:14px;"></i>Available generation</p>
<p class="sv-value" style="margin:0;">158 kW</p>
<p class="sv-muted" style="margin:4px 0 0;">solar 96 + battery 62</p>
</div>
<div class="sv-card-muted" style="padding:12px 14px;">
<p class="sv-label" style="margin:0 0 4px;display:flex;align-items:center;gap:6px;"><i class="ti ti-activity" aria-hidden="true" style="font-size:14px;"></i>Current demand</p>
<p class="sv-value" style="margin:0;">151 kW</p>
<p class="sv-muted" style="margin:4px 0 0;">7 kW margin · critical met</p>
</div>
<div class="sv-card-muted" style="padding:12px 14px;">
<p class="sv-label" style="margin:0 0 4px;display:flex;align-items:center;gap:6px;"><i class="ti ti-battery-2" aria-hidden="true" style="font-size:14px;"></i>Battery reserve</p>
<p class="sv-value" style="margin:0;">340 kWh</p>
<p class="sv-muted" style="margin:4px 0 0;">≈ 5.5 h endurance at 62 kW</p>
</div>
<div class="sv-card-muted" style="padding:12px 14px;">
<p class="sv-label" style="margin:0 0 4px;display:flex;align-items:center;gap:6px;"><i class="ti ti-users" aria-hidden="true" style="font-size:14px;"></i>Residents served</p>
<p class="sv-value" style="margin:0;">4,120</p>
<p class="sv-muted" style="margin:4px 0 0;">6 blocks · 2 cooling centers</p>
</div>
</div>

<div class="sv-grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">
<div class="sv-card" style="padding:12px 14px;">
<p style="margin:0 0 8px;font-size:13px;font-weight:500;color:var(--sv-text-secondary);">Priority allocation</p>
<div style="display:flex;flex-direction:column;gap:8px;">
<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
<div style="display:flex;align-items:center;gap:8px;min-width:0;">
<i class="ti ti-building-hospital" aria-hidden="true" style="font-size:16px;color:var(--sv-text-muted);"></i>
<span class="sv-badge sv-badge-success" style="font-size:11px;padding:2px 8px;">Protected</span>
<span style="font-size:13px;color:var(--sv-text-primary);white-space:nowrap;">Hospital</span>
</div>
<span style="font-size:11px;color:var(--sv-text-muted);white-space:nowrap;">44 kW · full power</span>
</div>
<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
<div style="display:flex;align-items:center;gap:8px;min-width:0;">
<i class="ti ti-snowflake" aria-hidden="true" style="font-size:16px;color:var(--sv-text-muted);"></i>
<span class="sv-badge sv-badge-success" style="font-size:11px;padding:2px 8px;">Protected</span>
<span style="font-size:13px;color:var(--sv-text-primary);white-space:nowrap;">Cooling centers ×2</span>
</div>
<span style="font-size:11px;color:var(--sv-text-muted);white-space:nowrap;">52 kW · setpoint 24 °C</span>
</div>
<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
<div style="display:flex;align-items:center;gap:8px;min-width:0;">
<i class="ti ti-droplet" aria-hidden="true" style="font-size:16px;color:var(--sv-text-muted);"></i>
<span class="sv-badge sv-badge-warning" style="font-size:11px;padding:2px 8px;">Constrained</span>
<span style="font-size:13px;color:var(--sv-text-primary);white-space:nowrap;">Water pumping</span>
</div>
<span style="font-size:11px;color:var(--sv-text-muted);white-space:nowrap;">16 kW · 70% schedule</span>
</div>
<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
<div style="display:flex;align-items:center;gap:8px;min-width:0;">
<i class="ti ti-home" aria-hidden="true" style="font-size:16px;color:var(--sv-text-muted);"></i>
<span class="sv-badge sv-badge-danger" style="font-size:11px;padding:2px 8px;">Flexible</span>
<span style="font-size:13px;color:var(--sv-text-primary);white-space:nowrap;">Residential blocks</span>
</div>
<span style="font-size:11px;color:var(--sv-text-muted);white-space:nowrap;">39 kW · DR active</span>
</div>
</div>
</div>

<div class="sv-card" style="padding:12px 14px;">
<p style="margin:0 0 8px;font-size:13px;font-weight:500;color:var(--sv-text-secondary);">Operational timeline</p>
<div style="display:flex;flex-direction:column;gap:8px;">
<div style="display:flex;align-items:flex-start;gap:10px;">
<span style="font-family:var(--sv-font-mono);font-size:12px;color:var(--sv-text-secondary);min-width:38px;">14:02</span>
<div style="display:flex;flex-direction:column;gap:1px;">
<p style="margin:0;font-size:13px;color:var(--sv-text-primary);">Grid loss detected</p>
<p style="margin:0;font-size:11px;color:var(--sv-text-muted);">regional outage · auto-detected</p>
</div>
</div>
<div style="display:flex;align-items:flex-start;gap:10px;">
<span style="font-family:var(--sv-font-mono);font-size:12px;color:var(--sv-text-secondary);min-width:38px;">14:04</span>
<div style="display:flex;flex-direction:column;gap:1px;">
<p style="margin:0;font-size:13px;color:var(--sv-text-primary);">Microgrid islanded</p>
<p style="margin:0;font-size:11px;color:var(--sv-text-muted);">solar + battery take the bus</p>
</div>
</div>
<div style="display:flex;align-items:flex-start;gap:10px;">
<span style="font-family:var(--sv-font-mono);font-size:12px;color:var(--sv-text-secondary);min-width:38px;">14:09</span>
<div style="display:flex;flex-direction:column;gap:1px;">
<p style="margin:0;font-size:13px;color:var(--sv-text-primary);">Critical loads protected</p>
<p style="margin:0;font-size:11px;color:var(--sv-text-muted);">hospital, cooling, water at full supply</p>
</div>
</div>
<div style="display:flex;align-items:flex-start;gap:10px;">
<span style="font-family:var(--sv-font-mono);font-size:12px;color:var(--sv-text-secondary);min-width:38px;">15:00</span>
<div style="display:flex;flex-direction:column;gap:1px;">
<p style="margin:0;font-size:13px;color:var(--sv-text-primary);">Next reassessment</p>
<p style="margin:0;font-size:11px;color:var(--sv-text-muted);">solar forecast + reserve check · in 28 min</p>
</div>
</div>
</div>
</div>
</div>

<button class="sv-action" onclick="sendPrompt('Model a lower-solar scenario for the Northgate microgrid: solar output drops to 58 kW while the heatwave continues. Recommend the next load-reduction step, which flexible loads to curtail first, and the updated battery endurance.')" style="width:100%;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:8px;">
<i class="ti ti-sun" aria-hidden="true" style="font-size:16px;"></i> Model lower-solar scenario · recommend next load reduction ↗
</button>
</div>`

export default mockupEnergyResilienceHtml
