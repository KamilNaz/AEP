// ============================================
// ZESPOLY MANAGER - Team Management System
// ============================================
/**
 * ZespolyManager - System zarządzania zespołami operacyjnymi
 * @namespace ZespolyManager
 */
const ZespolyManager = {
    teams: [],
    filteredTeams: [],
    currentFilter: {
        type: 'all',
        status: 'all',
        search: ''
    },

    // Typy zespołów
    TEAM_TYPES: {
        'patrol_zmotoryzowany': {
            label: 'Patrol zmotoryzowany',
            icon: 'fa-car-side',
            color: '#3b82f6'
        },
        'patrol_interwencyjny': {
            label: 'Patrol interwencyjny',
            icon: 'fa-car-burst',
            color: '#ef4444'
        },
        'patrol_pieszy': {
            label: 'Patrol pieszy',
            icon: 'fa-person-walking',
            color: '#10b981'
        },
        'patrol_motorowodny': {
            label: 'Patrol motorowodny',
            icon: 'fa-ship',
            color: '#06b6d4'
        },
        'patrol_ruchu': {
            label: 'Patrol ruchu drogowego',
            icon: 'fa-traffic-light',
            color: '#f59e0b'
        },
        'konwoj': {
            label: 'Konwój',
            icon: 'fa-arrow-right-arrow-left',
            color: '#8b5cf6'
        }
    },

    // Statusy zespołów
    TEAM_STATUSES: {
        'w_drodze': {
            label: 'W DRODZE',
            color: '#f59e0b',
            bgColor: '#fef3c7'
        },
        'na_miejscu': {
            label: 'NA MIEJSCU',
            color: '#10b981',
            bgColor: '#d1fae5'
        },
        'zakonczono': {
            label: 'ZAKOŃCZONO',
            color: '#6b7280',
            bgColor: '#f3f4f6'
        },
        'sprawdzanie_sektora': {
            label: 'SPRAWDZANIE SEKTORA',
            color: '#ef4444',
            bgColor: '#fee2e2'
        }
    },

    /**
     * Inicjalizacja managera
     */
    init() {
        this.loadTeams();
    },

    /**
     * Ładowanie zespołów z localStorage
     */
    loadTeams() {
        this.teams = Utils.loadFromLocalStorage('aep_teams') || [];
        this.filteredTeams = [...this.teams];
    },

    /**
     * Zapisywanie zespołów do localStorage
     */
    saveTeams() {
        Utils.saveToLocalStorage('aep_teams', this.teams);
    },

    /**
     * Główna funkcja renderująca widok
     */
    render() {
        this.loadTeams();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="teams-view">
                <div class="teams-header">
                    <h1 class="section-title">
                        <i class="fas fa-users"></i> Zespoły
                    </h1>
                    <div class="header-actions">
                        <button class="btn-primary" id="addTeamBtn">
                            <i class="fas fa-plus"></i> Dodaj nowy zespół
                        </button>
                    </div>
                </div>

                <div class="teams-filters">
                    <div class="filter-group">
                        <label>Typ zespołu:</label>
                        <select id="filterTeamType" class="filter-select">
                            <option value="all">Wszystkie</option>
                            ${Object.entries(this.TEAM_TYPES).map(([key, type]) => `
                                <option value="${key}">${type.label}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Status:</label>
                        <select id="filterTeamStatus" class="filter-select">
                            <option value="all">Wszystkie</option>
                            ${Object.entries(this.TEAM_STATUSES).map(([key, status]) => `
                                <option value="${key}">${status.label}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Szukaj:</label>
                        <input type="text" id="filterTeamSearch" class="filter-input" placeholder="Kryptonim, sektor, nawigator..." />
                    </div>

                    <button class="btn-secondary" id="clearFiltersBtn">
                        <i class="fas fa-times"></i> Wyczyść filtry
                    </button>
                </div>

                <div class="teams-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="totalTeams">0</div>
                        <div class="stat-label">Wszystkich zespołów</div>
                    </div>
                    <div class="stat-card stat-active">
                        <div class="stat-value" id="activeTeams">0</div>
                        <div class="stat-label">Aktywnych</div>
                    </div>
                    <div class="stat-card stat-onsite">
                        <div class="stat-value" id="onSiteTeams">0</div>
                        <div class="stat-label">Na miejscu</div>
                    </div>
                    <div class="stat-card stat-finished">
                        <div class="stat-value" id="finishedTeams">0</div>
                        <div class="stat-label">Zakończonych</div>
                    </div>
                </div>

                <div class="teams-table-container">
                    <table class="teams-table">
                        <thead>
                            <tr>
                                <th>GR</th>
                                <th>KRYPTONIM</th>
                                <th>TYP</th>
                                <th>SEKTOR</th>
                                <th>NAWIGATOR</th>
                                <th>TEL.</th>
                                <th>STATUS</th>
                                <th>KOMENTARZ</th>
                                <th>AKTUALIZACJA</th>
                                <th>OPERACJE</th>
                            </tr>
                        </thead>
                        <tbody id="teamsTableBody">
                            <!-- Dynamically generated -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.attachEventListeners();
        this.renderTeamsTable();
        this.updateStats();
    },

    /**
     * Przypisz event listenery
     */
    attachEventListeners() {
        document.getElementById('addTeamBtn')?.addEventListener('click', () => this.showAddTeamModal());
        document.getElementById('filterTeamType')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('filterTeamStatus')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('filterTeamSearch')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => this.clearFilters());
    },

    /**
     * Renderuj tabelę zespołów
     */
    renderTeamsTable() {
        const tbody = document.getElementById('teamsTableBody');
        if (!tbody) return;

        if (this.filteredTeams.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-state">
                        <i class="fas fa-users-slash"></i>
                        <p>Brak zespołów do wyświetlenia</p>
                        <button class="btn-primary" onclick="ZespolyManager.showAddTeamModal()">
                            <i class="fas fa-plus"></i> Dodaj pierwszy zespół
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredTeams.map((team, index) => {
            const typeInfo = this.TEAM_TYPES[team.type] || { label: team.type, icon: 'fa-users', color: '#6b7280' };
            const statusInfo = this.TEAM_STATUSES[team.status] || { label: team.status, color: '#6b7280', bgColor: '#f3f4f6' };

            return `
                <tr class="team-row">
                    <td class="team-number">${index + 1}</td>
                    <td class="team-codename">
                        <strong>${team.codename}</strong>
                    </td>
                    <td class="team-type">
                        <span class="type-badge" style="color: ${typeInfo.color};">
                            <i class="fas ${typeInfo.icon}"></i> ${typeInfo.label}
                        </span>
                    </td>
                    <td class="team-sector">${team.sector || '—'}</td>
                    <td class="team-navigator">${team.navigator || '—'}</td>
                    <td class="team-phone">${team.phone || '—'}</td>
                    <td class="team-status">
                        <span class="status-badge" style="color: ${statusInfo.color}; background-color: ${statusInfo.bgColor};">
                            ${statusInfo.label}
                        </span>
                    </td>
                    <td class="team-comment">${team.comment || '—'}</td>
                    <td class="team-updated">${this.formatDate(team.updatedAt)}</td>
                    <td class="team-actions">
                        <button class="btn-icon" onclick="ZespolyManager.editTeam(${team.id})" title="Edytuj">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="ZespolyManager.deleteTeam(${team.id})" title="Usuń">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Aktualizuj statystyki
     */
    updateStats() {
        const total = this.teams.length;
        const active = this.teams.filter(t => t.status === 'w_drodze' || t.status === 'sprawdzanie_sektora').length;
        const onSite = this.teams.filter(t => t.status === 'na_miejscu').length;
        const finished = this.teams.filter(t => t.status === 'zakonczono').length;

        document.getElementById('totalTeams').textContent = total;
        document.getElementById('activeTeams').textContent = active;
        document.getElementById('onSiteTeams').textContent = onSite;
        document.getElementById('finishedTeams').textContent = finished;
    },

    /**
     * Zastosuj filtry
     */
    applyFilters() {
        const typeFilter = document.getElementById('filterTeamType')?.value || 'all';
        const statusFilter = document.getElementById('filterTeamStatus')?.value || 'all';
        const searchFilter = (document.getElementById('filterTeamSearch')?.value || '').toLowerCase();

        this.currentFilter = {
            type: typeFilter,
            status: statusFilter,
            search: searchFilter
        };

        this.filteredTeams = this.teams.filter(team => {
            const matchesType = typeFilter === 'all' || team.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
            const matchesSearch = !searchFilter ||
                (team.codename && team.codename.toLowerCase().includes(searchFilter)) ||
                (team.sector && team.sector.toLowerCase().includes(searchFilter)) ||
                (team.navigator && team.navigator.toLowerCase().includes(searchFilter));

            return matchesType && matchesStatus && matchesSearch;
        });

        this.renderTeamsTable();
    },

    /**
     * Wyczyść filtry
     */
    clearFilters() {
        document.getElementById('filterTeamType').value = 'all';
        document.getElementById('filterTeamStatus').value = 'all';
        document.getElementById('filterTeamSearch').value = '';

        this.currentFilter = {
            type: 'all',
            status: 'all',
            search: ''
        };

        this.filteredTeams = [...this.teams];
        this.renderTeamsTable();
    },

    /**
     * Pokaż modal dodawania zespołu
     */
    showAddTeamModal(teamId = null) {
        const team = teamId ? this.teams.find(t => t.id === teamId) : null;
        const isEdit = !!team;

        Modal.show(isEdit ? 'Edytuj zespół' : 'Dodaj nowy zespół', `
            <form id="teamForm" class="calendar-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Kryptonim zespołu *</label>
                        <input type="text" id="teamCodename" required placeholder="np. Pieszy 1, Magda RD" value="${team?.codename || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Typ zespołu *</label>
                        <select id="teamType" required>
                            ${Object.entries(this.TEAM_TYPES).map(([key, type]) => `
                                <option value="${key}" ${team?.type === key ? 'selected' : ''}>
                                    ${type.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Status *</label>
                        <select id="teamStatus" required>
                            ${Object.entries(this.TEAM_STATUSES).map(([key, status]) => `
                                <option value="${key}" ${team?.status === key ? 'selected' : ''}>
                                    ${status.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Sektor</label>
                        <input type="text" id="teamSector" placeholder="np. 3" value="${team?.sector || ''}" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Nawigator (odpowiedzialny)</label>
                        <input type="text" id="teamNavigator" placeholder="np. Pawlicki, Kowalski" value="${team?.navigator || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Telefon</label>
                        <input type="tel" id="teamPhone" placeholder="np. +48 123 456 789" value="${team?.phone || ''}" />
                    </div>
                </div>

                <div class="form-group">
                    <label>Komentarz</label>
                    <textarea id="teamComment" rows="3" placeholder="Dodatkowe informacje...">${team?.comment || ''}</textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Zapisz zmiany' : 'Dodaj zespół'}
                    </button>
                    <button type="button" class="btn-secondary" onclick="Modal.hide()">
                        Anuluj
                    </button>
                </div>
            </form>
        `);

        document.getElementById('teamForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTeam(teamId);
        });
    },

    /**
     * Zapisz zespół
     */
    saveTeam(teamId = null) {
        const teamData = {
            codename: document.getElementById('teamCodename').value,
            type: document.getElementById('teamType').value,
            status: document.getElementById('teamStatus').value,
            sector: document.getElementById('teamSector').value || null,
            navigator: document.getElementById('teamNavigator').value || null,
            phone: document.getElementById('teamPhone').value || null,
            comment: document.getElementById('teamComment').value || null,
            updatedAt: new Date().toISOString()
        };

        if (teamId) {
            // Edycja
            const index = this.teams.findIndex(t => t.id === teamId);
            if (index !== -1) {
                this.teams[index] = { ...this.teams[index], ...teamData };
            }
        } else {
            // Nowy zespół
            teamData.id = Date.now();
            teamData.createdAt = new Date().toISOString();
            this.teams.push(teamData);
        }

        this.saveTeams();
        Modal.hide();
        this.applyFilters();
        this.updateStats();

        this.showToast(teamId ? 'Zespół zaktualizowany' : 'Zespół dodany');
    },

    /**
     * Edytuj zespół
     */
    editTeam(teamId) {
        this.showAddTeamModal(teamId);
    },

    /**
     * Usuń zespół
     */
    deleteTeam(teamId) {
        if (!confirm('Czy na pewno chcesz usunąć ten zespół?')) return;

        this.teams = this.teams.filter(t => t.id !== teamId);
        this.saveTeams();
        this.applyFilters();
        this.updateStats();

        this.showToast('Zespół usunięty');
    },

    /**
     * Formatuj datę
     */
    formatDate(dateString) {
        if (!dateString) return '—';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'przed chwilą';
        if (diffMins < 60) return `${diffMins} min temu`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} godz. temu`;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}`;
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
