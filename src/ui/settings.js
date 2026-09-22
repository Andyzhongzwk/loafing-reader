// Settings popover: sliders and choice buttons for reading preferences.
// All changes apply live and persist via storage.js.

// Small helper to build labeled control rows.
function settingsRow(labelText) {
    const row = document.createElement('div');
    row.className = 'lf-set-row';
    const label = document.createElement('span');
    label.className = 'lf-set-label';
    label.textContent = labelText;
    row.appendChild(label);
    elements.settingsBody.appendChild(row);
    return row;
}

function settingsSlider(labelText, key, min, max, step, format) {
    const row = settingsRow(labelText);
    const input = document.createElement('input');
    input.type = 'range';
    input.min = min; input.max = max; input.step = step;
    input.value = getSettings()[key];
    const value = document.createElement('span');
    value.className = 'lf-set-value';
    value.textContent = format(getSettings()[key]);
    input.addEventListener('input', function () {
        const v = parseFloat(input.value);
        setSetting(key, v);
        value.textContent = format(v);
        applySettings();
    });
    row.appendChild(input);
    row.appendChild(value);
}

function settingsChoice(labelText, key, options) {
    const row = settingsRow(labelText);
    const btns = [];
    options.forEach(function (opt) {
        const b = document.createElement('span');
        b.className = 'lf-set-choice';
        b.textContent = opt.label;
        if (getSettings()[key] === opt.value) b.classList.add('active');
        b.addEventListener('click', function () {
            setSetting(key, opt.value);
            btns.forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active');
            applySettings();
            if (key === 'mode') onModeChange();
        });
        btns.push(b);
        row.appendChild(b);
    });
}

// Re-render the book when switching between page and scroll mode.
function onModeChange() {
    if (!fileInfo.content) return;
    if (isScrollMode()) {
        renderScrollAll();
        scrollToLine(fileInfo.bookmark);
        updateProgressBar();
    } else {
        jump(fileInfo.bookmark);
    }
}

function buildSettingsPanel() {
    settingsSlider('字号', 'fontSize', 12, 24, 1, function (v) { return v + 'px'; });
    settingsSlider('行高', 'lineHeight', 1.2, 2.0, 0.05, function (v) { return v.toFixed(2); });
    settingsSlider('文字透明', 'textOpacity', 0.5, 1, 0.05, function (v) { return Math.round(v * 100) + '%'; });
    settingsSlider('背景透明', 'bgOpacity', 0, 0.4, 0.02, function (v) { return Math.round(v * 100) + '%'; });
    settingsChoice('字体', 'fontFamily', [
        { value: 'sans-serif', label: '无衬线' },
        { value: 'serif', label: '衬线' },
        { value: 'fangsong', label: '仿宋' },
    ]);
    settingsChoice('模式', 'mode', [
        { value: 'page', label: '翻页' },
        { value: 'scroll', label: '滚动' },
    ]);
    settingsChoice('编码', 'encoding', [
        { value: 'auto', label: '自动' },
        { value: 'utf-8', label: 'UTF-8' },
        { value: 'gb18030', label: 'GB18030' },
    ]);
}

// Toggle the settings popover; close the jump popover if open.
elements.settings.addEventListener('click', function (e) {
    e.stopPropagation();
    setPopoverVisible(elements.jumpPop, false);
    setPopoverVisible(elements.settingsPop, !isPopoverVisible(elements.settingsPop));
});
elements.settingsPop.addEventListener('click', function (e) {
    e.stopPropagation(); // keep the popover open when clicking inside
});

buildSettingsPanel();
