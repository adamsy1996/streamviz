Create a polished interactive long-term investment calculator as a visual artifact inside an AI conversation.

This artifact represents StreamViz's `interactive` capability. Call `visualize_read_me` with type `interactive`, then produce the final artifact with `visualize_show_widget`.

Build a genuinely script-driven calculator that helps someone explore how recurring contributions, compounding, fees, and inflation interact over time. Start with sensible illustrative defaults: $25,000 initial investment, $750 monthly contribution, 25-year horizon, 7% expected annual return, 0.6% annual fee, and 2.5% annual inflation.

Include accessible controls for initial investment, monthly contribution, years, expected annual return, annual fee, and inflation. Use range sliders where appropriate and keep their current values visibly synchronized. Recalculate immediately when any input changes.

Show four decision-useful outputs: total contributions, projected nominal value after fees, projected value in today's purchasing power, and estimated fee drag compared with an otherwise identical zero-fee scenario. Add a compact inline SVG growth chart comparing contributed principal, the after-fee portfolio, and the zero-fee portfolio across the selected horizon. Update the chart and labels through local JavaScript without network requests.

Keep the composition compact and editorial rather than looking like a trading terminal. Clearly label all results as an illustrative scenario based on constant assumptions, not a forecast or investment advice. Use semantic StreamViz utilities and variables, support light and dark themes, honor `prefers-reduced-motion`, and remain usable inside an approximately 760 × 520 pixel conversation artifact without horizontal scrolling. Use no gradients, glow, blur, drop shadows, or external assets.
