// =====================================================
//  LORD AI — Real AI Chat System (script.js)
//  Version   : 3.0 — Real Brain Edition
//  Author    : عبدالله (LORD) — 19 Years Old
//  License   : Private — Unlimited Power
// =====================================================

// ==================== STATE ====================
const STATE = {
    isDark: true,
    isProcessing: false,
    conversations: [],
    currentConvId: 1,
    convCounter: 1,
    maxConvHistory: 50,
};

// ==================== DOM REFS ====================
const DOM = {};

function initDOM() {
    DOM.chatContainer = document.getElementById('chatContainer');
    DOM.welcomeScreen = document.getElementById('welcomeScreen');
    DOM.chatInput = document.getElementById('chatInput');
    DOM.sendBtn = document.getElementById('sendBtn');
    DOM.sidebar = document.getElementById('sidebar');
    DOM.sidebarBackdrop = document.getElementById('sidebarBackdrop');
    DOM.convList = document.getElementById('convList');
    DOM.themeLabel = document.getElementById('themeLabel');
    DOM.statusText = document.getElementById('statusText');
    DOM.msgCount = document.getElementById('msgCount');
    DOM.devModal = document.getElementById('devModal');
    DOM.devModalName = document.getElementById('devModalName');
}

// ==================== UTILITY ====================
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
    setTimeout(() => {
        if (DOM.chatContainer) {
            DOM.chatContainer.scrollTop = DOM.chatContainer.scrollHeight;
        }
    }, 60);
}

function getTime() {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}

function getFullDate() {
    const d = new Date();
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const day = days[d.getDay()];
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${day}، ${h}:${m}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 7);
}

// ==================== THEME ====================
function toggleTheme() {
    STATE.isDark = !STATE.isDark;

    if (STATE.isDark) {
        document.body.classList.remove('light-mode');
        if (DOM.themeLabel) DOM.themeLabel.textContent = 'الوضع الداكن';
        updateThemeIcons('🌙');
        localStorage.setItem('lord-theme', 'dark');
    } else {
        document.body.classList.add('light-mode');
        if (DOM.themeLabel) DOM.themeLabel.textContent = 'الوضع الفاتح';
        updateThemeIcons('☀️');
        localStorage.setItem('lord-theme', 'light');
    }
}

function updateThemeIcons(icon) {
    document.querySelectorAll('.theme-toggle-icon').forEach(el => {
        el.textContent = icon;
    });
}

function loadSavedTheme() {
    const saved = localStorage.getItem('lord-theme');
    if (saved === 'light') {
        STATE.isDark = false;
        document.body.classList.add('light-mode');
        if (DOM.themeLabel) DOM.themeLabel.textContent = 'الوضع الفاتح';
        updateThemeIcons('☀️');
    } else {
        STATE.isDark = true;
        document.body.classList.remove('light-mode');
        if (DOM.themeLabel) DOM.themeLabel.textContent = 'الوضع الداكن';
        updateThemeIcons('🌙');
    }
}

// ==================== SIDEBAR ====================
function toggleSidebar() {
    if (DOM.sidebar) DOM.sidebar.classList.toggle('open');
    if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.toggle('show');
    document.body.style.overflow = (DOM.sidebar && DOM.sidebar.classList.contains('open')) ? 'hidden' : '';
}

document.addEventListener('DOMContentLoaded', () => {
    if (DOM.sidebarBackdrop) {
        DOM.sidebarBackdrop.addEventListener('click', toggleSidebar);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (DOM.sidebar && DOM.sidebar.classList.contains('open')) toggleSidebar();
        if (DOM.devModal && DOM.devModal.classList.contains('show')) closeDevModal();
    }
});

