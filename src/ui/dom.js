// Element registry: every created element is stored here by id so other
// modules can reference it without querying the DOM.
const elements = {};

// Create an element, register it, and optionally attach children/classes.
// Registered under both the raw id ('settings-pop') and a camelCase alias
// ('settingsPop') so referencing modules can use whichever reads better.
function ce(tagName, id, children = [], ...clazz) {
    const tmp = document.createElement(tagName);
    tmp.setAttribute('id', 'lf-' + id);
    tmp.setAttribute('class', ['loafing-reader', ...(clazz.map(i => 'lf-' + i))].join(' '));
    children.forEach(i => tmp.appendChild(i));
    if (id !== undefined) {
        elements[id] = tmp;
        elements[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = tmp;
    }
    return tmp;
}

// Popover visibility helpers (settings / jump panels toggle the lf-hidden class).
function setPopoverVisible(pop, visible) {
    pop.classList.toggle('lf-hidden', !visible);
}

function isPopoverVisible(pop) {
    return !pop.classList.contains('lf-hidden');
}

function closePopovers() {
    setPopoverVisible(elements.settingsPop, false);
    setPopoverVisible(elements.jumpPop, false);
}
