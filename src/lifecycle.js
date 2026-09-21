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