// ==================== CONVERSATIONS ====================
function addConversation(name) {
    STATE.convCounter++;
    const id = STATE.convCounter;
    const conv = { id, name, messages: [], createdAt: new Date().toISOString() };
    STATE.conversations.unshift(conv);
    STATE.currentConvId = id;

    if (STATE.conversations.length > STATE.maxConvHistory) {
        STATE.conversations = STATE.conversations.slice(0, STATE.maxConvHistory);
    }

    renderConversations();
    saveConversations();
    return conv;
}

function renderConversations() {
    if (!DOM.convList) return;
    DOM.convList.innerHTML = '';

    STATE.conversations.forEach(conv => {
        const div = document.createElement('div');
        div.className = `conv-item${conv.id === STATE.currentConvId ? ' active' : ''}`;
        div.dataset.id = conv.id;

        const lastMsg = conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : '';
        const preview = lastMsg.length > 30 ? lastMsg.substring(0, 30) + '...' : lastMsg || conv.name;

        div.innerHTML = `
            <span class="icon">💬</span>
            <span class="conv-name">${preview}</span>
        `;

        div.addEventListener('click', () => switchConversation(conv.id));
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm(`حذف "${conv.name}"؟`)) {
                deleteConversation(conv.id);
            }
        });

        DOM.convList.appendChild(div);
    });

    if (STATE.conversations.length === 0) {
        const defaultConv = { id: 1, name: 'المحادثة الحالية', messages: [] };
        STATE.conversations.push(defaultConv);
        STATE.currentConvId = 1;
        renderConversations();
    }
}

function deleteConversation(id) {
    if (STATE.conversations.length <= 1) {
        newChat();
        return;
    }

    const idx = STATE.conversations.findIndex(c => c.id === id);
    STATE.conversations = STATE.conversations.filter(c => c.id !== id);

    if (STATE.currentConvId === id) {
        const nextConv = STATE.conversations[Math.min(idx, STATE.conversations.length - 1)];
        STATE.currentConvId = nextConv.id;
        switchConversation(nextConv.id);
    }

    renderConversations();
    saveConversations();
}

function switchConversation(id) {
    const conv = STATE.conversations.find(c => c.id === id);
    if (!conv) return;

    STATE.currentConvId = id;
    renderConversations();
    clearChatArea();

    if (conv.messages.length === 0) {
        if (DOM.welcomeScreen) DOM.welcomeScreen.style.display = 'flex';
        if (DOM.statusText) DOM.statusText.textContent = 'LORD AI';
        if (DOM.msgCount) DOM.msgCount.textContent = '0 رسائل';
    } else {
        if (DOM.welcomeScreen) DOM.welcomeScreen.style.display = 'none';
        conv.messages.forEach(msg => {
            renderMessage(msg.text, msg.role, msg.time);
        });
        if (DOM.statusText) DOM.statusText.textContent = `${conv.messages.length} رسائل`;
        if (DOM.msgCount) DOM.msgCount.textContent = `${conv.messages.length} رسائل`;
        scrollToBottom();
    }

    if (window.innerWidth <= 768) toggleSidebar();
    if (DOM.chatInput) DOM.chatInput.focus();
}

function getCurrentConv() {
    return STATE.conversations.find(c => c.id === STATE.currentConvId) || STATE.conversations[0];
}

function clearChatArea() {
    if (!DOM.chatContainer) return;
    const items = DOM.chatContainer.querySelectorAll('.message, .typing-indicator, .welcome-logo, .welcome-title, .welcome-sub, .welcome-features, .welcome-screen');
    items.forEach(el => el.remove());
}

// ==================== NEW CHAT ====================
function newChat() {
    const name = `محادثة ${STATE.convCounter + 1}`;
    addConversation(name);

    clearChatArea();
    if (DOM.welcomeScreen) DOM.welcomeScreen.style.display = 'flex';
    if (DOM.chatInput) {
        DOM.chatInput.value = '';
        autoResize(DOM.chatInput);
    }
    STATE.isProcessing = false;
    if (DOM.sendBtn) DOM.sendBtn.disabled = false;
    if (DOM.statusText) DOM.statusText.textContent = 'LORD AI';
    if (DOM.msgCount) DOM.msgCount.textContent = '0 رسائل';

    if (window.innerWidth <= 768) {
        if (DOM.sidebar) DOM.sidebar.classList.remove('open');
        if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.remove('show');
        document.body.style.overflow = '';
    }

    if (DOM.chatInput) DOM.chatInput.focus();
}

