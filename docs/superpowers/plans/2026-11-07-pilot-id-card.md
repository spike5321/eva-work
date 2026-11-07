# Driver identity credential implementation

User approved the preceding recommendation with “你改吧”. Implement a compact landscape credential in the existing 400% confirmation band. Photo on the left, Matisse name, English name, unit, ID and static pending-authentication status on the right. Pale blue-white background, thin blue border, quiet barcode and existing motto-free NERV watermark. Centre credential under the sync ring; retain heading left and confirmation action right.

- Reuse the supplied reference image unchanged as a local asset; crop its portrait using a native SVG viewport, without redrawing the character or baking UI text into a bitmap.
- Add `PilotIdentityCard.jsx` and its scoped CSS; replace the current name-only `.console-pilot` content. Desktop credential approximately 320×112px, portrait 64×84px. Keep the existing narrow-screen hidden-identity behavior and sequence timings.
- Use equal-width desktop side columns so the centre aligns to the viewport. Preserve the 168px confirmation band (150px for short viewports), heading treatment and action semantics.
- Inspect 1440×900, 1280×720, 1920×1080 and a short desktop viewport. Verify the image loads, card/control bounds do not overlap, focus/Enter confirmation still reaches the workbench, and replay works. Run build, Sites tests and font coverage.
- Do not add implementation-mirroring unit tests for this reversible visual change. Use real browser layout/interaction checks and screenshot review. Record evidence in design-qa.md. Retain local uncommitted work.
