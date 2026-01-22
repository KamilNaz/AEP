// ============================================
// SETTINGS MANAGER
// ============================================
/**
 * SettingsManager - Zarządzanie ustawieniami aplikacji
 * @namespace SettingsManager
 */
const SettingsManager = {
    settings: {
        theme: 'dark', // 'dark' | 'light'
        profile: {
            name: '',
            unit: '',
            rank: '',
            serviceNumber: ''
        },
        defaultUnit: 'OŻW Elbląg',
        contactEmail: 'admin@aep.example.com'
    },

    // Lista jednostek JŻW
    UNITS: [
        'KG ŻW',
        'OŻW Elbląg',
        'OŻW Bydgoszcz',
        'OŻW Szczecin',
        'OŻW Żagań',
        'OŻW Kraków',
        'OŻW Łódź',
        'OŻW Lublin'
    ],

    // Lista stopni służbowych
    RANKS: [
        'szer.',
        'st. szer.',
        'kpr.',
        'st. kpr.',
        'plut.',
        'plut. pchor.',
        'sierż.',
        'st. sierż.',
        'sierż. sztab.',
        'młodszy chor.',
        'chor.',
        'st. chor.',
        'chor. sztab.',
        'młodszy ppor.',
        'ppor.',
        'por.',
        'kpt.',
        'mjr',
        'ppłk',
        'płk',
        'gen. bryg.',
        'gen. dyw.',
        'gen. broni'
    ],

    /**
     * Inicjalizacja managera
     */
    init() {
        this.loadSettings();
        this.applyTheme();
    },

    /**
     * Załaduj ustawienia z localStorage
     */
    loadSettings() {
        const saved = Utils.loadFromLocalStorage('aep_settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
        }
    },

    /**
     * Zapisz ustawienia do localStorage
     */
    saveSettings() {
        Utils.saveToLocalStorage('aep_settings', this.settings);
        this.showToast('Ustawienia zapisane pomyślnie', 'success');
    },

    /**
     * Zastosuj motyw
     */
    applyTheme() {
        const root = document.documentElement;
        if (this.settings.theme === 'light') {
            root.setAttribute('data-theme', 'light');
        } else {
            root.removeAttribute('data-theme');
        }
    },

    /**
     * Renderuj widok ustawień
     */
    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="settings-view">
                <div class="settings-header">
                    <h1 class="section-title">
                        <i class="fas fa-cog"></i> Ustawienia
                    </h1>
                    <p class="section-subtitle">Zarządzaj preferencjami i konfiguracją systemu</p>
                </div>

                <div class="settings-container">
                    <!-- Motyw -->
                    <div class="settings-card">
                        <div class="settings-card-header">
                            <i class="fas fa-palette"></i>
                            <h2>Motyw</h2>
                        </div>
                        <div class="settings-card-body">
                            <p class="settings-description">Wybierz wygląd aplikacji</p>
                            <div class="theme-selector">
                                <div class="theme-option ${this.settings.theme === 'dark' ? 'active' : ''}"
                                     data-theme="dark"
                                     onclick="SettingsManager.setTheme('dark')">
                                    <div class="theme-preview theme-dark">
                                        <div class="theme-preview-header"></div>
                                        <div class="theme-preview-sidebar"></div>
                                        <div class="theme-preview-content"></div>
                                    </div>
                                    <div class="theme-label">
                                        <i class="fas fa-moon"></i>
                                        <span>Ciemny</span>
                                    </div>
                                </div>
                                <div class="theme-option ${this.settings.theme === 'light' ? 'active' : ''}"
                                     data-theme="light"
                                     onclick="SettingsManager.setTheme('light')">
                                    <div class="theme-preview theme-light">
                                        <div class="theme-preview-header"></div>
                                        <div class="theme-preview-sidebar"></div>
                                        <div class="theme-preview-content"></div>
                                    </div>
                                    <div class="theme-label">
                                        <i class="fas fa-sun"></i>
                                        <span>Jasny</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Profil użytkownika -->
                    <div class="settings-card">
                        <div class="settings-card-header">
                            <i class="fas fa-user"></i>
                            <h2>Profil użytkownika</h2>
                        </div>
                        <div class="settings-card-body">
                            <p class="settings-description">Informacje o użytkowniku systemu</p>
                            <div class="form-group">
                                <label>Imię i nazwisko</label>
                                <input type="text"
                                       id="profileName"
                                       value="${this.settings.profile.name || ''}"
                                       placeholder="np. Jan Kowalski"
                                       class="settings-input">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Stopień służbowy</label>
                                    <select id="profileRank" class="settings-select">
                                        <option value="">-- Wybierz --</option>
                                        ${this.RANKS.map(rank => `
                                            <option value="${rank}" ${this.settings.profile.rank === rank ? 'selected' : ''}>
                                                ${rank}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Numer służbowy</label>
                                    <input type="text"
                                           id="profileServiceNumber"
                                           value="${this.settings.profile.serviceNumber || ''}"
                                           placeholder="np. 12345"
                                           class="settings-input">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Jednostka organizacyjna</label>
                                <select id="profileUnit" class="settings-select">
                                    <option value="">-- Wybierz --</option>
                                    ${this.UNITS.map(unit => `
                                        <option value="${unit}" ${this.settings.profile.unit === unit ? 'selected' : ''}>
                                            ${unit}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- JŻW Prowadząca -->
                    <div class="settings-card">
                        <div class="settings-card-header">
                            <i class="fas fa-building-shield"></i>
                            <h2>JŻW Prowadząca (domyślna)</h2>
                        </div>
                        <div class="settings-card-body">
                            <p class="settings-description">Domyślna jednostka żandarmerii wojskowej dla nowych wpisów</p>
                            <div class="form-group">
                                <label>Wybierz jednostkę</label>
                                <select id="defaultUnit" class="settings-select">
                                    ${this.UNITS.map(unit => `
                                        <option value="${unit}" ${this.settings.defaultUnit === unit ? 'selected' : ''}>
                                            ${unit}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Kontakt do administratora -->
                    <div class="settings-card">
                        <div class="settings-card-header">
                            <i class="fas fa-envelope"></i>
                            <h2>Kontakt do administratora</h2>
                        </div>
                        <div class="settings-card-body">
                            <p class="settings-description">Masz problem lub pytanie? Skontaktuj się z administratorem systemu</p>
                            <form id="contactForm" class="contact-form" onsubmit="SettingsManager.sendContact(event)">
                                <div class="form-group">
                                    <label>Temat wiadomości *</label>
                                    <input type="text"
                                           id="contactSubject"
                                           required
                                           placeholder="np. Problem z eksportem danych"
                                           class="settings-input">
                                </div>
                                <div class="form-group">
                                    <label>Treść wiadomości *</label>
                                    <textarea id="contactMessage"
                                              required
                                              rows="5"
                                              placeholder="Opisz swój problem lub pytanie..."
                                              class="settings-textarea"></textarea>
                                </div>
                                <div class="contact-info">
                                    <i class="fas fa-info-circle"></i>
                                    <span>Email administratora: <strong>${this.settings.contactEmail}</strong></span>
                                </div>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-paper-plane"></i> Wyślij wiadomość
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Przyciski akcji -->
                    <div class="settings-actions">
                        <button class="btn-primary btn-large" onclick="SettingsManager.saveAllSettings()">
                            <i class="fas fa-save"></i> Zapisz wszystkie ustawienia
                        </button>
                        <button class="btn-secondary btn-large" onclick="SettingsManager.resetSettings()">
                            <i class="fas fa-undo"></i> Przywróć domyślne
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Ustaw motyw
     */
    setTheme(theme) {
        this.settings.theme = theme;
        this.applyTheme();

        // Zapisz ustawienia do localStorage
        Utils.saveToLocalStorage('aep_settings', this.settings);

        // Aktualizuj UI
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector(`.theme-option[data-theme="${theme}"]`)?.classList.add('active');

        this.showToast(`Motyw zmieniony na ${theme === 'dark' ? 'ciemny' : 'jasny'}`, 'success');
    },

    /**
     * Zapisz wszystkie ustawienia
     */
    saveAllSettings() {
        // Profil
        this.settings.profile.name = document.getElementById('profileName')?.value || '';
        this.settings.profile.rank = document.getElementById('profileRank')?.value || '';
        this.settings.profile.serviceNumber = document.getElementById('profileServiceNumber')?.value || '';
        this.settings.profile.unit = document.getElementById('profileUnit')?.value || '';

        // JŻW Prowadząca
        this.settings.defaultUnit = document.getElementById('defaultUnit')?.value || 'OŻW Elbląg';

        this.saveSettings();
    },

    /**
     * Przywróć ustawienia domyślne
     */
    resetSettings() {
        if (!confirm('Czy na pewno chcesz przywrócić ustawienia domyślne? Ta operacja jest nieodwracalna.')) {
            return;
        }

        this.settings = {
            theme: 'dark',
            profile: {
                name: '',
                unit: '',
                rank: '',
                serviceNumber: ''
            },
            defaultUnit: 'OŻW Elbląg',
            contactEmail: 'admin@aep.example.com'
        };

        this.saveSettings();
        this.applyTheme();
        this.render();
        this.showToast('Ustawienia przywrócone do domyślnych', 'success');
    },

    /**
     * Wyślij wiadomość do administratora
     */
    sendContact(event) {
        event.preventDefault();

        const subject = document.getElementById('contactSubject')?.value || '';
        const message = document.getElementById('contactMessage')?.value || '';

        if (!subject || !message) {
            this.showToast('Wypełnij wszystkie wymagane pola', 'error');
            return;
        }

        // Przygotuj mailto link
        const body = `
Temat: ${subject}

Treść wiadomości:
${message}

---
Dane użytkownika:
Imię i nazwisko: ${this.settings.profile.name || 'Nie podano'}
Stopień: ${this.settings.profile.rank || 'Nie podano'}
Jednostka: ${this.settings.profile.unit || 'Nie podano'}
Numer służbowy: ${this.settings.profile.serviceNumber || 'Nie podano'}
        `.trim();

        const mailtoLink = `mailto:${this.settings.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Otwórz domyślnego klienta email
        window.location.href = mailtoLink;

        // Wyczyść formularz
        document.getElementById('contactForm')?.reset();

        this.showToast('Otwarto klienta email. Wyślij wiadomość z poziomu swojego programu pocztowego.', 'info');
    },

    /**
     * Pokaż toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
