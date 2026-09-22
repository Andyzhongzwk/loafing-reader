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
