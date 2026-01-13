/**
 * Tabular Report Exporter for AEP - Version 2
 * With proper two-level headers and abbreviated column names
 *
 * @author AEP System
 * @version 2.0.0
 */

const TabularExporter = {
    /**
     * Module display names in Polish
     */
    moduleNames: {
        patrole: 'Patrole',
        wykroczenia: 'Wykroczenia',
        wkrd: 'WKRD',
        sankcje: 'Sankcje',
        konwoje: 'Konwoje',
        spb: 'ŚPB - Środki Przymusu Bezpośredniego',
        pilotaze: 'Pilotaże',
        zdarzenia: 'Zdarzenia drogowe'
    },

    /**
     * Two-level header structure for PDF export
     * Each module defines:
     * - headers: array of {label, colspan, rowspan} for level 1
     * - subheaders: array of labels for level 2 (only for colspan > 1)
     * - fields: array of field names matching data structure
     */
    tableStructures: {
        patrole: {
            headers: [
                {label: 'Mc', rowspan: 2},
                {label: 'Data', rowspan: 2},
                {label: 'Rodzaj Patrolu', colspan: 6},
                {label: 'Ilość', colspan: 3},
                {label: 'Współdziałanie', colspan: 6},
                {label: 'JW Prow.', rowspan: 2},
                {label: 'Oddz. ŻW', rowspan: 2}
            ],
            subheaders: [
                'RAZ', 'Int.', 'Pie.', 'Wod.', 'Zmo.', 'WKR',  // Rodzaj Patrolu
                'Żan', 'WPM', 'Mot.',  // Ilość
                'RAZ', 'Pol', 'SG', 'SOP', 'SOK', 'Inn'  // Współdziałanie
            ],
            fields: ['month', 'date', 'razem_rodzaj', 'interven', 'pieszych', 'wodnych', 'zmot', 'wkrd',
                     'zand', 'wpm', 'motorowek', 'razem_wspolz', 'policja', 'sg', 'sop', 'sok', 'inne',
                     'jwProwadzaca', 'oddzialZW']
        },

        wykroczenia: {
            headers: [
                {label: 'Mc', rowspan: 2},
                {label: 'Data', rowspan: 2},
                {label: 'Nr JW', rowspan: 2},
                {label: 'Naz. JW', rowspan: 2},
                {label: 'M. stac.', rowspan: 2},
                {label: 'Podl.', rowspan: 2},
                {label: 'Gr. os.', rowspan: 2},
                {label: 'Leg.', rowspan: 2},
                {label: 'Podst.', rowspan: 2},
                {label: 'Stan', colspan: 4},
                {label: 'Rodzaj interw.', colspan: 6},
                {label: 'Wys. mand.', rowspan: 2},
                {label: 'W czs. sł.', rowspan: 2},
                {label: 'JŻW prow.', rowspan: 2},
                {label: 'Oddz.', rowspan: 2}
            ],
            subheaders: [
                'RAZ', 'P.alk', 'Ntrz', 'P.śr',  // Stan
                'RAZ', 'Zat', 'Dop', 'Wyl', 'Pou', 'Man'  // Rodzaj interw.
            ],
            fields: ['month', 'data', 'nr_jw', 'nazwa_jw', 'miejsce', 'podleglosc', 'grupa', 'legitymowany',
                     'podstawa', 'stan_razem', 'pod_wplywem_alk', 'nietrzezwy', 'pod_wplywem_srod',
                     'rodzaj_razem', 'zatrzymanie', 'doprowadzenie', 'wylegitymowanie', 'pouczenie', 'mandat',
                     'wysokosc_mandatu', 'w_czasie_sluzby', 'jzw_prowadzaca', 'oddzial']
        },

        wkrd: {
            headers: [
                {label: 'Mc', rowspan: 2},
                {label: 'Data', rowspan: 2},
                {label: 'Nr JW', rowspan: 2},
                {label: 'Naz. JW', rowspan: 2},
                {label: 'M. stac.', rowspan: 2},
                {label: 'Podl.', rowspan: 2},
                {label: 'RAZEM', rowspan: 2},
                {label: 'WPM', rowspan: 2},
                {label: 'PPM', rowspan: 2},
                {label: 'Pozost.', rowspan: 2},
                {label: 'Oddz.', rowspan: 2}
            ],
            subheaders: [],
            fields: ['month', 'data', 'nr_jw', 'nazwa_jw', 'miejsce', 'podleglosc', 'razem', 'wpm', 'ppm', 'pozostale', 'oddzial']
        },

        sankcje: {
            headers: [
                {label: 'Mc', rowspan: 2},
                {label: 'Data', rowspan: 2},
                {label: 'Nr JW', rowspan: 2},
                {label: 'Naz. JW', rowspan: 2},
                {label: 'M. stac.', rowspan: 2},
                {label: 'Podl.', rowspan: 2},
                {label: 'Gr. os.', rowspan: 2},
                {label: 'Leg.', rowspan: 2},
                {label: 'Rodz. poj.', colspan: 4},
                {label: 'Przycz.', rowspan: 2},
                {label: 'Sankcja', colspan: 5},
                {label: 'Wys. mand.', rowspan: 2},
                {label: 'W czs. sł.', rowspan: 2},
                {label: 'JŻW prow.', rowspan: 2},
                {label: 'Oddz.', rowspan: 2}
            ],
            subheaders: [
                'RAZ', 'WPM', 'PPM', 'Pie',  // Rodz. poj.
                'RAZ', 'Z.DR', 'Z.PJ', 'Man', 'Pou', 'Inn'  // Sankcja
            ],
            fields: ['month', 'data', 'nr_jw', 'nazwa_jw', 'miejsce', 'podleglosc', 'grupa', 'legitymowany',
                     'rodzaj_razem', 'wpm', 'ppm', 'pieszy', 'przyczyna',
                     'sankcja_razem', 'zatrzymanie_dr', 'zatrzymanie_pj', 'mandat', 'pouczenie', 'inne',
                     'wysokosc_mandatu', 'w_czasie_sluzby', 'jzw_prowadzaca', 'oddzial']
        },

        konwoje: {
            headers: [
                {label: 'Mc', rowspan: 2},
                {label: 'Data', rowspan: 2},
                {label: 'Rodzaj', colspan: 3},
                {label: 'Il. żołn.', rowspan: 2},
                {label: 'Il. WPM', rowspan: 2},
                {label: 'Zleceniodawca', colspan: 5},
                {label: 'Co konwoj.', colspan: 4},
                {label: 'JW prow.', rowspan: 2},
                {label: 'Oddz.', rowspan: 2}
            ],
            subheaders: [
                'RAZ', 'Mjsc', 'Zmjsc',  // Rodzaj
                'RAZ', 'Prok', 'Sąd', 'Włas', 'JŻW',  // Zleceniodawca
                'RAZ', 'Dok', 'Osb', 'Przd'  // Co konwoj.
            ],
            fields: ['month', 'data', 'rodzaj_razem', 'miejscowy', 'zamiejscowy', 'ilosc_zw', 'ilosc_wpm',
                     'zleceniodawca_razem', 'prokuratura', 'sad', 'wlasne', 'jzw',
                     'co_konwojowano_razem', 'dokumenty', 'osoby', 'przedmioty',
                     'jw_prowadzaca', 'oddzial']
        },

        spb: {
            headers: [
                {label: 'Data', rowspan: 2},
                {label: 'Nr JW', rowspan: 2},
                {label: 'Naz. JW', rowspan: 2},
                {label: 'M. stac.', rowspan: 2},
                {label: 'Podl.', rowspan: 2},
                {label: 'Gr. os.', rowspan: 2},
                {label: 'Śr. przymusu', colspan: 11},
                {label: 'Podcs konw.', rowspan: 2},
                {label: 'Zatrz.', rowspan: 2},
                {label: 'Dopr.', rowspan: 2},
                {label: 'Inn/Pat', rowspan: 2},
                {label: 'Skutek', colspan: 2},
                {label: 'JŻW prow.', rowspan: 2},
                {label: 'Oddz.', rowspan: 2}
            ],
            subheaders: [
                'S.fiz', 'Kaj', 'Kaf', 'Ksk', 'Siat', 'Pał', 'Pies', 'Chem', 'Par', 'Kolcz', 'Broń',  // Śr. przymusu
                'Ran', 'Śmr'  // Skutek
            ],
            fields: ['data', 'nr_jw', 'nazwa_jw', 'miejsce', 'podleglosc', 'grupa',
                     'sila_fizyczna', 'kajdanki', 'kaftan', 'kask', 'siatka', 'palka', 'pies',
                     'chem_sr', 'paralizator', 'kolczatka', 'bron',
                     'podczas_konw', 'zatrzymania', 'doprowadzenia', 'inne_patrol',
                     'ranny', 'smierc',
                     'jzw_prowadzaca', 'oddzial']
        },

        pilotaze: {
            headers: [
                {label: 'Data', rowspan: 2},
                {label: 'Własne', rowspan: 2},
                {label: 'Sojuszn.', rowspan: 2},
                {label: 'Zmot.', rowspan: 2},
                {label: 'WKRD', rowspan: 2},
                {label: 'Il. żołn.', rowspan: 2},
                {label: 'WPM', rowspan: 2},
                {label: 'JŻW', rowspan: 2},
                {label: 'Oddz.', rowspan: 2}
            ],
            subheaders: [],
            fields: ['data', 'wlasne', 'sojusznicze', 'zmotoryzowany', 'wkrd', 'ilosc_zw', 'wpm', 'jzw', 'oddzial']
        },

        zdarzenia: {
            headers: [
                {label: 'Mc', rowspan: 2},
                {label: 'Data', rowspan: 2},
                {label: 'Nr JW', rowspan: 2},
                {label: 'Naz. JW', rowspan: 2},
                {label: 'M. stac.', rowspan: 2},
                {label: 'Podl.', rowspan: 2},
                {label: 'Gr. os.', rowspan: 2},
                {label: 'Rodz. zdar.', colspan: 3},
                {label: 'Rodz. poj.', colspan: 3},
                {label: 'Typ uczest.', colspan: 2},
                {label: 'Przycz.', rowspan: 2},
                {label: 'Sank.', rowspan: 2},
                {label: 'Wys. mand.', rowspan: 2},
                {label: 'W czs. sł.', rowspan: 2},
                {label: 'Il. ran.', rowspan: 2},
                {label: 'Il. zab.', rowspan: 2},
                {label: 'JŻW prow.', rowspan: 2},
                {label: 'Oddz.', rowspan: 2}
            ],
            subheaders: [
                'RAZ', 'Wyp', 'Kol',  // Rodz. zdar.
                'RAZ', 'WPM', 'PPM',  // Rodz. poj.
                'Spr', 'Psz'  // Typ uczest.
            ],
            fields: ['month', 'data', 'nr_jw', 'nazwa_jw', 'miejsce', 'podleglosc', 'grupa',
                     'rodzaj_razem', 'wypadek', 'kolizja',
                     'pojazd_razem', 'wpm', 'ppm',
                     'typ_sprawca', 'typ_poszkodowany',
                     'przyczyna', 'sankcja', 'wysokosc_mandatu', 'w_czasie_sluzby',
                     'ilosc_rannych', 'ilosc_zabitych',
                     'jzw_prowadzaca', 'oddzial']
        }
    },

    /**
     * Loads data from localStorage for selected modules
     */
    loadData(modules) {
        const data = {};
        modules.forEach(module => {
            const storageKey = `aep_data_${module}`;
            data[module] = Utils.loadFromLocalStorage(storageKey) || [];
        });
        return data;
    },

    /**
     * Filters data by date range
     */
    filterByDateRange(data, dateFrom, dateTo) {
        if (!dateFrom && !dateTo) {
            return data;
        }

        return data.filter(row => {
            const rowDate = row.data || row.date;
            if (!rowDate) return false;

            const dateObj = this.parseDate(rowDate);
            if (!dateObj) return false;

            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;

            if (from && dateObj < from) return false;
            if (to && dateObj > to) return false;

            return true;
        });
    },

    /**
     * Parses various date formats to Date object
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return new Date(dateStr);
        }

        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
            const parts = dateStr.split('.');
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }

        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    },

    /**
     * Exports data to XLSX format
     */
    exportToXLSX(modules, dateFrom, dateTo) {
        console.log('📊 Eksport do XLSX:', modules);

        const allData = this.loadData(modules);
        const worksheetData = [];

        // Header
        worksheetData.push(['Raport Tabelaryczny - AEP']);
        worksheetData.push(['Data wygenerowania:', new Date().toLocaleString('pl-PL')]);
        if (dateFrom || dateTo) {
            worksheetData.push(['Zakres dat:', `${dateFrom || 'początek'} - ${dateTo || 'koniec'}`]);
        }
        worksheetData.push([]);

        modules.forEach((module, moduleIndex) => {
            const data = allData[module];
            if (!data || data.length === 0) {
                worksheetData.push([this.moduleNames[module]]);
                worksheetData.push(['Brak danych']);
                worksheetData.push([]);
                return;
            }

            const filteredData = this.filterByDateRange(data, dateFrom, dateTo);
            if (filteredData.length === 0) {
                worksheetData.push([this.moduleNames[module]]);
                worksheetData.push(['Brak danych w wybranym zakresie dat']);
                worksheetData.push([]);
                return;
            }

            // Module header
            worksheetData.push([this.moduleNames[module]]);
            worksheetData.push([`Liczba rekordów: ${filteredData.length}`]);
            worksheetData.push([]);

            // Get structure
            const structure = this.tableStructures[module];

            // Build header rows
            const headerRow1 = [];
            const headerRow2 = [];
            let subHeaderIndex = 0;

            structure.headers.forEach(header => {
                if (header.rowspan === 2) {
                    headerRow1.push(header.label);
                    headerRow2.push(''); // Empty for merged cell
                } else if (header.colspan) {
                    headerRow1.push(header.label);
                    // Add empty cells for colspan
                    for (let i = 1; i < header.colspan; i++) {
                        headerRow1.push('');
                    }
                    // Add subheaders
                    for (let i = 0; i < header.colspan; i++) {
                        headerRow2.push(structure.subheaders[subHeaderIndex++]);
                    }
                }
            });

            worksheetData.push(headerRow1);
            worksheetData.push(headerRow2);

            // Data rows
            filteredData.forEach(row => {
                const dataRow = structure.fields.map(field => {
                    const value = row[field];
                    if (Array.isArray(value)) return value.join(', ');
                    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
                    return value !== undefined && value !== null ? value : '';
                });
                worksheetData.push(dataRow);
            });

            if (moduleIndex < modules.length - 1) {
                worksheetData.push([]);
                worksheetData.push([]);
            }
        });

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // Auto-size columns
        const colWidths = [];
        worksheetData.forEach(row => {
            row.forEach((cell, colIndex) => {
                const cellLength = cell ? String(cell).length : 10;
                colWidths[colIndex] = Math.max(colWidths[colIndex] || 10, cellLength + 2);
            });
        });
        ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 50) }));

        // Apply styling (same as before but adapted to new structure)
        const range = XLSX.utils.decode_range(ws['!ref']);
        const headerRows = new Set();

        // Find header rows
        worksheetData.forEach((row, rowIndex) => {
            if (rowIndex === 0) headerRows.add(rowIndex);
            if (row[0] && typeof row[0] === 'string' &&
                (row[0].includes('Patrole') || row[0].includes('Wykroczenia') ||
                 row[0].includes('WKRD') || row[0].includes('Sankcje') ||
                 row[0].includes('Konwoje') || row[0].includes('ŚPB') ||
                 row[0].includes('Pilotaże') || row[0].includes('Zdarzenia'))) {
                headerRows.add(rowIndex);
                headerRows.add(rowIndex + 3); // Level 1 header
                headerRows.add(rowIndex + 4); // Level 2 header
            }
        });

        // Apply styles
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;
                const cell = ws[cellAddress];
                if (!cell.s) cell.s = {};

                if (R === 0) {
                    cell.s = {
                        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "4B5563" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        }
                    };
                } else if (headerRows.has(R)) {
                    cell.s = {
                        font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "6B7280" } },
                        alignment: { horizontal: "center", vertical: "center", wrapText: true },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        }
                    };
                } else {
                    const isEvenRow = R % 2 === 0;
                    cell.s = {
                        font: { sz: 9 },
                        fill: { fgColor: { rgb: isEvenRow ? "FFFFFF" : "F3F4F6" } },
                        alignment: { horizontal: "left", vertical: "center", wrapText: true },
                        border: {
                            top: { style: "thin", color: { rgb: "E5E7EB" } },
                            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                            left: { style: "thin", color: { rgb: "E5E7EB" } },
                            right: { style: "thin", color: { rgb: "E5E7EB" } }
                        }
                    };
                }
            }
        }

        ws['!freeze'] = { xSplit: 0, ySplit: 4, topLeftCell: 'A5', activePane: 'bottomLeft' };
        XLSX.utils.book_append_sheet(wb, ws, 'Raport');

        const dateStr = dateTo || new Date().toISOString().split('T')[0];
        const filename = `AEP_Raport_Tabelaryczny_${dateStr}.xlsx`;
        XLSX.writeFile(wb, filename);

        console.log(`✅ XLSX downloaded: ${filename}`);
    },

    /**
     * Exports data to PDF format with two-level headers
     */
    async exportToPDF(modules, dateFrom, dateTo) {
        console.log('📄 Eksport do PDF:', modules);

        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('Błąd: Biblioteka jsPDF nie jest załadowana.');
            return;
        }

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginLeft = 10;
        const marginRight = 10;
        const marginTop = 20;
        const marginBottom = 15;

        const allData = this.loadData(modules);
        let yPos = marginTop;

        // Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Raport Tabelaryczny - AEP', marginLeft, yPos);

        yPos += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Data wygenerowania: ${new Date().toLocaleString('pl-PL')}`, marginLeft, yPos);

        if (dateFrom || dateTo) {
            yPos += 4;
            doc.text(`Zakres dat: ${dateFrom || 'początek'} - ${dateTo || 'koniec'}`, marginLeft, yPos);
        }

        yPos += 8;

        // Process each module
        for (let i = 0; i < modules.length; i++) {
            const module = modules[i];
            const data = allData[module];

            if (!data || data.length === 0) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(this.moduleNames[module], marginLeft, yPos);
                yPos += 6;
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.text('Brak danych', marginLeft, yPos);
                yPos += 8;
                continue;
            }

            const filteredData = this.filterByDateRange(data, dateFrom, dateTo);
            if (filteredData.length === 0) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(this.moduleNames[module], marginLeft, yPos);
                yPos += 6;
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.text('Brak danych w wybranym zakresie dat', marginLeft, yPos);
                yPos += 8;
                continue;
            }

            // Module header
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(this.moduleNames[module], marginLeft, yPos);
            yPos += 5;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Liczba rekordów: ${filteredData.length}`, marginLeft, yPos);
            yPos += 4;

            // Get structure
            const structure = this.tableStructures[module];

            // Build two-level headers for autoTable
            const headerRow1 = [];
            const headerRow2 = [];
            let subHeaderIndex = 0;

            structure.headers.forEach(header => {
                if (header.rowspan === 2) {
                    headerRow1.push({
                        content: header.label,
                        rowSpan: 2,
                        styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fontSize: 5.5 }
                    });
                } else if (header.colspan) {
                    headerRow1.push({
                        content: header.label,
                        colSpan: header.colspan,
                        styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fontSize: 5.5 }
                    });
                    // Add subheaders for row 2
                    for (let j = 0; j < header.colspan; j++) {
                        headerRow2.push({
                            content: structure.subheaders[subHeaderIndex++],
                            styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fontSize: 5 }
                        });
                    }
                }
            });

            // Remove undefined from headerRow2 (for rowSpan cells)
            const cleanHeaderRow2 = headerRow2.filter(h => h !== undefined);

            // Body data
            const body = filteredData.map(row => {
                return structure.fields.map(field => {
                    const value = row[field];
                    if (Array.isArray(value)) return value.join(', ');
                    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
                    return value !== undefined && value !== null ? String(value) : '';
                });
            });

            // Add table with two-level headers
            doc.autoTable({
                head: [headerRow1, cleanHeaderRow2],
                body: body,
                startY: yPos,
                margin: { left: marginLeft, right: marginRight },
                tableWidth: 'auto',
                styles: {
                    fontSize: 5,
                    cellPadding: 1,
                    overflow: 'linebreak',
                    cellWidth: 'auto',
                    halign: 'left',
                    valign: 'middle',
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                headStyles: {
                    fillColor: [75, 85, 99],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center',
                    fontSize: 5.5
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                didDrawPage: (data) => {
                    const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
                    const totalPages = doc.internal.getNumberOfPages();
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Strona ${pageNumber} / ${totalPages}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
                }
            });

            yPos = doc.lastAutoTable.finalY + 8;

            if (i < modules.length - 1 && yPos > pageHeight - 40) {
                doc.addPage();
                yPos = marginTop;
            }
        }

        // Update page numbers
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text(`Strona ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
        }

        const dateStr = dateTo || new Date().toISOString().split('T')[0];
        const filename = `AEP_Raport_Tabelaryczny_${dateStr}.pdf`;
        doc.save(filename);

        console.log(`✅ PDF downloaded: ${filename}`);
    }
};
