// Panel dragging and resizing (v2.1.1: explicit handles, hide-locked).
//
// Move: press and hold the ⠿ grip at the left end of the toolbar, then drag.
// Resize: grab the handle at the bottom-right corner of the panel.
// Both share the same interaction model: hold -> drag -> release.
//
// While either operation is active, panelOperating is true and the panel
// must NOT auto-hide on mouseleave — the cursor is expected to leave the
// panel bounds during a drag.
//
// Position and size persist in settings and are restored on init.

const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;

let dragState = null;   // { dx, dy } cursor offset from panel top-left
let resizeState = null; // { startX, startY, startW, startH }
let panelOperating = false;

// Move grip: mousedown on the grip starts a drag.
elements.move.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    const rect = elements.panel.getBoundingClientRect();
    dragState = {
        dx: e.clientX - rect.left,
        dy: e.clientY - rect.top,
    };
    panelOperating = true;
    e.preventDefault();
    e.stopPropagation();
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
    panelOperating = true;
    e.preventDefault();
    e.stopPropagation();
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
        panelOperating = false;
        const rect = elements.panel.getBoundingClientRect();
        setSetting('panelLeft', rect.left);
        setSetting('panelTop', rect.top);
    } else if (resizeState) {
        resizeState = null;
        panelOperating = false;
        setSetting('panelWidth', elements.panel.offsetWidth);
        setSetting('panelHeight', elements.panel.offsetHeight);
        // Re-paginate the book to the new height (page mode only).
        if (fileInfo.content && !isScrollMode()) {
            jump(fileInfo.bookmark);
        }
    }
});

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
