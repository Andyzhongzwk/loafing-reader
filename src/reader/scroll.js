// Scroll mode: render the whole book into #lf-text, make #lf-content
// scrollable, and keep a progress bar in sync with the scroll position.
// The bookmark is derived from the scroll ratio so page mode and scroll mode
// share the same persisted position.

let scrollSaveTimer = null;
let scrollSyncRaf = 0;

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
// Scroll events fire in bursts (a single wheel flick = dozens), and each sync
// reads scrollHeight on a DOM of tens of thousands of line divs plus a
// synchronous GM_setValue — doing that per event made scroll mode janky.
// Coalesce to one sync per animation frame; the storage write stays
// debounced on top of that.
function onScroll() {
    if (!isScrollMode() || !fileInfo.content) return;
    if (scrollSyncRaf) return;
    scrollSyncRaf = requestAnimationFrame(function () {
        scrollSyncRaf = 0;
        fileInfo.bookmark = lineFromScroll();
        updateProgressBar();
        updateInfo();
        if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
        scrollSaveTimer = setTimeout(function () {
            GM_setValue('lf_bookmark', fileInfo.bookmark);
        }, 300);
    });
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
