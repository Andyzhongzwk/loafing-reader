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
