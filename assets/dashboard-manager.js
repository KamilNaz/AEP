/**
 * Dashboard Hub - Advanced Analytics Dashboard
 * Dynamiczny system analizy danych z multi-source filtering
 */

const DashboardHub = {
    // Stan aplikacji
    state: {
        // Aktywne sekcje (domyślnie Patrole)
        activeSections: ['patrole'],

        // Globalny zakres dat
        dateFrom: null,
        dateTo: null,

        // Aktywne filtry per sekcja
        // Format: { sekcja: [{ field, operator, value }, ...] }
        filters: {},

        // Ustawienia wykresu głównego
        mainChart: {
            type: 'line', // line, bar, area, pie
            aggregation: 'day', // day, week, month
            xAxis: 'Data',
            yAxis: 'Liczba zdarzeń',
            series: 'Sekcja', // co kolorować
            chartInstance: null
        },

        // Ustawienia wykresów pomocniczych
        helperCharts: [
            { id: 'helper1', type: 'bar', title: 'Struktura kategorii', enabled: true },
            { id: 'helper2', type: 'line', title: 'Heatmapa dni tygodnia', enabled: true },
            { id: 'helper3', type: 'bar', title: 'Top N podkategorii', enabled: false },
            { id: 'helper4', type: 'line', title: 'Porównanie okresów', enabled: false }
        ],

        // Przełączniki widoczności
        showKPI: true,
        showTable: false,

        // Dane
        rawData: {},
        filteredData: {},
        aggregatedData: null,

        // UI state
        filterPanelExpanded: true
    },

    // Definicje sekcji i ich kolumn
    sections: {
        patrole: {
            name: 'Patrole',
            color: '#3b82f6',
            storageKey: 'aep_data_patrole',
            fields: {
                'Data': { type: 'date', operators: ['=', '≥', '≤', 'zakres'] },
                'Godz. rozpoczęcia': { type: 'time', operators: ['=', '≥', '≤'] },
                'Godz. zakończenia': { type: 'time', operators: ['=', '≥', '≤'] },
                'Oznaczenie': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Obszar': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Pojazd': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Nr rej.': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Dowódca': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Skład': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Przebieg (km)': { type: 'number', operators: ['=', '≥', '≤', '>', '<'] },
                'Status': { type: 'select', operators: ['=', '≠'], options: ['Zakończona', 'W trakcie', 'Planowana'] }
            }
        },
        wykroczenia: {
            name: 'Wykroczenia',
            color: '#f59e0b',
            storageKey: 'aep_data_wykroczenia',
            fields: {
                'Data': { type: 'date', operators: ['=', '≥', '≤', 'zakres'] },
                'Godzina': { type: 'time', operators: ['=', '≥', '≤'] },
                'Miejsce': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Rodzaj wykroczenia': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Funkcjonariusz': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Mandat': { type: 'flag', operators: ['='], options: ['TAK', 'NIE'] },
                'Pouczenie': { type: 'flag', operators: ['='], options: ['TAK', 'NIE'] },
                'Notatka służbowa': { type: 'flag', operators: ['='], options: ['TAK', 'NIE'] },
                'Status': { type: 'select', operators: ['=', '≠'], options: ['Zakończone', 'W trakcie'] }
            }
        },
        wkrd: {
            name: 'WKRD',
            color: '#8b5cf6',
            storageKey: 'aep_data_wkrd',
            fields: {
                'Data': { type: 'date', operators: ['=', '≥', '≤', 'zakres'] },
                'Godz. rozpoczęcia': { type: 'time', operators: ['=', '≥', '≤'] },
                'Godz. zakończenia': { type: 'time', operators: ['=', '≥', '≤'] },
                'Oznaczenie': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Rodzaj zabezpieczenia': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Cel': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Dowódca': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Liczba funkcjonariuszy': { type: 'number', operators: ['=', '≥', '≤', '>', '<'] },
                'Status': { type: 'select', operators: ['=', '≠'], options: ['Zakończone', 'W trakcie', 'Planowane'] }
            }
        },
        sankcje: {
            name: 'Sankcje',
            color: '#22c55e',
            storageKey: 'aep_data_sankcje',
            fields: {
                'Data wystawienia': { type: 'date', operators: ['=', '≥', '≤', 'zakres'] },
                'Nr mandatu': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Kwota (zł)': { type: 'number', operators: ['=', '≥', '≤', '>', '<'] },
                'Wykroczenie': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Funkcjonariusz': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Miejsce': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Status płatności': { type: 'select', operators: ['=', '≠'], options: ['Opłacony', 'Nieopłacony', 'Windykacja'] }
            }
        },
        konwoje: {
            name: 'Konwoje',
            color: '#ec4899',
            storageKey: 'aep_data_konwoje',
            fields: {
                'Data': { type: 'date', operators: ['=', '≥', '≤', 'zakres'] },
                'Godz. rozpoczęcia': { type: 'time', operators: ['=', '≥', '≤'] },
                'Godz. zakończenia': { type: 'time', operators: ['=', '≥', '≤'] },
                'Oznaczenie': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Trasa': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Cel konwoju': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Dowódca': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Status': { type: 'select', operators: ['=', '≠'], options: ['Zakończony', 'W trakcie', 'Planowany'] }
            }
        },
        spb: {
            name: 'ŚPB',
            color: '#ef4444',
            storageKey: 'aep_data_spb',
            fields: {
                'Data': { type: 'date', operators: ['=', '≥', '≤', 'zakres'] },
                'Godz. rozpoczęcia': { type: 'time', operators: ['=', '≥', '≤'] },
                'Godz. zakończenia': { type: 'time', operators: ['=', '≤'] },
                'Rodzaj interwencji': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Miejsce': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Dowódca': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Użycie przymusu': { type: 'flag', operators: ['='], options: ['TAK', 'NIE'] },
                'Status': { type: 'select', operators: ['=', '≠'], options: ['Zakończone', 'W trakcie'] }
            }
        },
        pilotaze: {
            name: 'Pilotaże',
            color: '#06b6d4',
            storageKey: 'aep_data_pilotaze',
            fields: {
                'Data': { type: 'date', operators: ['=', '≥', '≤', 'zakres'] },
                'Godz. rozpoczęcia': { type: 'time', operators: ['=', '≥', '≤'] },
                'Godz. zakończenia': { type: 'time', operators: ['=', '≥', '≤'] },
                'Oznaczenie': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Trasa': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Cel podróży': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Nr rej.': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Status': { type: 'select', operators: ['=', '≠'], options: ['Zakończony', 'W trakcie', 'Planowany'] }
            }
        },
        zdarzenia: {
            name: 'Zdarzenia drogowe',
            color: '#f97316',
            storageKey: 'aep_data_zdarzenia',
            fields: {
                'Data': { type: 'date', operators: ['=', '≥', '≤', 'zakres'] },
                'Godzina': { type: 'time', operators: ['=', '≥', '≤'] },
                'Miejsce': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Rodzaj': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Ofiary': { type: 'number', operators: ['=', '≥', '≤', '>'] },
                'Alkohol': { type: 'flag', operators: ['='], options: ['TAK', 'NIE'] },
                'Funkcjonariusz': { type: 'text', operators: ['zawiera', '=', '≠'] },
                'Status': { type: 'select', operators: ['=', '≠'], options: ['Zakończone', 'W trakcie'] }
            }
        }
    },

    /**
     * Główna funkcja renderująca
     */
    render() {
        const mainContent = document.getElementById('mainContent');

        // Nie ustawiamy domyślnego zakresu dat - pokazujemy wszystkie dane
        // Użytkownik może ręcznie zastosować filtr dat jeśli potrzebuje

        mainContent.innerHTML = `
            <div class="dashboard-analytics">
                <!-- Header -->
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <h1><i class="fas fa-chart-line"></i> Dashboard Analityczny</h1>
                        <p>Dynamiczna analiza danych operacyjnych</p>
                    </div>
                    <div class="dashboard-actions">
                        <button class="btn-secondary btn-sm" onclick="DashboardHub.exportToPNG()">
                            <i class="fas fa-download"></i> Eksport PNG
                        </button>
                        <button class="btn-secondary btn-sm" onclick="DashboardHub.exportToCSV()">
                            <i class="fas fa-file-csv"></i> CSV
                        </button>
                    </div>
                </div>

                <!-- Filters Panel (Top) -->
                <div class="filters-panel ${this.state.filterPanelExpanded ? 'expanded' : 'collapsed'}" id="filtersPanel">
                    ${this.renderFiltersPanel()}
                </div>

                <!-- Active Filters (Chipsy) -->
                <div class="active-filters-bar" id="activeFiltersBar">
                    ${this.renderActiveFilters()}
                </div>

                <!-- Main Content -->
                <div class="dashboard-content">
                    <!-- Main Chart -->
                    <div class="chart-section main-chart-section">
                        <div class="chart-header">
                            <h3>Wykres główny</h3>
                            <div class="chart-controls-inline">
                                ${this.renderChartTypeButtons()}
                                <select class="form-control-xs" onchange="DashboardHub.changeAggregation(this.value)">
                                    <option value="day" ${this.state.mainChart.aggregation === 'day' ? 'selected' : ''}>Dzień</option>
                                    <option value="week" ${this.state.mainChart.aggregation === 'week' ? 'selected' : ''}>Tydzień</option>
                                    <option value="month" ${this.state.mainChart.aggregation === 'month' ? 'selected' : ''}>Miesiąc</option>
                                </select>
                                <button class="btn-icon-xs" onclick="DashboardHub.showChartSettings('main')" title="Ustawienia wykresu">
                                    <i class="fas fa-cog"></i>
                                </button>
                            </div>
                        </div>
                        <div class="chart-container" id="mainChart"></div>
                    </div>

                    <!-- KPI Cards -->
                    <div class="kpi-section" id="kpiSection" style="display: ${this.state.showKPI ? 'block' : 'none'}">
                        ${this.renderKPICards()}
                    </div>

                    <!-- Helper Charts (2 columns) -->
                    <div class="helper-charts-grid">
                        ${this.renderHelperCharts()}
                    </div>

                    <!-- Data Table -->
                    <div class="table-section" id="tableSection" style="display: ${this.state.showTable ? 'block' : 'none'}">
                        ${this.renderDataTable()}
                    </div>
                </div>
            </div>
        `;

        // Inicjalizuj dane i wykresy
        this.loadAllData();
        this.applyFilters();
        this.renderMainChart();
    },

    /**
     * Renderuj panel filtrów (górny, poziomy)
     */
    renderFiltersPanel() {
        return `
            <div class="filters-header">
                <button class="btn-expand" onclick="DashboardHub.toggleFiltersPanel()">
                    <i class="fas fa-filter"></i>
                    <span>Filtry</span>
                    <i class="fas fa-chevron-${this.state.filterPanelExpanded ? 'up' : 'down'}"></i>
                </button>
            </div>

            <div class="filters-content">
                <!-- A) Sekcje (multi-select) -->
                <div class="filter-row">
                    <label class="filter-row-label">Sekcje główne:</label>
                    <div class="sections-select">
                        ${Object.keys(this.sections).map(key => {
                            const section = this.sections[key];
                            const isActive = this.state.activeSections.includes(key);
                            return `
                                <label class="section-checkbox">
                                    <input type="checkbox"
                                        ${isActive ? 'checked' : ''}
                                        onchange="DashboardHub.toggleSection('${key}')">
                                    <span>${section.name}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- B) Zakres dat (globalny) -->
                <div class="filter-row">
                    <label class="filter-row-label">Zakres dat:</label>
                    <div class="date-range-inputs">
                        <div class="date-input-group">
                            <label>Data od:</label>
                            <input type="date"
                                value="${this.state.dateFrom || ''}"
                                onchange="DashboardHub.updateDateRange('from', this.value)"
                                class="form-control-xs">
                        </div>
                        <div class="date-input-group">
                            <label>Data do:</label>
                            <input type="date"
                                value="${this.state.dateTo || ''}"
                                onchange="DashboardHub.updateDateRange('to', this.value)"
                                class="form-control-xs">
                        </div>
                        <div class="date-presets">
                            <button class="btn-preset" onclick="DashboardHub.setDatePreset(7)">7 dni</button>
                            <button class="btn-preset" onclick="DashboardHub.setDatePreset(30)">30 dni</button>
                            <button class="btn-preset" onclick="DashboardHub.setDatePreset(90)">Kwartał</button>
                        </div>
                    </div>
                </div>

                <!-- D) Dodawanie filtrów -->
                <div class="filter-row">
                    <label class="filter-row-label">Aktywne filtry:</label>
                    <div class="add-filter-section">
                        <button class="btn-secondary btn-sm" onclick="DashboardHub.showAddFilterDialog()">
                            <i class="fas fa-plus"></i> Dodaj filtr
                        </button>
                    </div>
                </div>

                <!-- E) Przyciski akcji -->
                <div class="filter-row filter-actions">
                    <button class="btn-primary" onclick="DashboardHub.applyFilters()">
                        <i class="fas fa-check"></i> Zastosuj
                    </button>
                    <button class="btn-secondary" onclick="DashboardHub.resetFilters()">
                        <i class="fas fa-rotate-right"></i> Reset
                    </button>
                    <div class="filter-toggles">
                        <label>
                            <input type="checkbox" ${this.state.showKPI ? 'checked' : ''}
                                onchange="DashboardHub.toggleKPI(this.checked)">
                            <span>KPI</span>
                        </label>
                        <label>
                            <input type="checkbox" ${this.state.showTable ? 'checked' : ''}
                                onchange="DashboardHub.toggleTable(this.checked)">
                            <span>Tabela</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderuj aktywne filtry jako chipsy
     */
    renderActiveFilters() {
        const chips = [];

        // Chipsy dla aktywnych sekcji
        this.state.activeSections.forEach(sectionKey => {
            const section = this.sections[sectionKey];
            chips.push(`
                <div class="filter-chip" style="border-color: ${section.color}">
                    <span style="color: ${section.color}">${section.name}</span>
                    <button onclick="DashboardHub.removeSection('${sectionKey}')" class="chip-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
        });

        // Chipsy dla filtrów per sekcja
        Object.keys(this.state.filters).forEach(sectionKey => {
            const section = this.sections[sectionKey];
            const sectionFilters = this.state.filters[sectionKey];

            sectionFilters.forEach((filter, index) => {
                chips.push(`
                    <div class="filter-chip filter-chip-detail" style="border-color: ${section.color}">
                        <span class="chip-section" style="color: ${section.color}">${section.name}:</span>
                        <span>${filter.field} ${filter.operator} ${filter.value}</span>
                        <button onclick="DashboardHub.removeFilter('${sectionKey}', ${index})" class="chip-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `);
            });
        });

        if (chips.length === 0) {
            return '<p class="no-filters-msg">Brak aktywnych filtrów. Wybierz sekcje i ustaw zakres dat.</p>';
        }

        return `<div class="filter-chips-container">${chips.join('')}</div>`;
    },

    /**
     * Renderuj przyciski typu wykresu
     */
    renderChartTypeButtons() {
        const types = [
            { value: 'line', icon: 'fa-chart-line', title: 'Liniowy' },
            { value: 'bar', icon: 'fa-chart-bar', title: 'Słupkowy' },
            { value: 'area', icon: 'fa-chart-area', title: 'Obszarowy' },
            { value: 'pie', icon: 'fa-chart-pie', title: 'Kołowy' }
        ];

        return `
            <div class="chart-type-buttons">
                ${types.map(type => `
                    <button class="btn-chart-type ${this.state.mainChart.type === type.value ? 'active' : ''}"
                        onclick="DashboardHub.changeChartType('${type.value}')"
                        title="${type.title}">
                        <i class="fas ${type.icon}"></i>
                    </button>
                `).join('')}
            </div>
        `;
    },

    /**
     * Renderuj karty KPI
     */
    renderKPICards() {
        const kpis = this.calculateKPIs();

        if (kpis.length === 0) {
            return '<p class="no-data-msg">Wybierz sekcje aby zobaczyć wskaźniki KPI</p>';
        }

        return `
            <div class="kpi-header">
                <h3><i class="fas fa-gauge-high"></i> Wskaźniki KPI</h3>
            </div>
            <div class="kpi-cards-grid">
                ${kpis.map(kpi => `
                    <div class="kpi-card" style="border-top-color: ${kpi.color}">
                        <div class="kpi-label">${kpi.label}</div>
                        <div class="kpi-value">${kpi.value}</div>
                        ${kpi.trend ? `<div class="kpi-trend ${kpi.trend > 0 ? 'up' : 'down'}">
                            <i class="fas fa-arrow-${kpi.trend > 0 ? 'up' : 'down'}"></i> ${Math.abs(kpi.trend)}%
                        </div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Renderuj wykresy pomocnicze
     */
    renderHelperCharts() {
        const enabled = this.state.helperCharts.filter(c => c.enabled);

        if (enabled.length === 0) {
            return '<p class="no-data-msg">Brak aktywnych wykresów pomocniczych</p>';
        }

        return enabled.map(chart => `
            <div class="helper-chart-section">
                <div class="chart-header">
                    <h4>${chart.title}</h4>
                    <button class="btn-icon-xs" onclick="DashboardHub.showChartSettings('${chart.id}')" title="Ustawienia">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
                <div class="chart-container-sm" id="${chart.id}"></div>
            </div>
        `).join('');
    },

    /**
     * Renderuj tabelę szczegółów
     */
    renderDataTable() {
        return `
            <div class="table-header">
                <h3><i class="fas fa-table"></i> Szczegóły danych</h3>
                <button class="btn-secondary btn-sm" onclick="DashboardHub.exportTableToCSV()">
                    <i class="fas fa-download"></i> Eksport CSV
                </button>
            </div>
            <div class="table-wrapper">
                <table class="details-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Sekcja</th>
                            <th>Kategoria</th>
                            <th>Podkategoria</th>
                            <th>Wartość</th>
                            <th>Jednostka</th>
                        </tr>
                    </thead>
                    <tbody id="detailsTableBody">
                        ${this.renderTableRows()}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Renderuj wiersze tabeli
     */
    renderTableRows() {
        const rows = [];
        let rowCount = 0;
        const maxRows = 100;

        this.state.activeSections.forEach(sectionKey => {
            const section = this.sections[sectionKey];
            const data = this.state.filteredData[sectionKey] || [];

            data.slice(0, 20).forEach(item => {
                if (rowCount >= maxRows) return;

                const dateField = item['Data'] || item['Data wystawienia'] || '';
                rows.push(`
                    <tr>
                        <td>${dateField}</td>
                        <td><span class="badge" style="background: ${section.color}20; color: ${section.color}">${section.name}</span></td>
                        <td>${item[Object.keys(item)[3]] || '-'}</td>
                        <td>${item[Object.keys(item)[4]] || '-'}</td>
                        <td>1</td>
                        <td>liczba</td>
                    </tr>
                `);
                rowCount++;
            });
        });

        if (rows.length === 0) {
            return '<tr><td colspan="6" class="no-data-cell">Brak danych do wyświetlenia</td></tr>';
        }

        return rows.join('');
    },

    // ========================================
    // DATA LOADING & FILTERING
    // ========================================

    /**
     * Załaduj wszystkie dane z localStorage
     */
    loadAllData() {
        console.log('📊 Dashboard - Ładowanie danych z localStorage...');
        Object.keys(this.sections).forEach(sectionKey => {
            const section = this.sections[sectionKey];
            const data = Utils.loadFromLocalStorage(section.storageKey) || [];
            this.state.rawData[sectionKey] = data;
            console.log(`  → ${section.name}: ${data.length} rekordów`);
        });
        console.log('✅ Wszystkie dane załadowane:', this.state.rawData);
    },

    /**
     * Zastosuj filtry
     */
    applyFilters() {
        console.log('🔍 Dashboard - Stosowanie filtrów...');
        console.log('  Aktywne sekcje:', this.state.activeSections);
        console.log('  Zakres dat:', this.state.dateFrom, '-', this.state.dateTo);

        this.state.filteredData = {};

        this.state.activeSections.forEach(sectionKey => {
            let data = this.state.rawData[sectionKey] || [];
            console.log(`  → ${sectionKey}: ${data.length} rekordów (raw)`);

            // Filtr daty globalny
            data = this.filterByDateRange(data, sectionKey);
            console.log(`    Po filtrze dat: ${data.length} rekordów`);

            // Filtry per sekcja
            const sectionFilters = this.state.filters[sectionKey] || [];
            sectionFilters.forEach(filter => {
                data = this.applyFilter(data, filter);
            });

            this.state.filteredData[sectionKey] = data;
            console.log(`    ✅ Przefiltrowane: ${data.length} rekordów`);
        });

        console.log('✅ Dane przefiltrowane:', this.state.filteredData);

        // Odśwież widok
        this.refreshView();
    },

    /**
     * Parse date from Polish format (DD.MM.YYYY) or ISO (YYYY-MM-DD)
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        // Try DD.MM.YYYY format first (Polish format)
        if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // months are 0-indexed
                const year = parseInt(parts[2]);
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) return date;
            }
        }

        // Try ISO format or other standard formats
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    },

    /**
     * Filtruj według zakresu dat
     */
    filterByDateRange(data, sectionKey) {
        if (!this.state.dateFrom && !this.state.dateTo) return data;

        // Debug: pokaż przykładowe daty z danych
        console.log(`    🔍 Filtrowanie dat dla ${sectionKey}:`);
        console.log(`       Zakres: ${this.state.dateFrom} do ${this.state.dateTo}`);
        if (data.length > 0) {
            console.log(`       ⚠️ PRZYKŁADOWY CAŁY REKORD (JSON):`, JSON.stringify(data[0], null, 2));
            console.log(`       ⚠️ DOSTĘPNE KLUCZE:`, Object.keys(data[0]));
            const sampleDates = data.slice(0, 3).map(item => {
                // Sprawdź różne warianty nazw kolumn dat
                const dateField = item['date'] || item['Data'] || item['Data wystawienia'] || '';
                return dateField;
            });
            console.log(`       Przykładowe daty w danych:`, sampleDates);
        }

        const filterFrom = this.state.dateFrom ? new Date(this.state.dateFrom) : null;
        const filterTo = this.state.dateTo ? new Date(this.state.dateTo) : null;

        return data.filter(item => {
            // Sprawdź różne warianty nazw kolumn dat (małe i wielkie litery)
            const dateField = item['date'] || item['Data'] || item['Data wystawienia'] || '';
            if (!dateField) return false;

            const itemDate = this.parseDate(dateField);
            if (!itemDate) {
                console.warn(`       ⚠️ Nie można sparsować daty: "${dateField}"`);
                return false;
            }

            if (filterFrom && itemDate < filterFrom) return false;
            if (filterTo && itemDate > filterTo) return false;

            return true;
        });
    },

    /**
     * Zastosuj pojedynczy filtr
     */
    applyFilter(data, filter) {
        return data.filter(item => {
            const value = item[filter.field];
            const filterValue = filter.value;

            switch (filter.operator) {
                case '=':
                    return String(value) === String(filterValue);
                case '≠':
                    return String(value) !== String(filterValue);
                case 'zawiera':
                    return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
                case '≥':
                    return parseFloat(value) >= parseFloat(filterValue);
                case '≤':
                    return parseFloat(value) <= parseFloat(filterValue);
                case '>':
                    return parseFloat(value) > parseFloat(filterValue);
                case '<':
                    return parseFloat(value) < parseFloat(filterValue);
                default:
                    return true;
            }
        });
    },

    /**
     * Oblicz KPI
     */
    calculateKPIs() {
        const kpis = [];

        this.state.activeSections.forEach(sectionKey => {
            const section = this.sections[sectionKey];
            const data = this.state.filteredData[sectionKey] || [];

            if (data.length > 0) {
                kpis.push({
                    label: `${section.name} - Suma`,
                    value: data.length,
                    color: section.color,
                    trend: null
                });

                const daysRange = this.getDaysInRange();
                if (daysRange > 0) {
                    kpis.push({
                        label: `${section.name} - Średnia/dzień`,
                        value: (data.length / daysRange).toFixed(1),
                        color: section.color,
                        trend: null
                    });
                }
            }
        });

        return kpis;
    },

    /**
     * Pobierz liczbę dni w zakresie
     */
    getDaysInRange() {
        if (!this.state.dateFrom || !this.state.dateTo) return 30;

        const from = new Date(this.state.dateFrom);
        const to = new Date(this.state.dateTo);
        const diffTime = Math.abs(to - from);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays || 1;
    },

    // ========================================
    // CHART RENDERING
    // ========================================

    /**
     * Renderuj główny wykres
     */
    renderMainChart() {
        console.log('📈 Dashboard - Renderowanie wykresu głównego...');
        const chartData = this.prepareChartData();
        console.log('  Dane wykresu:', chartData);

        if (this.state.mainChart.chartInstance) {
            this.state.mainChart.chartInstance.destroy();
        }

        const options = {
            series: chartData.series,
            chart: {
                type: this.state.mainChart.type,
                height: 400,
                background: 'transparent',
                foreColor: '#9aa3b2',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        zoom: true,
                        pan: true,
                        reset: true
                    }
                }
            },
            colors: chartData.colors,
            xaxis: {
                categories: chartData.categories,
                labels: { style: { colors: '#9aa3b2' } }
            },
            yaxis: {
                labels: { style: { colors: '#9aa3b2' } }
            },
            grid: {
                borderColor: '#2d3748',
                strokeDashArray: 4
            },
            legend: {
                position: 'top',
                labels: { colors: '#e6e6e6' }
            },
            theme: { mode: 'dark' },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 }
        };

        if (this.state.mainChart.type === 'pie') {
            options.labels = chartData.categories;
        }

        const chartEl = document.querySelector('#mainChart');
        if (chartEl) {
            console.log('  Element wykresu znaleziony:', chartEl);
            this.state.mainChart.chartInstance = new ApexCharts(chartEl, options);
            this.state.mainChart.chartInstance.render();
            console.log('  ✅ Wykres wyrenderowany');
        } else {
            console.error('  ❌ Element #mainChart nie znaleziony!');
        }
    },

    /**
     * Przygotuj dane do wykresu
     */
    prepareChartData() {
        console.log('🔄 Przygotowywanie danych do wykresu...');
        const series = [];
        const colors = [];
        const categories = [];

        this.state.activeSections.forEach(sectionKey => {
            const section = this.sections[sectionKey];
            const data = this.state.filteredData[sectionKey] || [];
            console.log(`  → ${section.name}: ${data.length} rekordów do agregacji`);

            const aggregated = this.aggregateData(data, sectionKey);
            console.log(`    Zagregowane:`, aggregated);

            series.push({
                name: section.name,
                data: Object.values(aggregated)
            });

            colors.push(section.color);

            if (categories.length === 0) {
                categories.push(...Object.keys(aggregated));
            }
        });

        console.log('  ✅ Przygotowano dane:', { series, colors, categories });
        return { series, colors, categories };
    },

    /**
     * Agreguj dane
     */
    aggregateData(data, sectionKey) {
        const aggregated = {};

        data.forEach(item => {
            // Sprawdź różne warianty nazw kolumn dat (małe i wielkie litery)
            const dateField = item['date'] || item['Data'] || item['Data wystawienia'] || '';
            if (!dateField) return;

            const date = this.parseDate(dateField);
            if (!date) return;

            let key;
            if (this.state.mainChart.aggregation === 'day') {
                // Normalize to YYYY-MM-DD format for consistency
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            } else if (this.state.mainChart.aggregation === 'week') {
                const weekNum = this.getWeekNumber(date);
                key = `${date.getFullYear()}-W${weekNum}`;
            } else if (this.state.mainChart.aggregation === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            aggregated[key] = (aggregated[key] || 0) + 1;
        });

        return Object.keys(aggregated).sort().reduce((acc, key) => {
            acc[key] = aggregated[key];
            return acc;
        }, {});
    },

    /**
     * Pobierz numer tygodnia
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    // ========================================
    // EVENT HANDLERS
    // ========================================

    toggleFiltersPanel() {
        this.state.filterPanelExpanded = !this.state.filterPanelExpanded;
        const panel = document.getElementById('filtersPanel');
        if (panel) {
            panel.classList.toggle('expanded');
            panel.classList.toggle('collapsed');
        }
        // Update chevron icon
        const chevron = document.querySelector('.btn-expand i:last-child');
        if (chevron) {
            chevron.className = `fas fa-chevron-${this.state.filterPanelExpanded ? 'up' : 'down'}`;
        }
    },

    toggleSection(sectionKey) {
        const index = this.state.activeSections.indexOf(sectionKey);
        if (index > -1) {
            this.state.activeSections.splice(index, 1);
        } else {
            this.state.activeSections.push(sectionKey);
        }
        this.refreshActiveFilters();
    },

    removeSection(sectionKey) {
        const index = this.state.activeSections.indexOf(sectionKey);
        if (index > -1) {
            this.state.activeSections.splice(index, 1);
        }
        // Uncheck checkbox
        const checkbox = document.querySelector(`input[onchange="DashboardHub.toggleSection('${sectionKey}')"]`);
        if (checkbox) checkbox.checked = false;

        this.applyFilters();
    },

    updateDateRange(type, value) {
        console.log(`📅 updateDateRange wywołane: ${type} = ${value}`);
        console.trace('Stack trace:');
        if (type === 'from') {
            this.state.dateFrom = value;
        } else {
            this.state.dateTo = value;
        }
        this.applyFilters();
    },

    setDatePreset(days) {
        console.log(`📅 setDatePreset wywołane: ${days} dni`);
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);

        this.state.dateFrom = from.toISOString().split('T')[0];
        this.state.dateTo = to.toISOString().split('T')[0];

        // Update inputs (bez triggera onchange)
        document.querySelectorAll('.date-input-group input').forEach((input, i) => {
            if (i === 0) input.value = this.state.dateFrom;
            if (i === 1) input.value = this.state.dateTo;
        });

        this.applyFilters();
    },

    showAddFilterDialog() {
        if (this.state.activeSections.length === 0) {
            alert('Najpierw wybierz sekcje danych.');
            return;
        }

        // Pokaż modal z wyborem sekcji -> pola -> operatora -> wartości
        Modal.show('Dodaj filtr', `
            <div class="add-filter-form">
                <div class="form-group">
                    <label>Wybierz sekcję:</label>
                    <select id="filterSection" class="form-control" onchange="DashboardHub.updateFilterFields()">
                        <option value="">-- Wybierz --</option>
                        ${this.state.activeSections.map(key => `
                            <option value="${key}">${this.sections[key].name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Pole:</label>
                    <select id="filterField" class="form-control" onchange="DashboardHub.updateFilterOperators()">
                        <option value="">-- Wybierz sekcję --</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Operator:</label>
                    <select id="filterOperator" class="form-control">
                        <option value="">-- Wybierz pole --</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Wartość:</label>
                    <input type="text" id="filterValue" class="form-control" placeholder="Wpisz wartość...">
                </div>
                <div class="form-actions">
                    <button class="btn-primary" onclick="DashboardHub.addFilter()">
                        <i class="fas fa-plus"></i> Dodaj
                    </button>
                    <button class="btn-secondary" onclick="Modal.hide()">Anuluj</button>
                </div>
            </div>
        `);
    },

    updateFilterFields() {
        const sectionKey = document.getElementById('filterSection').value;
        const fieldSelect = document.getElementById('filterField');

        if (!sectionKey) {
            fieldSelect.innerHTML = '<option value="">-- Wybierz sekcję --</option>';
            return;
        }

        const section = this.sections[sectionKey];
        const fields = Object.keys(section.fields);

        fieldSelect.innerHTML = '<option value="">-- Wybierz pole --</option>' +
            fields.map(field => `<option value="${field}">${field}</option>`).join('');
    },

    updateFilterOperators() {
        const sectionKey = document.getElementById('filterSection').value;
        const field = document.getElementById('filterField').value;
        const operatorSelect = document.getElementById('filterOperator');

        if (!sectionKey || !field) {
            operatorSelect.innerHTML = '<option value="">-- Wybierz pole --</option>';
            return;
        }

        const section = this.sections[sectionKey];
        const fieldDef = section.fields[field];
        const operators = fieldDef.operators;

        operatorSelect.innerHTML = operators.map(op => `<option value="${op}">${op}</option>`).join('');
    },

    addFilter() {
        const sectionKey = document.getElementById('filterSection').value;
        const field = document.getElementById('filterField').value;
        const operator = document.getElementById('filterOperator').value;
        const value = document.getElementById('filterValue').value;

        if (!sectionKey || !field || !operator || !value) {
            alert('Wypełnij wszystkie pola');
            return;
        }

        if (!this.state.filters[sectionKey]) {
            this.state.filters[sectionKey] = [];
        }

        this.state.filters[sectionKey].push({ field, operator, value });

        Modal.hide();
        this.refreshActiveFilters();
    },

    removeFilter(sectionKey, index) {
        this.state.filters[sectionKey].splice(index, 1);
        if (this.state.filters[sectionKey].length === 0) {
            delete this.state.filters[sectionKey];
        }
        this.applyFilters();
    },

    resetFilters() {
        this.state.filters = {};
        this.refreshActiveFilters();
        this.applyFilters();
    },

    changeChartType(type) {
        this.state.mainChart.type = type;
        this.renderMainChart();
        this.refreshChartControls();
    },

    changeAggregation(aggregation) {
        this.state.mainChart.aggregation = aggregation;
        this.applyFilters();
    },

    toggleKPI(show) {
        this.state.showKPI = show;
        const section = document.getElementById('kpiSection');
        if (section) section.style.display = show ? 'block' : 'none';
    },

    toggleTable(show) {
        this.state.showTable = show;
        const section = document.getElementById('tableSection');
        if (section) section.style.display = show ? 'block' : 'none';
    },

    showChartSettings(chartId) {
        alert('Ustawienia wykresu: ' + chartId + ' (w budowie)');
    },

    exportToPNG() {
        if (this.state.mainChart.chartInstance) {
            this.state.mainChart.chartInstance.dataURI().then(({ imgURI }) => {
                const link = document.createElement('a');
                link.href = imgURI;
                link.download = `dashboard_${new Date().toISOString().split('T')[0]}.png`;
                link.click();
            });
        }
    },

    exportToCSV() {
        alert('Eksport CSV (w budowie)');
    },

    exportTableToCSV() {
        alert('Eksport tabeli do CSV (w budowie)');
    },

    // ========================================
    // UI REFRESH
    // ========================================

    refreshView() {
        this.refreshActiveFilters();
        this.refreshKPI();
        this.refreshTable();
        this.renderMainChart();
    },

    refreshActiveFilters() {
        const bar = document.getElementById('activeFiltersBar');
        if (bar) bar.innerHTML = this.renderActiveFilters();
    },

    refreshKPI() {
        const section = document.getElementById('kpiSection');
        if (section && this.state.showKPI) {
            section.innerHTML = this.renderKPICards();
        }
    },

    refreshTable() {
        const tbody = document.getElementById('detailsTableBody');
        if (tbody && this.state.showTable) {
            tbody.innerHTML = this.renderTableRows();
        }
    },

    refreshChartControls() {
        const controls = document.querySelector('.chart-controls-inline');
        if (controls) {
            const typeButtons = controls.querySelector('.chart-type-buttons');
            if (typeButtons) {
                typeButtons.outerHTML = this.renderChartTypeButtons();
            }
        }
    }
};
