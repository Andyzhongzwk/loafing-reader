// ==UserScript==
// @name         摸鱼小说阅读器 Loafing-Reader
// @namespace    hanayabuki-loafing-reader
// @version      2.3.2
// @description  内嵌浏览器里用来上班摸鱼看小说
// @author       HanaYabuki
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @noframes
// ==/UserScript==
// This file is generated from src/ by scripts/build.js — do not edit directly.

(function () {

/* ===== src/style.css.js ===== */
// Styles injected via GM_addStyle. All colors are semi-transparent so the
// panel blends into whatever page is behind it.
const cssText = `
    :root {
        --lf-color: #222;
        --lf-toolbar-background-color: #aaa3;
        --lf-content-background-color: #fff3;
        --lf-btn-color: #00a;
        --lf-btn-color-hover: #00f;
        --lf-bg-alpha: 0.2;
    }
    [lf-theme='dark'] {
        --lf-color: #ddd;
        --lf-toolbar-background-color: #5553;
        --lf-content-background-color: #2223;
        --lf-btn-color: #aa0;
        --lf-btn-color-hover: #ff0;
    }
    .loafing-reader {
        margin: 0; padding: 0;
        box-sizing: content-box;
        font-size: 12px;
        color: var(--lf-color);
    }
    #lf-panel {
        height: 27em;
        width: 48em;
        background-color: #f000;
        top: 50%; left: 50%;
        /* Must sit above common site chrome (sticky headers, modals). */
        z-index: 2147483647;
        position: fixed;
        display: flex;
        flex-flow: column nowrap;
        user-select: none;
        backdrop-filter: blur(1px);
    }
    #lf-toolbar {
        background: var(--lf-toolbar-background-color);
        width: 100%;
        /* Dynamic height: buttons wrap to a second line when the panel is
           narrow instead of overflowing into the content area. */
        min-height: 18px;
        flex-shrink: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        overflow: hidden;
    }
    .lf-item {
        padding: 0 0 0 1em;
        white-space: nowrap;
    }
    /* The info text flexes and ellipsizes rather than pushing buttons away. */
    #lf-info {
        flex: 1 1 auto;
        min-width: 4em;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .lf-btn {
        color: var(--lf-btn-color);
        cursor: pointer;
    }
    .lf-btn:hover {
        color: var(--lf-btn-color-hover);
    }
    #lf-content {
        background-color: var(--lf-content-background-color);
        flex: 1;
        padding: 0 0.5em;
        overflow: hidden;
    }
    /* Scroll mode: the content area becomes scrollable. */
    #lf-panel[lf-mode='scroll'] #lf-content {
        overflow-y: auto;
    }
    #lf-text {
        background-color: #f000;
        position: relative;
        /* Line divs are plain (no .loafing-reader class) and inherit from
           here, so user settings on #lf-text actually reach the text. */
        color: var(--lf-color);
    }
    .lf-hidden {
        display: none;
    }
    #lf-trigger {
        position: fixed;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        background: linear-gradient(-45deg, transparent 14px, pink 0);
        z-index: 2147483647;
    }

    /* Scroll-mode progress bar */
    #lf-progress {
        height: 5px;
        background: rgba(128, 128, 128, 0.25);
        cursor: pointer;
        position: relative;
    }
    #lf-progress-thumb {
        height: 100%;
        width: 0%;
        background: var(--lf-btn-color);
    }
    #lf-panel:not([lf-mode='scroll']) #lf-progress {
        display: none;
    }

    /* Popovers (settings / jump) */
    .lf-popover {
        position: absolute;
        top: 20px;
        right: 4px;
        background: rgba(250, 250, 250, 0.97);
        color: #222;
        border: 1px solid #999;
        border-radius: 4px;
        padding: 8px 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        z-index: 2;
        user-select: none;
    }
    [lf-theme='dark'] .lf-popover {
        background: rgba(40, 40, 40, 0.97);
        color: #ddd;
        border-color: #666;
    }
    .lf-set-row {
        display: flex;
        align-items: center;
        margin: 4px 0;
        white-space: nowrap;
    }
    .lf-set-label {
        width: 4.5em;
    }
    .lf-set-value {
        width: 3em;
        text-align: right;
    }
    .lf-set-choice {
        color: var(--lf-btn-color);
        cursor: pointer;
        margin-right: 0.8em;
    }
    .lf-set-choice.active {
        color: var(--lf-btn-color-hover);
        font-weight: bold;
    }

    /* Header-hidden (mini) mode: only the text strip remains. */
    #lf-panel[lf-header='hidden'] #lf-toolbar {
        display: none;
    }

    /* Toasts */
    #lf-toasts {
        position: absolute;
        bottom: 1em;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
    }
    .lf-toast-item {
        background: rgba(0, 0, 0, 0.65);
        color: #fff;
        padding: 2px 10px;
        border-radius: 3px;
        margin-top: 4px;
    }

    /* Chapter list popover (scrollable, opened via [章节]) */
    #lf-chapter-pop {
        top: 20px;
        left: 4px;
        right: auto;
        max-height: 80%;
        overflow-y: auto;
        min-width: 14em;
    }
    .lf-chapter-item {
        cursor: pointer;
        padding: 1px 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 24em;
    }
    .lf-chapter-item:hover {
        color: var(--lf-btn-color-hover);
    }
    .lf-chapter-empty {
        color: #888;
    }

    /* Move/resize mode: highlight the panel edge so it's visible. */
    #lf-panel.lf-opmode {
        outline: 2px dashed var(--lf-btn-color);
        outline-offset: 2px;
    }
`;

// Inject the stylesheet. (v2.1 and earlier this lived in ui/theme.js.)
GM_addStyle(cssText);

/* ===== src/storage.js ===== */
// Settings storage. All user preferences live in one versioned JSON key so
// they can be migrated/reset as a unit.
const SETTINGS_KEY = 'lf_settings';

const DEFAULT_SETTINGS = {
    fontSize: 12,          // px, 12–24
    lineHeight: 1.5,       // 1.2–2.0
    fontFamily: 'sans-serif', // 'serif' | 'sans-serif' | 'fangsong'
    textOpacity: 1,        // 0.5–1
    bgOpacity: 0.2,        // 0–0.4, alpha of toolbar/content backgrounds
    mode: 'page',          // 'page' | 'scroll'
    encoding: 'auto',      // 'auto' | 'utf-8' | 'gb18030'
    showHeader: true,      // false = mini mode: toolbar hidden, text only
    visibleLines: 0,       // 0 = auto (fill container); 1–10 = fixed line count
    theme: 'light',        // 'light' | 'dark'
    panelLeft: null,       // persisted geometry (null = centered default)
    panelTop: null,
    panelWidth: null,
    panelHeight: null,
};

const FONT_FAMILIES = {
    serif: 'Georgia, "Times New Roman", "SimSun", serif',
    'sans-serif': '"Segoe UI", "Microsoft YaHei", sans-serif',
    fangsong: '"FangSong", "仿宋", "STFangsong", serif',
};

function getSettings() {
    let saved = {};
    try {
        saved = JSON.parse(GM_getValue(SETTINGS_KEY, '{}')) || {};
    } catch (e) {
        saved = {};
    }
    return Object.assign({}, DEFAULT_SETTINGS, saved);
}

function setSetting(key, value) {
    const s = getSettings();
    s[key] = value;
    GM_setValue(SETTINGS_KEY, JSON.stringify(s));
}

// Push the current settings into the live panel styles. Called on init and
// after every settings change.
function applySettings() {
    const s = getSettings();
    elements.text.style.fontSize = s.fontSize + 'px';
    elements.text.style.lineHeight = String(s.lineHeight);
    elements.text.style.fontFamily = FONT_FAMILIES[s.fontFamily] || FONT_FAMILIES['sans-serif'];
    elements.text.style.opacity = String(s.textOpacity);
    elements.panel.style.setProperty('--lf-bg-alpha', String(s.bgOpacity));
    elements.panel.setAttribute('lf-mode', s.mode);
    elements.panel.setAttribute('lf-theme', s.theme);
    elements.panel.setAttribute('lf-header', s.showHeader ? 'show' : 'hidden');

    // Fixed line count: the panel height is derived from lines × line-height
    // so the text strip is exactly as tall as the requested lines (plus the
    // toolbar in header mode). Overrides any persisted/free height.
    if (s.visibleLines > 0) {
        // Measure the real toolbar height (it grows when buttons wrap at
        // narrow widths) rather than assuming a single 18px row.
        const toolbarH = s.showHeader ? (elements.toolbar.offsetHeight || 18) : 0;
        const progressH = s.mode === 'scroll' ? 5 : 0;
        const h = Math.ceil(s.visibleLines * s.fontSize * s.lineHeight) + toolbarH + progressH;
        elements.panel.style.height = h + 'px';
        if (fileInfo && fileInfo.content && s.mode === 'page') {
            jump(fileInfo.bookmark); // re-paginate to the new height
        }
    }
}

// Keyboard shortcut helper for [ / ] font-size adjustment.
function adjustFontSize(delta) {
    const s = getSettings();
    const size = Math.min(24, Math.max(12, s.fontSize + delta));
    if (size !== s.fontSize) {
        setSetting('fontSize', size);
        applySettings();
    }
}

/* ===== src/ui/dom.js ===== */
// Element registry: every created element is stored here by id so other
// modules can reference it without querying the DOM.
const elements = {};

// Create an element, register it, and optionally attach children/classes.
// Registered under both the raw id ('settings-pop') and a camelCase alias
// ('settingsPop') so referencing modules can use whichever reads better.
function ce(tagName, id, children = [], ...clazz) {
    const tmp = document.createElement(tagName);
    tmp.setAttribute('id', 'lf-' + id);
    tmp.setAttribute('class', ['loafing-reader', ...(clazz.map(i => 'lf-' + i))].join(' '));
    children.forEach(i => tmp.appendChild(i));
    if (id !== undefined) {
        elements[id] = tmp;
        elements[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = tmp;
    }
    return tmp;
}

// Popover visibility helpers (settings / chapter panels toggle the lf-hidden class).
function setPopoverVisible(pop, visible) {
    pop.classList.toggle('lf-hidden', !visible);
}

function isPopoverVisible(pop) {
    return !pop.classList.contains('lf-hidden');
}

function closePopovers() {
    setPopoverVisible(elements.settingsPop, false);
    setPopoverVisible(elements.chapterPop, false);
}

/* ===== src/ui/toast.js ===== */
// Non-blocking toast notifications. Replaces all alert() calls — a stealth
// reader must never pop a modal dialog.
function toast(message) {
    const box = elements.toasts;
    if (!box) return;
    const item = document.createElement('div');
    item.className = 'lf-toast-item';
    item.textContent = message;
    box.appendChild(item);
    setTimeout(function () {
        item.remove();
    }, 1500);
}

/* ===== src/reader/state.js ===== */
// Shared mutable state for the currently loaded book.
const fileInfo = {};

// Remove all rendered page elements from the DOM.
function clear() {
    const ls = fileInfo.page;
    while (ls && ls.length > 0) {
        ls.pop().remove();
    }
}

/* ===== src/reader/render.js ===== */
// Pagination engine (page mode). Pages are rendered by appending line elements
// until the text area is full, then pruning from the opposite end. "direction"
// is true when moving forward (append) and false when moving backward (prepend).
function render(mark, removeNumber, direction) {
    const ls = fileInfo.page;
    for (let i = 0; i < removeNumber; ++i) {
        if (direction) {
            ls.shift().remove();
        }
        else {
            ls.pop().remove();
        }
    }

    let i = mark;
    while (i < fileInfo.length && i >= 0 && elements.text.offsetHeight < elements.content.offsetHeight) {
        const p = document.createElement('div');
        // Plain text, not innerHTML: book content must never be parsed as markup.
        // Empty lines get a non-breaking space so they still occupy height.
        p.textContent = fileInfo.content[i] === '' ? '\u00A0' : fileInfo.content[i];
        if (direction) {
            elements.text.appendChild(p);
            ls.push(p);
            i++;
        }
        else {
            elements.text.insertBefore(p, elements.text.firstChild);
            ls.unshift(p);
            i--;
            if (i < 0) {
                let t = ls.length;
                while (t < fileInfo.length && elements.text.offsetHeight < elements.content.offsetHeight) {
                    const p = document.createElement('div');
                    p.textContent = fileInfo.content[t] === '' ? '\u00A0' : fileInfo.content[t];
                    elements.text.appendChild(p);
                    ls.push(p);
                    ++t
                }
            }
        }
    }

    return direction ? mark : (i + 1);
}

// Refresh the info label and persist the current bookmark.
// Info is chapter-centric: current chapter title + progress within that
// chapter — not whole-book progress, and no book title.
function updateInfo() {
    if (!fileInfo.content) {
        elements.info.innerText = '(无文件)';
        return;
    }
    const ch = currentChapter(fileInfo.bookmark);
    if (!ch) {
        const pct = fileInfo.length > 0 ? (fileInfo.bookmark / fileInfo.length * 100) : 0;
        elements.info.innerText = `正文 · ${pct.toFixed(1)}%`;
    } else {
        const span = Math.max(1, ch.end - ch.start);
        const pct = Math.min(100, (fileInfo.bookmark - ch.start) / span * 100);
        elements.info.innerText = `${ch.title} · 本章${pct.toFixed(0)}%`;
    }

    GM_setValue('lf_bookmark', fileInfo.bookmark);
}

// Re-render starting from an absolute line index. Branches by reading mode.
function jump(index) {
    if (isScrollMode()) {
        fileInfo.bookmark = Math.max(0, Math.min(fileInfo.length - 1, index));
        renderScrollAll();
        scrollToLine(fileInfo.bookmark);
        updateProgressBar();
        updateInfo();
        return;
    }

    // Coming from scroll mode (or any stale render): the text container holds
    // lines that are not tracked in fileInfo.page — reset it before paginating.
    if (elements.text.children.length !== fileInfo.page.length) {
        while (elements.text.firstChild) {
            elements.text.removeChild(elements.text.firstChild);
        }
        fileInfo.page = [];
    }

    let i = index;

    const ls = fileInfo.page;
    render(i, ls.length, true);

    fileInfo.bookmark = index;
    fileInfo.page = ls;
    updateInfo();
}

// Advance one page forward.
function next() {
    if (isScrollMode()) {
        scrollPage(1);
        return;
    }
    const ls = fileInfo.page;
    if (fileInfo.bookmark + 1 >= fileInfo.length || ls.length === 0) {
        toast('已是最后一页');
        return;
    }

    let i = fileInfo.bookmark + fileInfo.page.length;

    const s = Math.max(ls.length - 1, 1);
    render(i, s, true);

    fileInfo.bookmark += s;
    fileInfo.page = ls;
    updateInfo();
}

// Go back one page.
function previous() {
    if (isScrollMode()) {
        scrollPage(-1);
        return;
    }
    const ls = fileInfo.page;
    if (fileInfo.bookmark === 0 || ls.length === 0) {
        toast('已经是第一页');
        return
    }

    let i = fileInfo.bookmark;
    const mk = render(i, ls.length, false);

    fileInfo.bookmark = mk;
    fileInfo.page = ls;
    updateInfo();
}

/* ===== src/reader/scroll.js ===== */
// Scroll mode: render the whole book into #lf-text, make #lf-content
// scrollable, and keep a progress bar in sync with the scroll position.
// The bookmark is derived from the scroll ratio so page mode and scroll mode
// share the same persisted position.

let scrollSaveTimer = null;

function isScrollMode() {
    return getSettings().mode === 'scroll';
}

// Render every line of the book (used in scroll mode).
function renderScrollAll() {
    clear();
    while (elements.text.firstChild) {
        elements.text.removeChild(elements.text.firstChild);
    }
    const frag = document.createDocumentFragment();
    for (let i = 0; i < fileInfo.length; i++) {
        const p = document.createElement('div');
        // Plain text, not innerHTML: book content must never be parsed as markup.
        p.textContent = fileInfo.content[i] === '' ? '\u00A0' : fileInfo.content[i];
        frag.appendChild(p);
    }
    elements.text.appendChild(frag);
    fileInfo.page = [];
}

// Scroll so that the given line index sits at the top of the view.
function scrollToLine(index) {
    const content = elements.content;
    const max = content.scrollHeight - content.clientHeight;
    const ratio = fileInfo.length > 1 ? index / (fileInfo.length - 1) : 0;
    content.scrollTop = max * ratio;
}

// Inverse of scrollToLine: current bookmark from scroll position.
function lineFromScroll() {
    const content = elements.content;
    const max = content.scrollHeight - content.clientHeight;
    if (max <= 0 || fileInfo.length <= 1) return 0;
    const ratio = content.scrollTop / max;
    return Math.round(ratio * (fileInfo.length - 1));
}

// Update the progress bar thumb from the current scroll position.
function updateProgressBar() {
    const content = elements.content;
    const max = content.scrollHeight - content.clientHeight;
    const ratio = max > 0 ? content.scrollTop / max : 0;
    elements.progressThumb.style.width = (ratio * 100) + '%';
}

// Scroll event handler: sync bookmark + progress bar, persist debounced.
function onScroll() {
    if (!isScrollMode() || !fileInfo.content) return;
    fileInfo.bookmark = lineFromScroll();
    updateProgressBar();
    updateInfo();
    if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(function () {
        GM_setValue('lf_bookmark', fileInfo.bookmark);
    }, 300);
}

// Page forward/backward by one viewport in scroll mode.
function scrollPage(direction) {
    const content = elements.content;
    const max = content.scrollHeight - content.clientHeight;
    const target = content.scrollTop + direction * content.clientHeight;
    if (target >= max && direction > 0) {
        content.scrollTop = max;
        toast('已是最后一页');
    } else if (target <= 0 && direction < 0) {
        content.scrollTop = 0;
        toast('已经是第一页');
    } else {
        content.scrollTop = target;
    }
}

// Wire the scroll listener and the draggable progress bar.
function initScrollMode() {
    elements.content.addEventListener('scroll', onScroll);

    let dragging = false;
    const seek = function (e) {
        if (!fileInfo.content || !fileInfo.length) return;
        const rect = elements.progress.getBoundingClientRect();
        if (!rect.width) return;
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const index = Math.round(ratio * (fileInfo.length - 1));
        fileInfo.bookmark = index;
        scrollToLine(index);
        updateInfo();
        GM_setValue('lf_bookmark', fileInfo.bookmark);
    };
    elements.progress.addEventListener('mousedown', function (e) {
        dragging = true;
        seek(e);
    });
    document.addEventListener('mousemove', function (e) {
        if (dragging) seek(e);
    });
    document.addEventListener('mouseup', function () {
        dragging = false;
    });
}

/* ===== src/ui/panel.js ===== */
// Build the panel DOM tree:
//   #lf-panel
//     #lf-toolbar ([移动] [缩放] [章节], info text, [设置], hidden file input)
//     #lf-content > #lf-text
//     #lf-progress > #lf-progress-thumb   (scroll mode progress bar)
//     #lf-settings-pop > #lf-settings-body   (settings popover; hosts
//                                             加载/换书 + 主题 + 编码 choices)
//     #lf-chapter-pop                         (chapter list popover)
//     #lf-toasts                              (toast notifications)
// Move/resize are MODES (Alt+M / Alt+S or the toolbar buttons), not handles.
// plus the #lf-trigger hotspot in the top-left corner.
ce('div', 'panel', [
    ce('div', 'toolbar', [
        ce('input', 'fileholder', [], 'hidden'),
        ce('span', 'move', [], 'item', 'btn'),
        ce('span', 'resize', [], 'item', 'btn'),
        ce('span', 'chapter', [], 'item', 'btn'),
        ce('span', 'info', [], 'item'),
        ce('span', 'settings', [], 'item', 'btn'),
    ],),
    ce('div', 'content', [
        ce('div', 'text', [])
    ]),
    ce('div', 'progress', [
        ce('div', 'progress-thumb', [])
    ], 'hidden'),
    ce('div', 'settings-pop', [
        ce('div', 'settings-body', [])
    ], 'popover', 'hidden'),
    ce('div', 'chapter-pop', [], 'popover', 'hidden'),
    ce('div', 'toasts', []),
]);
ce('div', 'trigger', [], 'trigger');

elements.move.innerText = '[移动]';
elements.resize.innerText = '[缩放]';
elements.chapter.innerText = '[章节]';
elements.fileholder.type = 'file';
elements.fileholder.accept = '.txt';
elements.info.innerText = '(无文件)';
elements.settings.innerText = '[设置]';

document.documentElement.appendChild(elements.panel);
document.documentElement.appendChild(elements.trigger);

/* ===== src/ui/settings.js ===== */
// Settings popover: sliders and choice buttons for reading preferences.
// All changes apply live and persist via storage.js.

// Small helper to build labeled control rows.
function settingsRow(labelText) {
    const row = document.createElement('div');
    row.className = 'lf-set-row';
    const label = document.createElement('span');
    label.className = 'lf-set-label';
    label.textContent = labelText;
    row.appendChild(label);
    elements.settingsBody.appendChild(row);
    return row;
}

function settingsSlider(labelText, key, min, max, step, format) {
    const row = settingsRow(labelText);
    const input = document.createElement('input');
    input.type = 'range';
    input.min = min; input.max = max; input.step = step;
    input.value = getSettings()[key];
    const value = document.createElement('span');
    value.className = 'lf-set-value';
    value.textContent = format(getSettings()[key]);
    input.addEventListener('input', function () {
        const v = parseFloat(input.value);
        setSetting(key, v);
        value.textContent = format(v);
        applySettings();
    });
    row.appendChild(input);
    row.appendChild(value);
}

function settingsChoice(labelText, key, options) {
    const row = settingsRow(labelText);
    const btns = [];
    options.forEach(function (opt) {
        const b = document.createElement('span');
        b.className = 'lf-set-choice';
        b.textContent = opt.label;
        if (getSettings()[key] === opt.value) b.classList.add('active');
        b.addEventListener('click', function () {
            setSetting(key, opt.value);
            btns.forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active');
            applySettings();
            if (key === 'mode') onModeChange();
        });
        btns.push(b);
        row.appendChild(b);
    });
}

// Re-render the book when switching between page and scroll mode.
function onModeChange() {
    if (!fileInfo.content) return;
    if (isScrollMode()) {
        renderScrollAll();
        scrollToLine(fileInfo.bookmark);
        updateProgressBar();
    } else {
        jump(fileInfo.bookmark);
    }
}

function buildSettingsPanel() {
    settingsSlider('字号', 'fontSize', 12, 24, 1, function (v) { return v + 'px'; });
    settingsSlider('行高', 'lineHeight', 1.2, 2.0, 0.05, function (v) { return v.toFixed(2); });
    settingsSlider('文字透明', 'textOpacity', 0.5, 1, 0.05, function (v) { return Math.round(v * 100) + '%'; });
    settingsSlider('背景透明', 'bgOpacity', 0, 0.4, 0.02, function (v) { return Math.round(v * 100) + '%'; });
    settingsChoice('字体', 'fontFamily', [
        { value: 'sans-serif', label: '无衬线' },
        { value: 'serif', label: '衬线' },
        { value: 'fangsong', label: '仿宋' },
    ]);
    settingsChoice('模式', 'mode', [
        { value: 'page', label: '翻页' },
        { value: 'scroll', label: '滚动' },
    ]);
    settingsChoice('编码', 'encoding', [
        { value: 'auto', label: '自动' },
        { value: 'utf-8', label: 'UTF-8' },
        { value: 'gb18030', label: 'GB18030' },
    ]);
    settingsSlider('行数', 'visibleLines', 0, 10, 1, function (v) { return v === 0 ? '自动' : v + '行'; });
    settingsChoice('头部', 'showHeader', [
        { value: true, label: '显示' },
        { value: false, label: '隐藏' },
    ]);
    settingsChoice('主题', 'theme', [
        { value: 'light', label: '明亮' },
        { value: 'dark', label: '暗色' },
    ]);
}

// Toggle the settings popover; close the chapter popover if open.
elements.settings.addEventListener('click', function (e) {
    e.stopPropagation();
    setPopoverVisible(elements.chapterPop, false);
    setPopoverVisible(elements.settingsPop, !isPopoverVisible(elements.settingsPop));
});
elements.settingsPop.addEventListener('click', function (e) {
    e.stopPropagation(); // keep the popover open when clicking inside
});

buildSettingsPanel();

// v2.2: file loading lives in the settings popover (toolbar stays minimal).
const loadRow = settingsRow('书籍');
const loadBtn = document.createElement('span');
loadBtn.className = 'lf-set-choice';
loadBtn.textContent = '加载 / 换书';
loadBtn.addEventListener('click', function () {
    setPopoverVisible(elements.settingsPop, false);
    elements.fileholder.click();
});
loadRow.appendChild(loadBtn);

/* ===== src/reader/encoding.js ===== */
// Encoding detection and decoding. Files are read as ArrayBuffer and decoded
// in a strict order: UTF-8 first (any invalid byte fails), then GB18030
// (superset of GBK, covers the vast majority of Chinese novels).
// TextDecoder is available in all modern browsers.

// Returns { text, encoding } — encoding is what actually decoded successfully.
function decodeText(buffer, preferred) {
    const encodings = preferred ? [preferred] : ['utf-8', 'gb18030'];
    for (const enc of encodings) {
        try {
            const text = new TextDecoder(enc, { fatal: true }).decode(buffer);
            return { text, encoding: enc };
        } catch (e) {
            // Invalid byte sequence for this encoding — try the next one.
        }
    }
    // Nothing decoded strictly. Fall back to GB18030 with replacement chars
    // so the user at least sees content (and can switch encoding manually).
    return {
        text: new TextDecoder('gb18030').decode(buffer),
        encoding: 'gb18030',
    };
}

// Manual override cycle shown in the settings popover / toolbar hint.
const ENCODING_OPTIONS = ['auto', 'utf-8', 'gb18030'];
const ENCODING_LABELS = { auto: '自动', 'utf-8': 'UTF-8', gb18030: 'GB18030' };

function currentEncodingPreference() {
    const enc = getSettings().encoding;
    return enc === 'auto' ? null : enc;
}

/* ===== src/reader/file.js ===== */
// File loading. The file is read as an ArrayBuffer and decoded with automatic
// encoding detection (see encoding.js), so most users never see an encoding
// prompt. The decoded text is persisted via GM_setValue so the book survives
// page reloads; files above the size cap are kept in memory only.

const SIZE_CAP = 5 * 1024 * 1024; // bytes

// Collapse runs of consecutive blank lines into a single blank line.
function collapseBlankLines(content) {
    return content.replace(/(\r?\n)[ \t]*(\r?\n)+/g, '$1$1');
}

function loadFile(filename, content) {
    clear();
    fileInfo.fileName = filename.substring(0, filename.lastIndexOf('.'));

    fileInfo.content = collapseBlankLines(content).split(/(?:\r\n|\n)/);
    fileInfo.length = fileInfo.content.length;
    fileInfo.bookmark = 0;
    fileInfo.page = [];
    fileInfo.chapters = detectChapters(fileInfo.content);

    GM_setValue('lf_file_name', filename);
    if (content.length <= SIZE_CAP) {
        GM_setValue('lf_file_content', content);
    } else {
        GM_setValue('lf_file_content', '');
        toast('文件较大，已跳过持久化存储');
    }
    GM_setValue('lf_bookmark', 0);

    jump(0);
}

// v2.1: read as ArrayBuffer + auto-detect encoding. A manual override can be
// chosen in the settings popover (encoding row) — the load button no longer
// prompts on every file.
elements.fileholder.addEventListener('change', function (e) {
    const file = elements.fileholder.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
        const result = decodeText(this.result, currentEncodingPreference());
        loadFile(file.name, result.text);
        fileInfo.encoding = result.encoding;
        updateInfo();
    }
});
// Loading is triggered from the settings popover (see ui/settings.js), which
// calls elements.fileholder.click() directly.

/* ===== src/reader/chapters.js ===== */
// Chapter detection. Scans the loaded book for common Chinese/English
// chapter headings and builds a quick-jump list:
//   第一章 / 第12章 / 第百二十回 / 卷三 / Chapter 5 / ch.7
// Chapter positions are recomputed on every loadFile.

const CHAPTER_PATTERNS = [
    /^\s*第[零一二三四五六七八九十百千万两0-9０-９]+[章回节卷部集]/,
    /^\s*(chapter|ch\.?)\s*[0-9ivx]+/i,
];

function detectChapters(content) {
    const chapters = [];
    for (let i = 0; i < content.length; i++) {
        const line = content[i];
        if (line.length > 40) continue; // chapter headings are short lines
        for (const re of CHAPTER_PATTERNS) {
            if (re.test(line)) {
                chapters.push({ index: i, title: line.trim().slice(0, 30) });
                break;
            }
        }
    }
    return chapters;
}

// Find the chapter containing a line index (binary search — chapters are
// sorted by line index). Returns the chapter entry plus its end line.
function currentChapter(lineIndex) {
    const chapters = fileInfo.chapters || [];
    if (chapters.length === 0) return null;
    let lo = 0, hi = chapters.length - 1, ans = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (chapters[mid].index <= lineIndex) {
            ans = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    if (ans === -1) return null; // before the first chapter
    const start = chapters[ans].index;
    const end = ans + 1 < chapters.length ? chapters[ans + 1].index : fileInfo.length;
    return { title: chapters[ans].title, index: ans, start: start, end: end };
}

// Rebuild and show the chapter popover. Called on load and on button click.
function rebuildChapterList() {
    const pop = elements.chapterPop;
    // Clear previous items (keep nothing but rebuild from scratch).
    while (pop.firstChild) {
        pop.removeChild(pop.firstChild);
    }
    if (!fileInfo.chapters || fileInfo.chapters.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'lf-chapter-empty';
        empty.textContent = '未检测到章节';
        pop.appendChild(empty);
        return;
    }
    fileInfo.chapters.forEach(function (ch) {
        const item = document.createElement('div');
        item.className = 'lf-chapter-item';
        item.textContent = ch.title;
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            jump(ch.index);
            setPopoverVisible(pop, false);
        });
        pop.appendChild(item);
    });
}

// Toggle the chapter popover; close the other popovers if open.
elements.chapter.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!fileInfo.content) {
        toast('请先加载文件');
        return;
    }
    const willShow = !isPopoverVisible(elements.chapterPop);
    closePopovers();
    if (willShow) {
        rebuildChapterList();
        setPopoverVisible(elements.chapterPop, true);
    }
});
elements.chapterPop.addEventListener('click', function (e) {
    e.stopPropagation();
});

