// Build script: concatenates the src/ modules into a single self-contained
// userscript at dist/loafing-reader.user.js.
//
// Modules share one IIFE scope, so plain function declarations and top-level
// const/let work across files without any import/export machinery. The order
// below is the execution order — keep top-level side-effect modules after
// their dependencies.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { version } = require(path.join(ROOT, 'package.json'));

const HEADER = `// ==UserScript==
// @name         摸鱼小说阅读器 Loafing-Reader
// @namespace    hanayabuki-loafing-reader
// @version      ${version}
// @description  内嵌浏览器里用来上班摸鱼看小说
// @author       HanaYabuki
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @noframes
// ==/UserScript==
// This file is generated from src/ by scripts/build.js — do not edit directly.
`;

// Concatenation order = execution order. Top-level side effects (DOM building,
// listener registration) must come after the modules they depend on.
const MODULES = [
    'src/style.css.js',
    'src/storage.js',
    'src/ui/dom.js',
    'src/ui/toast.js',
    'src/reader/state.js',
    'src/reader/render.js',
    'src/reader/scroll.js',
    'src/ui/panel.js',
    'src/ui/theme.js',
    'src/ui/settings.js',
    'src/reader/encoding.js',
    'src/reader/file.js',
    'src/reader/chapters.js',
    'src/reader/jump-button.js',
    'src/ui/window.js',
    'src/lifecycle.js',
];

const parts = [HEADER, '(function () {'];
for (const mod of MODULES) {
    const code = fs.readFileSync(path.join(ROOT, mod), 'utf8').trimEnd();
    parts.push(`\n/* ===== ${mod} ===== */\n${code}`);
}
parts.push('\n})();\n');

const out = parts.join('\n');
const outPath = path.join(ROOT, 'dist', 'loafing-reader.user.js');
fs.writeFileSync(outPath, out);
console.log(`built dist/loafing-reader.user.js (v${version}, ${out.length} bytes, ${MODULES.length} modules)`);
