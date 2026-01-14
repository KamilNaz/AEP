// ============================================
// PROFESSIONAL REPORT GENERATION SYSTEM
// Full implementation with Executive Summary priority
// ============================================

/**
 * @typedef {Object} RawDataRow
 * @property {string} [data] - Data w formacie DD.MM.YYYY
 * @property {string} [jzw] - Jednostka Żandarmerii Wojskowej
 * @property {string} [podstawa_prawna] - Podstawa prawna wykroczenia
 */

/**
 * @typedef {Object} RawData
 * @property {RawDataRow[]} patrole - Lista patroli
 * @property {RawDataRow[]} wykroczenia - Lista wykroczeń
 * @property {RawDataRow[]} wkrd - Lista kontroli WKRD
 * @property {RawDataRow[]} sankcje - Lista sankcji/mandatów
 * @property {RawDataRow[]} konwoje - Lista konwojów
 * @property {RawDataRow[]} spb - Lista użyć środków przymusu
 * @property {RawDataRow[]} pilotaze - Lista pilotaży
 * @property {RawDataRow[]} zdarzenia - Lista zdarzeń drogowych
 */

/**
 * @typedef {Object} AggregatedCounts
 * @property {number} patrole - Liczba patroli
 * @property {number} wykroczenia - Liczba wykroczeń
 * @property {number} wkrd - Liczba kontroli WKRD
 * @property {number} mandaty - Liczba mandatów
 * @property {number} konwoje - Liczba konwojów
 * @property {number} spb - Liczba użyć środków przymusu
 * @property {number} pilotaze - Liczba pilotaży
 * @property {number} zdarzenia - Liczba zdarzeń
 */

/**
 * @typedef {Object} KPIs
 * @property {string} wykroczeniaPerPatrol - Wykroczenia na patrol
 * @property {number} mandatyPerPatrol - Średnia wartość mandatów na patrol
 * @property {string} detectionEfficiency - Procent efektywności wykrywania
 * @property {number} avgMandat - Średnia wartość mandatu
 * @property {string} activityRate - Wskaźnik aktywności
 * @property {string} wkrdPer100 - WKRD na 100 patroli
 */

/**
 * @typedef {Object} TopItem
 * @property {string} name - Nazwa elementu
 * @property {number} count - Liczba wystąpień
 */

/**
 * @typedef {Object} AggregatedData
 * @property {AggregatedCounts} counts - Zliczone dane
 * @property {number} sumaMandatow - Suma wszystkich mandatów
 * @property {KPIs} kpis - Wskaźniki wydajności
 * @property {TopItem[]} topJZW - Top 5 JŻW
 * @property {TopItem[]} topPodstawy - Top 5 podstaw prawnych
 * @property {RawData} filtered - Przefiltrowane dane
 * @property {{from: string|null, to: string|null}} dateRange - Zakres dat
 */

/**
 * DataProcessor - Agregacja i przetwarzanie danych
 */