/* ===== src/ui/window.js ===== */
// Panel move/resize (v2.3): explicit MODES instead of drag handles.
//
// Enter with Alt+M (move) / Alt+S (resize), or the toolbar buttons. While a
// mode is active:
//   - the panel edge is highlighted (lf-opmode class) so you can see it,
//   - auto-hide is suppressed (panelOperating) — it stays awake,
//   - moving the mouse moves/resizes the panel,
//   - clicking, pressing Esc, or the same shortcut exits the mode and
//     persists the new position/size.
//
// The v2.1 grip (⠿) and corner triangle are gone — buttons only, more stealth.

// Minimum sizes. The toolbar needs less room when it is allowed to wrap, and
// needs no room at all in mini mode (header hidden) — so the floor depends
// on the header state. This lets the text strip shrink to a genuinely tiny
// sliver when the user wants maximum stealth.
const MIN_HEIGHT = 80;
function minWidth() {
    return getSettings().showHeader ? 120 : 60;
}

let panelOperating = false; // suppresses auto-hide; also true while dragging
let opMode = null;          // null | 'move' | 'resize'
let opAnchor = null;        // cursor position when the mode was entered
let opGeometry = null;      // panel rect when the mode was entered

function enterOpMode(mode) {
    if (opMode === mode) { exitOpMode(); return; }
    opMode = mode;
    panelOperating = true;
    elements.panel.style.visibility = 'visible'; // works even from mini mode
    elements.panel.classList.add('lf-opmode');
    opAnchor = { x: lastMouse.x, y: lastMouse.y };
    const rect = elements.panel.getBoundingClientRect();
    opGeometry = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    toast(mode === 'move' ? '移动模式：移动鼠标，点击或 Esc 退出' : '缩放模式：移动鼠标，点击或 Esc 退出');
}

