// Paging gestures: left click advances, right click goes back. While a
// move/resize mode is active, clicking the content FINISHES the edit instead
// of paging — exiting the mode takes priority over navigation.
elements.content.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});
elements.content.addEventListener('mousedown', function (e) {
    if (opMode) {
        exitOpMode();
        return;
    }
    if (e.button === 0) {
        next();
    }
    else if (e.button === 2) {
        previous();
    }
});

// Keyboard (v2.3): all shortcuts are Alt-based so plain typing can never
// trigger them. Alt+R wakes the panel; Alt+H toggles the header; Alt+M /
// Alt+S enter move/resize modes. These work whether or not the panel is
// visible and whether or not the header is shown — the panel wakes first.
//
// v1.3 assigned document.onkeydown, clobbering the host page's own handler;
// we use addEventListener instead.
document.addEventListener('keydown', function (event) {
    event = event || window.event;

    if (event.altKey) {
        const key = (event.key || '').toLowerCase();
        if (key === 'r') {
            wakeUp();
            return;
        }
        if (key === 'h') {
            wakeUp();
            setSetting('showHeader', !getSettings().showHeader);
            applySettings();
            return;
        }
        if (key === 'v') {
            wakeUp();
            enterOpMode('move');
            return;
        }
        if (key === 's') {
            wakeUp();
            enterOpMode('resize');
            return;
        }
        return; // other Alt combos belong to the browser/page
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
            // Priority: exit move/resize mode > close popovers > hide panel.
            if (opMode) {
                exitOpMode();
            } else if (isPopoverVisible(elements.settingsPop) || isPopoverVisible(elements.chapterPop)) {
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

// Auto-hide: leaving the panel hides it INSTANTLY. Stealth beats polish —
// no grace period. The only exception is an active move/resize mode, where
// the cursor is expected to leave the panel bounds.
elements.panel.addEventListener('mouseleave', function (event) {
    if (!panelOperating) {
        sleepDown();
    }
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
