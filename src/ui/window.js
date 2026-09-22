// Panel dragging and resizing (v2.1 "move well").
//
// Drag: hold the mouse anywhere on the toolbar (except buttons) and move.
// Resize: grab the handle at the bottom-right corner of the panel.
// Position and size persist in settings and are restored on init.

const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;

let dragState = null;   // { dx, dy } offset from panel top-left to cursor
let resizeState = null; // { startX, startY, startW, startH }

// Drag: mousedown on the toolbar background starts a drag; buttons/inputs
// inside the toolbar keep their own behavior.
elements.toolbar.addEventListener('mousedown', function (e) {
    if (e.target !== elements.toolbar) return; // only drag from empty toolbar space
    if (e.button !== 0) return;
    dragState = {
        dx: e.clientX - panelLeft(),
        dy: e.clientY - panelTop(),
    };
    e.preventDefault();
});

document.addEventListener('mousemove', function (e) {
    if (dragState) {
        elements.panel.style.left = (e.clientX - dragState.dx) + 'px';
        elements.panel.style.top = (e.clientY - dragState.dy) + 'px';
    } else if (resizeState) {
        const w = Math.max(MIN_WIDTH, resizeState.startW + (e.clientX - resizeState.startX));
        const h = Math.max(MIN_HEIGHT, resizeState.startH + (e.clientY - resizeState.startY));
        elements.panel.style.width = w + 'px';
        elements.panel.style.height = h + 'px';
    }
});

document.addEventListener('mouseup', function () {
    if (dragState) {
        dragState = null;
        setSetting('panelLeft', panelLeft());
        setSetting('panelTop', panelTop());
    } else if (resizeState) {
        resizeState = null;
        setSetting('panelWidth', elements.panel.offsetWidth);
        setSetting('panelHeight', elements.panel.offsetHeight);
        // Re-paginate the book to the new height (page mode only).
        if (fileInfo.content && !isScrollMode()) {
            jump(fileInfo.bookmark);
        }
    }
});

// Resize handle.
elements.resize.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    resizeState = {
        startX: e.clientX,
        startY: e.clientY,
        startW: elements.panel.offsetWidth,
        startH: elements.panel.offsetHeight,
    };
    e.preventDefault();
    e.stopPropagation();
});

function panelLeft() {
    return elements.panel.getBoundingClientRect().left;
}
function panelTop() {
    return elements.panel.getBoundingClientRect().top;
}

// Restore persisted geometry on init (lifecycle calls this). Position is
// stored as absolute px — the panel's CSS default (top:50%; left:50%) is
// overridden the first time the user drags it.
function applyPanelGeometry() {
    const s = getSettings();
    if (s.panelWidth) elements.panel.style.width = s.panelWidth + 'px';
    if (s.panelHeight) elements.panel.style.height = s.panelHeight + 'px';
    if (s.panelLeft !== undefined && s.panelLeft !== null) {
        elements.panel.style.left = s.panelLeft + 'px';
        elements.panel.style.top = s.panelTop + 'px';
    }
}
