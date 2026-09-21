// Theme handling: inject styles once, then cycle light/dark on button click.
GM_addStyle(cssText);
const themes = ['light', 'dark'];
let themeId = 1;
elements.color.addEventListener('click', function () {
    elements.panel.setAttribute('lf-theme', themes.at(themeId));
    themeId = (themeId + 1) % themes.length;
});
