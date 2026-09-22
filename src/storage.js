// Settings storage. All user preferences live in one versioned JSON key so
// they can be migrated/reset as a unit.
const SETTINGS_KEY = 'lf_settings';

const DEFAULT_SETTINGS = {
    fontSize: 12,          // px, 12–24
    lineHeight: 1.5,       // 1.2–2.0
    fontFamily: 'sans-serif', // 'serif' | 'sans-serif' | 'fangsong'
    textOpacity: 1,        // 0.5–1
    bgOpacity: 0.2,        // 0–0.4, alpha of toolbar/content backgrounds
    mode: 'page',          // 'page' | 'scroll'
    encoding: 'auto',      // 'auto' | 'utf-8' | 'gb18030'
    showHeader: true,      // false = mini mode: toolbar hidden, text only
    visibleLines: 0,       // 0 = auto (fill container); 1–10 = fixed line count
    theme: 'light',        // 'light' | 'dark'
    panelLeft: null,       // persisted geometry (null = centered default)
    panelTop: null,
    panelWidth: null,
    panelHeight: null,
};

const FONT_FAMILIES = {
    serif: 'Georgia, "Times New Roman", "SimSun", serif',
    'sans-serif': '"Segoe UI", "Microsoft YaHei", sans-serif',
    fangsong: '"FangSong", "仿宋", "STFangsong", serif',
};

function getSettings() {
    let saved = {};
    try {
        saved = JSON.parse(GM_getValue(SETTINGS_KEY, '{}')) || {};
    } catch (e) {
        saved = {};
    }
    return Object.assign({}, DEFAULT_SETTINGS, saved);
}

function setSetting(key, value) {
    const s = getSettings();
    s[key] = value;
    GM_setValue(SETTINGS_KEY, JSON.stringify(s));
}

// Push the current settings into the live panel styles. Called on init and
// after every settings change.
function applySettings() {
    const s = getSettings();
    elements.text.style.fontSize = s.fontSize + 'px';
    elements.text.style.lineHeight = String(s.lineHeight);
    elements.text.style.fontFamily = FONT_FAMILIES[s.fontFamily] || FONT_FAMILIES['sans-serif'];
    elements.text.style.opacity = String(s.textOpacity);
    elements.panel.style.setProperty('--lf-bg-alpha', String(s.bgOpacity));
    elements.panel.setAttribute('lf-mode', s.mode);
    elements.panel.setAttribute('lf-theme', s.theme);
    elements.panel.setAttribute('lf-header', s.showHeader ? 'show' : 'hidden');

    // Fixed line count: the panel height is derived from lines × line-height
    // so the text strip is exactly as tall as the requested lines (plus the
    // toolbar in header mode). Overrides any persisted/free height.
    if (s.visibleLines > 0) {
        const toolbarH = s.showHeader ? 18 : 0;
        const progressH = s.mode === 'scroll' ? 5 : 0;
        const h = Math.ceil(s.visibleLines * s.fontSize * s.lineHeight) + toolbarH + progressH;
        elements.panel.style.height = h + 'px';
        if (fileInfo && fileInfo.content && s.mode === 'page') {
            jump(fileInfo.bookmark); // re-paginate to the new height
        }
    }
}

// Keyboard shortcut helper for [ / ] font-size adjustment.
function adjustFontSize(delta) {
    const s = getSettings();
    const size = Math.min(24, Math.max(12, s.fontSize + delta));
    if (size !== s.fontSize) {
        setSetting('fontSize', size);
        applySettings();
    }
}
