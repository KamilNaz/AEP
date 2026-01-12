// ============================================
// PDF EXPORTER - Generowanie raportów PDF
// ============================================

const PDFExporter = {
    async generateExecutiveSummary(aggregatedData, insights, recommendations, dateRange) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yPos = 20;

        // HEADER
        doc.setFontSize(24);
        doc.setTextColor(60, 60, 60);
        doc.text('Executive Summary', 15, yPos);

        yPos += 10;
        doc.setFontSize(12);
        doc.setTextColor(120, 120, 120);
        const dateRangeText = dateRange.from && dateRange.to
            ? `Okres: ${dateRange.from} - ${dateRange.to}`
            : 'Okres: Wszystkie dane';
        doc.text(dateRangeText, 15, yPos);

        yPos += 5;
        const generatedDate = new Date().toLocaleString('pl-PL');
        doc.text(`Wygenerowano: ${generatedDate}`, 15, yPos);

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
