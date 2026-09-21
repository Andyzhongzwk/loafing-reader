// Smoke test: executes the built userscript in Node against a minimal DOM/GM
// stub and asserts the panel is constructed and basic flows work.
// This is a sanity check, not a full browser test — e2e tests live in tests/e2e/.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const script = fs.readFileSync(
    path.join(__dirname, '..', 'dist', 'loafing-reader.user.js'), 'utf8');

// Test-only instrumentation: expose IIFE internals so the assertions below
// can drive the reader directly. Done by string injection — the shipped
// bundle itself is untouched.
const instrumented = script.replace(
    '\n})();',
    '\nwindow.__lf_test = { loadFile, fileInfo, jump, next, previous, elements };\n})();'
);
if (instrumented === script) throw new Error('instrumentation failed: IIFE tail not found');

// ---- Minimal DOM stub -------------------------------------------------------
function makeElement(tag) {
    const el = {
        tagName: tag,
        children: [],
        style: {},
        attrs: {},
        listeners: {},
        // Simulated layout: each child contributes 10px; tests may override
        // with _oh to model a taller container (the pagination engine loops
        // until text height reaches content height).
        _oh: undefined,
        get offsetHeight() {
            return this._oh !== undefined ? this._oh : this.children.length * 10;
        },
        setAttribute(k, v) { this.attrs[k] = v; },
        getAttribute(k) { return this.attrs[k]; },
        appendChild(c) { this.children.push(c); return c; },
        insertBefore(c, ref) {
            const i = ref ? this.children.indexOf(ref) : this.children.length;
            this.children.splice(i < 0 ? this.children.length : i, 0, c);
            return c;
        },
        remove() {
            const walk = (node) => {
                const i = node.children.indexOf(this);
                if (i >= 0) { node.children.splice(i, 1); return true; }
                return node.children.some(walk);
            };
            walk(document.documentElement);
        },
        addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
        fire(type, event = {}) {
            (this.listeners[type] || []).forEach(fn => fn(event));
        },
        click() { this.fire('click', { button: 0 }); },
    };
    return el;
}

const storage = {};
const document = {
    documentElement: makeElement('html'),
    createElement: makeElement,
    onkeydown: null,
};
const sandbox = {
    document,
    window: {},
    console,
    alert: () => {},
    prompt: () => null,
    GM_addStyle: () => {},
    GM_setValue: (k, v) => { storage[k] = v; },
    GM_getValue: (k, d) => (k in storage ? storage[k] : d),
};
sandbox.window.event = null;
vm.createContext(sandbox);

// ---- Run --------------------------------------------------------------------
vm.runInContext(instrumented, sandbox);
const lf = sandbox.window.__lf_test;

const results = [];
const check = (name, cond) => {
    results.push([name, !!cond]);
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
};

// Panel and trigger must be attached to <html>.
const attached = document.documentElement.children;
check('panel attached to document', attached.some(e => e.attrs.id === 'lf-panel'));
check('trigger attached to document', attached.some(e => e.attrs.id === 'lf-trigger'));

// Panel starts hidden.
const panel = attached.find(e => e.attrs.id === 'lf-panel');
check('panel starts hidden', panel.style.visibility === 'hidden');

// Alt+R handler registered on document.
check('keydown handler registered', typeof document.onkeydown === 'function');

// Wake up via the global keydown handler.
document.onkeydown({ altKey: true, key: 'r' });
check('Alt+R wakes the panel', panel.style.visibility === 'visible');

// Give the content area a simulated height so pagination produces 3-line pages.
const content = panel.children.find(e => e.attrs.id === 'lf-content');
content._oh = 30;

// Simulate loading a file: 500 lines.
const lines = Array.from({ length: 500 }, (_, i) => `line ${i + 1}`).join('\n');
lf.loadFile('test.txt', lines);
check('content split into 500 lines', lf.fileInfo.length === 500);
check('bookmark persisted', storage['lf_bookmark'] === 0);
check('file persisted', storage['lf_file_name'] === 'test.txt');

// next() must advance or report last page without throwing.
lf.next();
check('next() updates bookmark', lf.fileInfo.bookmark > 0);

// previous() must return toward the start.
const mark = lf.fileInfo.bookmark;
lf.previous();
check('previous() moves back', lf.fileInfo.bookmark < mark);

// jump() to an arbitrary index.
lf.jump(100);
check('jump(100) sets bookmark', lf.fileInfo.bookmark === 100);

// ---- Summary ----------------------------------------------------------------
const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
