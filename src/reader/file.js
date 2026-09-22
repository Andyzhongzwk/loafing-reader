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
elements.load.addEventListener('click', function (e) {
    elements.fileholder.click();
});
