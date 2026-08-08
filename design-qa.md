# StreamViz homepage pipeline design QA

- Source visual truth: `/var/folders/bz/4zm15yqd7wzd03235lxhg5340000gn/T/codex-clipboard-fb4cb690-0fa9-4aeb-9039-25005a800cd7.png`
- Implementation screenshot: `/tmp/streamviz-home-pipeline-desktop.png`
- Mobile screenshot: `/tmp/streamviz-home-pipeline-mobile.png`
- Combined comparison: `/tmp/streamviz-home-pipeline-comparison.png`
- Desktop viewport: 2062 × 1051 CSS px at device scale factor 1
- Source pixels: 5038 × 1570; normalized to 2062 px wide for comparison
- Implementation pixels: 2062 × 1051
- Mobile viewport and pixels: 390 × 844 at device scale factor 1
- State: dark theme, active streaming cycle; mobile Chat tab and Parsed-tab interaction checked

## Full-view comparison evidence

The original screenshot and the implementation were placed in one vertically stacked comparison image. The implementation preserves the single three-stage workbench while changing the columns from equal width to task-weighted tracks. Each stage now shares a stage header, a fixed summary band, and a fill-height workspace. The third stage is an Astryx conversation containing the user prompt, assistant response, tool-call status, and the live StreamViz iframe artifact.

## Focused-region evidence

The pipeline region was inspected at desktop size during both complete and streaming states. The mobile region was inspected separately because the selected desktop source does not define a mobile state. Tabs were exercised by switching from Chat to Parsed and verifying the live parser content. No separate typography crop was needed because all labels, summary values, code, chat copy, and artifact controls were readable in the full-width desktop capture.

## Findings

- Fonts and typography: passed. Astryx semantic text and code styles establish a readable hierarchy; labels, stage titles, chat copy, and code remain distinct without custom font overrides.
- Spacing and layout rhythm: passed. The 32/23/45-style track weighting gives the artifact the largest area, summary bands align, and code/chat regions fill the common frame instead of growing independently.
- Colors and visual tokens: passed. Borders, spacing, status colors, and muted surfaces use Astryx StyleX tokens and remain consistent with the existing dark theme.
- Image and artifact fidelity: passed. The original StreamViz SVG artifact is preserved and rendered through the package iframe; it is not replaced with a host-side approximation.
- Copy and content: passed. Stage names now describe the actual transport, parsing, and user-facing chat surfaces. The right stage explicitly explains that the artifact belongs to an assistant message.
- Responsiveness: passed. At 390 px, the workbench becomes Stream / Parsed / Chat tabs instead of three stacked long panels; the primary stage switch is keyboard-addressable through Astryx TabList.
- Accessibility: no screenshot-visible blocker. ChatMessageList exposes a live log, streaming state is announced, and the artifact retains its accessible SVG title and description. Full screen-reader and reduced-motion behavior remains a runtime test gap.
- Console: no warnings or errors were recorded in the final browser pass.

## Comparison history

1. Initial implementation: the parser summary's second value touched the code region at the desktop viewport. Classified P2 because it weakened the shared vertical rhythm.
2. Fix: increased the shared summary band using the Astryx spacing token scale. Post-fix captures show the title and loading message fully visible while all three workspaces begin on the same baseline.
3. Responsive check: the three-column frame would otherwise become a long vertical stack. Added Astryx tabs and verified the Parsed interaction at 390 × 844.

## Follow-up polish

- P3: A future pass could shorten the tool-call target label further at narrow widths, but it does not block reading or interaction.

## Final result

final result: passed
