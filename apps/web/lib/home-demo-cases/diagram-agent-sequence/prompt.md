Create a polished, accessible Agent conversation system sequence diagram as a visual artifact inside an AI conversation.

This artifact represents StreamViz's `diagram` capability. Call `visualize_read_me` with type `diagram`, then produce the final artifact with `visualize_show_widget`.

Show this complete streaming path from left to right:

- User sends a request in the Chat UI.
- Agent Runtime sends an OpenAI-compatible streaming request to the LLM.
- The LLM emits tokens and a `visualize_show_widget` function call.
- Agent Runtime resolves the tool through the Tool Registry.
- StreamViz receives accumulating `widget_code`, recovers useful partial HTML, and renders it inside an isolated iframe.
- The live artifact appears back inside the same conversation before generation is complete.

Use an English sequence diagram with clear participants, vertical lifelines, concise message labels, and a small legend for interface, runtime, model, tool, and rendering roles. Emphasize the boundary where raw SSE becomes parsed metadata and streamed HTML. Make the progression readable at a glance, not dense documentation.

Use only self-contained HTML, CSS, and inline SVG with no external assets or network requests. Use semantic StreamViz variables and diagram classes, support light and dark themes, include an accessible SVG title and description, and fit an approximately 760 × 520 pixel conversation artifact without horizontal scrolling.