function exitOpMode() {
    if (!opMode) return;
    const rect = elements.panel.getBoundingClientRect();
    elements.panel.classList.remove('lf-opmode');
    if (opMode === 'move') {
        setSetting('panelLeft', rect.left);
        setSetting('panelTop', rect.top);
    } else {
        setSetting('panelWidth', rect.width);
        if (!getSettings().visibleLines) setSetting('panelHeight', rect.height);
        if (fileInfo.content && !isScrollMode()) {
            jump(fileInfo.bookmark); // re-paginate to the new height
        }
    }
    opMode = null;
    opGeometry = null;
    panelOperating = false;
}

// Last known mouse position, tracked globally so a mode can anchor to it
// even if the cursor hasn't moved since the hotkey was pressed.
const lastMouse = { x: 0, y: 0 };
document.addEventListener('mousemove', function (e) {
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
    if (!opMode || !opGeometry) return;
    const dx = e.clientX - opAnchor.x;
    const dy = e.clientY - opAnchor.y;
    if (opMode === 'move') {
        elements.panel.style.left = (opGeometry.left + dx) + 'px';
        elements.panel.style.top = (opGeometry.top + dy) + 'px';
    } else {
        elements.panel.style.width = Math.max(minWidth(), opGeometry.width + dx) + 'px';
        // Fixed line count derives height from lines — ignore vertical drag.
        if (!getSettings().visibleLines) {
            elements.panel.style.height = Math.max(MIN_HEIGHT, opGeometry.height + dy) + 'px';
        }
    }
});

