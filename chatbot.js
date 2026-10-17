
(function () {
    'use strict';

    if (window.DiginixChatbotLoaded) return;
    window.DiginixChatbotLoaded = true;

    const API_ENDPOINT = window.DIGINIX_CHAT_ENDPOINT || '/api/chat';
    const STORAGE_KEY = 'diginix_chat_history_v2';

    const FALLBACK_DATA = {
        advisor: "Dr. Nadeem Nazir (Chief Executive & Founding Strategic Advisor)",
        phone: "+92 300 7960300",
        phoneRaw: "+923007960300",
        email: "contact@diginix.com",
        studios: "Main Boulevard, Lahore & Global Engineering Studio, Faisalabad, Pakistan"
    };

    function loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveHistory(messages) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
        } catch {}
    }

    const styles = `
    .dnx-chat-root {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #171717;
        line-height: 1.5;
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
    }
    .dnx-chat-root *, .dnx-chat-root *::before, .dnx-chat-root *::after {
        box-sizing: border-box;
    }

    /* Floating Launcher Button */
    .dnx-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #171717;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, background-color 0.2s ease;
        outline: none;
    }
    .dnx-launcher:hover {
        transform: scale(1.06);
        background: #202020;
        box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(62, 207, 142, 0.35);
    }
    .dnx-launcher:active {
        transform: scale(0.95);
    }
    .dnx-badge-dot {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 14px;
        height: 14px;
        background: #3ecf8e;
        border: 2px solid #171717;
        border-radius: 50%;
    }
    .dnx-badge-pulse {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 14px;
        height: 14px;
        background: #3ecf8e;
        border-radius: 50%;
        animation: dnxPulse 2.2s infinite ease-out;
        opacity: 0.8;
    }
    @keyframes dnxPulse {
        0% { transform: scale(1); opacity: 0.8; }
        60% { transform: scale(1.8); opacity: 0; }
        100% { transform: scale(1.8); opacity: 0; }
    }

    /* Popup Modal Window */
    .dnx-window {
        position: fixed;
        bottom: 96px;
        right: 24px;
        z-index: 99999;
        width: 400px;
        max-width: calc(100vw - 32px);
        height: 600px;
        max-height: calc(100vh - 120px);
        background: #ffffff;
        border-radius: 16px;
        border: 1px solid #dfdfdf;
        box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: translateY(14px) scale(0.98);
        transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.24s;
    }
    .dnx-window.dnx-open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
    }

    /* Header */
    .dnx-header {
        background: #171717;
        color: #ffffff;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        flex-shrink: 0;
    }
    .dnx-brand {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .dnx-avatar {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: #242424;
        border: 1px solid rgba(62, 207, 142, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .dnx-title {
        font-size: 14.5px;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .dnx-subtitle {
        font-size: 11px;
        color: #9a9a9a;
    }
    .dnx-online-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #3ecf8e;
        display: inline-block;
    }
    .dnx-actions {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .dnx-icon-btn {
        background: transparent;
        border: none;
        color: #a0a0a0;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
    }
    .dnx-icon-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }

    /* Message list */
    .dnx-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        background: #ffffff;
        scroll-behavior: smooth;
    }
    .dnx-row {
        display: flex;
        gap: 10px;
        max-width: 88%;
        animation: dnxFade 0.2s ease-out;
    }
    @keyframes dnxFade {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .dnx-row.dnx-user {
        align-self: flex-end;
        flex-direction: row-reverse;
    }
    .dnx-row.dnx-bot {
        align-self: flex-start;
    }
    .dnx-msg-avatar {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: #171717;
        color: #3ecf8e;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;
    }
    .dnx-bubble {
        padding: 12px 14px;
        border-radius: 14px;
        font-size: 13.5px;
        line-height: 1.5;
        word-break: break-word;
    }
    .dnx-row.dnx-user .dnx-bubble {
        background: #171717;
        color: #ffffff;
        border-bottom-right-radius: 4px;
    }
    .dnx-row.dnx-bot .dnx-bubble {
        background: #fafafa;
        color: #171717;
        border: 1px solid #ededed;
        border-bottom-left-radius: 4px;
    }
    .dnx-bubble p {
        margin: 0 0 8px 0;
    }
    .dnx-bubble p:last-child {
        margin-bottom: 0;
    }
    .dnx-bubble strong {
        font-weight: 600;
        color: inherit;
    }
    .dnx-bubble ul {
        margin: 6px 0 6px 18px;
        padding: 0;
    }
    .dnx-bubble li {
        margin-bottom: 4px;
    }
    .dnx-bubble a {
        color: #24b47e;
        text-decoration: underline;
        font-weight: 500;
    }
    .dnx-time {
        font-size: 10px;
        color: #9a9a9a;
        margin-top: 4px;
        text-align: right;
    }
    .dnx-row.dnx-bot .dnx-time {
        text-align: left;
    }

    /* Typing indicator */
    .dnx-typing-wrap {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background: #fafafa;
        border: 1px solid #ededed;
        border-radius: 12px;
        align-self: flex-start;
    }
    .dnx-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #3ecf8e;
        animation: dnxDot 1.4s infinite ease-in-out both;
    }
    .dnx-dot:nth-child(1) { animation-delay: -0.32s; }
    .dnx-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes dnxDot {
        0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
        40% { transform: scale(1); opacity: 1; }
    }

    /* Suggestion pills */
    .dnx-chips {
        padding: 8px 16px 10px 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        background: #ffffff;
        border-top: 1px solid #f2f2f2;
        flex-shrink: 0;
    }
    .dnx-chip {
        background: #fafafa;
        border: 1px solid #dfdfdf;
        color: #212121;
        font-size: 11.5px;
        padding: 5px 10px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
    }
    .dnx-chip:hover {
        background: #171717;
        color: #ffffff;
        border-color: #171717;
    }

    /* Input dock */
    .dnx-footer {
        padding: 12px 16px 14px 16px;
        background: #ffffff;
        border-top: 1px solid #ededed;
        display: flex;
        gap: 8px;
        align-items: flex-end;
        flex-shrink: 0;
    }
    .dnx-input-box {
        flex: 1;
    }
    .dnx-input {
        width: 100%;
        max-height: 100px;
        min-height: 40px;
        padding: 10px 14px;
        font-size: 13.5px;
        line-height: 1.4;
        border: 1px solid #dfdfdf;
        border-radius: 12px;
        outline: none;
        resize: none;
        font-family: inherit;
        background: #fafafa;
        color: #171717;
        transition: border-color 0.15s, background 0.15s;
    }
    .dnx-input:focus {
        border-color: #3ecf8e;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.15);
    }
    .dnx-send-button {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: #3ecf8e;
        color: #171717;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        flex-shrink: 0;
    }
    .dnx-send-button:hover {
        background: #24b47e;
        color: #ffffff;
    }
    .dnx-send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .dnx-sources {
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px dashed #e5e5e5;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .dnx-sources-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #888888;
    }
    .dnx-source-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #171717;
        text-decoration: none;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 5px 9px;
        transition: all 0.15s ease;
    }
    .dnx-source-chip:hover {
        background: #f0fdf4;
        border-color: #3ecf8e;
        color: #15803d;
    }
    .dnx-source-chip svg {
        flex-shrink: 0;
        color: #3ecf8e;
    }

    @media (max-width: 480px) {
        .dnx-launcher {
            bottom: 16px;
            right: 16px;
            width: 54px;
            height: 54px;
        }
        .dnx-window {
            bottom: 80px;
            right: 12px;
            left: 12px;
            width: auto;
            max-width: none;
            height: calc(100vh - 100px);
        }
    }
    `;

    function renderMarkup(text) {
        if (!text) return '';
        let sanitized = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        sanitized = sanitized.replace(/\*(.*?)\*/g, '<em>$1</em>');
        sanitized = sanitized.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        const blocks = sanitized.split(/\n\n+/);
        return blocks.map(block => {
            const lines = block.split('\n');
            const hasList = lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('• '));
            if (hasList) {
                let html = '<ul>';
                lines.forEach(l => {
                    const clean = l.replace(/^[-•]\s*/, '').trim();
                    if (clean) html += `<li>${clean}</li>`;
                });
                html += '</ul>';
                return html;
            }
            return `<p>${lines.join('<br>')}</p>`;
        }).join('');
    }

    let isOpen = false;
    let isRequestActive = false;
    let messageLog = [];

    function getTimeLabel() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function appendMessage(role, text, time = getTimeLabel(), scroll = true, sources = []) {
        const list = document.getElementById('dnx-messages-list');
        if (!list) return;

        const row = document.createElement('div');
        row.className = `dnx-row ${role === 'user' ? 'dnx-user' : 'dnx-bot'}`;

        if (role === 'assistant') {
            const avatar = document.createElement('div');
            avatar.className = 'dnx-msg-avatar';
            avatar.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3"></path><rect x="4" y="6" width="16" height="13" rx="3"></rect><circle cx="9" cy="11.5" r="1.5" fill="#3ecf8e"></circle><circle cx="15" cy="11.5" r="1.5" fill="#3ecf8e"></circle><path d="M9 15.5h6"></path></svg>`;
            row.appendChild(avatar);
        }

        const bubbleContainer = document.createElement('div');
        bubbleContainer.style.display = 'flex';
        bubbleContainer.style.flexDirection = 'column';

        const bubble = document.createElement('div');
        bubble.className = 'dnx-bubble';
        bubble.innerHTML = renderMarkup(text);

        if (Array.isArray(sources) && sources.length > 0) {
            const sourcesDiv = document.createElement('div');
            sourcesDiv.className = 'dnx-sources';
            sourcesDiv.innerHTML = `<div class="dnx-sources-label">Relevant Articles:</div>`;
            sources.forEach(src => {
                if (src && src.title && src.url) {
                    const a = document.createElement('a');
                    a.className = 'dnx-source-chip';
                    a.href = src.url;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    const titleText = document.createTextNode(src.title);
                    a.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> `;
                    a.appendChild(titleText);
                    sourcesDiv.appendChild(a);
                }
            });
            bubble.appendChild(sourcesDiv);
        }

        bubbleContainer.appendChild(bubble);

        const timestamp = document.createElement('div');
        timestamp.className = 'dnx-time';
        timestamp.textContent = time;
        bubbleContainer.appendChild(timestamp);

        row.appendChild(bubbleContainer);
        list.appendChild(row);

        if (scroll) {
            list.scrollTop = list.scrollHeight;
        }
    }

    function toggleTyping(show) {
        const list = document.getElementById('dnx-messages-list');
        const existing = document.getElementById('dnx-typing-row');
        if (!show && existing) {
            existing.remove();
            return;
        }
        if (show && !existing && list) {
            const row = document.createElement('div');
            row.id = 'dnx-typing-row';
            row.className = 'dnx-row dnx-bot';

            const avatar = document.createElement('div');
            avatar.className = 'dnx-msg-avatar';
            avatar.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3"></path><rect x="4" y="6" width="16" height="13" rx="3"></rect><circle cx="9" cy="11.5" r="1.5" fill="#3ecf8e"></circle><circle cx="15" cy="11.5" r="1.5" fill="#3ecf8e"></circle><path d="M9 15.5h6"></path></svg>`;
            row.appendChild(avatar);

            const wrap = document.createElement('div');
            wrap.className = 'dnx-typing-wrap';
            wrap.innerHTML = '<span class="dnx-dot"></span><span class="dnx-dot"></span><span class="dnx-dot"></span>';

            row.appendChild(wrap);
            list.appendChild(row);
            list.scrollTop = list.scrollHeight;
        }
    }

    async function submitQuery(query) {
        try {
            const res = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: query,
                    history: messageLog.slice(-8)
                })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return {
                reply: data.reply || '',
                sources: Array.isArray(data.sources) ? data.sources : []
            };
        } catch {
            return {
                reply: `**DiginixIT Executive Advisory**\n\n` +
                    `Thank you for your inquiry. For direct advisory with **${FALLBACK_DATA.advisor}**, please connect:\n` +
                    `• Phone / WhatsApp: [${FALLBACK_DATA.phone}](tel:${FALLBACK_DATA.phoneRaw})\n` +
                    `• Email: [${FALLBACK_DATA.email}](mailto:${FALLBACK_DATA.email})\n` +
                    `• Studios: ${FALLBACK_DATA.studios}`,
                sources: []
            };
        }
    }

    async function handleSend(presetText) {
        const input = document.getElementById('dnx-input-field');
        const text = (presetText || (input ? input.value : '')).trim();
        if (!text || isRequestActive) return;

        if (input) {
            input.value = '';
            input.style.height = '40px';
        }

        isRequestActive = true;
        const sendBtn = document.getElementById('dnx-send-btn');
        if (sendBtn) sendBtn.disabled = true;

        const time = getTimeLabel();
        appendMessage('user', text, time);
        messageLog.push({ role: 'user', content: text, time });
        saveHistory(messageLog);

        toggleTyping(true);

        try {
            const result = await submitQuery(text);
            toggleTyping(false);

            const botTime = getTimeLabel();
            appendMessage('assistant', result.reply, botTime, true, result.sources);
            messageLog.push({ role: 'assistant', content: result.reply, time: botTime, sources: result.sources });
            saveHistory(messageLog);
        } catch {
            toggleTyping(false);
            appendMessage('assistant', `We could not complete your request at this moment. Reach out to ${FALLBACK_DATA.email}.`, getTimeLabel());
        } finally {
            isRequestActive = false;
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    function initWidget() {
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);

        const root = document.createElement('div');
        root.className = 'dnx-chat-root';

        root.innerHTML = `
            <!-- Floating Launcher (Bot Sign) -->
            <button class="dnx-launcher" id="dnx-launcher-btn" aria-label="Open Chat" title="DiginixIT AI Bot">
                <span class="dnx-badge-pulse"></span>
                <span class="dnx-badge-dot"></span>
                <svg id="dnx-icon-bot" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v3"></path>
                    <rect x="4" y="6" width="16" height="13" rx="3"></rect>
                    <circle cx="9" cy="11.5" r="1.5" fill="#3ecf8e"></circle>
                    <circle cx="15" cy="11.5" r="1.5" fill="#3ecf8e"></circle>
                    <path d="M9 15.5h6"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                </svg>
                <svg id="dnx-icon-close" style="display:none;" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <!-- Chat Window -->
            <div class="dnx-window" id="dnx-chat-window">
                <div class="dnx-header">
                    <div class="dnx-brand">
                        <div class="dnx-avatar" title="DiginixIT Bot">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2v3"></path>
                                <rect x="4" y="6" width="16" height="13" rx="3"></rect>
                                <circle cx="9" cy="11.5" r="1.5" fill="#3ecf8e"></circle>
                                <circle cx="15" cy="11.5" r="1.5" fill="#3ecf8e"></circle>
                                <path d="M9 15.5h6"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="dnx-title">
                                DIGINIXIT.
                                <span class="dnx-online-dot"></span>
                            </div>
                            <div class="dnx-subtitle">AI Assistant &amp; Strategic Advisory</div>
                        </div>
                    </div>
                    <div class="dnx-actions">
                        <button class="dnx-icon-btn" id="dnx-clear-btn" title="Clear Chat" aria-label="Clear Chat">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                        <button class="dnx-icon-btn" id="dnx-close-btn" title="Minimize" aria-label="Close">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="dnx-messages" id="dnx-messages-list"></div>

                <div class="dnx-chips" id="dnx-chips-bar">
                    <button class="dnx-chip" data-q="Who is Dr. Nadeem Nazir and what is his role?">Dr. Nadeem Nazir</button>
                    <button class="dnx-chip" data-q="What web engineering services does DiginixIT offer?">Web Engineering</button>
                    <button class="dnx-chip" data-q="How can DiginixIT optimize Core Web Vitals and SEO?">SEO & Vitals</button>
                    <button class="dnx-chip" data-q="Tell me about tech law & compliance consulting.">Law & Compliance</button>
                    <button class="dnx-chip" data-q="How to contact DiginixIT or book a consultation?">Contact & Quote</button>
                </div>

                <div class="dnx-footer">
                    <div class="dnx-input-box">
                        <textarea class="dnx-input" id="dnx-input-field" placeholder="Ask anything about DiginixIT & Dr. Nadeem Nazir..." rows="1"></textarea>
                    </div>
                    <button class="dnx-send-button" id="dnx-send-btn" aria-label="Send">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(root);

        const launcher = document.getElementById('dnx-launcher-btn');
        const win = document.getElementById('dnx-chat-window');
        const botIcon = document.getElementById('dnx-icon-bot');
        const closeIcon = document.getElementById('dnx-icon-close');
        const closeBtn = document.getElementById('dnx-close-btn');
        const clearBtn = document.getElementById('dnx-clear-btn');
        const inputField = document.getElementById('dnx-input-field');
        const sendBtn = document.getElementById('dnx-send-btn');
        const chipsBar = document.getElementById('dnx-chips-bar');

        function toggle(force) {
            isOpen = typeof force === 'boolean' ? force : !isOpen;
            if (isOpen) {
                win.classList.add('dnx-open');
                botIcon.style.display = 'none';
                closeIcon.style.display = 'block';
                setTimeout(() => inputField && inputField.focus(), 120);
            } else {
                win.classList.remove('dnx-open');
                botIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            }
        }

        launcher.addEventListener('click', () => toggle());
        closeBtn.addEventListener('click', () => toggle(false));

        clearBtn.addEventListener('click', () => {
            try {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem('diginix_chat_history');
            } catch {}
            messageLog = [];
            const list = document.getElementById('dnx-messages-list');
            if (list) list.innerHTML = '';
            const welcomeText = `Welcome to **DiginixIT**! How can I help you today?`;
            const t = getTimeLabel();
            messageLog = [{ role: 'assistant', content: welcomeText, time: t }];
            appendMessage('assistant', welcomeText, t, false);
            saveHistory(messageLog);
            if (inputField) {
                inputField.value = '';
                inputField.style.height = '40px';
                inputField.focus();
            }
        });

        sendBtn.addEventListener('click', () => handleSend());

        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        inputField.addEventListener('input', () => {
            inputField.style.height = 'auto';
            inputField.style.height = Math.min(inputField.scrollHeight, 100) + 'px';
        });

        chipsBar.addEventListener('click', (e) => {
            const btn = e.target.closest('.dnx-chip');
            if (btn && btn.dataset.q) {
                handleSend(btn.dataset.q);
            }
        });

        function renderWelcome() {
            const list = document.getElementById('dnx-messages-list');
            if (!list) return;
            list.innerHTML = '';
            const history = loadHistory();
            if (history.length > 0) {
                messageLog = history;
                history.forEach(m => appendMessage(m.role, m.content, m.time, false, m.sources || []));
            } else {
                const welcomeText = `Welcome to **DiginixIT**! How can I help you today?`;
                const t = getTimeLabel();
                messageLog = [{ role: 'assistant', content: welcomeText, time: t }];
                appendMessage('assistant', welcomeText, t, false);
                saveHistory(messageLog);
            }
        }

        renderWelcome();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

    window.DiginixChatbot = {
        open: () => document.getElementById('dnx-chat-window')?.classList.add('dnx-open'),
        close: () => document.getElementById('dnx-chat-window')?.classList.remove('dnx-open'),
        clear: () => document.getElementById('dnx-clear-btn')?.click(),
        send: handleSend
    };
})();
