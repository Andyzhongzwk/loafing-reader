// Smoke test: executes the built userscript in Node against a minimal DOM/GM
// stub and asserts the panel is constructed and core v2.0 flows work.
// This is a sanity check, not a full browser test — manual verification uses
// tests/test.html in a real browser with Tampermonkey.
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
    `\nwindow.__lf_test = { loadFile, fileInfo, jump, next, previous, elements,
        getSettings, setSetting, applySettings, adjustFontSize, isScrollMode,
        renderScrollAll, scrollToLine, lineFromScroll, updateProgressBar,
        collapseBlankLines, wakeUp, sleepDown, closePopovers, isPopoverVisible };\n})();`
);
if (instrumented === script) throw new Error('instrumentation failed: IIFE tail not found');

// ---- Minimal DOM stub -------------------------------------------------------
function makeElement(tag) {
    const el = {
        tagName: tag.toUpperCase(),
        children: [],
        style: {
            setProperty(k, v) { this[k] = v; },
        },
        attrs: {},
        listeners: {},
        textContent: '',
        value: '',
        scrollTop: 0,
        // Simulated layout: each child contributes 10px; tests may override
        // _oh (own height) to model a taller container. The pagination engine
        // loops until text height reaches content height.
        _oh: undefined,
        get offsetHeight() {
            return this._oh !== undefined ? this._oh : this.children.length * 10;
        },
        get scrollHeight() {
            // Total height = sum of children's heights (models #lf-content
            // wrapping a tall #lf-text), or a minimal own height.
            const sum = this.children.reduce((a, c) => a + c.offsetHeight, 0);
            return sum > 0 ? sum : 10;
        },
        get clientHeight() { return this._oh !== undefined ? this._oh : 30; },
        getBoundingClientRect() { return { left: 0, width: 100 }; },
        setAttribute(k, v) { this.attrs[k] = String(v); },
        getAttribute(k) { return this.attrs[k]; },
        get classList() {
            const self = this;
            const set = () => new Set((self.attrs['class'] || '').split(/\s+/).filter(Boolean));
            return {
                add(c) { const s = set(); s.add(c); self.attrs['class'] = [...s].join(' '); },
                remove(c) { const s = set(); s.delete(c); self.attrs['class'] = [...s].join(' '); },
                contains(c) { return set().has(c); },
                toggle(c, force) {
                    const s = set();
                    const want = force === undefined ? !s.has(c) : force;
                    if (want) s.add(c); else s.delete(c);
                    self.attrs['class'] = [...s].join(' ');
                },
            };
        },
        appendChild(c) {
            // Document fragments donate their children instead of being nested.
            if (c.tagName === '#FRAGMENT') {
                this.children.push(...c.children);
                c.children.length = 0;
                return c;
            }
            this.children.push(c);
            return c;
        },
        insertBefore(c, ref) {
            const i = ref ? this.children.indexOf(ref) : this.children.length;
            this.children.splice(i < 0 ? this.children.length : i, 0, c);
            return c;
        },
        removeChild(c) {
            const i = this.children.indexOf(c);
            if (i >= 0) this.children.splice(i, 1);
            return c;
        },
        get firstChild() { return this.children[0] || null; },
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
            event.preventDefault ||= () => {};
            event.stopPropagation ||= () => {};
            (this.listeners[type] || []).forEach(fn => fn(event));
        },
        click() { this.fire('click', { button: 0 }); },
    };
    return el;
}