// Click anywhere exits the active mode (buttons that ENTER a mode call
// stopPropagation so the entering click doesn't immediately exit it).
document.addEventListener('click', function () {
    if (opMode) exitOpMode();
});

// Toolbar buttons.
elements.move.addEventListener('click', function (e) {
    e.stopPropagation();
    enterOpMode('move');
});
elements.resize.addEventListener('click', function (e) {
    e.stopPropagation();
    enterOpMode('resize');
});

// Restore persisted geometry on init (lifecycle calls this).
function applyPanelGeometry() {
    const s = getSettings();
    if (s.panelWidth) elements.panel.style.width = s.panelWidth + 'px';
    if (s.panelHeight && !s.visibleLines) elements.panel.style.height = s.panelHeight + 'px';
    if (s.panelLeft !== undefined && s.panelLeft !== null) {
        elements.panel.style.left = s.panelLeft + 'px';
        elements.panel.style.top = s.panelTop + 'px';
    }
}

/* ===== src/lifecycle.js ===== */
// Paging gestures: left click advances, right click goes back. While a
// move/resize mode is active, clicking the content FINISHES the edit instead
// of paging — exiting the mode takes priority over navigation.
elements.content.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});
elements.content.addEventListener('mousedown', function (e) {
    if (opMode) {
        exitOpMode();
        return;
    }
    if (e.button === 0) {
        next();
    }
    else if (e.button === 2) {
        previous();
    }
});

