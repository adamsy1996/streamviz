Create a polished interactive Agent autonomy budget simulator as a visual artifact inside an AI conversation.

This artifact represents StreamViz's `interactive` capability. Call `visualize_read_me` with type `interactive`, then produce the final artifact with `visualize_show_widget`.

The user is tuning an agent before production. Provide two useful controls: maximum tool calls per task and human-approval threshold. As either control changes, update projected completion rate, median latency, cost per task, escalation rate, and a clearly labeled risk state.

Include:

- A compact configuration header with the current operating profile.
- Two accessible range controls with visible values and useful min/max labels.
- Four live outcome metrics that update deterministically.
- A small visual frontier showing the relationship between autonomy, quality, and operational risk.
- A recommendation that changes across conservative, balanced, and autonomous settings.
- A `sendPrompt(...)` action that asks the agent to apply the selected policy.

The interaction must work entirely inside the artifact using self-contained HTML, CSS, SVG, and JavaScript. Use semantic StreamViz variables and utilities, round every displayed number, support keyboard interaction and light/dark themes, avoid external assets, and fit an approximately 760 × 520 pixel conversation artifact without nested or horizontal scrolling.
