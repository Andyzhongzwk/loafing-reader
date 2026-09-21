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