// Keyboard (v2.3): all shortcuts are Alt-based so plain typing can never
// trigger them. Alt+R wakes the panel; Alt+H toggles the header; Alt+M /
// Alt+S enter move/resize modes. These work whether or not the panel is
// visible and whether or not the header is shown — the panel wakes first.
//
// v1.3 assigned document.onkeydown, clobbering the host page's own handler;
// we use addEventListener instead.
document.addEventListener('keydown', function (event) {
    event = event || window.event;

    if (event.altKey) {
        const key = (event.key || '').toLowerCase();
        if (key === 'r') {
            wakeUp();
            return;
        }
        if (key === 'h') {
            wakeUp();
            setSetting('showHeader', !getSettings().showHeader);
            applySettings();
            return;
        }
        if (key === 'v') {
            wakeUp();
            enterOpMode('move');
            return;
        }
        if (key === 's') {
            wakeUp();
            enterOpMode('resize');
            return;
        }
        return; // other Alt combos belong to the browser/page
    }

    // Everything below only applies while the panel is visible.
    if (elements.panel.style.visibility !== 'visible') return;

    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

    switch (event.key) {
        case 'ArrowRight':
        case ' ':
            event.preventDefault();
            next();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            previous();
            break;
        case 'ArrowUp':
            if (isScrollMode()) {
                event.preventDefault();
                elements.content.scrollTop -= 40;
            }
            break;
        case 'ArrowDown':
            if (isScrollMode()) {
                event.preventDefault();
                elements.content.scrollTop += 40;
            }
            break;
        case '[':
            adjustFontSize(-1);
            break;
        case ']':
            adjustFontSize(1);
            break;
        case 'Escape':
            // Priority: exit move/resize mode > close popovers > hide panel.
            if (opMode) {
                exitOpMode();
            } else if (isPopoverVisible(elements.settingsPop) || isPopoverVisible(elements.chapterPop)) {
                closePopovers();
            } else {
                sleepDown();
            }
            break;
    }
});