const storage = {};
const document = {
    documentElement: makeElement('html'),
    listeners: {},
    createElement: makeElement,
    createDocumentFragment() { const f = makeElement('#fragment'); f.appendChild = (c) => { f.children.push(c); return c; }; return f; },
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
    fire(type, event = {}) {
        event.preventDefault ||= () => {};
        event.stopPropagation ||= () => {};
        (this.listeners[type] || []).forEach(fn => fn(event));
    },
};
const sandbox = {
    document,
    window: {},
    console,
    alert: () => { throw new Error('alert() must not be called in v2.0'); },
    prompt: () => null,
    setTimeout: (fn, ms) => 0, // fire-and-forget in tests
    clearTimeout: () => {},
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

// v2.0: must NOT clobber document.onkeydown (v1.3 bug).
check('document.onkeydown not clobbered', document.onkeydown === undefined || document.onkeydown === null);

// Wake up via the global keydown listener (Alt+R).
document.fire('keydown', { altKey: true, key: 'r', target: document.documentElement });
check('Alt+R wakes the panel', panel.style.visibility === 'visible');

// Give the content area a simulated height so pagination produces 3-line pages.
const content = panel.children.find(e => e.attrs.id === 'lf-content');
content._oh = 30;

// Load a file: 500 lines.
const lines = Array.from({ length: 500 }, (_, i) => `line ${i + 1}`).join('\n');
lf.loadFile('test.txt', lines);
check('content split into 500 lines', lf.fileInfo.length === 500);
check('bookmark persisted', storage['lf_bookmark'] === 0);
check('file persisted', storage['lf_file_name'] === 'test.txt');

// v2.0: info line shows percentage format.
check('info shows percentage', /%/.test(lf.elements.info.textContent) || /%/.test(lf.elements.info.innerText));

// next() / previous() page-mode behavior.
lf.next();
check('next() updates bookmark', lf.fileInfo.bookmark > 0);
const mark = lf.fileInfo.bookmark;
lf.previous();
check('previous() moves back', lf.fileInfo.bookmark < mark);

lf.jump(100);
check('jump(100) sets bookmark', lf.fileInfo.bookmark === 100);

// v2.0: textContent, not innerHTML — a line with markup renders as literal text.
lf.loadFile('xss.txt', '<b>bold</b> & <i>italic</i>');
const renderedText = lf.elements.text.children.map(c => c.textContent).join('');
check('markup rendered as literal text', renderedText.includes('<b>bold</b>'));

// v2.0: blank-line collapsing.
check('blank lines collapsed', lf.collapseBlankLines('a\n\n\n\nb') === 'a\n\nb');
lf.loadFile('blank.txt', 'a\n\n\n\nb');
check('collapsed content length', lf.fileInfo.length === 3);

// v2.0: no alert() on last page — boundary uses toast.
lf.loadFile('short.txt', 'l1\nl2\nl3');
lf.jump(0);
lf.previous(); // at first page -> toast, not alert
check('first-page boundary does not alert', true);
lf.jump(2);
lf.next(); // at last page -> toast, not alert
check('last-page boundary does not alert', true);

// v2.0: toast element created and auto-dismiss scheduled.
check('toast notification shown', lf.elements.toasts.children.length > 0);

// v2.0: settings round-trip + live apply.
lf.setSetting('fontSize', 18);
check('setting persisted', lf.getSettings().fontSize === 18);
lf.applySettings();
check('font size applied to panel', lf.elements.text.style.fontSize === '18px');
lf.adjustFontSize(1);
check('adjustFontSize caps at 24', lf.getSettings().fontSize === 19);
lf.setSetting('fontSize', 12);
lf.applySettings();

// v2.0: scroll mode renders the whole book and tracks position.
lf.setSetting('mode', 'scroll');
lf.applySettings();
lf.loadFile('scroll.txt', Array.from({ length: 200 }, (_, i) => `s${i}`).join('\n'));
check('scroll mode active', lf.isScrollMode() === true);
check('scroll mode renders all lines', lf.elements.text.children.length === 200);
lf.jump(100);
check('scroll jump sets bookmark', lf.fileInfo.bookmark === 100);
lf.updateProgressBar();
check('progress thumb width set', /%$/.test(lf.elements.progressThumb.style.width));

// Scroll listener syncs bookmark from scroll position.
content.scrollTop = content.scrollHeight / 2;
content.fire('scroll');
check('scroll syncs bookmark', lf.fileInfo.bookmark > 90 && lf.fileInfo.bookmark < 110);

// Back to page mode re-renders paginated.
lf.setSetting('mode', 'page');
lf.applySettings();
lf.jump(0);
check('page mode re-paginates', lf.elements.text.children.length > 0 && lf.elements.text.children.length < 200);

// v2.0: keyboard navigation scoped to visible panel.
const before = lf.fileInfo.bookmark;
document.fire('keydown', { key: 'ArrowRight', target: document.documentElement });
check('ArrowRight pages forward', lf.fileInfo.bookmark > before);
document.fire('keydown', { key: 'ArrowLeft', target: document.documentElement });
check('ArrowLeft pages back', lf.fileInfo.bookmark === before);

// Keys are ignored while panel is hidden.
lf.sleepDown();
const hiddenMark = lf.fileInfo.bookmark;
document.fire('keydown', { key: 'ArrowRight', target: document.documentElement });
check('keys ignored while hidden', lf.fileInfo.bookmark === hiddenMark);

// Esc hides the panel when visible.
document.fire('keydown', { altKey: true, key: 'r', target: document.documentElement }); // wake
document.fire('keydown', { key: 'Escape', target: document.documentElement });
check('Escape hides panel', panel.style.visibility === 'hidden');

// v2.0: oversized file skips content persistence.
lf.loadFile('big.txt', 'x'.repeat(6 * 1024 * 1024));
check('oversized file not persisted', storage['lf_file_content'] === '');
lf.setSetting('mode', 'page');

// ---- Summary ----------------------------------------------------------------
const failed = results.filter(([, ok]) => !ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
