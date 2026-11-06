# Synchronization indicator review

Scope: one captured state, 400% awaiting pilot confirmation. No implementation changes.

1. 400% confirmation: readable value and clear confirmation action; visual hierarchy needs refinement. Evidence: qa-sync-design-review.png.

The ring's layered blur and white inner highlight give it a rounded neon-tube appearance. This conflicts with the surrounding flat grid, warning stripes and technical labels. The narrow seven-segment digits, proportionally heavy percent mark and small, bold Matisse caption feel separately designed. The large empty ring interior amplifies that separation.

Recommended direction: a flat calibrated instrument ring. Remove the broad glow and white bevel, reduce diameter roughly 10%, add a quiet outer scale with sparse major ticks and four fixed index marks. Keep a restrained blue progress arc, changing the active arc to red at 400% without flashing. Do not change the permanently blue side rails.

Typography: keep Matisse EB for the fixed Traditional Chinese label 同步率, move it above the number and increase it modestly to 20–22px. Optionally add a small neutral monospaced SYNCHRO RATE line to connect the label to the readout. Retain the user's requested seven-segment number, modestly enlarge to 72–80px and increase segment weight. Make the percent sign 35–40% of digit height, add 8–10px spacing and align its bottom to the digits. Center the complete group optically inside the ring.

Alternative: a segmented ring with 24 rectangular arc segments. Stronger discrete instrumentation feel, but visually busier than a fine calibrated dial. A horizontal bar would require a broader composition change and is not the first recommendation.

Accessibility limits: this review covers one static screenshot, not assistive technology, keyboard operation or full contrast compliance. The red threshold should remain redundantly expressed by the numeric 400% value; avoid relying on hue or flashing alone. Keep captions legible rather than fading them further.
