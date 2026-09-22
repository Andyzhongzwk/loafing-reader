// Build the panel DOM tree:
//   #lf-panel
//     #lf-toolbar (jump / load / chapter buttons, info text, theme + settings
//                  toggles, hidden file input)
//     #lf-content > #lf-text
//     #lf-progress > #lf-progress-thumb   (scroll mode progress bar)
//     #lf-settings-pop > #lf-settings-body   (settings popover)
//     #lf-jump-pop                            (jump popover)
//     #lf-chapter-pop                         (chapter list popover)
//     #lf-toasts                              (toast notifications)
//     #lf-resize                              (resize handle, bottom-right)
// Dragging is done from the empty part of the toolbar (see ui/window.js).
// plus the #lf-trigger hotspot in the top-left corner.
ce('div', 'panel', [
    ce('div', 'toolbar', [
        ce('input', 'fileholder', [], 'hidden'),
        ce('span', 'jump', [], 'item', 'btn'),
        ce('span', 'load', [], 'item', 'btn'),
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
    ce('div', 'jump-pop', [], 'popover', 'hidden'),
    ce('div', 'chapter-pop', [], 'popover', 'hidden'),
    ce('div', 'toasts', []),
    ce('div', 'resize', [], 'resize-handle'),
]);
ce('div', 'trigger', [], 'trigger');

elements.jump.innerText = '[跳转]';
elements.load.innerText = '[加载]';
elements.chapter.innerText = '[章节]';
elements.fileholder.type = 'file';
elements.fileholder.accept = '.txt';
elements.info.innerText = '(无文件)';
elements.color.innerText = '[主题]';
elements.settings.innerText = '[设置]';

document.documentElement.appendChild(elements.panel);
document.documentElement.appendChild(elements.trigger);
