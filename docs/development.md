# Development Guide

## Repository layout

```
src/                  Source modules (the code you edit)
  style.css.js        Injected stylesheet
  ui/                 Panel DOM, theme, window dragging
  reader/             File loading, pagination, jump
  lifecycle.js        Wake/sleep, events, init
dist/
  loafing-reader.user.js   BUILD OUTPUT — install this in Tampermonkey
scripts/build.js      Concatenates src/ into the single-file userscript
tests/
  smoke.js            Node smoke test (no browser needed)
  test.html           Manual browser test page with hostile elements
  fixtures/           Sample .txt files (utf8 / gbk / empty-lines / html-chars / big)
docs/                 Design documents
```

## Build

```bash
npm run build
```

There is no bundler and no dependencies: `scripts/build.js` reads the modules
in a fixed order, wraps them in one IIFE, and writes `dist/`. Module order in
`scripts/build.js` is the execution order — modules with top-level side
effects (DOM building, listener registration) must come after their
dependencies.

## Test

```bash
npm test          # Node smoke test: builds nothing, tests dist/ — run build first
```

The smoke test runs the built userscript in a `vm` context against a minimal
DOM stub and checks panel construction, wake/sleep, loading, paging, jumping,
and persistence. It is a sanity net, not a browser replacement.

For real verification you still need a browser:

1. Build, then open `dist/loafing-reader.user.js`, copy the whole file.
2. Tampermonkey dashboard → Loafing Reader → paste → `Ctrl+S` save.
   (No reinstall needed; saving updates the script. Then refresh the target page.)
3. Open `tests/test.html` in the browser. For `file://` pages, enable
   Tampermonkey's "Allow access to file URLs" first.
4. Walk the checklist printed on the test page.

## Debugging tips

- `console.log` output appears in the page's DevTools console; the script logs
  `loafing-reader loaded.` on first wake.
- Tampermonkey dashboard → script → "Values" tab shows persisted keys
  (`lf_file_name`, `lf_file_content`, `lf_bookmark`); you can edit or delete
  them to reset state without reinstalling.
- Quick state reset from the console:
  `GM_setValue('lf_bookmark', 0)` (or clear keys in the Values tab).

## Releasing

1. Bump `version` in `package.json` (the build injects it into the userscript
   header) and add a `CHANGELOG.md` entry.
2. `npm run build && npm test`.
3. Commit; the `dist/` file is tracked so users can copy it directly from the
   repo or GreasyFork.
