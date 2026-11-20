New Premium Section Templates (Agent Build Prompt)

Our website is template-based (each section of the page is a separate reusable template/component). Your task is to design and build a new premium template for every section, replacing the current visual styling while keeping all existing data bindings, props, content fields, forms, and logic intact — you are only swapping the template layer, not the data layer.

Follow the brand system below for every template. Then go section by section and rebuild each one to this standard.

Brand System (apply to all templates)

Colors

Near-Black / Charcoal 
#141210 — headers, nav, primary text, footer bg
Warm Off-White / Paper 
#F4F1EA — page/light section backgrounds
Muted Brass 
#A98F5C — accents, hover states, dividers only (never large fills)
Warm Taupe 
#7A6A57 — secondary text, borders, icon strokes
Stone Gray 
#B8B3AA — captions, muted labels
Smoke Gray 
#5C5852 — body copy on light backgrounds

Typography

Headings: confident serif or high-contrast sans, large scale, tight line-height.
Labels / nav / eyebrows / captions: monospace or uppercase sans, wide tracking (0.08–0.15em), small size.
Body: quiet, readable sans or serif. Max 2 type families total.

Shape & Surface Language

Flat edges, thin 1px hairline borders, no drop shadows, minimal border-radius.
No bright colors, no gradients other than a dark image-overlay gradient for hero/CTA text legibility.
Motion limited to subtle fades/slides on scroll and a gentle darken-on-hover for image tiles.
Templates to Rebuild

For each template below, produce the new premium version, preserving every existing dynamic field/prop it currently renders.

1. Header / Navigation Template
Logo left, uppercase tracked-out nav links center or right, utility icons far right.
Thin 1px bottom hairline border, no shadow, sticky on scroll.
Mobile: collapses to a minimal full-screen menu, same type treatment.
2. Hero Template
Full-bleed background image/video with a dark bottom gradient overlay.
Small monospace eyebrow label, large heading, one short supporting line, one primary CTA (outlined or solid brass/charcoal — no default bright button).
Keep existing hero fields (title, subtitle, CTA link, background media) mapped to the new layout.
3. Service Cards / Flat-Lay Grid Template
Replace boxed shadow-cards with a flat image-tile grid: image fills tile, uppercase label + one-line description overlaid or directly beneath, thin dividers between tiles, "View more →" style link.
Preserve existing service data (icon/image, title, description, link) — just re-skin the presentation.
4. About / Story Template
Two-column editorial layout: image left or right, generous whitespace, serif heading, quiet body copy, no icon clutter.
5. Process / Timeline Template
Numbered or lettered steps set as monospace labels with a thin connecting line, minimal iconography (single-color line icons only, taupe/brass stroke).
6. Trust / Stats Template
Large serif numerals, monospace uppercase labels underneath, separated by hairline dividers — no colored icon-boxes.
7. Testimonials / Reviews Template
Quiet quote-style layout: large opening quotation mark or thin rule, serif/italic quote text, monospace attribution line beneath. Carousel controls minimal (thin arrows, no bright buttons).
8. Pricing / Quote Request Form Template
Keep all existing form fields, validation, and submission logic unchanged.
Restyle inputs: flat rectangular fields, thin bottom-border or full hairline border, monospace uppercase field labels above each input, charcoal/brass submit button.
9. Gallery / Fleet Template
Same flat-lay grid treatment as Service Cards, larger imagery, optional lightbox on click with minimal chrome.
10. CTA / Newsletter Band Template
Full-width charcoal or paper section, centered monospace label + heading + single CTA, no busy background graphics.
11. Footer Template
Flat multi-column layout separated by hairline dividers, on charcoal background with paper-colored text, monospace labels, small logo mark, legal line in stone gray.
Build Rules
Do not remove or alter existing data modules, forms, database connections, APIs, or business logic — only replace the presentational template.
Every dynamic field currently rendered by a section must still be rendered by its new template (map old props/fields into the new layout).
Keep templates consistent with each other — same spacing scale, same type scale, same color tokens — so the site reads as one system, not mismatched pages.
Confirm responsive behavior (desktop, laptop, tablet, mobile) for every rebuilt template before moving to the next.
If a section has functionality not described above (e.g. a live tracking widget, a calculator), keep its logic untouched and only restyle its container/inputs/buttons to match this system.

Deliverable: each section template rebuilt in place, visually unified under the palette and typography system above, with zero functional regressions.