// ==================== DEVELOPER MODAL ====================
function openDevModal() {
    if (DOM.devModal) DOM.devModal.classList.add('show');
}

function closeDevModal() {
    if (DOM.devModal) DOM.devModal.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
    if (DOM.devModal) {
        DOM.devModal.addEventListener('click', function(e) {
            if (e.target === this) closeDevModal();
        });
    }
});

// ==================== SEND MESSAGE ====================
function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const text = DOM.chatInput ? DOM.chatInput.value.trim() : '';
    if (!text || STATE.isProcessing) return;

    // Hide welcome
    const welcome = DOM.chatContainer ? DOM.chatContainer.querySelector('.welcome-screen') : null;
    if (welcome) welcome.style.display = 'none';
    if (DOM.welcomeScreen) DOM.welcomeScreen.style.display = 'none';

    // Add user message
    addMessage(text, 'user');
    if (DOM.chatInput) {
        DOM.chatInput.value = '';
        autoResize(DOM.chatInput);
    }
    STATE.isProcessing = true;
    if (DOM.sendBtn) DOM.sendBtn.disabled = true;
    if (DOM.statusText) DOM.statusText.textContent = 'جارٍ التفكير... 🤔';

    // Show typing indicator
    showTypingIndicator();

    try {
        const formData = new FormData();
        formData.append('message', text);
        formData.append('conversation_id', STATE.currentConvId);

        const res = await fetch('api.php', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        removeTypingIndicator();

        const reply = data.reply || '❌ حدث خطأ في الاستجابة';
        addMessage(reply, 'ai');

        // Save to conversation
        const conv = getCurrentConv();
        if (conv) {
            conv.messages.push(
                { text, role: 'user', time: getTime() },
                { text: reply, role: 'ai', time: getTime() }
            );
            saveConversations();
            renderConversations();
            if (DOM.statusText) DOM.statusText.textContent = `${conv.messages.length} رسائل`;
            if (DOM.msgCount) DOM.msgCount.textContent = `${conv.messages.length} رسائل`;
        }
    } catch (err) {
        removeTypingIndicator();
        addMessage('❌ فشل الاتصال بالخادم. تأكد من تشغيل PHP و Ollama.', 'ai');
    }

    STATE.isProcessing = false;
    if (DOM.sendBtn) DOM.sendBtn.disabled = false;
    scrollToBottom();
}