const DataProcessor = {
    /**
     * Pobiera wszystkie dane z localStorage
     * @returns {RawData} Wszystkie dane z localStorage
     */
    getAllData() {
        return {
            patrole: Utils.loadFromLocalStorage('aep_data_patrole') || [],
            wykroczenia: Utils.loadFromLocalStorage('aep_data_wykroczenia') || [],
            wkrd: Utils.loadFromLocalStorage('aep_data_wkrd') || [],
            sankcje: Utils.loadFromLocalStorage('aep_data_sankcje') || [],
            konwoje: Utils.loadFromLocalStorage('aep_data_konwoje') || [],
            spb: Utils.loadFromLocalStorage('aep_data_spb') || [],
            pilotaze: Utils.loadFromLocalStorage('aep_data_pilotaze') || [],
            zdarzenia: Utils.loadFromLocalStorage('aep_data_zdarzenia') || []
        };
    },

    /**
     * Filtruje dane według zakresu dat
     * @param {RawDataRow[]} data - Dane do przefiltrowania
     * @param {string|null} dateFrom - Data początkowa (format YYYY-MM-DD)
     * @param {string|null} dateTo - Data końcowa (format YYYY-MM-DD)
     * @returns {RawDataRow[]} Przefiltrowane dane
     */
    filterByDateRange(data, dateFrom, dateTo) {
        if (!dateFrom && !dateTo) return data;

        return data.filter(row => {
            if (!row.data) return true;
            const rowDate = this.parsePolishDate(row.data);
            if (!rowDate) return true;

            if (dateFrom) {
                const from = new Date(dateFrom);
                if (rowDate < from) return false;
            }

            if (dateTo) {
                const to = new Date(dateTo);
                to.setHours(23, 59, 59);
                if (rowDate > to) return false;
            }

            return true;
        });
    },

    /**
     * Parsuje datę w formacie polskim DD.MM.YYYY
     * @param {string} dateStr - Data w formacie DD.MM.YYYY
     * @returns {Date|null} Obiekt Date lub null jeśli nieprawidłowy format
     */
    parsePolishDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);

        return new Date(year, month, day);
    },

    /**
     * Agreguje dane do postaci przydatnej dla raportów
     * @param {RawData} rawData - Surowe dane z localStorage
     * @param {string|null} dateFrom - Data początkowa (format YYYY-MM-DD)
     * @param {string|null} dateTo - Data końcowa (format YYYY-MM-DD)
     * @returns {AggregatedData} Zagregowane dane z KPI i analizami
     */
    aggregateData(rawData, dateFrom, dateTo) {
        const filtered = {
            patrole: this.filterByDateRange(rawData.patrole, dateFrom, dateTo),
            wykroczenia: this.filterByDateRange(rawData.wykroczenia, dateFrom, dateTo),
            wkrd: this.filterByDateRange(rawData.wkrd, dateFrom, dateTo),
            sankcje: this.filterByDateRange(rawData.sankcje, dateFrom, dateTo),
            konwoje: this.filterByDateRange(rawData.konwoje, dateFrom, dateTo),
            spb: this.filterByDateRange(rawData.spb, dateFrom, dateTo),
            pilotaze: this.filterByDateRange(rawData.pilotaze, dateFrom, dateTo),
            zdarzenia: this.filterByDateRange(rawData.zdarzenia, dateFrom, dateTo)
        };

        // Podstawowe liczby
        const counts = {
            patrole: filtered.patrole.length,
            wykroczenia: filtered.wykroczenia.length,
            wkrd: filtered.wkrd.length,
            mandaty: filtered.sankcje.length,
            konwoje: filtered.konwoje.length,
            spb: filtered.spb.length,
            pilotaze: filtered.pilotaze.length,
            zdarzenia: filtered.zdarzenia.length
        };

        // Suma mandatów
        const sumaMandatow = filtered.sankcje.reduce((sum, row) =>
            sum + (parseInt(row.wysokosc_mandatu) || 0), 0
        );

        // KPI
        const kpis = {
            wykroczeniaPerPatrol: counts.patrole > 0
                ? (counts.wykroczenia / counts.patrole).toFixed(2)
                : '0.00',
            mandatyPerPatrol: counts.patrole > 0
                ? Math.round(sumaMandatow / counts.patrole)
                : 0,
            detectionEfficiency: counts.wykroczenia > 0
                ? ((counts.mandaty / counts.wykroczenia) * 100).toFixed(1)
                : '0.0',
            avgMandat: counts.mandaty > 0
                ? Math.round(sumaMandatow / counts.mandaty)
                : 0,
            activityRate: counts.patrole > 0
                ? ((counts.wykroczenia + counts.wkrd + counts.konwoje +
                    counts.spb + counts.pilotaze + counts.zdarzenia) / counts.patrole).toFixed(2)
                : '0.00',
            wkrdPer100: counts.patrole > 0
                ? ((counts.wkrd / counts.patrole) * 100).toFixed(1)
                : '0.0'
        };

        // Top JŻW (dla patroli)
        const jzwPatroleMap = {};
        filtered.patrole.forEach(patrol => {
            const jzw = patrol.jzw || 'Nieznane';
            jzwPatroleMap[jzw] = (jzwPatroleMap[jzw] || 0) + 1;
        });

        const topJZW = Object.entries(jzwPatroleMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // Top podstawy prawne
        const podstawyMap = {};
        filtered.wykroczenia.forEach(w => {
            const podstawa = w.podstawa_prawna || 'Nieznana';
            podstawyMap[podstawa] = (podstawyMap[podstawa] || 0) + 1;
        });

        const topPodstawy = Object.entries(podstawyMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return {
            counts,
            sumaMandatow,
            kpis,
            topJZW,
            topPodstawy,
            filtered,
            dateRange: { from: dateFrom, to: dateTo }
        };
    }
};

/**
 * @typedef {Object} Insight
 * @property {string} type - Typ insightu (positive, negative, warning, info, danger)
 * @property {string} icon - Klasa ikony FontAwesome
 * @property {string} text - Treść insightu
 * @property {string} priority - Priorytet (high, medium, low, critical)
 */

/**
 * @typedef {Object} Recommendation
 * @property {string} icon - Klasa ikony FontAwesome
 * @property {string} title - Tytuł rekomendacji
 * @property {string} description - Opis aktualnego stanu
 * @property {string} action - Zalecana akcja do podjęcia
 * @property {string} priority - Priorytet (high, medium, low)
 */

/**
 * AnalyticsEngine - Automatyczne generowanie insights i rekomendacji
 */
const AnalyticsEngine = {
    /**
     * Generuje insights na podstawie zagregowanych danych
     * @param {AggregatedData} aggregatedData - Zagregowane dane
     * @param {AggregatedData|null} [previousPeriodData=null] - Dane z poprzedniego okresu (opcjonalne)
     * @returns {Insight[]} Lista insights (max 5)
     */
    generateInsights(aggregatedData, previousPeriodData = null) {
        const insights = [];

        // 1. Insights o wzrostach/spadkach (jeśli mamy dane z poprzedniego okresu)
        if (previousPeriodData) {
            insights.push(...this.generateComparisonInsights(aggregatedData, previousPeriodData));
        }

        // 2. Insights o efektywności
        insights.push(...this.generateEfficiencyInsights(aggregatedData));

        // 3. Insights o topowych JŻW
        insights.push(...this.generateTopPerformerInsights(aggregatedData));

        // 4. Red flags
        insights.push(...this.generateRedFlags(aggregatedData));

        return insights.slice(0, 5); // Max 5 najważniejszych
    },

    /**
     * Generuje insights porównawcze między okresami
     * @param {AggregatedData} current - Dane z bieżącego okresu
     * @param {AggregatedData} previous - Dane z poprzedniego okresu
     * @returns {Insight[]} Lista insights porównawczych
     */
    generateComparisonInsights(current, previous) {
        const insights = [];
        const { counts: curr } = current;
        const { counts: prev } = previous;

        // Porównaj patrole
        if (prev.patrole > 0) {
            const change = ((curr.patrole - prev.patrole) / prev.patrole) * 100;
            if (Math.abs(change) >= 15) {
                insights.push({
                    type: change > 0 ? 'positive' : 'negative',
                    icon: change > 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down',
                    text: `Liczba patroli ${change > 0 ? 'wzrosła' : 'spadła'} o ${Math.abs(Math.round(change))}% w porównaniu do poprzedniego okresu`,
                    priority: Math.abs(change) >= 30 ? 'high' : 'medium'
                });
            }
        }

        // Porównaj wykroczenia
        if (prev.wykroczenia > 0) {
            const change = ((curr.wykroczenia - prev.wykroczenia) / prev.wykroczenia) * 100;
            if (Math.abs(change) >= 15) {
                insights.push({
                    type: change > 0 ? 'positive' : 'warning',
                    icon: change > 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down',
                    text: `Wykryte wykroczenia: ${change > 0 ? '+' : ''}${Math.round(change)}% vs poprzedni okres`,
                    priority: Math.abs(change) >= 25 ? 'high' : 'medium'
                });
            }
        }

        return insights;
    },

    /**
     * Generuje insights o efektywności działań
     * @param {AggregatedData} aggregatedData - Zagregowane dane
     * @returns {Insight[]} Lista insights o efektywności
     */
    generateEfficiencyInsights(aggregatedData) {
        const insights = [];
        const { kpis, counts } = aggregatedData;

        // Efektywność wykrywania
        const detectionEff = parseFloat(kpis.detectionEfficiency);
        if (detectionEff >= 75) {
            insights.push({
                type: 'positive',
                icon: 'fa-medal',
                text: `Wysoka efektywność wykrywania: ${detectionEff}% wykroczeń zakończonych mandatem`,
                priority: 'high'
            });
        } else if (detectionEff < 50 && counts.wykroczenia > 10) {
            insights.push({
                type: 'warning',
                icon: 'fa-triangle-exclamation',
                text: `Niska efektywność: tylko ${detectionEff}% wykroczeń zakończonych mandatem - wymaga analizy`,
                priority: 'high'
            });
        }

        // Wykroczenia na patrol
        const wykrPerPatrol = parseFloat(kpis.wykroczeniaPerPatrol);
        if (wykrPerPatrol >= 2.5) {
            insights.push({
                type: 'positive',
                icon: 'fa-bullseye',
                text: `Wysoka wykrywalność: ${wykrPerPatrol} wykroczeń na patrol (benchmark: 2.5)`,
                priority: 'medium'
            });
        } else if (wykrPerPatrol < 1.5 && counts.patrole > 20) {
            insights.push({
                type: 'info',
                icon: 'fa-info-circle',
                text: `Wykrywalność poniżej benchmarku: ${wykrPerPatrol} wyk/patrol (cel: 2.5)`,
                priority: 'medium'
            });
        }

        return insights;
    },

    /**
     * Generuje insights o najlepszych wykonawcach
     * @param {AggregatedData} aggregatedData - Zagregowane dane
     * @returns {Insight[]} Lista insights o top JŻW
     */
    generateTopPerformerInsights(aggregatedData) {
        const insights = [];
        const { topJZW, counts } = aggregatedData;

        if (topJZW.length > 0 && counts.patrole >= 10) {
            const leader = topJZW[0];
            const percent = Math.round((leader.count / counts.patrole) * 100);

            insights.push({
                type: 'info',
                icon: 'fa-trophy',
                text: `${leader.name}: ${leader.count} patroli (${percent}% wszystkich) - lider aktywności`,
                priority: 'medium'
            });
        }

        return insights;
    },

    /**
     * Generuje ostrzeżenia o problemach wymagających uwagi
     * @param {AggregatedData} aggregatedData - Zagregowane dane
     * @returns {Insight[]} Lista ostrzeżeń (red flags)
     */
    generateRedFlags(aggregatedData) {
        const insights = [];
        const { counts, kpis } = aggregatedData;

        // WKRD poniżej minimalnego poziomu
        const wkrdPer100 = parseFloat(kpis.wkrdPer100);
        if (wkrdPer100 < 10 && counts.patrole > 20) {
            insights.push({
                type: 'danger',
                icon: 'fa-exclamation-triangle',
                text: `WKRD: tylko ${wkrdPer100} kontroli na 100 patroli (cel: 15) - wymaga poprawy`,
                priority: 'high'
            });
        }

        // Brak aktywności mandatowej
        if (counts.wykroczenia > 30 && counts.mandaty === 0) {
            insights.push({
                type: 'danger',
                icon: 'fa-ban',
                text: `KRYTYCZNE: ${counts.wykroczenia} wykroczeń, ale ZERO mandatów - problem systemowy`,
                priority: 'critical'
            });
        }

        return insights;
    },

    /**
     * Generuje rekomendacje actionable
     * @param {AggregatedData} aggregatedData - Zagregowane dane
     * @returns {Recommendation[]} Lista rekomendacji (max 4)
     */
    generateRecommendations(aggregatedData) {
        const recommendations = [];
        const { counts, kpis } = aggregatedData;

        // Rekomendacja 1: WKRD
        const wkrdPer100 = parseFloat(kpis.wkrdPer100);
        if (wkrdPer100 < 15) {
            recommendations.push({
                icon: 'fa-shield-halved',
                title: 'Zwiększenie kontroli WKRD',
                description: `Obecny poziom: ${wkrdPer100} na 100 patroli. Cel: 15.`,
                action: 'Przeprowadzić dodatkowe ${Math.ceil((15 - wkrdPer100) * counts.patrole / 100)} kontroli WKRD w najbliższym okresie',
                priority: 'high'
            });
        }

        // Rekomendacja 2: Efektywność
        const detectionEff = parseFloat(kpis.detectionEfficiency);
        if (detectionEff < 70 && counts.wykroczenia > 10) {
            recommendations.push({
                icon: 'fa-graduation-cap',
                title: 'Poprawa efektywności nałożania mandatów',
                description: `Obecna efektywność: ${detectionEff}%. Cel: 75%.`,
                action: 'Zorganizować szkolenie z procedur mandatowych i dokumentacji wykroczeń',
                priority: 'medium'
            });
        }

        // Rekomendacja 3: Wykrywalność
        const wykrPerPatrol = parseFloat(kpis.wykroczeniaPerPatrol);
        if (wykrPerPatrol < 2.0 && counts.patrole > 20) {
            recommendations.push({
                icon: 'fa-route',
                title: 'Optymalizacja tras patrolowych',
                description: `Obecna wykrywalność: ${wykrPerPatrol} wyk/patrol. Benchmark: 2.5.`,
                action: 'Przeanalizować i zoptymalizować trasy patrolowe w obszarach o wysokiej częstotliwości wykroczeń',
                priority: 'medium'
            });
        }

        // Rekomendacja 4: Rozłożenie aktywności
        if (counts.patrole >= 30) {
            recommendations.push({
                icon: 'fa-calendar-days',
                title: 'Analiza wzorców czasowych',
                description: 'Monitorowanie rozkładu aktywności w czasie.',
                action: 'Przeprowadzić analizę godzinową i dzienną dla lepszego planowania patroli',
                priority: 'low'
            });
        }

        return recommendations.slice(0, 4); // Max 4 rekomendacje
    }
};
