# 📖 摸鱼小说阅读器 loafing-reader

一个油猴（Tampermonkey）脚本：在浏览器里低调地读小说，鼠标一移开立刻消失。

> 本项目基于 [hua-zhi-wan/loafing-reader](https://github.com/hua-zhi-wan/loafing-reader)
> （[油叉地址](https://greasyfork.org/zh-CN/scripts/470914-%E6%91%B8%E9%B1%BC%E5%B0%8F%E8%AF%B4%E9%98%85%E8%AF%BB%E5%99%A8-loafing-reader)）
> 重写并持续迭代，原项目使用 MIT 协议，版权见 [LICENSE](LICENSE)。

## ✨ 特性

- **秒隐**：鼠标移出面板立即隐藏，无延迟；可选「失焦隐藏」——切窗口的瞬间自动藏
- **自由布局**：移动 / 缩放都是显式模式（进入后面板保持唤醒，不会误隐藏）
- **迷你模式**：隐藏 header 后只剩几行文字，最小宽度 60px，缩到角落里的一个小条
- **章节支持**：自动识别 `第X章 / 第X回 / Chapter N` 等标题，章节跳转 + 本章进度显示
- **双阅读模式**：翻页 / 滚动，进度条可拖动定位
- **设置面板**：字号、行高、字体、透明度、行数、主题、编码全部实时生效并持久化
- **进度记忆**：书名、内容、书签全部本地保存，关掉浏览器回来接着读

## 📦 安装

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/) 扩展
2. 打开 `dist/loafing-reader.user.js`，复制全部内容
3. 在 Tampermonkey 中新建脚本 → 粘贴 → 保存（或直接在已安装脚本里替换）

## 🎮 快捷键

所有快捷键均为 `Alt + 字母`，不会与正常打字冲突；面板隐藏时同样生效。

| 快捷键 | 功能 |
| ------ | ---- |
| `Alt + R` | 唤醒面板 |
| `Alt + H` | 显示 / 隐藏 header（迷你模式） |
| `Alt + V` | 进入移动模式 |
| `Alt + S` | 进入缩放模式 |
| `Esc` | 退出移动/缩放 → 关闭弹窗 → 隐藏面板（按优先级） |
| `→` / `空格` / 左键 | 翻页 |
| `←` / 右键 | 上翻 |
| `[` / `]` | 字号减 / 加 |

移动 / 缩放模式下：移动鼠标即调整，**点击正文或按 Esc 结束**；进入模式后面板边缘高亮且保持唤醒。

## ⚙️ 设置说明

设置面板里的每一项：

| 设置 | 说明 |
| ---- | ---- |
| 字号 / 行高 | 8–48px / 1.0–3.0，实时生效 |
| 文字透明 / 背景透明 | 越低越隐蔽，背景透明为 0 时面板完全融入页面 |
| 字体 | 无衬线 / 衬线 / 仿宋 |
| 模式 | 翻页 / 滚动（滚动模式底部有进度条，可点击拖动） |
| 编码 | 自动识别 UTF-8 / GB18030，识别失败可手动指定 |
| 行数 | 固定显示行数 0–50（0 = 自动填满）；固定行数时面板高度由行数决定 |
| 头部 (Alt+H) | 隐藏后只剩文字条，宽度可缩到 60px |
| 失焦隐藏 | 开启后切标签页 / Alt+Tab / 最小化时立即隐藏（双屏用户建议关闭） |
| 主题 | 明亮 / 暗色 |
| 面板 | 移动 (Alt+V) / 缩放 (Alt+S) 的显式入口 |
| 书籍 | 加载 / 换书（仅支持 `.txt`） |

## 🛠️ 开发

源码在 `src/` 下按模块拆分（零依赖），`scripts/build.js` 拼接生成
`dist/loafing-reader.user.js`。构建与测试流程见 [docs/development.md](docs/development.md)。

```bash
node scripts/build.js     # 构建 dist
node tests/smoke.js       # Node 冒烟测试
node scripts/make-harness.js  # 重新内联 bundle 到浏览器测试页
```

版本历史见 [CHANGELOG.md](CHANGELOG.md)。
