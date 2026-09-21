// Element registry: every created element is stored here by id so other
// modules can reference it without querying the DOM.
const elements = {};

// Create an element, register it, and optionally attach children/classes.
function ce(tagName, id, children = [], ...clazz) {
    const tmp = document.createElement(tagName);
    tmp.setAttribute('id', 'lf-' + id);
    tmp.setAttribute('class', ['loafing-reader', ...(clazz.map(i => 'lf-' + i))].join(' '));
    children.forEach(i => tmp.appendChild(i));
    return elements[id] = tmp;
}
