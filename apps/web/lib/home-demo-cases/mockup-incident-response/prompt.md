Create a polished, responsive live incident response dashboard as a visual artifact inside an AI agent conversation.

Scenario: checkout latency regressed immediately after a production deploy in us-east-1. The agent has correlated the deploy, identified the impacted service path, shifted traffic to a healthy replica, and is monitoring recovery.

The artifact should feel like a compact production operations surface rather than a generic card grid. Include:

- A clear incident header with incident ID, severity, region, elapsed time, and current mitigation state.
- A visual service-impact topology from client entry points through Checkout API to Payment DB, clearly distinguishing healthy and impacted nodes.
- Three or four high-signal metrics such as P95 latency, error rate, recovered traffic, and affected sessions.
- A short chronological agent-response timeline showing detection, correlation, mitigation, and monitoring.
- One concise follow-up action that calls `sendPrompt(...)` to draft a stakeholder update.

Use semantic StreamViz utility variables where possible. Use only self-contained HTML, CSS, and inline SVG with no external assets or network requests. Keep it readable inside an approximately 760 × 520 pixel conversation artifact, responsive on narrow screens, accessible, and visually polished in both light and dark themes.
