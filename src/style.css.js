// Styles injected via GM_addStyle. All colors are semi-transparent so the
// panel blends into whatever page is behind it.
const cssText = `
    :root {
        --lf-color: #222;
        --lf-toolbar-background-color: #aaa3;
        --lf-content-background-color: #fff3;
        --lf-btn-color: #00a;
        --lf-btn-color-hover: #00f;
    }
    [lf-theme='dark'] {
        --lf-color: #ddd;
        --lf-toolbar-background-color: #5553;
        --lf-content-background-color: #2223;
        --lf-btn-color: #aa0;
        --lf-btn-color-hover: #ff0;
    }
    .loafing-reader {
        margin: 0; padding: 0;
        box-sizing: content-box;
        font-size: 12px;
        color: var(--lf-color);
    }
    #lf-panel {
        height: 27em;
        width: 48em;
        background-color: #f000;
        top: 50%; left: 50%;
        z-index: 10;
        position: fixed;
        display: flex;
        flex-flow: column nowrap;
        user-select: none;
        backdrop-filter: blur(1px);
    }
    #lf-toolbar {
        background: var(--lf-toolbar-background-color);
        width: 100%; height: 18px;
    }
    .lf-item {
        padding: 0 0 0 1em;
    }
    .lf-btn {
        color: var(--lf-btn-color);
    }
    .lf-btn:hover {
        color: var(--lf-btn-color-hover);
    }
    #lf-content {
        background-color: var(--lf-content-background-color);
        flex: 1;
        padding: 0 0.5em;
        overflow: hidden;
    }
    #lf-text {
        background-color: #f000,
        position: relative;
    }
    .lf-hidden {
        display: none;
    }
    #lf-trigger {
        position: fixed;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        background: linear-gradient(-45deg, transparent 14px, pink 0);
        z-index: 16777271;
    }
`;