function addMessage(text, role) {
    if (!DOM.chatContainer) return;

    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.dataset.id = generateId();

    const avatar = role === 'user' ? 'U' : 'L';
    const time = getTime();

    div.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div>
            <div class="message-bubble">${formatMessage(text)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;

    DOM.chatContainer.appendChild(div);
    scrollToBottom();
}

function renderMessage(text, role, time) {
    if (!DOM.chatContainer) return;

    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.dataset.id = generateId();

    const avatar = role === 'user' ? 'U' : 'L';

    div.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div>
            <div class="message-bubble">${formatMessage(text)}</div>
            <div class="message-time">${time || getTime()}</div>
        </div>
    `;

    DOM.chatContainer.appendChild(div);
}

function showTypingIndicator() {
    if (!DOM.chatContainer) return;

    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'typingIndicator';
    div.innerHTML = `
        <div class="message-avatar" style="background:linear-gradient(135deg,var(--accent),#a855f7);color:#fff;font-weight:700;font-size:14px;">L</div>
        <div class="dots">
            <span></span><span></span><span></span>
        </div>
    `;
    DOM.chatContainer.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

function formatMessage(text) {
    if (!text) return '';

    // Headers
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Code blocks
    text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
        const cleanCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre><code class="lang-${lang || 'code'}">${cleanCode}</code></pre>`;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Lists
    text = text.replace(/^\- (.+)$/gm, '<li style="margin-right:20px;list-style-type:disc;">$1</li>');
    text = text.replace(/^\d+\. (.+)$/gm, '<li style="margin-right:20px;list-style-type:decimal;">$1</li>');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
}

// ==================== LOCAL STORAGE ====================
function saveConversations() {
    try {
        const data = {
            conversations: STATE.conversations,
            currentConvId: STATE.currentConvId,
            convCounter: STATE.convCounter,
        };
        localStorage.setItem('lord-conversations', JSON.stringify(data));
    } catch (e) {
        console.warn('⚠️ Could not save conversations:', e.message);
    }
}

function loadConversations() {
    try {
        const saved = localStorage.getItem('lord-conversations');
        if (saved) {
            const data = JSON.parse(saved);
            STATE.conversations = data.conversations || [];
            STATE.currentConvId = data.currentConvId || 1;
            STATE.convCounter = data.convCounter || 1;
            return true;
        }
    } catch (e) {
        console.warn('⚠️ Could not load conversations:', e.message);
    }
    return false;
}

// ==================== SUGGESTED QUESTIONS ====================
function insertSuggestion(text) {
    if (DOM.chatInput) {
        DOM.chatInput.value = text;
        autoResize(DOM.chatInput);
        DOM.chatInput.focus();
    }
}

// ==================== QUICK ACTIONS ====================
function clearAllConversations() {
    if (STATE.conversations.length === 0) return;
    if (confirm('⚠️ مسح كل المحادثات؟ هذا لا يمكن التراجع عنه.')) {
        STATE.conversations = [];
        STATE.convCounter = 0;
        localStorage.removeItem('lord-conversations');
        newChat();
    }
}

function exportConversations() {
    const data = JSON.stringify(STATE.conversations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lord-conversations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importConversations() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data)) {
                    STATE.conversations = data;
                    STATE.convCounter = data.length;
                    STATE.currentConvId = data[0]?.id || 1;
                    saveConversations();
                    renderConversations();
                    switchConversation(STATE.currentConvId);
                    alert('✅ تم استيراد المحادثات بنجاح!');
                }
            } catch (err) {
                alert('❌ فشل استيراد الملف. تأكد من أنه ملف JSON صحيح.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ==================== INIT ====================
function init() {
    initDOM();
    loadSavedTheme();

    const loaded = loadConversations();

    if (loaded && STATE.conversations.length > 0) {
        renderConversations();
        switchConversation(STATE.currentConvId);
    } else {
        const defaultConv = { id: 1, name: 'المحادثة الحالية', messages: [] };
        STATE.conversations.push(defaultConv);
        STATE.currentConvId = 1;
        renderConversations();
        if (DOM.welcomeScreen) DOM.welcomeScreen.style.display = 'flex';
    }

    if (DOM.devModalName) {
        DOM.devModalName.textContent = 'عبدالله (LORD) — 19 سنة';
    }

    if (DOM.chatInput) {
        DOM.chatInput.addEventListener('keydown', handleKey);
        DOM.chatInput.focus();
    }

    if (DOM.sendBtn) {
        DOM.sendBtn.addEventListener('click', sendMessage);
    }

    // Auto-save every 30 seconds
    setInterval(saveConversations, 30000);

    console.log('👑 LORD AI v3.0 — Real Brain Edition');
    console.log('👤 Developed by: عبدالله (LORD)');
    console.log('🎂 Age: 19');
    console.log('⚡ Powered by Ollama + DeepSeek/Llama');
    console.log('🔥 Ready for action.');
}

document.addEventListener('DOMContentLoaded', init);