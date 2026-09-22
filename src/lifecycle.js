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
//
// NOTE: v1.3 assigned document.onkeydown, clobbering the host page's own
// handler. v2.0 uses addEventListener and ignores keys while the panel is
// hidden or while typing in an input.
document.addEventListener('keydown', function (event) {
    event = event || window.event;

    // Global wake-up shortcut works regardless of panel state.
    if (event.altKey && (event.key === 'r' || event.key === 'R')) {
        wakeUp();
        return;
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
            if (isPopoverVisible(elements.settingsPop) || isPopoverVisible(elements.jumpPop)) {
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
