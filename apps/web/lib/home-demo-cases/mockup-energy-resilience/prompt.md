Create a polished, responsive neighborhood energy resilience command center as a visual artifact inside an AI conversation.

This artifact represents StreamViz's `mockup` capability. Call `visualize_read_me` with type `mockup`, then produce the final artifact with `visualize_show_widget`.

Scenario: a severe heatwave has triggered a regional grid outage. A neighborhood microgrid has islanded successfully and must allocate limited solar generation and battery reserves across a community hospital, two cooling centers, a water pumping station, and residential blocks until utility power returns. The current plan protects critical services while reducing flexible residential demand.

The artifact should feel like a compact public-infrastructure operations surface, not a generic metric-card dashboard. Include:

- A clear resilience header showing islanded status, local time, outside temperature, estimated grid restoration, and current operating posture.
- A visual live energy-flow topology connecting solar generation and battery storage to the hospital, cooling centers, water station, and residential demand. Make protected, constrained, and flexible loads visually distinct.
- Three or four high-signal measures: available generation, current demand, battery reserve with estimated endurance, and residents served.
- A concise priority allocation list showing that the hospital, cooling centers, and water station are protected while residential demand response is active.
- A short operational timeline covering grid loss, islanding, critical-load protection, and the next reassessment.
- One useful follow-up action that calls `sendPrompt(...)` to model a lower-solar scenario and recommend the next load reduction.

Use semantic StreamViz utility variables where possible. Use only self-contained HTML, CSS, and inline SVG with no external assets or network requests. Keep it readable inside an approximately 760 × 520 pixel conversation artifact, responsive on narrow screens, accessible, and visually polished in both light and dark themes. Use no gradients, glow, blur, or decorative noise.
