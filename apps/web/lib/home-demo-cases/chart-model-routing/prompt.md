Create a polished model-routing performance chart as a visual artifact inside an AI agent conversation.

This artifact represents StreamViz's `chart` capability. Call `visualize_read_me` with type `chart`, then produce the final artifact with `visualize_show_widget`.

Scenario: an AI platform is deciding how to route production tasks across three model tiers during a seven-day launch. Visualize a credible dataset for Swift, Balanced, and Reasoning routes. The central story is that dynamic routing lowers median cost while preserving task success and improving P95 latency.

Include:

- Three compact headline metrics: task success, P95 latency, and cost per 1,000 tasks, each with a comparison to the static-routing baseline.
- A primary seven-day multi-series line chart for P95 latency across the three routes.
- A compact cost-versus-success view that makes the routing trade-off immediately understandable.
- A concise legend with exact current values and distinct non-color cues.
- One sentence-sized insight and a `sendPrompt(...)` action to inspect the routing policy.

Keep the visualization focused and editorial rather than a generic dashboard grid. Use inline SVG instead of external chart libraries so it is useful while streaming. Use StreamViz chart-series variables, semantic status variables, accessible titles/descriptions, readable labels, light/dark compatibility, and no external assets. Fit an approximately 760 × 520 pixel conversation artifact without horizontal scrolling.
