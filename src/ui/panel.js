// Build the panel DOM tree:
//   #lf-panel
//     #lf-toolbar ([移动] [缩放] [章节], info text, [设置], hidden file input)
//     #lf-content > #lf-text
//     #lf-progress > #lf-progress-thumb   (scroll mode progress bar)
//     #lf-settings-pop > #lf-settings-body   (settings popover; hosts
//                                             加载/换书 + 主题 + 编码 choices)
//     #lf-chapter-pop                         (chapter list popover)
//     #lf-toasts                              (toast notifications)
// Move/resize are MODES (Alt+M / Alt+S or the toolbar buttons), not handles.
// plus the #lf-trigger hotspot in the top-left corner.
ce('div', 'panel', [
    ce('div', 'toolbar', [
        ce('input', 'fileholder', [], 'hidden'),
        ce('span', 'move', [], 'item', 'btn'),
        ce('span', 'resize', [], 'item', 'btn'),
        ce('span', 'chapter', [], 'item', 'btn'),
        ce('span', 'info', [], 'item'),
        ce('span', 'settings', [], 'item', 'btn'),
    ],),
    ce('div', 'content', [
        ce('div', 'text', [])
    ]),
    ce('div', 'progress', [
        ce('div', 'progress-thumb', [])
    ], 'hidden'),
    ce('div', 'settings-pop', [
        ce('div', 'settings-body', [])
    ], 'popover', 'hidden'),
    ce('div', 'chapter-pop', [], 'popover', 'hidden'),
    ce('div', 'toasts', []),
]);
ce('div', 'trigger', [], 'trigger');

elements.move.innerText = '[移动]';
elements.resize.innerText = '[缩放]';
elements.chapter.innerText = '[章节]';
elements.fileholder.type = 'file';
elements.fileholder.accept = '.txt';
elements.info.innerText = '(无文件)';
elements.settings.innerText = '[设置]';

document.documentElement.appendChild(elements.panel);
document.documentElement.appendChild(elements.trigger);
