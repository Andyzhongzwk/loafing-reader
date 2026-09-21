// ==UserScript==
// @name         摸鱼小说阅读器 Loafing-Reader
// @namespace    hanayabuki-loafing-reader
// @version      1.3.0
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
        z-index: 10;
        position: fixed;
        display: flex;
        flex-flow: column nowrap;
        user-select: none;
        backdrop-filter: blur(1px);
    }
    #lf-toolbar {
        background: var(--lf-toolbar-background-color);
        width: 100%; height: 18px;
    }
    .lf-item {
        padding: 0 0 0 1em;
    }
    .lf-btn {
        color: var(--lf-btn-color);
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
    #lf-text {
        background-color: #f000,
        position: relative;
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
        z-index: 16777271;
    }
`;

/* ===== src/ui/dom.js ===== */
// Element registry: every created element is stored here by id so other
// modules can reference it without querying the DOM.
const elements = {};

// Create an element, register it, and optionally attach children/classes.
function ce(tagName, id, children = [], ...clazz) {
    const tmp = document.createElement(tagName);
    tmp.setAttribute('id', 'lf-' + id);
    tmp.setAttribute('class', ['loafing-reader', ...(clazz.map(i => 'lf-' + i))].join(' '));
    children.forEach(i => tmp.appendChild(i));
    return elements[id] = tmp;
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
// Pagination engine. Pages are rendered by appending line elements until the
// text area is full, then pruning from the opposite end. "direction" is true
// when moving forward (append) and false when moving backward (prepend).
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
        const p = ce('div');
        p.innerHTML = fileInfo.content[i] + '&nbsp;';
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
                    const p = ce('div');
                    p.innerHTML = fileInfo.content[t] + '&nbsp;';
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
function updateInfo() {
    const filename = fileInfo.fileName;
    elements.info.innerText = `(${fileInfo.bookmark}/${fileInfo.length})-${filename}`;

    GM_setValue('lf_bookmark', fileInfo.bookmark);
}

// Re-render starting from an absolute line index.
function jump(index) {
    let i = index;

    const ls = fileInfo.page;
    render(i, ls.length, true);

    fileInfo.bookmark = index;
    fileInfo.page = ls;
    updateInfo();
}

// Advance one page forward.
function next() {
    const ls = fileInfo.page;
    if (fileInfo.bookmark + 1 >= fileInfo.length || ls.length === 0) {
        alert('已是最后一页');
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
    const ls = fileInfo.page;
    if (fileInfo.bookmark === 0 || ls.length === 0) {
        alert('已经是第一页');
        return
    }

    let i = fileInfo.bookmark;
    const mk = render(i, ls.length, false);

    fileInfo.bookmark = mk;
    fileInfo.page = ls;
    updateInfo();
}

/* ===== src/ui/panel.js ===== */
// Build the panel DOM tree:
//   #lf-panel
//     #lf-toolbar (jump / load / move buttons, info text, theme toggle, hidden file input)
//     #lf-content > #lf-text
// plus the #lf-trigger hotspot in the top-left corner.
ce('div', 'panel', [
    ce('div', 'toolbar', [
        ce('input', 'fileholder', [], 'hidden'),
        ce('span', 'jump', [], 'item', 'btn'),
        ce('span', 'load', [], 'item', 'btn'),
        ce('span', 'move', [], 'item', 'btn'),
        ce('span', 'info', [], 'item'),
        ce('span', 'color', [], 'item', 'btn'),
    ],),
    ce('div', 'content', [
        ce('div', 'text', [])
    ]),
]);
ce('div', 'trigger', [], 'trigger');

elements.jump.innerText = '[跳转]';
elements.load.innerText = '[加载]';
elements.move.innerText = '[移动]';
elements.fileholder.type = 'file';
elements.fileholder.accept = '.txt';
elements.info.innerText = '(无文件)';
elements.color.innerText = '[主题]';

document.documentElement.appendChild(elements.panel);
document.documentElement.appendChild(elements.trigger);

/* ===== src/ui/theme.js ===== */
// Theme handling: inject styles once, then cycle light/dark on button click.
GM_addStyle(cssText);
const themes = ['light', 'dark'];
let themeId = 1;
elements.color.addEventListener('click', function () {
    elements.panel.setAttribute('lf-theme', themes.at(themeId));
    themeId = (themeId + 1) % themes.length;
});

/* ===== src/reader/file.js ===== */
// File loading. The file content is split into lines and persisted via
// GM_setValue so the book survives page reloads.
function loadFile(filename, content) {
    clear();
    fileInfo.fileName = filename.substring(0, filename.lastIndexOf('.'));

    fileInfo.content = content.split(/(?:\r\n|\n)/)//.filter(s=>/\s*/.test(s));
    fileInfo.length = fileInfo.content.length;
    fileInfo.bookmark = 0;
    fileInfo.page = [];

    GM_setValue('lf_file_name', filename);
    GM_setValue('lf_file_content', content);
    GM_setValue('lf_bookmark', 0);

    jump(0);
}

// Character set used when reading the file. Users can override it via the
// load button's prompt before picking a file.
let charset = "utf-8";

elements.fileholder.addEventListener('change', function (e) {
    const file = elements.fileholder.files[0];
    const reader = new FileReader();
    reader.readAsText(file, charset);
    reader.onload = function () {
        loadFile(file.name, this.result);
    }
});
elements.load.addEventListener('click', function (e) {
    charset = prompt("选择文件编码格式", charset)
    elements.fileholder.click();
});

/* ===== src/reader/jump-button.js ===== */
// Jump button: prompt for a target line index and re-render from there.
elements.jump.addEventListener('click', function (e) {
    let value = prompt('跳转到？', fileInfo.bookmark);
    value = parseInt(value);
    if (!isNaN(value) && fileInfo.content && fileInfo.length >= value) {
        jump(value);
    }
    else {
        alert('输入有误，跳转失败');
    }
});

/* ===== src/ui/window.js ===== */
// Panel dragging. Clicking the [移动] button toggles drag mode; while active,
// mousemove deltas reposition the panel relative to its centered origin.
let mouseMemory = [0, 0];
let moveWindow = false
elements.move.addEventListener('mousedown', function (e) {
    mouseMemory = [e.clientX - mouseMemory[0], e.clientY - mouseMemory[1]];
    moveWindow = !moveWindow;
});
document.documentElement.addEventListener('mousemove', function (e) {
    if (moveWindow) {
        elements.panel.style.left = `calc(50% + ${e.clientX - mouseMemory[0]}px)`;
        elements.panel.style.top = `calc(50% + ${e.clientY - mouseMemory[1]}px)`;
    }
});

/* ===== src/lifecycle.js ===== */
// Paging gestures: left click advances, right click goes back. The default
// context menu is suppressed inside the reading area.
elements.content.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});
elements.content.addEventListener('mousedown', function (e) {
    if (e.button === 0) {
        next();
    }
    else if (e.button === 2) {
        previous();
    }
});

// Wake up & sleep down. The panel starts hidden; Alt+R or the trigger
// hotspot shows it, and moving the mouse out hides it again (unless the
// window is being dragged).
document.onkeydown = function (event) {
    event = event || window.event
    if (event.altKey && (event.key === 'r' || event.key === 'R')) {
        wakeUp();
    }
}
elements.panel.addEventListener('mouseleave', function (event) {
    sleepDown();
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
    if (!moveWindow) {
        elements.panel.style.visibility = 'hidden';
    }
}

// INIT: restore the previously loaded book and bookmark from storage.
window.LOAFING_READER_INIT = false;
function init() {
    const lfFileName = GM_getValue('lf_file_name');
    const lfFileContent = GM_getValue('lf_file_content');
    const lfBookmark = GM_getValue('lf_bookmark', 0);

    if (lfFileName && lfFileContent) {
        loadFile(lfFileName, lfFileContent);
    }
    if (fileInfo.content) {
        jump(lfBookmark);
    }
}

})();
