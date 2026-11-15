# P0 — Functional and accessibility fixes

## Implemented

1. Added hash-based page routing (`#/home`, `#/poem-teen`, `#/poem-lahyaa`, `#/poem-qadiya`). Individual poem pages can now be opened directly and browser Back/Forward follows in-site navigation.
2. Hardened page transitions against rapid repeated navigation and invalid page names.
3. Fixed the contact success overlay so manually closing it restores form interaction immediately; the submit button is disabled only while the request is in flight to reduce duplicate submissions.
4. Added keyboard activation and visible focus treatment for poem cards and next-poem cards.
5. Changed generated navigation controls to semantic buttons/links and added real `href` targets for section navigation and footer home links.

## Validation

- `node --check app.js` — passed.
- `node --check poems-data.js` — passed.
- HTML structure spot-check — found all four expected page sections, three keyboard-operable station cards, three keyboard-operable next-poem cards, three footer home links, and the contact form.
- A full browser interaction test could not be completed in this environment because local browser navigation is blocked by the execution environment. Formspree delivery has not been tested; no real message was sent.


## P0 follow-up — image delivery and scroll restoration

- Extracted the seven embedded raster images into the `assets/` directory and converted them to WebP.
- Replaced base64 image payloads in `index.html` with external asset paths; this reduces the HTML document from about 1.67 MB to about 37 KB.
- The three poem-cover paintings now load only when their corresponding poem page is opened.
- The profile image uses lazy loading and asynchronous decoding.
- Added per-history-entry scroll position saving and restoration for browser Back/Forward, including returning to the homepage at the poem card's previous position.
- Tested SPA navigation and scroll restoration in a headless browser; tested JavaScript syntax.
