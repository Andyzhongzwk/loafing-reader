// Panel dragging. Clicking the [移动] button toggles drag mode; while active,
// mousemove deltas reposition the panel relative to its centered origin.
let mouseMemory = [0, 0];
let moveWindow = false
elements.move.addEventListener('mousedown', function (e) {
    mouseMemory = [e.clientX - mouseMemory[0], e.clientY - mouseMemory[1]];
    moveWindow = !moveWindow;
});
document.documentElement.addEventListener('mousemove', function (e) {
    if (moveWindow) {
        elements.panel.style.left = `calc(50% + ${e.clientX - mouseMemory[0]}px)`;
        elements.panel.style.top = `calc(50% + ${e.clientY - mouseMemory[1]}px)`;
    }
});
