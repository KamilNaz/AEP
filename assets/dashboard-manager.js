/**
 * Dashboard Hub - Advanced Analytics Dashboard
 * Kompleksowy system analizy danych z wieloma źródłami danych
 */

const DashboardHub = {
    // Stan dashboardu
    state: {
        // Aktywne filtry dla każdego typu danych
        activeFilters: {
            patrole: {},
            wykroczenia: {},
            wkrd: {},
            sankcje: {},
            konwoje: {},
            spb: {},
            pilotaze: {},
            zdarzenia: {}
        },

        // Wybrane źródła danych do analizy
        selectedDataSources: ['patrole'],

        // Ustawienia wykresu
        chartConfig: {
            type: 'line', // line, bar, pie, area
            aggregation: 'day', // day, week, month
            dateFrom: null,
            dateTo: null
        },

        // Przełączniki widoczności
        showKPI: true,
        showDataTable: false,

        // Dane
        chartData: null,
        filteredData: {},

        // Wykres ApexCharts
        chart: null
    },

    // Konfiguracja dostępnych źródeł danych
    dataSources: {
        patrole: {
            name: 'Patrole',
            icon: 'fa-car-side',
            color: '#3b82f6',
            storageKey: 'aep_data_patrole',
            columns: ['Data', 'Godz. rozpoczęcia', 'Godz. zakończenia', 'Oznaczenie', 'Obszar', 'Pojazd', 'Nr rej.', 'Dowódca', 'Skład', 'Przebieg (km)', 'Uwagi', 'Status']
        },
        wykroczenia: {
            name: 'Wykroczenia',
            icon: 'fa-scale-balanced',
            color: '#f59e0b',
            storageKey: 'aep_data_wykroczenia',
            columns: ['Data', 'Godzina', 'Miejsce', 'Rodzaj wykroczenia', 'Funkcjonariusz', 'Mandat', 'Pouczenie', 'Notatka służbowa', 'Status']
        },
        wkrd: {
            name: 'WKRD',
            icon: 'fa-shield-halved',
            color: '#8b5cf6',
            storageKey: 'aep_data_wkrd',
            columns: ['Data', 'Godz. rozpoczęcia', 'Godz. zakończenia', 'Oznaczenie', 'Siły i środki', 'Rodzaj zabezpieczenia', 'Cel', 'Dowódca', 'Liczba funkcjonariuszy', 'Przebieg', 'Status']
        },
        sankcje: {
            name: 'Sankcje',
            icon: 'fa-money-bill-wave',
            color: '#22c55e',
            storageKey: 'aep_data_sankcje',
            columns: ['Data wystawienia', 'Nr mandatu', 'Kwota (zł)', 'Wykroczenie', 'Funkcjonariusz', 'Miejsce', 'Status płatności', 'Uwagi']
        },
        konwoje: {
            name: 'Konwoje',
            icon: 'fa-arrow-right-arrow-left',
            color: '#ec4899',
            storageKey: 'aep_data_konwoje',
            columns: ['Data', 'Godz. rozpoczęcia', 'Godz. zakończenia', 'Oznaczenie', 'Trasa', 'Pojazdy', 'Eskortowani', 'Cel konwoju', 'Dowódca', 'Skład', 'Uwagi', 'Status']
        },
        spb: {
            name: 'ŚPB',
            icon: 'fa-hand-fist',
            color: '#ef4444',
            storageKey: 'aep_data_spb',
            columns: ['Data', 'Godz. rozpoczęcia', 'Godz. zakończenia', 'Rodzaj interwencji', 'Miejsce', 'Siły', 'Dowódca', 'Przebieg', 'Użycie przymusu', 'Raport', 'Status']
        },
        pilotaze: {
            name: 'Pilotaże',
            icon: 'fa-flag-checkered',
            color: '#06b6d4',
            storageKey: 'aep_data_pilotaze',
            columns: ['Data', 'Godz. rozpoczęcia', 'Godz. zakończenia', 'Oznaczenie', 'Trasa', 'Pojazd pilotowany', 'Nr rej.', 'Kierowca', 'Cel podróży', 'Funkcjonariusze', 'Uwagi', 'Status']
        },
        zdarzenia: {
            name: 'Zdarzenia drogowe',
            icon: 'fa-car-burst',
            color: '#f97316',
            storageKey: 'aep_data_zdarzenia',
            columns: ['Data', 'Godzina', 'Miejsce', 'Rodzaj', 'Pojazdy', 'Ofiary', 'Alkohol', 'Protokół', 'Funkcjonariusz', 'Status']
        }
    },

    /**
     * Główna funkcja renderująca dashboard
     */
    render() {
        const mainContent = document.getElementById('mainContent');

        // Załaduj dane z localStorage
        this.loadAllData();

        // Ustaw domyślny zakres dat (ostatnie 30 dni)
        if (!this.state.chartConfig.dateTo) {
            this.state.chartConfig.dateTo = new Date().toISOString().split('T')[0];
        }
        if (!this.state.chartConfig.dateFrom) {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            this.state.chartConfig.dateFrom = date.toISOString().split('T')[0];
        }

        mainContent.innerHTML = `
            <div class="dashboard-view">
                <!-- Header -->
                <div class="dashboard-header">
                    <h1 class="section-title">
                        <i class="fas fa-chart-line"></i> Dashboard Analityczny
                    </h1>
                    <p class="section-subtitle">Zaawansowana analiza i wizualizacja danych operacyjnych</p>
                </div>

                <div class="dashboard-container">
                    <!-- Filters Sidebar -->
                    <aside class="dashboard-sidebar" id="dashboardSidebar">
                        <div class="sidebar-header-dash">
                            <h3><i class="fas fa-filter"></i> Filtry</h3>
                            <button class="btn-icon-dash" onclick="DashboardHub.toggleSidebar()" title="Zwiń/Rozwiń">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                        </div>

                        <div class="filters-container" id="filtersContainer">
                            ${this.renderFiltersPanel()}
                        </div>

                        <div class="sidebar-actions">
                            <button class="btn-primary btn-block" onclick="DashboardHub.applyFilters()">
                                <i class="fas fa-check"></i> Zastosuj
                            </button>
                            <button class="btn-secondary btn-block" onclick="DashboardHub.resetFilters()">
                                <i class="fas fa-rotate-right"></i> Reset
                            </button>
                        </div>
                    </aside>

                    <!-- Main Chart Area -->
                    <main class="dashboard-main">
                        <!-- Active Filters -->
                        <div class="active-filters" id="activeFilters">
                            ${this.renderActiveFilters()}
                        </div>

                        <!-- Chart Controls -->
                        <div class="chart-controls">
                            ${this.renderChartControls()}
                        </div>

                        <!-- Main Chart -->
                        <div class="chart-container">
                            <div id="dashboardChart"></div>
                        </div>

                        <!-- KPI Cards (Optional) -->
                        <div class="kpi-section" id="kpiSection" style="display: ${this.state.showKPI ? 'block' : 'none'}">
                            ${this.renderKPICards()}
                        </div>

                        <!-- Data Table (Optional) -->
                        <div class="data-table-section" id="dataTableSection" style="display: ${this.state.showDataTable ? 'block' : 'none'}">
                            ${this.renderDataTable()}
                        </div>
                    </main>
                </div>
            </div>
        `;

        // Renderuj wykres
        this.renderChart();
    },

    /**
     * Renderuj panel filtrów
     */
    renderFiltersPanel() {
        let html = '<div class="filter-sections">';

        Object.keys(this.dataSources).forEach(sourceKey => {
            const source = this.dataSources[sourceKey];
            const isExpanded = this.state.selectedDataSources.includes(sourceKey);

            html += `
                <div class="filter-section ${isExpanded ? 'expanded' : ''}">
                    <div class="filter-section-header" onclick="DashboardHub.toggleFilterSection('${sourceKey}')">
                        <div class="filter-section-title">
                            <input type="checkbox"
                                id="source_${sourceKey}"
                                ${this.state.selectedDataSources.includes(sourceKey) ? 'checked' : ''}
                                onclick="event.stopPropagation(); DashboardHub.toggleDataSource('${sourceKey}')"
                            />
                            <label for="source_${sourceKey}">
                                <i class="fas ${source.icon}" style="color: ${source.color}"></i>
                                ${source.name}
                            </label>
                        </div>
                        <i class="fas fa-chevron-down toggle-icon"></i>
                    </div>

                    <div class="filter-section-content">
                        ${this.renderColumnFilters(sourceKey, source.columns)}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    },

    /**
     * Renderuj filtry dla kolumn
     */
    renderColumnFilters(sourceKey, columns) {
        let html = '<div class="column-filters">';

        // Specjalne filtry dla dat
        html += `
            <div class="filter-group">
                <label class="filter-label">Zakres dat:</label>
                <div class="date-range-filter">
                    <input type="date"
                        id="filter_${sourceKey}_dateFrom"
                        class="form-control-sm"
                        value="${this.state.chartConfig.dateFrom || ''}"
                        onchange="DashboardHub.updateDateFilter('${sourceKey}', 'from', this.value)"
                    />
                    <span>do</span>
                    <input type="date"
                        id="filter_${sourceKey}_dateTo"
                        class="form-control-sm"
                        value="${this.state.chartConfig.dateTo || ''}"
                        onchange="DashboardHub.updateDateFilter('${sourceKey}', 'to', this.value)"
                    />
                </div>
            </div>
        `;

        // Filtry dla pozostałych kolumn
        columns.forEach((col, index) => {
            if (!col.toLowerCase().includes('data') && !col.toLowerCase().includes('godz')) {
                const filterId = `filter_${sourceKey}_${index}`;
                html += `
                    <div class="filter-group">
                        <label class="filter-label" for="${filterId}">${col}:</label>
                        <input type="text"
                            id="${filterId}"
                            class="form-control-sm"
                            placeholder="Szukaj..."
                            onchange="DashboardHub.updateColumnFilter('${sourceKey}', '${col}', this.value)"
                        />
                    </div>
                `;
            }
        });

        html += '</div>';
        return html;
    },

    /**
     * Renderuj aktywne filtry (chipsy)
     */
    renderActiveFilters() {
        const chips = [];

        // Źródła danych
        this.state.selectedDataSources.forEach(source => {
            const config = this.dataSources[source];
            chips.push(`
                <div class="filter-chip" style="border-color: ${config.color}">
                    <i class="fas ${config.icon}" style="color: ${config.color}"></i>
                    <span>${config.name}</span>
                    <button onclick="DashboardHub.removeDataSource('${source}')" class="chip-remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
        });

        // Zakres dat
        if (this.state.chartConfig.dateFrom || this.state.chartConfig.dateTo) {
            chips.push(`
                <div class="filter-chip">
                    <i class="fas fa-calendar"></i>
                    <span>${this.state.chartConfig.dateFrom || '...'} - ${this.state.chartConfig.dateTo || '...'}</span>
                </div>
            `);
        }

        if (chips.length === 0) {
            return '<p class="no-filters">Brak aktywnych filtrów</p>';
        }

        return `
            <div class="filters-header">
                <span>Aktywne filtry:</span>
            </div>
            <div class="filter-chips">
                ${chips.join('')}
            </div>
        `;
    },

    /**
     * Renderuj kontrolki wykresu
     */
    renderChartControls() {
        return `
            <div class="controls-row">
                <div class="control-group">
                    <label>Typ wykresu:</label>
                    <div class="btn-group">
                        <button class="btn-control ${this.state.chartConfig.type === 'line' ? 'active' : ''}"
                            onclick="DashboardHub.changeChartType('line')" title="Liniowy">
                            <i class="fas fa-chart-line"></i>
                        </button>
                        <button class="btn-control ${this.state.chartConfig.type === 'bar' ? 'active' : ''}"
                            onclick="DashboardHub.changeChartType('bar')" title="Słupkowy">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                        <button class="btn-control ${this.state.chartConfig.type === 'area' ? 'active' : ''}"
                            onclick="DashboardHub.changeChartType('area')" title="Obszarowy">
                            <i class="fas fa-chart-area"></i>
                        </button>
                        <button class="btn-control ${this.state.chartConfig.type === 'pie' ? 'active' : ''}"
                            onclick="DashboardHub.changeChartType('pie')" title="Kołowy">
                            <i class="fas fa-chart-pie"></i>
                        </button>
                    </div>
                </div>

                <div class="control-group">
                    <label>Agregacja:</label>
                    <select class="form-control-sm" onchange="DashboardHub.changeAggregation(this.value)">
                        <option value="day" ${this.state.chartConfig.aggregation === 'day' ? 'selected' : ''}>Dzień</option>
                        <option value="week" ${this.state.chartConfig.aggregation === 'week' ? 'selected' : ''}>Tydzień</option>
                        <option value="month" ${this.state.chartConfig.aggregation === 'month' ? 'selected' : ''}>Miesiąc</option>
                    </select>
                </div>

                <div class="control-group">
                    <label>Opcje:</label>
                    <div class="toggle-switches">
                        <label class="toggle-label">
                            <input type="checkbox" ${this.state.showKPI ? 'checked' : ''}
                                onchange="DashboardHub.toggleKPI(this.checked)">
                            <span>KPI</span>
                        </label>
                        <label class="toggle-label">
                            <input type="checkbox" ${this.state.showDataTable ? 'checked' : ''}
                                onchange="DashboardHub.toggleDataTable(this.checked)">
                            <span>Tabela</span>
                        </label>
                    </div>
                </div>

                <div class="control-group">
                    <button class="btn-secondary btn-sm" onclick="DashboardHub.exportChart()">
                        <i class="fas fa-download"></i> Eksport PNG
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Renderuj karty KPI
     */
    renderKPICards() {
        const kpis = this.calculateKPIs();

        return `
            <div class="kpi-header">
                <h3><i class="fas fa-gauge-high"></i> Wskaźniki KPI</h3>
            </div>
            <div class="kpi-cards">
                ${kpis.map(kpi => `
                    <div class="kpi-card" style="border-top: 3px solid ${kpi.color}">
                        <div class="kpi-icon" style="background: ${kpi.color}20; color: ${kpi.color}">
                            <i class="fas ${kpi.icon}"></i>
                        </div>
                        <div class="kpi-content">
                            <div class="kpi-label">${kpi.label}</div>
                            <div class="kpi-value">${kpi.value}</div>
                            ${kpi.trend ? `<div class="kpi-trend ${kpi.trend > 0 ? 'up' : 'down'}">
                                <i class="fas fa-arrow-${kpi.trend > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(kpi.trend)}%
                            </div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Renderuj tabelę szczegółów
     */
    renderDataTable() {
        return `
            <div class="table-header">
                <h3><i class="fas fa-table"></i> Szczegółowe dane</h3>
            </div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Kategoria</th>
                            <th>Wartość</th>
                        </tr>
                    </thead>
                    <tbody id="dataTableBody">
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

        this.state.selectedDataSources.forEach(source => {
            const data = this.state.filteredData[source] || [];
            const config = this.dataSources[source];

            data.slice(0, 50).forEach(item => {
                const dateField = item['Data'] || item['Data wystawienia'] || '';
                rows.push(`
                    <tr>
                        <td>${dateField}</td>
                        <td>
                            <span class="category-badge" style="background: ${config.color}20; color: ${config.color}">
                                <i class="fas ${config.icon}"></i> ${config.name}
                            </span>
                        </td>
                        <td>${Object.values(item).slice(1, 3).join(' | ')}</td>
                    </tr>
                `);
            });
        });

        if (rows.length === 0) {
            return '<tr><td colspan="3" class="no-data">Brak danych</td></tr>';
        }

        return rows.join('');
    },

    /**
     * Renderuj główny wykres
     */
    renderChart() {
        const chartData = this.prepareChartData();

        // Zniszcz poprzedni wykres jeśli istnieje
        if (this.state.chart) {
            this.state.chart.destroy();
        }

        // Konfiguracja wykresu
        const options = {
            series: chartData.series,
            chart: {
                type: this.state.chartConfig.type,
                height: 450,
                background: 'transparent',
                foreColor: '#9aa3b2',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                animations: {
                    enabled: true,
                    speed: 800
                }
            },
            colors: chartData.colors,
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            xaxis: {
                categories: chartData.categories,
                labels: {
                    style: {
                        colors: '#9aa3b2'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#9aa3b2'
                    }
                }
            },
            grid: {
                borderColor: '#2d3748',
                strokeDashArray: 4
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                labels: {
                    colors: '#e6e6e6'
                }
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: function(value) {
                        return value + ' rekordów';
                    }
                }
            },
            theme: {
                mode: 'dark'
            }
        };

        // Specjalna konfiguracja dla wykresu kołowego
        if (this.state.chartConfig.type === 'pie') {
            options.labels = chartData.categories;
            options.legend.position = 'bottom';
        }

        // Renderuj wykres
        const chartElement = document.querySelector('#dashboardChart');
        if (chartElement) {
            this.state.chart = new ApexCharts(chartElement, options);
            this.state.chart.render();
        }
    },

    /**
     * Przygotuj dane do wykresu
     */
    prepareChartData() {
        const series = [];
        const colors = [];
        const categories = [];

        // Dla każdego wybranego źródła danych
        this.state.selectedDataSources.forEach(sourceKey => {
            const config = this.dataSources[sourceKey];
            const data = this.state.filteredData[sourceKey] || [];

            // Agreguj dane według wybranego okresu
            const aggregated = this.aggregateData(data, sourceKey);

            // Dodaj serię danych
            series.push({
                name: config.name,
                data: Object.values(aggregated)
            });

            colors.push(config.color);

            // Kategorie (etykiety osi X) - używamy pierwszego źródła
            if (categories.length === 0) {
                categories.push(...Object.keys(aggregated));
            }
        });

        return { series, colors, categories };
    },

    /**
     * Agreguj dane według wybranego okresu
     */
    aggregateData(data, sourceKey) {
        const aggregated = {};
        const config = this.state.chartConfig;

        data.forEach(item => {
            // Znajdź pole z datą
            const dateField = item['Data'] || item['Data wystawienia'] || '';
            if (!dateField) return;

            let key;
            const date = new Date(dateField);

            if (isNaN(date.getTime())) return;

            // Agregacja według wybranego okresu
            if (config.aggregation === 'day') {
                key = dateField;
            } else if (config.aggregation === 'week') {
                const weekNum = this.getWeekNumber(date);
                key = `${date.getFullYear()}-W${weekNum}`;
            } else if (config.aggregation === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            aggregated[key] = (aggregated[key] || 0) + 1;
        });

        // Sortuj według klucza (daty)
        const sorted = Object.keys(aggregated).sort().reduce((acc, key) => {
            acc[key] = aggregated[key];
            return acc;
        }, {});

        return sorted;
    },

    /**
     * Oblicz numer tygodnia
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    /**
     * Oblicz wskaźniki KPI
     */
    calculateKPIs() {
        const kpis = [];

        this.state.selectedDataSources.forEach(sourceKey => {
            const config = this.dataSources[sourceKey];
            const data = this.state.filteredData[sourceKey] || [];

            if (data.length > 0) {
                const total = data.length;
                const avg = (total / 30).toFixed(1); // Średnia dzienna (zakładając 30 dni)

                kpis.push({
                    label: `${config.name} - Suma`,
                    value: total,
                    icon: config.icon,
                    color: config.color,
                    trend: null
                });

                kpis.push({
                    label: `${config.name} - Średnia/dzień`,
                    value: avg,
                    icon: 'fa-chart-line',
                    color: config.color,
                    trend: null
                });
            }
        });

        return kpis;
    },

    /**
     * Załaduj wszystkie dane z localStorage
     */
    loadAllData() {
        Object.keys(this.dataSources).forEach(sourceKey => {
            const config = this.dataSources[sourceKey];
            const data = Utils.loadFromLocalStorage(config.storageKey) || [];
            this.state.filteredData[sourceKey] = this.filterDataByDateRange(data, sourceKey);
        });
    },

    /**
     * Filtruj dane według zakresu dat
     */
    filterDataByDateRange(data, sourceKey) {
        const { dateFrom, dateTo } = this.state.chartConfig;

        if (!dateFrom && !dateTo) return data;

        return data.filter(item => {
            const dateField = item['Data'] || item['Data wystawienia'] || '';
            if (!dateField) return false;

            const itemDate = new Date(dateField);
            if (isNaN(itemDate.getTime())) return false;

            if (dateFrom && itemDate < new Date(dateFrom)) return false;
            if (dateTo && itemDate > new Date(dateTo)) return false;

            return true;
        });
    },

    // ========================================
    // EVENT HANDLERS
    // ========================================

    /**
     * Przełącz widoczność sekcji filtrów
     */
    toggleFilterSection(sourceKey) {
        const section = event.target.closest('.filter-section');
        section.classList.toggle('expanded');
    },

    /**
     * Przełącz źródło danych
     */
    toggleDataSource(sourceKey) {
        const index = this.state.selectedDataSources.indexOf(sourceKey);

        if (index > -1) {
            this.state.selectedDataSources.splice(index, 1);
        } else {
            this.state.selectedDataSources.push(sourceKey);
        }

        // Odśwież widok
        this.refreshView();
    },

    /**
     * Usuń źródło danych z chipsa
     */
    removeDataSource(sourceKey) {
        const index = this.state.selectedDataSources.indexOf(sourceKey);
        if (index > -1) {
            this.state.selectedDataSources.splice(index, 1);
        }

        // Odznacz checkbox
        const checkbox = document.getElementById(`source_${sourceKey}`);
        if (checkbox) checkbox.checked = false;

        this.refreshView();
    },

    /**
     * Zaktualizuj filtr dat
     */
    updateDateFilter(sourceKey, type, value) {
        if (type === 'from') {
            this.state.chartConfig.dateFrom = value;
        } else {
            this.state.chartConfig.dateTo = value;
        }

        // Automatycznie zastosuj filtry
        this.applyFilters();
    },

    /**
     * Zaktualizuj filtr kolumny
     */
    updateColumnFilter(sourceKey, column, value) {
        if (!this.state.activeFilters[sourceKey]) {
            this.state.activeFilters[sourceKey] = {};
        }

        if (value) {
            this.state.activeFilters[sourceKey][column] = value;
        } else {
            delete this.state.activeFilters[sourceKey][column];
        }
    },

    /**
     * Zastosuj filtry
     */
    applyFilters() {
        this.loadAllData();

        // Zastosuj dodatkowe filtry kolumn
        Object.keys(this.state.activeFilters).forEach(sourceKey => {
            const filters = this.state.activeFilters[sourceKey];
            let data = this.state.filteredData[sourceKey] || [];

            Object.keys(filters).forEach(column => {
                const filterValue = filters[column].toLowerCase();
                data = data.filter(item => {
                    const itemValue = String(item[column] || '').toLowerCase();
                    return itemValue.includes(filterValue);
                });
            });

            this.state.filteredData[sourceKey] = data;
        });

        this.refreshView();
    },

    /**
     * Resetuj filtry
     */
    resetFilters() {
        this.state.activeFilters = {
            patrole: {},
            wykroczenia: {},
            wkrd: {},
            sankcje: {},
            konwoje: {},
            spb: {},
            pilotaze: {},
            zdarzenia: {}
        };

        // Wyczyść pola filtrów
        document.querySelectorAll('.column-filters input[type="text"]').forEach(input => {
            input.value = '';
        });

        this.applyFilters();
    },

    /**
     * Zmień typ wykresu
     */
    changeChartType(type) {
        this.state.chartConfig.type = type;
        this.refreshView();
    },

    /**
     * Zmień agregację
     */
    changeAggregation(aggregation) {
        this.state.chartConfig.aggregation = aggregation;
        this.refreshView();
    },

    /**
     * Przełącz widoczność KPI
     */
    toggleKPI(show) {
        this.state.showKPI = show;
        const section = document.getElementById('kpiSection');
        if (section) {
            section.style.display = show ? 'block' : 'none';
        }
    },

    /**
     * Przełącz widoczność tabeli
     */
    toggleDataTable(show) {
        this.state.showDataTable = show;
        const section = document.getElementById('dataTableSection');
        if (section) {
            section.style.display = show ? 'block' : 'none';
        }
    },

    /**
     * Eksportuj wykres do PNG
     */
    exportChart() {
        if (this.state.chart) {
            this.state.chart.dataURI().then(({ imgURI }) => {
                const link = document.createElement('a');
                link.href = imgURI;
                link.download = `dashboard_${new Date().toISOString().split('T')[0]}.png`;
                link.click();
            });
        }
    },

    /**
     * Przełącz sidebar
     */
    toggleSidebar() {
        const sidebar = document.getElementById('dashboardSidebar');
        sidebar.classList.toggle('collapsed');
    },

    /**
     * Odśwież widok
     */
    refreshView() {
        // Odśwież aktywne filtry
        const activeFiltersEl = document.getElementById('activeFilters');
        if (activeFiltersEl) {
            activeFiltersEl.innerHTML = this.renderActiveFilters();
        }

        // Odśwież kontrolki
        const controlsEl = document.querySelector('.chart-controls');
        if (controlsEl) {
            controlsEl.innerHTML = this.renderChartControls();
        }

        // Odśwież wykres
        this.renderChart();

        // Odśwież KPI jeśli widoczne
        if (this.state.showKPI) {
            const kpiSection = document.getElementById('kpiSection');
            if (kpiSection) {
                kpiSection.innerHTML = this.renderKPICards();
            }
        }

        // Odśwież tabelę jeśli widoczna
        if (this.state.showDataTable) {
            const tableBody = document.getElementById('dataTableBody');
            if (tableBody) {
                tableBody.innerHTML = this.renderTableRows();
            }
        }
    }
};
