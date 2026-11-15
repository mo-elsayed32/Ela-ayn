# P1 — Keyboard accessibility

## Implemented
- Converted the homepage work cards and poem-to-poem navigation cards from clickable `div` elements into native links.
- Added a keyboard-accessible skip link and a consistent, restrained `:focus-visible` indicator.
- Added semantic main landmarks to the SPA page containers.
- Converted the flash close control and expandable flash content to native buttons; added accessible names to icon-only controls.
- Added pressed-state semantics to the contact-method selector.
- Converted generated envelopes and saved-envelope items into buttons, including keyboard access to the saved-envelope pocket.
- Made the discovery overlay expose dialog semantics while open, support Escape and Tab focus containment, focus its close/action controls appropriately, and restore focus on close.
- Kept hidden discovery content out of the accessibility tree and out of the tab sequence.

## Content protection
- No existing visible copy, poem text, work titles, or page text was rewritten, shortened, removed, or paraphrased.
- Protected title occurrence counts in `index.html` remain unchanged:
  - “تلك قضية”: 5
  - “لا حياء لمن تنادي”: 5
  - “مولود في الطين”: 10
- No image assets or poem data were modified.

## Verification
- JavaScript syntax check passed with Node.js `--check`.
- HTML parsing confirmed all three work cards and all three next-work cards are anchors, with no nested anchors.
- This pass includes static code verification; full keyboard testing in a live browser/device remains advisable before deployment.
