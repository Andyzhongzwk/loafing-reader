// Styles injected via GM_addStyle. All colors are semi-transparent so the
// panel blends into whatever page is behind it.
const cssText = `
    :root {
        --lf-color: #222;
        --lf-toolbar-background-color: #aaa3;
        --lf-content-background-color: #fff3;
        --lf-btn-color: #00a;
        --lf-btn-color-hover: #00f;
        --lf-bg-alpha: 0.2;
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
        /* Must sit above common site chrome (sticky headers, modals). */
        z-index: 2147483647;
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
        cursor: pointer;
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
    /* Scroll mode: the content area becomes scrollable. */
    #lf-panel[lf-mode='scroll'] #lf-content {
        overflow-y: auto;
    }
    #lf-text {
        background-color: #f000;
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
        z-index: 2147483647;
    }

    /* Scroll-mode progress bar */
    #lf-progress {
        height: 5px;
        background: rgba(128, 128, 128, 0.25);
        cursor: pointer;
        position: relative;
    }
    #lf-progress-thumb {
        height: 100%;
        width: 0%;
        background: var(--lf-btn-color);
    }
    #lf-panel:not([lf-mode='scroll']) #lf-progress {
        display: none;
    }

    /* Popovers (settings / jump) */
    .lf-popover {
        position: absolute;
        top: 20px;
        right: 4px;
        background: rgba(250, 250, 250, 0.97);
        color: #222;
        border: 1px solid #999;
        border-radius: 4px;
        padding: 8px 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        z-index: 2;
        user-select: none;
    }
    [lf-theme='dark'] .lf-popover {
        background: rgba(40, 40, 40, 0.97);
        color: #ddd;
        border-color: #666;
    }
    .lf-set-row {
        display: flex;
        align-items: center;
        margin: 4px 0;
        white-space: nowrap;
    }
    .lf-set-label {
        width: 4.5em;
    }
    .lf-set-value {
        width: 3em;
        text-align: right;
    }
    .lf-set-choice {
        color: var(--lf-btn-color);
        cursor: pointer;
        margin-right: 0.8em;
    }
    .lf-set-choice.active {
        color: var(--lf-btn-color-hover);
        font-weight: bold;
    }

    /* Jump popover */
    #lf-jump-pop input {
        width: 5em;
        font-size: 12px;
    }

    /* Toasts */
    #lf-toasts {
        position: absolute;
        bottom: 1em;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
    }
    .lf-toast-item {
        background: rgba(0, 0, 0, 0.65);
        color: #fff;
        padding: 2px 10px;
        border-radius: 3px;
        margin-top: 4px;
    }
`;
