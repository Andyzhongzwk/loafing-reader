// Build the panel DOM tree:
//   #lf-panel
//     #lf-toolbar (jump / load / move buttons, info text, theme toggle, hidden file input)
//     #lf-content > #lf-text
// plus the #lf-trigger hotspot in the top-left corner.
ce('div', 'panel', [
    ce('div', 'toolbar', [
        ce('input', 'fileholder', [], 'hidden'),
        ce('span', 'jump', [], 'item', 'btn'),
        ce('span', 'load', [], 'item', 'btn'),
        ce('span', 'move', [], 'item', 'btn'),
        ce('span', 'info', [], 'item'),
        ce('span', 'color', [], 'item', 'btn'),
    ],),
    ce('div', 'content', [
        ce('div', 'text', [])
    ]),
]);
ce('div', 'trigger', [], 'trigger');

elements.jump.innerText = '[跳转]';
elements.load.innerText = '[加载]';
elements.move.innerText = '[移动]';
elements.fileholder.type = 'file';
elements.fileholder.accept = '.txt';
elements.info.innerText = '(无文件)';
elements.color.innerText = '[主题]';

document.documentElement.appendChild(elements.panel);
document.documentElement.appendChild(elements.trigger);
