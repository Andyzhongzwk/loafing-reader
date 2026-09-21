# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versions follow [Semantic Versioning](https://semver.org/).

## [1.3.0] - 2026-09-21

### Changed
- Restructured the repository for public development:
  - Source split into ES5-style modules under `src/` (concatenated at build time).
  - `scripts/build.js` generates the single-file userscript at
    `dist/loafing-reader.user.js` — the file users install.
  - Added Node-based smoke test (`tests/smoke.js`), a manual test page
    (`tests/test.html`), and text fixtures (`tests/fixtures/`).
- No functional changes; behavior is identical to the previous single-file
  release (verified by smoke test and code comparison).

### Known issues (planned for v2.0)
- `#lf-text` CSS has a trailing comma (`background-color: #f000,`).
- Book content injected via `innerHTML` instead of `textContent`.
- `document.onkeydown` overwrites the host page's key handler.
- Encoding must be selected manually via `prompt()`.
- Blank lines are not collapsed; `alert()` used for boundary messages.
