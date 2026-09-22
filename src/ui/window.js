// Panel move/resize (v2.3): explicit MODES instead of drag handles.
//
// Enter with Alt+M (move) / Alt+S (resize), or the toolbar buttons. While a
// mode is active:
//   - the panel edge is highlighted (lf-opmode class) so you can see it,
//   - auto-hide is suppressed (panelOperating) — it stays awake,
//   - moving the mouse moves/resizes the panel,
//   - clicking, pressing Esc, or the same shortcut exits the mode and
//     persists the new position/size.
//
// The v2.1 grip (⠿) and corner triangle are gone — buttons only, more stealth.

// Minimum sizes. The toolbar needs less room when it is allowed to wrap, and
// needs no room at all in mini mode (header hidden) — so the floor depends
// on the header state. This lets the text strip shrink to a genuinely tiny
// sliver when the user wants maximum stealth.
const MIN_HEIGHT = 80;
function minWidth() {
    return getSettings().showHeader ? 120 : 60;
}

let panelOperating = false; // suppresses auto-hide; also true while dragging
let opMode = null;          // null | 'move' | 'resize'
let opAnchor = null;        // cursor position when the mode was entered
let opGeometry = null;      // panel rect when the mode was entered

function enterOpMode(mode) {
    if (opMode === mode) { exitOpMode(); return; }
    opMode = mode;
    panelOperating = true;
    elements.panel.style.visibility = 'visible'; // works even from mini mode
    elements.panel.classList.add('lf-opmode');
    opAnchor = { x: lastMouse.x, y: lastMouse.y };
    const rect = elements.panel.getBoundingClientRect();
    opGeometry = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    toast(mode === 'move' ? '移动模式：移动鼠标，点击或 Esc 退出' : '缩放模式：移动鼠标，点击或 Esc 退出');
}

function exitOpMode() {
    if (!opMode) return;
    const rect = elements.panel.getBoundingClientRect();
    elements.panel.classList.remove('lf-opmode');
    if (opMode === 'move') {
        setSetting('panelLeft', rect.left);
        setSetting('panelTop', rect.top);
    } else {
        setSetting('panelWidth', rect.width);
        if (!getSettings().visibleLines) setSetting('panelHeight', rect.height);
        if (fileInfo.content && !isScrollMode()) {
            jump(fileInfo.bookmark); // re-paginate to the new height
        }
    }
    opMode = null;
    opGeometry = null;
    panelOperating = false;
}

// Last known mouse position, tracked globally so a mode can anchor to it
// even if the cursor hasn't moved since the hotkey was pressed.
const lastMouse = { x: 0, y: 0 };
document.addEventListener('mousemove', function (e) {
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
    if (!opMode || !opGeometry) return;
    const dx = e.clientX - opAnchor.x;
    const dy = e.clientY - opAnchor.y;
    if (opMode === 'move') {
        elements.panel.style.left = (opGeometry.left + dx) + 'px';
        elements.panel.style.top = (opGeometry.top + dy) + 'px';
    } else {
        elements.panel.style.width = Math.max(minWidth(), opGeometry.width + dx) + 'px';
        // Fixed line count derives height from lines — ignore vertical drag.
        if (!getSettings().visibleLines) {
            elements.panel.style.height = Math.max(MIN_HEIGHT, opGeometry.height + dy) + 'px';
        }
    }
});

// Click anywhere exits the active mode (buttons that ENTER a mode call
// stopPropagation so the entering click doesn't immediately exit it).
document.addEventListener('click', function () {
    if (opMode) exitOpMode();
});

// Toolbar buttons.
elements.move.addEventListener('click', function (e) {
    e.stopPropagation();
    enterOpMode('move');
});
elements.resize.addEventListener('click', function (e) {
    e.stopPropagation();
    enterOpMode('resize');
});

// Restore persisted geometry on init (lifecycle calls this).
function applyPanelGeometry() {
    const s = getSettings();
    if (s.panelWidth) elements.panel.style.width = s.panelWidth + 'px';
    if (s.panelHeight && !s.visibleLines) elements.panel.style.height = s.panelHeight + 'px';
    if (s.panelLeft !== undefined && s.panelLeft !== null) {
        elements.panel.style.left = s.panelLeft + 'px';
        elements.panel.style.top = s.panelTop + 'px';
    }
}
