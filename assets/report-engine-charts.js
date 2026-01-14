// ============================================
// CHART RENDERING FOR REPORTS
// Renderuje wykresy jako base64 images dla PDF
// ============================================

/**
 * @typedef {Object} ChartConfig
 * @property {string} type - Typ wykresu (line, bar, pie, etc.)
 * @property {Object} data - Dane dla wykresu
 * @property {Object} [options] - Opcje konfiguracyjne wykresu
 */

const ChartRenderer = {
    /**
     * Renderuje wykres do formatu base64 PNG
     * @param {ChartConfig} config - Konfiguracja wykresu Chart.js
     * @param {number} [width=600] - Szerokość wykresu w pikselach
     * @param {number} [height=400] - Wysokość wykresu w pikselach
     * @returns {Promise<string>} Promise z obrazem w formacie base64
     */
    async renderChartToBase64(config, width = 600, height = 400) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.style.backgroundColor = '#1a1d29';

            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, config);

            setTimeout(() => {
                const base64 = canvas.toDataURL('image/png');
                chart.destroy();
                resolve(base64);
            }, 500);
        });
    },

    /**
     * Generuje wykres trendów w czasie
     * @param {Array<{data: string}>} data - Tablica obiektów z polem data (DD.MM.YYYY)
     * @param {string} label - Etykieta dla zestawu danych
     * @returns {Promise<string>} Promise z obrazem wykresu w formacie base64
     */
    async generateTrendChart(data, label) {
        const dateMap = {};
        data.forEach(item => {
            if (item.data) {
                dateMap[item.data] = (dateMap[item.data] || 0) + 1;
            }
        });

        const sorted = Object.entries(dateMap)
            .sort((a, b) => {
                const dateA = a[0].split('.').reverse().join('');
                const dateB = b[0].split('.').reverse().join('');
                return dateA.localeCompare(dateB);
            })
            .slice(-30);

        const labels = sorted.map(([date]) => date);
        const values = sorted.map(([, count]) => count);

        const config = {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label,
                    data: values,
                    borderColor: '#9ca3af',
                    backgroundColor: 'rgba(156, 163, 175, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#e6e6e6' } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#9ca3af', maxRotation: 45 },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    }
                }
            }
        };

        return await this.renderChartToBase64(config, 800, 300);
    },

    /**
     * Generuje wykres słupkowy
     * @param {string[]} labels - Etykiety dla słupków
     * @param {number[]} values - Wartości dla słupków
     * @param {string} title - Tytuł wykresu
     * @returns {Promise<string>} Promise z obrazem wykresu w formacie base64
     */
    async generateBarChart(labels, values, title) {
        const config = {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: title,
                    data: values,
                    backgroundColor: '#9ca3af',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#9ca3af' },
                        grid: { display: false }
                    }
                }
            }
        };

        return await this.renderChartToBase64(config, 600, 300);
    }
};
