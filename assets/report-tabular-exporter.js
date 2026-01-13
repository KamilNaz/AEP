/**
 * Tabular Report Exporter for AEP
 * Exports raw data tables to PDF (landscape) or XLSX formats
 *
 * @author AEP System
 * @version 1.0.0
 */

const TabularExporter = {
    /**
     * Column definitions with labels for all modules
     * Maps internal field names to human-readable Polish labels
     */
    columnDefinitions: {
        patrole: {
            month: 'Miesiąc',
            date: 'Data',
            razem_rodzaj: 'Rodzaj - RAZEM',
            interven: 'Interwencyjny',
            pieszych: 'Pieszych',
            wodnych: 'Wodnych',
            zmot: 'Zmotoryzowany',
            wkrd: 'WKRD',
            zand: 'Żandarmeria',
            wpm: 'WPM',
            motorowek: 'Motorowerki',
            razem_wspolz: 'Współdziałanie - RAZEM',
            policja: 'Policja',
            sg: 'Straż Graniczna',
            sop: 'SOP',
            sok: 'SOK',
            inne: 'Inne',
            jwProwadzaca: 'JW Prowadząca',
            oddzialZW: 'Oddział ZW'
        },
        wykroczenia: {
            month: 'Miesiąc',
            data: 'Data',
            nr_jw: 'Nr JW',
            nazwa_jw: 'Nazwa JW',
            miejsce: 'Miejsce stacjonowania',
            podleglosc: 'Podległość RSZ',
            grupa: 'Grupa osobowa',
            legitymowany: 'Legitymowany',
            podstawa: 'Podstawa interwencji',
            stan_razem: 'Stan - RAZEM',
            pod_wplywem_alk: 'Pod wpływem alkoholu',
            nietrzezwy: 'W stanie nietrzeźwości',
            pod_wplywem_srod: 'Pod wpływem środków odurzających',
            rodzaj_razem: 'Rodzaj - RAZEM',
            zatrzymanie: 'Zatrzymanie',
            doprowadzenie: 'Doprowadzenie',
            wylegitymowanie: 'Wylegitymowanie',
            pouczenie: 'Pouczenie',
            mandat: 'Mandat',
            wysokosc_mandatu: 'Wysokość mandatu (zł)',
            w_czasie_sluzby: 'W czasie służby',
            jzw_prowadzaca: 'JŻW Prowadząca',
            oddzial: 'Oddział'
        },
        wkrd: {
            month: 'Miesiąc',
            data: 'Data',
            nr_jw: 'Nr JW',
            nazwa_jw: 'Nazwa JW',
            miejsce: 'Miejsce stacjonowania',
            podleglosc: 'Podległość RSZ',
            razem: 'RAZEM',
            wpm: 'WPM',
            ppm: 'PPM',
            pozostale: 'Pozostałe',
            oddzial: 'Oddział'
        },
        sankcje: {
            month: 'Miesiąc',
            data: 'Data',
            nr_jw: 'Nr JW',
            nazwa_jw: 'Nazwa JW',
            miejsce: 'Miejsce stacjonowania',
            podleglosc: 'Podległość RSZ',
            grupa: 'Grupa osobowa',
            legitymowany: 'Legitymowany',
            rodzaj_razem: 'Rodzaj pojazdu - RAZEM',
            wpm: 'WPM',
            ppm: 'PPM',
            pieszy: 'Pieszy',
            przyczyna: 'Przyczyna',
            sankcja_razem: 'Sankcja - RAZEM',
            zatrzymanie_dr: 'Zatrzymanie DR',
            zatrzymanie_pj: 'Zatrzymanie PJ',
            mandat: 'Mandat',
            pouczenie: 'Pouczenie',
            inne: 'Inne',
            wysokosc_mandatu: 'Wysokość mandatu (zł)',
            w_czasie_sluzby: 'W czasie służby',
            jzw_prowadzaca: 'JŻW Prowadząca',
            oddzial: 'Oddział'
        },
        konwoje: {
            month: 'Miesiąc',
            data: 'Data',
            rodzaj_razem: 'Rodzaj - RAZEM',
            miejscowy: 'Miejscowy',
            zamiejscowy: 'Zamiejscowy',
            ilosc_zw: 'Ilość żołnierzy',
            ilosc_wpm: 'Ilość WPM',
            zleceniodawca_razem: 'Zleceniodawca - RAZEM',
            prokuratura: 'Prokuratura',
            sad: 'Sąd',
            wlasne: 'Własne',
            jzw: 'JŻW',
            co_konwojowano_razem: 'Co konwojowano - RAZEM',
            dokumenty: 'Dokumenty',
            osoby: 'Osoby',
            przedmioty: 'Przedmioty',
            jw_prowadzaca: 'JW Prowadząca',
            oddzial: 'Oddział'
        },
        spb: {
            data: 'Data',
            nr_jw: 'Nr JW',
            nazwa_jw: 'Nazwa JW',
            miejsce: 'Miejsce stacjonowania',
            podleglosc: 'Podległość RSZ',
            grupa: 'Grupa osobowa',
            sila_fizyczna: 'Siła fizyczna',
            kajdanki: 'Kajdanki',
            kaftan: 'Kaftan bezpieczeństwa',
            kask: 'Kask ochronny',
            siatka: 'Siatka obezwładniająca',
            palka: 'Pałka wielofunkcyjna',
            pies: 'Pies służbowy',
            chem_sr: 'Środki chemiczne',
            paralizator: 'Paralizator',
            kolczatka: 'Kolczatka drogowa',
            bron: 'Broń palna',
            podczas_konw: 'Podczas konwoju',
            zatrzymania: 'Liczba zatrzymań',
            doprowadzenia: 'Liczba doprowadzeń',
            inne_patrol: 'Inne/Patrol',
            ranny: 'Skutek - Ranny',
            smierc: 'Skutek - Śmierć',
            jzw_prowadzaca: 'JŻW Prowadząca',
            oddzial: 'Oddział'
        },
        pilotaze: {
            data: 'Data',
            wlasne: 'Własne',
            sojusznicze: 'Sojusznicze',
            zmotoryzowany: 'Zmotoryzowany',
            wkrd: 'WKRD',
            ilosc_zw: 'Ilość żołnierzy',
            wpm: 'WPM',
            jzw: 'JŻW',
            oddzial: 'Oddział'
        },
        zdarzenia: {
            month: 'Miesiąc',
            data: 'Data',
            nr_jw: 'Nr JW',
            nazwa_jw: 'Nazwa JW',
            miejsce: 'Miejsce stacjonowania',
            podleglosc: 'Podległość RSZ',
            grupa: 'Grupa osobowa',
            rodzaj_razem: 'Rodzaj zdarzenia - RAZEM',
            wypadek: 'Wypadek',
            kolizja: 'Kolizja',
            pojazd_razem: 'Rodzaj pojazdu - RAZEM',
            wpm: 'WPM',
            ppm: 'PPM',
            typ_sprawca: 'Typ - Sprawca',
            typ_poszkodowany: 'Typ - Poszkodowany',
            przyczyna: 'Przyczyna',
            sankcja: 'Sankcja',
            wysokosc_mandatu: 'Wysokość mandatu (zł)',
            w_czasie_sluzby: 'W czasie służby',
            ilosc_rannych: 'Ilość rannych',
            ilosc_zabitych: 'Ilość zabitych',
            jzw_prowadzaca: 'JŻW Prowadząca',
            oddzial: 'Oddział'
        }
    },

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
     * Loads data from localStorage for selected modules
     * @param {string[]} modules - Array of module names (e.g., ['patrole', 'wykroczenia'])
     * @returns {Object} Object with module names as keys and data arrays as values
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
     * @param {Array} data - Array of data objects
     * @param {string} dateFrom - Start date (YYYY-MM-DD) or null
     * @param {string} dateTo - End date (YYYY-MM-DD) or null
     * @returns {Array} Filtered data
     */
    filterByDateRange(data, dateFrom, dateTo) {
        if (!dateFrom && !dateTo) {
            return data;
        }

        return data.filter(row => {
            // Check both 'data' and 'date' field names
            const rowDate = row.data || row.date;
            if (!rowDate) return false;

            // Convert to Date objects for comparison
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
     * @param {string} dateStr - Date string in various formats
     * @returns {Date|null} Date object or null if invalid
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        // Try YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return new Date(dateStr);
        }

        // Try DD.MM.YYYY format (Polish locale)
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
            const parts = dateStr.split('.');
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }

        // Try parsing as-is
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    },

    /**
     * Exports data to XLSX format (all modules in one sheet, stacked vertically)
     * @param {string[]} modules - Array of selected module names
     * @param {string} dateFrom - Start date filter (YYYY-MM-DD) or null
     * @param {string} dateTo - End date filter (YYYY-MM-DD) or null
     */
    exportToXLSX(modules, dateFrom, dateTo) {
        console.log('📊 Eksport do XLSX:', modules);

        // Load and filter data
        const allData = this.loadData(modules);

        // Build worksheet data - all modules stacked vertically
        const worksheetData = [];

        // Add header with generation info
        worksheetData.push(['Raport Tabelaryczny - AEP']);
        worksheetData.push(['Data wygenerowania:', new Date().toLocaleString('pl-PL')]);
        if (dateFrom || dateTo) {
            worksheetData.push([
                'Zakres dat:',
                `${dateFrom || 'początek'} - ${dateTo || 'koniec'}`
            ]);
        }
        worksheetData.push([]); // Empty row

        modules.forEach((module, moduleIndex) => {
            const data = allData[module];
            if (!data || data.length === 0) {
                // Add module header even if no data
                worksheetData.push([this.moduleNames[module]]);
                worksheetData.push(['Brak danych']);
                worksheetData.push([]); // Empty row separator
                return;
            }

            // Filter by date
            const filteredData = this.filterByDateRange(data, dateFrom, dateTo);

            if (filteredData.length === 0) {
                worksheetData.push([this.moduleNames[module]]);
                worksheetData.push(['Brak danych w wybranym zakresie dat']);
                worksheetData.push([]); // Empty row separator
                return;
            }

            // Add module header
            worksheetData.push([this.moduleNames[module]]);
            worksheetData.push([`Liczba rekordów: ${filteredData.length}`]);
            worksheetData.push([]); // Empty row

            // Get column definitions for this module
            const columnDefs = this.columnDefinitions[module];
            const columns = Object.keys(columnDefs);

            // Add table headers (bold will be applied via cell styling)
            const headerRow = columns.map(col => columnDefs[col]);
            worksheetData.push(headerRow);

            // Add data rows
            filteredData.forEach(row => {
                const dataRow = columns.map(col => {
                    const value = row[col];
                    // Convert arrays/objects to readable strings
                    if (Array.isArray(value)) {
                        return value.join(', ');
                    }
                    if (typeof value === 'object' && value !== null) {
                        return JSON.stringify(value);
                    }
                    return value !== undefined && value !== null ? value : '';
                });
                worksheetData.push(dataRow);
            });

            // Add separator between modules (except after last module)
            if (moduleIndex < modules.length - 1) {
                worksheetData.push([]);
                worksheetData.push([]);
            }
        });

        // Create workbook and worksheet
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
        ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w, 50) })); // Max width 50

        // Apply bold styling to headers (first row of each table section)
        // Note: SheetJS styling requires additional library (xlsx-style),
        // so we'll skip advanced styling for now. Headers are still readable.

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Raport');

        // Generate filename
        const dateStr = dateTo || new Date().toISOString().split('T')[0];
        const filename = `AEP_Raport_Tabelaryczny_${dateStr}.xlsx`;

        // Download file
        XLSX.writeFile(wb, filename);

        console.log(`✅ XLSX downloaded: ${filename}`);
    },

    /**
     * Exports data to PDF format (landscape, with page numbers)
     * @param {string[]} modules - Array of selected module names
     * @param {string} dateFrom - Start date filter (YYYY-MM-DD) or null
     * @param {string} dateTo - End date filter (YYYY-MM-DD) or null
     */
    async exportToPDF(modules, dateFrom, dateTo) {
        console.log('📄 Eksport do PDF:', modules);

        // Load jsPDF
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('Błąd: Biblioteka jsPDF nie jest załadowana.');
            return;
        }

        // Create PDF document in landscape mode
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Page setup
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginLeft = 14;
        const marginRight = 14;
        const marginTop = 20;
        const marginBottom = 15;

        // Load and filter data
        const allData = this.loadData(modules);

        // Header - first page only
        let yPos = marginTop;

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Raport Tabelaryczny - AEP', marginLeft, yPos);

        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Data wygenerowania: ${new Date().toLocaleString('pl-PL')}`, marginLeft, yPos);

        if (dateFrom || dateTo) {
            yPos += 5;
            doc.text(`Zakres dat: ${dateFrom || 'początek'} - ${dateTo || 'koniec'}`, marginLeft, yPos);
        }

        yPos += 10;

        // Process each module
        for (let i = 0; i < modules.length; i++) {
            const module = modules[i];
            const data = allData[module];

            if (!data || data.length === 0) {
                // Add module header even if no data
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(this.moduleNames[module], marginLeft, yPos);
                yPos += 7;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.text('Brak danych', marginLeft, yPos);
                yPos += 10;
                continue;
            }

            // Filter by date
            const filteredData = this.filterByDateRange(data, dateFrom, dateTo);

            if (filteredData.length === 0) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(this.moduleNames[module], marginLeft, yPos);
                yPos += 7;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.text('Brak danych w wybranym zakresie dat', marginLeft, yPos);
                yPos += 10;
                continue;
            }

            // Module header
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(this.moduleNames[module], marginLeft, yPos);

            yPos += 7;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Liczba rekordów: ${filteredData.length}`, marginLeft, yPos);

            yPos += 5;

            // Prepare table data
            const columnDefs = this.columnDefinitions[module];
            const columns = Object.keys(columnDefs);

            // Table headers
            const headers = columns.map(col => columnDefs[col]);

            // Table body
            const body = filteredData.map(row => {
                return columns.map(col => {
                    const value = row[col];
                    // Convert arrays/objects to readable strings
                    if (Array.isArray(value)) {
                        return value.join(', ');
                    }
                    if (typeof value === 'object' && value !== null) {
                        return JSON.stringify(value);
                    }
                    return value !== undefined && value !== null ? String(value) : '';
                });
            });

            // Add table using autoTable
            doc.autoTable({
                head: [headers],
                body: body,
                startY: yPos,
                margin: { left: marginLeft, right: marginRight },
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                headStyles: {
                    fillColor: [75, 85, 99], // Grey
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                didDrawPage: (data) => {
                    // Add page numbers
                    const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
                    const totalPages = doc.internal.getNumberOfPages();

                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'normal');
                    doc.text(
                        `Strona ${pageNumber} / ${totalPages}`,
                        pageWidth / 2,
                        pageHeight - 8,
                        { align: 'center' }
                    );
                }
            });

            // Update yPos after table
            yPos = doc.lastAutoTable.finalY + 10;

            // Add new page if not last module and near bottom
            if (i < modules.length - 1 && yPos > pageHeight - 40) {
                doc.addPage();
                yPos = marginTop;
            }
        }

        // Update page numbers for all pages (must be done after all content)
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            const pageNumber = i;
            doc.text(
                `Strona ${pageNumber} / ${totalPages}`,
                pageWidth / 2,
                pageHeight - 8,
                { align: 'center' }
            );
        }

        // Generate filename
        const dateStr = dateTo || new Date().toISOString().split('T')[0];
        const filename = `AEP_Raport_Tabelaryczny_${dateStr}.pdf`;

        // Download PDF
        doc.save(filename);

        console.log(`✅ PDF downloaded: ${filename}`);
    }
};
