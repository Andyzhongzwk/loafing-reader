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

// Popover visibility helpers (settings / chapter panels toggle the lf-hidden class).
function setPopoverVisible(pop, visible) {
    pop.classList.toggle('lf-hidden', !visible);
}

function isPopoverVisible(pop) {
    return !pop.classList.contains('lf-hidden');
}

function closePopovers() {
    setPopoverVisible(elements.settingsPop, false);
    setPopoverVisible(elements.chapterPop, false);
}

// Popover placement: popovers open below the toolbar by default, but when
// the panel sits low on the screen that spills past the viewport bottom.
// Measure on open and flip the popover to expand upward when there is no
// room below (and there IS room above — a tall chapter list on a short
// screen keeps the default rather than oscillating).
function openPopover(pop) {
    setPopoverVisible(pop, true);
    pop.style.top = '20px';
    pop.style.bottom = 'auto';
    const panelTop = elements.panel.getBoundingClientRect().top;
    const popH = pop.offsetHeight;
    if (panelTop + 20 + popH > window.innerHeight && panelTop - 20 - popH > 0) {
        pop.style.top = 'auto';
        pop.style.bottom = 'calc(100% - 20px)';
    }
}
