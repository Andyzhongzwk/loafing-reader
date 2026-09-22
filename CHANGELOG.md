# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versions follow [Semantic Versioning](https://semver.org/).

## [2.1.1] - 2026-09-22

### Fixed
- The panel auto-hid whenever the mouse left its bounds, which made dragging
  and resizing nearly impossible — the cursor is expected to leave the panel
  mid-operation. While a move/resize is active the panel no longer auto-hides.
- Auto-hide now has a 400ms grace period: briefly leaving the panel no longer
  hides it instantly; re-entering cancels the hide.

### Changed
- Moving uses an explicit grip (⠿) at the left end of the toolbar instead of
  an invisible "drag the empty toolbar area" gesture, so users can discover
  it. Move and resize now share one interaction model: hold -> drag -> release.

## [2.1.0] - 2026-09-22

"Move well / load well" release.

### Added
- Encoding auto-detection: files are read as ArrayBuffer and decoded UTF-8
  (strict) → GB18030, so GBK/GB18030 novels load without the encoding
  prompt. Manual override (自动 / UTF-8 / GB18030) in the settings popover;
  the detected encoding is shown in the info line.
- Chapter detection: headings like 第一章 / 第12回 / Chapter 5 are detected
  on load; the [章节] popover lists them with percentages and jumps on click.
- Real panel dragging: hold the empty toolbar area and move (replaces the
  v1.3 [移动] toggle button).
- Panel resizing: bottom-right handle, with a minimum size; page mode
  re-paginates after a resize.
- Panel position and size persist across sessions.

### Removed
- The [移动] toolbar button and the encoding prompt on every file load.

## [2.0.1] - 2026-09-21

### Fixed
- Font size / line height / opacity settings only took effect in scroll
  mode. Cause: page-mode line divs were created via `ce()` and carried the
  `.loafing-reader` class, whose hard-coded `font-size: 12px` overrode the
  user settings applied to `#lf-text`. Page lines are now plain divs that
  inherit from `#lf-text`, matching scroll mode. Regression check added.

## [2.0.0] - 2026-09-21

"Read well" release — reading quality, navigation, and correctness.
Design doc: docs/v2.0-design.md.

### Added
- Settings popover ([设置]): font size (12–24px), line height (1.2–2.0),
  font family (sans-serif / serif / 仿宋), text opacity, background opacity,
  reading mode (page / scroll). All persisted in a single `lf_settings` JSON
  key and applied live.
- Scroll mode: continuous scrolling with a draggable progress bar; bookmark
  syncs from scroll position (debounced persistence).
- Keyboard navigation scoped to the visible panel: `→`/`Space` next,
  `←` previous, `↑`/`↓` scroll (scroll mode), `[`/`]` font size,
  `Esc` close popover / hide panel.
- Jump popover: percentage input with 开头 / 上次 / 末尾 quick actions,
  replacing the v1.3 prompt().
- Toast notifications replace all alert() calls.
- Info line now shows `《书名》 · 34.7% · 第 4213 行`.

### Fixed
- `#lf-text` CSS trailing comma that silently dropped a declaration.
- Book content injected via `textContent` instead of `innerHTML` — markup in
  novels now renders as literal text.
- `document.onkeydown` no longer clobbers the host page's key handler;
  scoped `addEventListener` is used instead.
- Panel z-index raised to 2147483647 so site chrome no longer covers it.
- Consecutive blank lines collapsed to one.
- Files over 5 MB skip content persistence (with a toast warning).

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
