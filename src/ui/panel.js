// Build the panel DOM tree:
//   #lf-panel
//     #lf-toolbar (move grip, chapter button, info text, theme + settings
//                  toggles, hidden file input)
//     #lf-content > #lf-text
//     #lf-progress > #lf-progress-thumb   (scroll mode progress bar)
//     #lf-settings-pop > #lf-settings-body   (settings popover; hosts 加载文件)
//     #lf-chapter-pop                         (chapter list popover)
//     #lf-toasts                              (toast notifications)
//     #lf-resize                              (resize handle, bottom-right)
// Dragging uses the ⠿ grip; loading a book is inside the settings popover.
// plus the #lf-trigger hotspot in the top-left corner.
ce('div', 'panel', [
    ce('div', 'toolbar', [
        ce('span', 'move', [], 'move-handle'),
        ce('input', 'fileholder', [], 'hidden'),
        ce('span', 'chapter', [], 'item', 'btn'),
        ce('span', 'info', [], 'item'),
        ce('span', 'color', [], 'item', 'btn'),
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
    ce('div', 'resize', [], 'resize-handle'),
]);
ce('div', 'trigger', [], 'trigger');

elements.chapter.innerText = '[章节]';
elements.move.innerText = '⠿';
elements.move.title = '按住拖动面板';
elements.fileholder.type = 'file';
elements.fileholder.accept = '.txt';
elements.info.innerText = '(无文件)';
elements.color.innerText = '[主题]';
elements.settings.innerText = '[设置]';

document.documentElement.appendChild(elements.panel);
document.documentElement.appendChild(elements.trigger);
