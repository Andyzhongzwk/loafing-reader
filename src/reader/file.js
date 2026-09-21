// File loading. The file content is split into lines and persisted via
// GM_setValue so the book survives page reloads. Files above the size cap are
// kept in memory only (persisting them would bloat storage).

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
