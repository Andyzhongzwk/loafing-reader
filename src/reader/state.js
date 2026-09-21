// Shared mutable state for the currently loaded book.
const fileInfo = {};

// Remove all rendered page elements from the DOM.
function clear() {
    const ls = fileInfo.page;
    while (ls && ls.length > 0) {
        ls.pop().remove();
    }
}