// Click on the panel backdrop closes any open popover.
elements.panel.addEventListener('click', function () {
    closePopovers();
});

// Auto-hide: leaving the panel hides it INSTANTLY. Stealth beats polish —
// no grace period. The only exception is an active move/resize mode, where
// the cursor is expected to leave the panel bounds.
elements.panel.addEventListener('mouseleave', function (event) {
    if (!panelOperating) {
        sleepDown();
    }
})
elements.panel.style.visibility = 'hidden';
elements.trigger.addEventListener('click', function (event) {
    wakeUp();
})

function wakeUp() {
    elements.panel.style.visibility = 'visible';
    if (!window.LOAFING_READER_INIT) {
        init();
        window.LOAFING_READER_INIT = true;
        console.log('loafing-reader loaded.')
    }
    const bookmark = GM_getValue('lf_bookmark');
    if (bookmark !== fileInfo.bookmark) {
        jump(bookmark);
    }
}

function sleepDown() {
    closePopovers();
    elements.panel.style.visibility = 'hidden';
}

// INIT: restore settings and the previously loaded book from storage.
window.LOAFING_READER_INIT = false;
function init() {
    applySettings();
    applyPanelGeometry();
    initScrollMode();

    const lfFileName = GM_getValue('lf_file_name');
    const lfFileContent = GM_getValue('lf_file_content');
    const lfBookmark = GM_getValue('lf_bookmark', 0);

    if (lfFileName && lfFileContent) {
        loadFile(lfFileName, lfFileContent);
    }
    if (fileInfo.content) {
        jump(lfBookmark);
    } else {
        updateInfo();
    }
}

})();
