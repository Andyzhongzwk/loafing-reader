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
