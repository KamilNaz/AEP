// ============================================
// KOMUNIKATOR MANAGER - Communication System
// ============================================
/**
 * KomunikatorManager - System komunikacji operacyjnej
 * @namespace KomunikatorManager
 */
const KomunikatorManager = {
    messages: [],
    channels: ['WSZYSCY'],
    currentChannel: 'WSZYSCY',
    currentUser: 'Operator',
    onlineUsers: ['Operator', 'Dyspozytor', 'Dowódca', 'Koordynator'],

    /**
     * Inicjalizacja managera
     */
    init() {
        this.loadMessages();
        this.loadChannels();
        this.loadOnlineUsers();
    },

    /**
     * Ładowanie wiadomości z localStorage
     */
    loadMessages() {
        this.messages = Utils.loadFromLocalStorage('aep_messages') || [];
    },

    /**
     * Zapisywanie wiadomości do localStorage
     */
    saveMessages() {
        Utils.saveToLocalStorage('aep_messages', this.messages);
    },

    /**
     * Ładowanie kanałów (WSZYSCY + zespoły)
     */
    loadChannels() {
        this.channels = ['WSZYSCY'];

        // Załaduj zespoły jako kanały
        const teams = Utils.loadFromLocalStorage('aep_teams') || [];
        teams.forEach(team => {
            if (team.codename) {
                this.channels.push(team.codename);
            }
        });
    },

    /**
     * Ładowanie użytkowników online (symulacja)
     */
    loadOnlineUsers() {
        const savedUsers = Utils.loadFromLocalStorage('aep_online_users');
        if (savedUsers) {
            this.onlineUsers = savedUsers;
        }
    },

    /**
     * Główna funkcja renderująca widok
     */
    render() {
        this.init();

        // Sprawdź czy jesteśmy w kontekście mapy
        const mapContainer = document.getElementById('communicatorInMapContainer');
        const targetContainer = mapContainer || document.getElementById('mainContent');

        targetContainer.innerHTML = `
            <div class="komunikator-view">
                <!-- Header -->
                <div class="komunikator-header">
                    <h1 class="section-title">
                        <i class="fas fa-comments"></i> Komunikator Ogólny
                    </h1>
                    <div class="header-info">
                        <span class="status-indicator online">
                            <i class="fas fa-circle"></i> Online
                        </span>
                        <span class="current-user">
                            <i class="fas fa-user"></i> ${this.currentUser}
                        </span>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="komunikator-content">
                    <!-- Channels Sidebar -->
                    <div class="channels-sidebar">
                        <div class="sidebar-header">
                            <h3><i class="fas fa-hashtag"></i> Kanały</h3>
                        </div>
                        <div class="channels-list" id="channelsList">
                            ${this.renderChannelsList()}
                        </div>
                    </div>

                    <!-- Chat Area -->
                    <div class="chat-area">
                        <div class="chat-header">
                            <div class="channel-info">
                                <h2 id="currentChannelName">
                                    ${this.currentChannel === 'WSZYSCY' ?
                                        '<i class="fas fa-bullhorn"></i>' :
                                        '<i class="fas fa-users"></i>'}
                                    ${this.currentChannel}
                                </h2>
                                <span class="channel-subtitle">Komunikator ogólny</span>
                            </div>
                        </div>

                        <div class="messages-container" id="messagesContainer">
                            ${this.renderMessages()}
                        </div>

                        <div class="message-input-area">
                            <div class="input-toolbar">
                                <button class="btn-heban" id="hebanBtn" title="Wiadomość pilna HEBAN">
                                    <i class="fas fa-exclamation-triangle"></i> HEBAN
                                </button>
                                <button class="btn-location" id="locationBtn" title="Dołącz lokalizację">
                                    <i class="fas fa-map-marker-alt"></i>
                                </button>
                            </div>
                            <div class="input-container">
                                <textarea
                                    id="messageInput"
                                    placeholder="Wpisz wiadomość..."
                                    rows="2"
                                    maxlength="500"
                                ></textarea>
                                <button class="btn-send" id="sendBtn">
                                    <i class="fas fa-paper-plane"></i> Wyślij
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Online Users Sidebar -->
                    <div class="users-sidebar">
                        <div class="sidebar-header">
                            <h3><i class="fas fa-users"></i> Uczastnicy Online</h3>
                            <span class="users-count">${this.onlineUsers.length}</span>
                        </div>
                        <div class="users-list" id="usersList">
                            ${this.renderOnlineUsers()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
        this.scrollToBottom();
    },

    /**
     * Renderuj listę kanałów
     */
    renderChannelsList() {
        return this.channels.map(channel => `
            <div class="channel-item ${channel === this.currentChannel ? 'active' : ''}"
                 onclick="KomunikatorManager.switchChannel('${channel}')">
                <i class="fas ${channel === 'WSZYSCY' ? 'fa-bullhorn' : 'fa-users'}"></i>
                <span class="channel-name">${channel}</span>
                <span class="unread-badge" id="unread-${channel.replace(/\s+/g, '-')}">0</span>
            </div>
        `).join('');
    },

    /**
     * Renderuj wiadomości
     */
    renderMessages() {
        const filteredMessages = this.messages.filter(msg =>
            msg.channel === this.currentChannel ||
            (this.currentChannel === 'WSZYSCY' && msg.channel === 'WSZYSCY')
        );

        if (filteredMessages.length === 0) {
            return `
                <div class="empty-chat">
                    <i class="fas fa-comments"></i>
                    <p>Brak wiadomości</p>
                    <span>Wyślij pierwszą wiadomość na tym kanale</span>
                </div>
            `;
        }

        return filteredMessages.map(msg => this.renderMessage(msg)).join('');
    },

    /**
     * Renderuj pojedynczą wiadomość
     */
    renderMessage(msg) {
        const isHeban = msg.isHeban || false;
        const isOwn = msg.user === this.currentUser;
        const locationLink = msg.location ?
            `<div class="message-location" onclick="KomunikatorManager.showOnMap(${msg.location.lat}, ${msg.location.lng})">
                <i class="fas fa-map-marker-alt"></i> Lokalizacja na mapie
            </div>` : '';

        return `
            <div class="message ${isOwn ? 'own-message' : ''} ${isHeban ? 'heban-message' : ''}">
                <div class="message-header">
                    <span class="message-user">
                        <i class="fas fa-user-circle"></i> ${msg.user}
                    </span>
                    <span class="message-time">${this.formatTime(msg.timestamp)}</span>
                </div>
                <div class="message-content">
                    ${isHeban ? '<div class="heban-badge"><i class="fas fa-exclamation-triangle"></i> HEBAN</div>' : ''}
                    <p>${this.escapeHtml(msg.content)}</p>
                    ${locationLink}
                </div>
            </div>
        `;
    },

    /**
     * Renderuj użytkowników online
     */
    renderOnlineUsers() {
        return this.onlineUsers.map(user => `
            <div class="user-item ${user === this.currentUser ? 'current-user' : ''}">
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-info">
                    <span class="user-name">${user}</span>
                    <span class="user-status">
                        <i class="fas fa-circle"></i> Online
                    </span>
                </div>
            </div>
        `).join('');
    },

    /**
     * Przypisz event listenery
     */
    attachEventListeners() {
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');
        const hebanBtn = document.getElementById('hebanBtn');
        const locationBtn = document.getElementById('locationBtn');

        // Wysyłanie wiadomości
        sendBtn?.addEventListener('click', () => this.sendMessage());

        // Enter wysyła wiadomość (Shift+Enter nowa linia)
        messageInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Przycisk HEBAN
        hebanBtn?.addEventListener('click', () => this.toggleHeban());

        // Przycisk lokalizacji
        locationBtn?.addEventListener('click', () => this.attachLocation());
    },

    /**
     * Przełącz kanał
     */
    switchChannel(channelName) {
        this.currentChannel = channelName;
        this.render();
    },

    /**
     * Wyślij wiadomość
     */
    sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input?.value.trim();

        if (!content) return;

        const message = {
            id: Date.now(),
            channel: this.currentChannel,
            user: this.currentUser,
            content: content,
            timestamp: new Date().toISOString(),
            isHeban: this.isHebanMode || false,
            location: this.attachedLocation || null
        };

        this.messages.push(message);
        this.saveMessages();

        // Wyczyść input
        input.value = '';
        this.isHebanMode = false;
        this.attachedLocation = null;

        // Aktualizuj widok
        this.updateMessages();
        this.scrollToBottom();

        // Pokaż powiadomienie jeśli HEBAN
        if (message.isHeban) {
            this.showHebanNotification(message);
        }
    },

    /**
     * Przełącz tryb HEBAN
     */
    toggleHeban() {
        this.isHebanMode = !this.isHebanMode;
        const hebanBtn = document.getElementById('hebanBtn');

        if (this.isHebanMode) {
            hebanBtn.classList.add('active');
            this.showToast('Tryb HEBAN aktywny - wiadomość pilna!');
        } else {
            hebanBtn.classList.remove('active');
        }
    },

    /**
     * Dołącz lokalizację
     */
    attachLocation() {
        // Symulacja wyboru lokalizacji (w przyszłości integracja z mapą)
        this.attachedLocation = {
            lat: 52.2297,
            lng: 21.0122,
            label: 'Warszawa, Centrum'
        };

        const locationBtn = document.getElementById('locationBtn');
        locationBtn.classList.add('active');

        this.showToast('Lokalizacja dodana do wiadomości');
    },

    /**
     * Pokaż na mapie
     */
    showOnMap(lat, lng) {
        // Przejdź do mapy i wyśrodkuj na lokalizacji
        window.location.hash = '#mapa';

        // Po załadowaniu mapy, wyśrodkuj
        setTimeout(() => {
            if (window.MapManager && window.MapManager.map) {
                window.MapManager.map.setView([lat, lng], 15);

                // Dodaj tymczasowy marker
                const marker = L.marker([lat, lng]).addTo(window.MapManager.map);
                marker.bindPopup('Lokalizacja z komunikatora').openPopup();
            }
        }, 500);
    },

    /**
     * Pokaż powiadomienie HEBAN
     */
    showHebanNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'heban-notification';
        notification.innerHTML = `
            <div class="heban-notification-content">
                <div class="heban-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="heban-text">
                    <strong>WIADOMOŚĆ PILNA - HEBAN</strong>
                    <p>${message.user}: ${message.content}</p>
                </div>
                <button class="heban-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove po 10 sekundach
        setTimeout(() => {
            notification.remove();
        }, 10000);

        // Odtwórz dźwięk powiadomienia (opcjonalne)
        this.playNotificationSound();
    },

    /**
     * Odtwórz dźwięk powiadomienia
     */
    playNotificationSound() {
        // Prosty beep używając Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio notification not supported');
        }
    },

    /**
     * Aktualizuj tylko wiadomości (bez pełnego re-renderu)
     */
    updateMessages() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.innerHTML = this.renderMessages();
        }
    },

    /**
     * Przewiń do dołu
     */
    scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('messagesContainer');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    },

    /**
     * Formatuj czas
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'teraz';
        if (diffMins < 60) return `${diffMins} min temu`;

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${hours}:${minutes}`;
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Pokaż toast notification
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
