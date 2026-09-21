// Non-blocking toast notifications. Replaces all alert() calls — a stealth
// reader must never pop a modal dialog.
function toast(message) {
    const box = elements.toasts;
    if (!box) return;
    const item = document.createElement('div');
    item.className = 'lf-toast-item';
    item.textContent = message;
    box.appendChild(item);
    setTimeout(function () {
        item.remove();
    }, 1500);
}
