// Jump popover: percentage input plus quick actions (start / last position /
// end). Replaces the v1.3 prompt() dialog.
(function buildJumpPopover() {
    const pop = elements.jumpPop;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '100';
    input.step = '0.1';
    input.placeholder = '%';
    pop.appendChild(input);

    const hint = document.createElement('div');
    hint.style.fontSize = '11px';
    hint.textContent = '输入百分比，如 34.7';
    pop.appendChild(hint);

    const row = document.createElement('div');
    pop.appendChild(row);

    function mkBtn(label, onClick) {
        const b = document.createElement('span');
        b.className = 'lf-btn lf-item';
        b.textContent = label;
        b.addEventListener('click', onClick);
        row.appendChild(b);
        return b;
    }

    function jumpToPercent(pct) {
        if (!fileInfo.content || !fileInfo.length) {
            toast('请先加载文件');
            return;
        }
        const p = Math.max(0, Math.min(100, parseFloat(pct)));
        if (isNaN(p)) {
            toast('输入有误，跳转失败');
            return;
        }
        const index = Math.round(p / 100 * (fileInfo.length - 1));
        jump(index);
        GM_setValue('lf_last_jump', index);
        toast(`已跳转到 ${p}%`);
        setPopoverVisible(pop, false);
    }

    mkBtn('[跳转]', function () {
        jumpToPercent(input.value);
    });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') jumpToPercent(input.value);
        e.stopPropagation(); // panel-level shortcuts must not fire while typing
    });
    mkBtn('[开头]', function () {
        jumpToPercent(0);
    });
    mkBtn('[上次]', function () {
        const last = GM_getValue('lf_last_jump', 0);
        input.value = fileInfo.length ? (last / (fileInfo.length - 1) * 100).toFixed(1) : 0;
        jumpToPercent(input.value);
    });
    mkBtn('[末尾]', function () {
        jumpToPercent(100);
    });

    // Toggle the jump popover; close the settings popover if open.
    elements.jump.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!fileInfo.content) {
            toast('请先加载文件');
            return;
        }
        setPopoverVisible(elements.settingsPop, false);
        const willShow = !isPopoverVisible(pop);
        if (willShow) {
            input.value = fileInfo.length
                ? (fileInfo.bookmark / (fileInfo.length - 1) * 100).toFixed(1)
                : '0';
        }
        setPopoverVisible(pop, willShow);
    });
    pop.addEventListener('click', function (e) {
        e.stopPropagation();
    });
})();
