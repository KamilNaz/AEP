// ============================================
// PDF EXPORTER - Generowanie raportów PDF
// ============================================

const PDFExporter = {
    async generateExecutiveSummary(aggregatedData, insights, recommendations, dateRange) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yPos = 20;

        // LOGO (jeśli jest w localStorage)
        const logoBase64 = localStorage.getItem('aep_report_logo');
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, 'PNG', 15, 10, 25, 25);
                yPos = 20;
            } catch (err) {
                console.warn('Logo render error:', err);
            }
        }

        // HEADER
        doc.setFontSize(24);
        doc.setTextColor(60, 60, 60);
        doc.text('Executive Summary', logoBase64 ? 45 : 15, yPos);

        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor(120, 120, 120);
        const dateRangeText = dateRange.from && dateRange.to
            ? `Okres: ${dateRange.from} - ${dateRange.to}`
            : 'Okres: Wszystkie dane';
        doc.text(dateRangeText, logoBase64 ? 45 : 15, yPos);

        yPos += 5;
        const generatedDate = new Date().toLocaleString('pl-PL');
        doc.text(`Wygenerowano: ${generatedDate}`, logoBase64 ? 45 : 15, yPos);

        yPos += 15;

        // LINIA SEPARUJĄCA
        doc.setDrawColor(200, 200, 200);
        doc.line(15, yPos, 195, yPos);
        yPos += 10;

        // KEY METRICS
        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.text('Kluczowe Wskazniki', 15, yPos);
        yPos += 10;

        const { counts, sumaMandatow, kpis } = aggregatedData;

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);

        const metrics = [
            { label: 'Patrole', value: counts.patrole, unit: '' },
            { label: 'Wykroczenia', value: counts.wykroczenia, unit: '' },
            { label: 'Mandaty', value: sumaMandatow.toLocaleString('pl-PL'), unit: 'PLN' },
            { label: 'WKRD', value: counts.wkrd, unit: '' }
        ];

        metrics.forEach((metric, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const x = 20 + (col * 90);
            const y = yPos + (row * 15);

            doc.text(metric.label + ':', x, y);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(14);
            doc.text(metric.value + ' ' + metric.unit, x, y + 6);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(11);
        });

        yPos += 40;

        // KPI PERFORMANCE
        doc.setFontSize(14);
        doc.setTextColor(60, 60, 60);
        doc.text('Performance Indicators', 15, yPos);
        yPos += 8;

        const kpiData = [
            ['Wykroczenia / Patrol', kpis.wykroczeniaPerPatrol, 'Benchmark: 2.5'],
            ['Mandaty / Patrol', kpis.mandatyPerPatrol.toLocaleString('pl-PL') + ' PLN', 'Benchmark: 1,500 PLN'],
            ['Efektywnosc Wykrywania', kpis.detectionEfficiency + '%', 'Benchmark: 75%'],
            ['Wskaznik Zajetosci', kpis.activityRate, 'Benchmark: 4.0']
        ];

        doc.autoTable({
            startY: yPos,
            head: [['Wskaznik', 'Wartosc', 'Cel']],
            body: kpiData,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 3
            },
            headStyles: {
                fillColor: [156, 163, 175],
                textColor: [255, 255, 255]
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // INSIGHTS
        if (insights && insights.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(60, 60, 60);
            doc.text('Key Insights', 15, yPos);
            yPos += 8;

            doc.setFontSize(10);
            insights.slice(0, 3).forEach((insight) => {
                doc.setTextColor(100, 100, 100);
                doc.text(String.fromCharCode(9679), 18, yPos);

                const lines = doc.splitTextToSize(insight.text, 170);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 6;
            });

            yPos += 5;
        }

        // RECOMMENDATIONS
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        if (recommendations && recommendations.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(60, 60, 60);
            doc.text('Rekomendacje', 15, yPos);
            yPos += 8;

            doc.setFontSize(10);
            recommendations.slice(0, 3).forEach((rec, idx) => {
                doc.setFont(undefined, 'bold');
                doc.setTextColor(80, 80, 80);
                doc.text(`${idx + 1}. ${rec.title}`, 20, yPos);
                yPos += 6;

                doc.setFont(undefined, 'normal');
                doc.setTextColor(100, 100, 100);
                const lines = doc.splitTextToSize(rec.action, 165);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 5 + 5;
            });
        }

        // FOOTER
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Strona ${i} z ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        return doc;
    },

    async generateOperationalReport(aggregatedData, insights, recommendations, dateRange) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yPos = 20;

        // LOGO
        const logoBase64 = localStorage.getItem('aep_report_logo');
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, 'PNG', 15, 10, 25, 25);
            } catch (err) {
                console.warn('Logo render error:', err);
            }
        }

        // === STRONA 1: HEADER I EXECUTIVE SUMMARY ===
        doc.setFontSize(20);
        doc.setTextColor(60, 60, 60);
        doc.text('Raport Operacyjny', logoBase64 ? 45 : 15, 20);

        yPos = 28;
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        const dateRangeText = dateRange.from && dateRange.to
            ? `Okres: ${dateRange.from} - ${dateRange.to}`
            : 'Okres: Wszystkie dane';
        doc.text(dateRangeText, logoBase64 ? 45 : 15, yPos);

        yPos += 5;
        doc.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')}`, logoBase64 ? 45 : 15, yPos);

        yPos += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(15, yPos, 195, yPos);
        yPos += 10;

        // Key metrics
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text('Executive Summary', 15, yPos);
        yPos += 8;

        const { counts, sumaMandatow, kpis } = aggregatedData;

        const summaryData = [
            ['Patrole', counts.patrole],
            ['Wykroczenia', counts.wykroczenia],
            ['Mandaty (suma)', sumaMandatow.toLocaleString('pl-PL') + ' PLN'],
            ['WKRD', counts.wkrd],
            ['Konwoje', counts.konwoje],
            ['SPB', counts.spb],
            ['Pilotaze', counts.pilotaze],
            ['Zdarzenia', counts.zdarzenia]
        ];

        doc.autoTable({
            startY: yPos,
            body: summaryData,
            theme: 'plain',
            styles: { fontSize: 10 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 80 },
                1: { cellWidth: 80 }
            }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // KPI Table
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.text('Performance Matrix', 15, yPos);
        yPos += 6;

        const kpiTableData = [
            ['Wykroczenia / Patrol', kpis.wykroczeniaPerPatrol, '2.5', kpis.wykroczeniaPerPatrol >= 2.5 ? 'OK' : 'Niski'],
            ['Mandaty / Patrol', kpis.mandatyPerPatrol + ' PLN', '1,500 PLN', kpis.mandatyPerPatrol >= 1500 ? 'OK' : 'Niski'],
            ['Efektywnosc', kpis.detectionEfficiency + '%', '75%', kpis.detectionEfficiency >= 75 ? 'OK' : 'Niski'],
            ['Wskaznik Zajetosci', kpis.activityRate, '4.0', kpis.activityRate >= 4.0 ? 'OK' : 'Niski']
        ];

        doc.autoTable({
            startY: yPos,
            head: [['KPI', 'Wartosc', 'Benchmark', 'Status']],
            body: kpiTableData,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: {
                fillColor: [156, 163, 175],
                textColor: [255, 255, 255]
            }
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // === STRONA 2: WYKRESY ===
        doc.addPage();
        yPos = 20;

        doc.setFontSize(14);
        doc.text('Analiza Wizualna', 15, yPos);
        yPos += 10;

        // Trend chart
        try {
            doc.setFontSize(11);
            doc.text('Trend patroli w czasie:', 15, yPos);
            yPos += 5;

            const trendChart = await ChartRenderer.generateTrendChart(
                aggregatedData.filtered.patrole,
                'Liczba patroli'
            );
            doc.addImage(trendChart, 'PNG', 15, yPos, 180, 60);
            yPos += 70;
        } catch (err) {
            console.error('Blad renderowania wykresu trendu:', err);
        }

        // Top JŻW bar chart
        if (aggregatedData.topJZW.length > 0) {
            try {
                if (yPos > 200) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(11);
                doc.text('Top 5 JZW (wedlug liczby patroli):', 15, yPos);
                yPos += 5;

                const labels = aggregatedData.topJZW.map(j => j.name);
                const values = aggregatedData.topJZW.map(j => j.count);
                const barChart = await ChartRenderer.generateBarChart(labels, values, 'Patrole');
                doc.addImage(barChart, 'PNG', 15, yPos, 180, 50);
                yPos += 60;
            } catch (err) {
                console.error('Blad renderowania wykresu bar:', err);
            }
        }

        // === STRONA 3: INSIGHTS I REKOMENDACJE ===
        doc.addPage();
        yPos = 20;

        doc.setFontSize(14);
        doc.text('Insights & Recommendations', 15, yPos);
        yPos += 10;

        // Insights
        if (insights && insights.length > 0) {
            doc.setFontSize(12);
            doc.text('Key Insights:', 15, yPos);
            yPos += 8;

            doc.setFontSize(10);
            insights.forEach((insight) => {
                const bullet = String.fromCharCode(9679);
                doc.text(bullet, 18, yPos);
                const lines = doc.splitTextToSize(insight.text, 170);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 6;
            });

            yPos += 10;
        }

        // Recommendations
        if (recommendations && recommendations.length > 0) {
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.text('Rekomendacje:', 15, yPos);
            yPos += 8;

            doc.setFontSize(10);
            recommendations.forEach((rec, idx) => {
                doc.setFont(undefined, 'bold');
                doc.text(`${idx + 1}. ${rec.title}`, 20, yPos);
                yPos += 6;

                doc.setFont(undefined, 'normal');
                const lines = doc.splitTextToSize(rec.action, 165);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 5 + 8;
            });
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Strona ${i} z ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        return doc;
    }
};

const ReportGenerator = {
    async generate(reportType, options) {
        try {
            console.log(`Generating ${reportType} report...`);

            const rawData = DataProcessor.getAllData();
            const aggregatedData = DataProcessor.aggregateData(
                rawData,
                options.dateFrom,
                options.dateTo
            );

            const insights = AnalyticsEngine.generateInsights(aggregatedData);
            const recommendations = AnalyticsEngine.generateRecommendations(aggregatedData);

            let pdf;
            if (reportType === 'executive') {
                pdf = await PDFExporter.generateExecutiveSummary(
                    aggregatedData,
                    insights,
                    recommendations,
                    { from: options.dateFrom, to: options.dateTo }
                );
            } else if (reportType === 'operational') {
                pdf = await PDFExporter.generateOperationalReport(
                    aggregatedData,
                    insights,
                    recommendations,
                    { from: options.dateFrom, to: options.dateTo }
                );
            } else {
                throw new Error(`Unknown report type: ${reportType}`);
            }

            console.log('Report generated successfully');
            return pdf;
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }
};
