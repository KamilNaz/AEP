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
            type: 'line', // line, bar, area
            aggregation: 'day', // day, week, month
            xAxis: 'Data',
            yAxis: 'Liczba zdarzeń',
            series: 'Sekcja', // co kolorować
            chartInstance: null
        },

        // Ustawienia wykresów pomocniczych (wyłączone - zastąpione przez KPI)
        helperCharts: [
            { id: 'helper1', type: 'bar', title: 'Struktura kategorii', enabled: false },
            { id: 'helper2', type: 'line', title: 'Heatmapa dni tygodnia', enabled: false },
            { id: 'helper3', type: 'bar', title: 'Top N podkategorii', enabled: false },
            { id: 'helper4', type: 'line', title: 'Porównanie okresów', enabled: false }
        ],

        // Przełączniki widoczności
        showKPI: true,

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

                        <!-- AI Chart Insights -->
                        <div class="chart-insights" id="chartInsights" style="display: none;">
                            <div class="insights-header">
                                <h4>Opis</h4>
                            </div>
                            <div class="insights-content" id="insightsContent"></div>
                        </div>
                    </div>

                    <!-- KPI Cards -->
                    <div class="kpi-section" id="kpiSection" style="display: ${this.state.showKPI ? 'block' : 'none'}">
                        ${this.renderKPICards()}
                    </div>

                    <!-- Helper Charts (2 columns) -->
                    <div class="helper-charts-grid">
                        ${this.renderHelperCharts()}
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
            { value: 'area', icon: 'fa-chart-area', title: 'Obszarowy' }
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
                        <div class="kpi-icon" style="color: ${kpi.color}">
                            <i class="fas ${kpi.icon || 'fa-chart-line'}"></i>
                        </div>
                        <div class="kpi-label">${kpi.label}</div>
                        <div class="kpi-value">${kpi.value}</div>
                        ${kpi.trend ? `<div class="kpi-trend ${kpi.trend}">
                            <i class="fas ${kpi.icon}"></i>
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
                // Sprawdź różne warianty nazw kolumn dat (małe i wielkie litery)
                const dateField = item['data'] || item['date'] || item['Data'] || item['Data wystawienia'] || '';
                return dateField;
            });
            console.log(`       Przykładowe daty w danych:`, sampleDates);
        }

        const filterFrom = this.state.dateFrom ? new Date(this.state.dateFrom) : null;
        const filterTo = this.state.dateTo ? new Date(this.state.dateTo) : null;

        return data.filter(item => {
            // Sprawdź różne warianty nazw kolumn dat (małe i wielkie litery)
            const dateField = item['data'] || item['date'] || item['Data'] || item['Data wystawienia'] || '';
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
                // Używamy agregacji aby uzyskać prawdziwe wartości
                const aggregated = this.aggregateData(data, sectionKey);
                const values = Object.values(aggregated);
                const totalSum = values.reduce((sum, val) => sum + val, 0);

                // 1. Łączna suma
                kpis.push({
                    label: `${section.name} - Suma`,
                    value: totalSum,
                    color: section.color,
                    icon: 'fa-hashtag',
                    trend: null
                });

                // 2. Średnia dzienna
                const daysRange = this.getDaysInRange();
                if (daysRange > 0) {
                    kpis.push({
                        label: `${section.name} - Średnia/dzień`,
                        value: (totalSum / daysRange).toFixed(1),
                        color: section.color,
                        icon: 'fa-calendar-day',
                        trend: null
                    });
                }

                // 3. Najaktywniejszy dzień
                if (values.length > 0) {
                    const maxValue = Math.max(...values);
                    const maxDate = Object.keys(aggregated).find(key => aggregated[key] === maxValue);
                    kpis.push({
                        label: `${section.name} - Najaktywniejszy dzień`,
                        value: `${maxValue} (${this.formatDate(maxDate)})`,
                        color: section.color,
                        icon: 'fa-fire',
                        trend: null
                    });
                }

                // 4. Trend (porównanie pierwszej i drugiej połowy okresu)
                if (values.length >= 4) {
                    const midPoint = Math.floor(values.length / 2);
                    const firstHalf = values.slice(0, midPoint);
                    const secondHalf = values.slice(midPoint);
                    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
                    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
                    const trendPercent = ((avgSecond - avgFirst) / avgFirst * 100).toFixed(1);

                    kpis.push({
                        label: `${section.name} - Trend`,
                        value: `${trendPercent > 0 ? '+' : ''}${trendPercent}%`,
                        color: section.color,
                        icon: trendPercent > 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down',
                        trend: trendPercent > 0 ? 'up' : 'down'
                    });
                }
            }
        });

        return kpis;
    },

    /**
     * Formatuj datę z YYYY-MM-DD do DD.MM
     */
    formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}`;
        }
        return dateStr;
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

    /**
     * Generuj opis analizy dla wykresu
     */
    generateChartInsights(chartData) {
        const insights = [];
        const { series, categories } = chartData;

        if (series.length === 0 || categories.length === 0) {
            document.getElementById('chartInsights').style.display = 'none';
            return;
        }

        // Oblicz rzeczywisty zakres dat (od-do)
        const firstDate = categories[0];
        const lastDate = categories[categories.length - 1];
        const dateFrom = this.parseDate(this.formatDateReverse(firstDate));
        const dateTo = this.parseDate(this.formatDateReverse(lastDate));
        const diffDays = Math.ceil((dateTo - dateFrom) / (1000 * 60 * 60 * 24)) + 1;

        // Analiza 1: Podsumowanie okresu (na początku)
        const totalSum = series.reduce((sum, s) => sum + s.data.reduce((a, b) => a + b, 0), 0);
        const avgDaily = (totalSum / diffDays).toFixed(1);
        const daysWithData = categories.length;

        insights.push(
            `W okresie od <strong>${this.formatDate(firstDate)}</strong> do <strong>${this.formatDate(lastDate)}</strong> ` +
            `(<strong>${diffDays} dni</strong>) zarejestrowano łącznie <strong>${totalSum}</strong> zdarzeń ` +
            `w <strong>${daysWithData}</strong> ${daysWithData === 1 ? 'dniu' : 'dniach'}, ` +
            `co daje średnią <strong>${avgDaily}</strong> zdarzenia dziennie.`
        );

        // Analiza 2: Trend dla każdej serii
        series.forEach(s => {
            const data = s.data;
            if (data.length >= 3) {
                const firstHalf = data.slice(0, Math.floor(data.length / 2));
                const secondHalf = data.slice(Math.floor(data.length / 2));
                const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
                const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

                if (avgSecond > avgFirst * 1.15) {
                    insights.push(
                        `Kategoria <strong>${s.name}</strong> wykazuje <strong>trend wzrostowy</strong> - ` +
                        `w drugiej połowie okresu średnia wartość wzrosła o <strong>${((avgSecond - avgFirst) / avgFirst * 100).toFixed(0)}%</strong>.`
                    );
                } else if (avgSecond < avgFirst * 0.85) {
                    insights.push(
                        `Kategoria <strong>${s.name}</strong> wykazuje <strong>trend spadkowy</strong> - ` +
                        `w drugiej połowie okresu średnia wartość spadła o <strong>${((avgFirst - avgSecond) / avgFirst * 100).toFixed(0)}%</strong>.`
                    );
                } else {
                    insights.push(
                        `Kategoria <strong>${s.name}</strong> utrzymuje się na <strong>stabilnym poziomie</strong> bez większych wahań.`
                    );
                }
            }
        });

        // Analiza 3: Najaktywniejszy dzień
        if (series.length > 0) {
            let maxValue = -Infinity;
            let maxDate = '';
            let maxSeries = '';

            categories.forEach((date, idx) => {
                series.forEach(s => {
                    if (s.data[idx] > maxValue) {
                        maxValue = s.data[idx];
                        maxDate = this.formatDate(date);
                        maxSeries = s.name;
                    }
                });
            });

            if (maxValue > 0) {
                insights.push(
                    `Najwyższa aktywność odnotowana została w kategorii <strong>${maxSeries}</strong> ` +
                    `w dniu <strong>${maxDate}</strong> z wartością <strong>${maxValue}</strong>.`
                );
            }
        }

        // Analiza 4: Korelacje między wszystkimi parami serii
        if (series.length >= 2) {
            const correlations = [];

            for (let i = 0; i < series.length; i++) {
                for (let j = i + 1; j < series.length; j++) {
                    const s1 = series[i];
                    const s2 = series[j];

                    // Znajdź wspólne punkty wzrostu i spadku
                    let correlatedGrowth = 0;
                    let correlatedDrop = 0;
                    let antiCorrelated = 0;

                    for (let k = 1; k < Math.min(s1.data.length, s2.data.length); k++) {
                        const s1Change = s1.data[k] - s1.data[k - 1];
                        const s2Change = s2.data[k] - s2.data[k - 1];

                        if (s1Change > 0 && s2Change > 0) {
                            correlatedGrowth++;
                        } else if (s1Change < 0 && s2Change < 0) {
                            correlatedDrop++;
                        } else if ((s1Change > 0 && s2Change < 0) || (s1Change < 0 && s2Change > 0)) {
                            antiCorrelated++;
                        }
                    }

                    const totalChanges = Math.min(s1.data.length, s2.data.length) - 1;
                    const positiveCorrelation = ((correlatedGrowth + correlatedDrop) / totalChanges) * 100;

                    if (positiveCorrelation > 60) {
                        correlations.push({
                            s1: s1.name,
                            s2: s2.name,
                            percent: positiveCorrelation.toFixed(0),
                            growth: correlatedGrowth,
                            drop: correlatedDrop
                        });
                    }
                }
            }

            // Wyświetl korelacje
            if (correlations.length > 0) {
                correlations.forEach(corr => {
                    insights.push(
                        `Zaobserwowano <strong>pozytywną korelację</strong> między kategoriami ` +
                        `<strong>${corr.s1}</strong> i <strong>${corr.s2}</strong> - ` +
                        `w <strong>${corr.percent}%</strong> przypadków zmiany wartości następują w tym samym kierunku ` +
                        `(wspólny wzrost: ${corr.growth}, wspólny spadek: ${corr.drop}).`
                    );
                });
            }
        }

        // Wyświetl opis
        const insightsEl = document.getElementById('chartInsights');
        const contentEl = document.getElementById('insightsContent');

        if (insights.length > 0) {
            // Połącz wszystkie insighty w jeden bloczek
            contentEl.innerHTML = `<p>${insights.join(' ')}</p>`;
            insightsEl.style.display = 'block';
        } else {
            insightsEl.style.display = 'none';
        }
    },

    /**
     * Formatuj datę z DD.MM do YYYY-MM-DD
     */
    formatDateReverse(dateStr) {
        if (!dateStr) return '';

        // Jeśli już w formacie YYYY-MM-DD
        if (dateStr.includes('-') && dateStr.length >= 10) {
            return dateStr;
        }

        // Jeśli w formacie DD.MM.YYYY
        if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        return dateStr;
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

        const chartEl = document.querySelector('#mainChart');
        if (chartEl) {
            console.log('  Element wykresu znaleziony:', chartEl);
            this.state.mainChart.chartInstance = new ApexCharts(chartEl, options);
            this.state.mainChart.chartInstance.render();
            console.log('  ✅ Wykres wyrenderowany');

            // Generuj AI spostrzeżenia
            this.generateChartInsights(chartData);
        } else {
            console.error('  ❌ Element #mainChart nie znaleziony!');
        }
    },

    /**
     * Przygotuj dane do wykresu
     */
    prepareChartData() {
        console.log('🔄 Przygotowywanie danych do wykresu...');

        // Krok 1: Zagreguj dane dla każdej sekcji
        const aggregatedBySection = {};
        const allDates = new Set();

        this.state.activeSections.forEach(sectionKey => {
            const section = this.sections[sectionKey];
            const data = this.state.filteredData[sectionKey] || [];
            console.log(`  → ${section.name}: ${data.length} rekordów do agregacji`);

            const aggregated = this.aggregateData(data, sectionKey);
            console.log(`    Zagregowane:`, aggregated);

            aggregatedBySection[sectionKey] = aggregated;

            // Zbierz wszystkie unikalne daty
            Object.keys(aggregated).forEach(date => allDates.add(date));
        });

        // Krok 2: Posortuj wszystkie daty
        const categories = Array.from(allDates).sort();
        console.log(`  📅 Wszystkie daty w zakresie (${categories.length}):`, categories);

        // Krok 3: Wypełnij brakujące daty zerami dla każdej sekcji
        const series = [];
        const colors = [];

        this.state.activeSections.forEach(sectionKey => {
            const section = this.sections[sectionKey];
            const aggregated = aggregatedBySection[sectionKey];

            // Dla każdej daty: użyj wartości z agregacji lub 0
            const dataWithZeros = categories.map(date => aggregated[date] || 0);

            series.push({
                name: section.name,
                data: dataWithZeros
            });

            colors.push(section.color);

            console.log(`  → ${section.name}: wypełniono ${dataWithZeros.length} punktów (w tym ${dataWithZeros.filter(v => v === 0).length} zer)`);
        });

        console.log('  ✅ Przygotowano dane:', { series: series.length, colors: colors.length, categories: categories.length });
        return { series, colors, categories };
    },

    /**
     * Agreguj dane
     */
    aggregateData(data, sectionKey) {
        const aggregated = {};

        console.log(`    📊 Agregacja danych dla ${sectionKey}, ${data.length} rekordów`);
        if (data.length > 0) {
            console.log(`    📋 Przykładowy rekord:`, JSON.stringify(data[0], null, 2));
        }

        data.forEach(item => {
            // Sprawdź różne warianty nazw kolumn dat (małe i wielkie litery)
            const dateField = item['data'] || item['date'] || item['Data'] || item['Data wystawienia'] || '';
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

            // Agregacja specyficzna dla każdej sekcji
            let value = 1; // domyślnie: liczba rekordów

            switch(sectionKey) {
                case 'patrole':
                    // Patrole: pole 'razem_rodzaj' (łączna liczba patrol)
                    if (item['razem_rodzaj'] !== undefined) {
                        value = parseInt(item['razem_rodzaj']) || 0;
                        console.log(`      → ${key}: razem_rodzaj = ${value}`);
                    }
                    break;

                case 'wykroczenia':
                    // Wykroczenia: rodzaj_razem + mandat
                    value = parseInt(item['rodzaj_razem']) || parseInt(item['stan_razem']) || 0;
                    if (item['mandat_bool'] === true || item['mandat_bool'] === 'TAK') {
                        value += 1;
                    }
                    console.log(`      → ${key}: wykroczenia = ${value} (rodzaj_razem + mandat)`);
                    break;

                case 'wkrd':
                    // WKRD: pole 'RAZEM' z wiersza 'Pojazdy'
                    // Szukamy pól: pojazdy_razem, razem_pojazdy, razem, total, itp.
                    value = parseInt(item['pojazdy_razem']) || parseInt(item['razem_pojazdy']) ||
                            parseInt(item['razem']) || parseInt(item['total']) || 1;
                    console.log(`      → ${key}: WKRD = ${value}`);
                    break;

                case 'sankcje':
                    // Sankcje: 'Sankcja' → 'Razem' + zawsze 1 jeśli jest mandat
                    value = parseInt(item['sankcja_razem']) || parseInt(item['Sankcja_razem']) ||
                            parseInt(item['razem']) || 0;
                    // Zawsze dodaj 1 jeśli jest mandat
                    if (item['mandat'] === true || item['mandat'] === 'TAK' ||
                        item['mandat_bool'] === true || item['Mandat'] === true) {
                        value += 1;
                    }
                    console.log(`      → ${key}: sankcje = ${value} (sankcja_razem: ${item['sankcja_razem'] || item['Sankcja_razem'] || item['razem']}, mandat: ${item['mandat'] || item['mandat_bool'] || item['Mandat']})`);
                    break;

                case 'konwoje':
                    // Konwoje: 'Rodzaj konwoju' → 'Razem' = miejscowy + zamiejscowy
                    const miejscowy = parseInt(item['miejscowy']) || 0;
                    const zamiejscowy = parseInt(item['zamiejscowy']) || 0;
                    value = miejscowy + zamiejscowy;
                    console.log(`      → ${key}: konwoje = ${value} (miejscowy: ${miejscowy}, zamiejscowy: ${zamiejscowy})`);
                    break;

                case 'spb':
                    // ŚPB: ilość zaznaczonych checkboxów w "Środki ŚPB"
                    value = 0;

                    // Możliwe pola które mogą zawierać informacje o zaznaczonych checkboxach
                    const spbFields = [
                        'środki_spb', 'srodki_spb', 'Środki_ŚPB', 'Środki_SPB',
                        'środki', 'srodki', 'Środki', 'checkboxes', 'selected'
                    ];

                    let foundField = null;
                    let checkboxData = null;

                    for (const field of spbFields) {
                        if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
                            foundField = field;
                            checkboxData = item[field];
                            break;
                        }
                    }

                    if (checkboxData !== null) {
                        if (Array.isArray(checkboxData)) {
                            // Jeśli to tablica - licz jej długość
                            value = checkboxData.length;
                        } else if (typeof checkboxData === 'string') {
                            // Jeśli to string - podziel po przecinkach i licz elementy
                            const items = checkboxData.split(',').map(s => s.trim()).filter(s => s.length > 0);
                            value = items.length;
                        } else if (typeof checkboxData === 'object') {
                            // Jeśli to obiekt - licz true values
                            value = Object.values(checkboxData).filter(v => v === true || v === 'true' || v === 1).length;
                        } else if (typeof checkboxData === 'number') {
                            // Jeśli to już liczba - użyj jej bezpośrednio
                            value = checkboxData;
                        }
                        console.log(`      → ${key}: ŚPB = ${value} (pole: ${foundField}, typ: ${typeof checkboxData}, dane: ${JSON.stringify(checkboxData)})`);
                    } else {
                        // Jeśli nie znaleziono pola - sprawdź czy są pola numeryczne/booleanowskie dla poszczególnych środków
                        const spbCheckboxFields = [
                            'sila_fizyczna', 'kajdanki', 'Kajdanki', 'kaftan', 'kask', 'siatka',
                            'pałka', 'Pałka', 'palka', 'Palka', 'pies', 'Pies',
                            'chem_sr', 'gaz', 'Gaz', 'paralizator', 'Paralizator',
                            'kolczatka', 'bron'
                        ];

                        value = spbCheckboxFields.filter(field => {
                            const fieldValue = item[field];
                            // Sprawdź czy wartość to 1, true, 'TAK' lub '1'
                            return fieldValue === 1 || fieldValue === true || fieldValue === 'TAK' || fieldValue === '1' || fieldValue > 0;
                        }).length;

                        console.log(`      → ${key}: ŚPB = ${value} (zliczone z pól: sila_fizyczna=${item['sila_fizyczna']}, kajdanki=${item['kajdanki']}, kaftan=${item['kaftan']}, siatka=${item['siatka']}, palka=${item['palka']}, pies=${item['pies']}, chem_sr=${item['chem_sr']}, paralizator=${item['paralizator']}, kolczatka=${item['kolczatka']}, bron=${item['bron']})`);
                    }
                    break;

                case 'pilotaze':
                    // Pilotaże: "Rodzaj patrolu" → "Razem" = wlasne + sojusznicze
                    const wlasne = parseInt(item['wlasne']) || 0;
                    const sojusznicze = parseInt(item['sojusznicze']) || 0;
                    value = wlasne + sojusznicze;
                    console.log(`      → ${key}: pilotaże = ${value} (wlasne: ${wlasne}, sojusznicze: ${sojusznicze})`);
                    break;

                case 'zdarzenia':
                    // Zdarzenia drogowe: "Rodzaj zdarzenia" → "Razem" = wypadek + kolizja
                    const wypadek = parseInt(item['wypadek']) || 0;
                    const kolizja = parseInt(item['kolizja']) || 0;
                    value = wypadek + kolizja;
                    console.log(`      → ${key}: zdarzenia = ${value} (wypadek: ${wypadek}, kolizja: ${kolizja})`);
                    break;

                default:
                    // Inne kategorie: domyślnie liczba rekordów
                    console.log(`      → ${key}: liczba rekordów = 1`);
            }

            aggregated[key] = (aggregated[key] || 0) + value;
        });

        console.log(`    ✅ Wynik agregacji:`, aggregated);

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
        // Resetuj wszystkie filtry
        this.state.filters = {};
        this.state.dateFrom = null;
        this.state.dateTo = null;

        // Wyczyść pola dat w UI
        const dateFromInput = document.getElementById('filterDateFrom');
        const dateToInput = document.getElementById('filterDateTo');
        if (dateFromInput) dateFromInput.value = '';
        if (dateToInput) dateToInput.value = '';

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

    showChartSettings(chartId) {
        alert('Ustawienia wykresu: ' + chartId + ' (w budowie)');
    },

    exportToPNG() {
        if (!this.state.mainChart.chartInstance) {
            console.error('❌ Brak instancji wykresu');
            return;
        }

        // Upewnij się, że czcionka Roboto jest załadowana
        document.fonts.ready.then(() => {
            console.log('✅ Czcionki załadowane');

            // Pobierz wykres jako dataURI
            this.state.mainChart.chartInstance.dataURI().then(({ imgURI }) => {
                const chartImage = new Image();
                chartImage.crossOrigin = 'anonymous';

                chartImage.onload = () => {
                    // Pobierz tekst opisu - użyj innerText zamiast textContent
                    const insightsEl = document.getElementById('insightsContent');
                    let insightsText = '';

                    if (insightsEl) {
                        // innerText zachowuje formatowanie i pomija ukryte elementy
                        insightsText = insightsEl.innerText.trim();

                        // Jeśli innerText jest puste, spróbuj textContent
                        if (!insightsText) {
                            insightsText = insightsEl.textContent.trim();
                        }
                    }

                    console.log('🖼️ Eksport PNG:');
                    console.log('  insightsEl:', insightsEl);
                    console.log('  insightsEl.innerHTML:', insightsEl ? insightsEl.innerHTML.substring(0, 100) : 'null');
                    console.log('  insightsText:', insightsText);
                    console.log('  insightsText length:', insightsText.length);

                    // Stwórz canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Wymiary
                    const chartWidth = chartImage.width;
                    const chartHeight = chartImage.height;
                    const padding = 30;
                    const lineHeight = 26;
                    const maxWidth = chartWidth - (padding * 2);

                    // Ustaw czcionkę Roboto (sprawdź czy jest dostępna)
                    const fontFamily = document.fonts.check('16px Roboto') ? 'Roboto' : 'Arial';
                    ctx.font = `16px ${fontFamily}, sans-serif`;
                    console.log('  Używana czcionka:', fontFamily);

                    // Podziel tekst na linie
                    let lines = [];
                    if (insightsText && insightsText.length > 0) {
                        lines = this.wrapText(ctx, insightsText, maxWidth);
                        console.log('  Liczba linii:', lines.length);
                        console.log('  Pierwsze 3 linie:', lines.slice(0, 3));
                    } else {
                        console.warn('⚠️ Brak tekstu opisu do wyeksportowania');
                    }

                    const textHeight = lines.length > 0 ? (lines.length * lineHeight) + (padding * 3) : 0;
                    const totalHeight = chartHeight + textHeight;

                    console.log('  Wymiary canvas:', chartWidth, 'x', totalHeight);
                    console.log('  Wysokość tekstu:', textHeight);

                    // Ustaw wymiary canvas
                    canvas.width = chartWidth;
                    canvas.height = totalHeight;

                    // Ciemne tło (jak w UI)
                    ctx.fillStyle = '#1a202c';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Narysuj wykres
                    ctx.drawImage(chartImage, 0, 0);

                    // Narysuj opis (jeśli istnieje)
                    if (lines.length > 0) {
                        console.log('  ✏️ Rysowanie tekstu...');

                        const textY = chartHeight;

                        // Tło dla opisu
                        ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
                        ctx.fillRect(0, textY, chartWidth, textHeight);

                        // Ramka
                        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(1, textY + 1, chartWidth - 2, textHeight - 2);

                        // Nagłówek "Opis"
                        ctx.fillStyle = '#e6e6e6';
                        ctx.font = `bold 18px ${fontFamily}, sans-serif`;
                        ctx.fillText('Opis', padding, textY + padding + 18);

                        // Tekst opisu
                        ctx.fillStyle = '#d1d5db';
                        ctx.font = `16px ${fontFamily}, sans-serif`;

                        lines.forEach((line, index) => {
                            const y = textY + padding + 50 + (index * lineHeight);
                            ctx.fillText(line, padding, y);
                        });

                        console.log('  ✅ Tekst narysowany');
                    }

                    // Pobierz jako PNG
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `dashboard_${new Date().toISOString().split('T')[0]}.png`;
                            link.click();
                            URL.revokeObjectURL(url);
                            console.log('✅ PNG pobrany');
                        } else {
                            console.error('❌ Błąd tworzenia blobu');
                        }
                    }, 'image/png');
                };

                chartImage.onerror = () => {
                    console.error('❌ Błąd ładowania obrazu wykresu');
                };

                chartImage.src = imgURI;
            }).catch(err => {
                console.error('❌ Błąd pobierania dataURI:', err);
            });
        });
    },

    /**
     * Podziel tekst na linie (word wrap)
     */
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    },

    exportToCSV() {
        alert('Eksport CSV (w budowie)');
    },

    // ========================================
    // UI REFRESH
    // ========================================

    refreshView() {
        this.refreshActiveFilters();
        this.refreshKPI();
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
