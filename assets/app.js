// ============================================
// AEP - Arkusz Ewidencji Prewencyjnej
// FINALNA WERSJA z wszystkimi poprawkami
// ============================================

// ============================================
// SECTIONS CONFIGURATION
// ============================================
const SECTIONS = [
    {
        id: 'patrole',
        title: 'Patrole',
        isCustomView: true,
        columns: []
    },
    {
        id: 'wykroczenia',
        title: 'Wykroczenia',
        columns: ['Data', 'Jednostka', 'Rodzaj', 'Art.', 'Miejsce', 'Sprawca', 'PESEL', 'Środek prawny', 'Mandat', 'Pkt.', 'Pojazd', 'Nr rej.', 'Świadkowie', 'Opis', 'Dowody', 'Funkcjon.', 'Nr notatki', 'Załączniki', 'Status', 'Operator']
    },
    {
        id: 'wkrd',
        title: 'WKRD',
        isCustomView: true,
        columns: []
    },
    {
        id: 'sankcje',
        title: 'Sankcje',
        isCustomView: true,
        columns: []
    },
    {
        id: 'konwoje',
        title: 'Konwoje',
        isCustomView: true,
        columns: []
    },
    {
        id: 'spb',
        title: 'ŚPB - Środki Przymusu Bezpośredniego',
        isCustomView: true,
        columns: []
    },
    {
        id: 'pilotaze',
        title: 'Pilotaże',
        isCustomView: true,
        columns: []
    },
    {
        id: 'zdarzenia',
        title: 'Zdarzenia drogowe',
        isCustomView: true,
        columns: []
    },
    {
        id: 'dashboardy',
        title: 'Dashboardy',
        isCustomView: true,
        columns: []
    },
    {
        id: 'raporty',
        title: 'Raporty',
        isCustomView: true,
        columns: []
    },
    {
        id: 'kalendarz',
        title: 'Kalendarz',
        columns: ['Data', 'Godzina', 'Wydarzenie', 'Typ', 'Jednostka', 'Odpowiedzialny', 'Lokalizacja', 'Opis', 'Status', 'Priorytet']
    },
    {
        id: 'mapa',
        title: 'Mapa zdarzeń',
        columns: ['ID', 'Data', 'Czas', 'Typ zdarzenia', 'Lokalizacja', 'Współrzędne', 'Jednostka', 'Status', 'Priorytet', 'Notatki']
    },
    {
        id: 'audyt',
        title: 'Log zmian / Audyt',
        columns: ['Timestamp', 'Użytkownik', 'Akcja', 'Moduł', 'Rekord ID', 'Przed zmianą', 'Po zmianie', 'IP', 'Status', 'Szczegóły']
    }
];

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * @typedef {Object} DataRow
 * @property {number} id - Unique row identifier
 * @property {string} [data] - Date in DD.MM.YYYY format
 * @property {string} [nr_jw] - Unit number
 * @property {string} [nazwa_jw] - Unit name
 * @property {string} [miejsce] - Location
 * @property {boolean} [isMainRow] - Whether this is a main row
 * @property {number} [groupId] - Group identifier
 * @property {number} [parentId] - Parent row identifier
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} errors - Array of error messages
 */

/**
 * @typedef {Object} ValidationSummary
 * @property {boolean} valid - Overall validation status
 * @property {number} errorCount - Total number of errors
 * @property {Map<number, string[]>} rowErrors - Map of row IDs to their errors
 */

/**
 * @typedef {Object} ColumnConfig
 * @property {string} key - Column key/identifier
 * @property {string} label - Display label
 * @property {boolean} [visible] - Whether column is visible
 * @property {number} [width] - Column width
 * @property {string} [type] - Data type (text, number, date, etc.)
 */

// ============================================
// STATE MANAGEMENT
// ============================================
/**
 * Global application state
 * @typedef {Object} AppState
 * @property {string|null} currentSection - Currently active section ID
 * @property {Array<Object>} currentData - Current section's data
 * @property {Array<Object>} filteredData - Filtered data for current view
 * @property {number} currentPage - Current pagination page
 * @property {number} rowsPerPage - Number of rows per page
 * @property {string|null} sortColumn - Column being sorted
 * @property {string} sortDirection - Sort direction ('asc' or 'desc')
 * @property {Set} selectedRows - Set of selected row IDs
 * @property {Array<Object>} patroleData - Patrole module data
 * @property {Set} patroleSelectedRows - Selected rows in Patrole module
 * @property {Array<Object>} wykroczeniaData - Wykroczenia module data
 * @property {Set} wykroczeniaSelectedRows - Selected rows in Wykroczenia module
 * @property {Object} wykroczeniaVisibleColumns - Visible columns configuration for Wykroczenia
 * @property {Array<Object>} wkrdData - WKRD module data
 * @property {Set} wkrdSelectedRows - Selected rows in WKRD module
 * @property {Object} wkrdVisibleColumns - Visible columns configuration for WKRD
 * @property {Array<Object>} sankcjeData - Sankcje module data
 * @property {Set} sankcjeSelectedRows - Selected rows in Sankcje module
 * @property {Object} sankcjeVisibleColumns - Visible columns configuration for Sankcje
 * @property {Array<Object>} konwojeData - Konwoje module data
 * @property {Set} konwojeSelectedRows - Selected rows in Konwoje module
 * @property {Object} konwojeVisibleColumns - Visible columns configuration for Konwoje
 * @property {Array<Object>} spbData - ŚPB module data
 * @property {Set} spbSelectedRows - Selected rows in ŚPB module
 * @property {Array<Object>} pilotazeData - Pilotaże module data
 * @property {Set} pilotazeSelectedRows - Selected rows in Pilotaże module
 * @property {Array<Object>} zdarzeniaData - Zdarzenia drogowe module data
 * @property {Set} zdarzeniaSelectedRows - Selected rows in Zdarzenia module
 * @property {string} dashboardView - Current dashboard view
 * @property {Object} dashboardFilters - Dashboard filters configuration
 * @property {Object} patroleVisibleColumns - Visible columns configuration for Patrole
 * @property {Object} patroleDateFilter - Date filter configuration for Patrole
 */
const AppState = {
    currentSection: null,
    currentData: [],
    filteredData: [],
    currentPage: 1,
    rowsPerPage: 25,
    sortColumn: null,
    sortDirection: 'asc',
    selectedRows: new Set(),
    patroleData: [],
    patroleSelectedRows: new Set(),
    wykroczeniaData: [],
    wykroczeniaSelectedRows: new Set(),
    // Widoczne kolumny w Wykroczenia (wszystkie domyślnie widoczne)
    wykroczeniaVisibleColumns: {
        lp: true,
        checkbox: true,
        copy: true,
        month: true,
        data: true,
        nr_jw: true,
        nazwa_jw: true,
        miejsce: true,
        podleglosc: true,
        grupa: true,
        legitymowany: true,
        podstawa: true,
        stan_razem: true,
        pod_wplywem_alk: true,
        nietrzezwy: true,
        pod_wplywem_srod: true,
        rodzaj_razem: true,
        zatrzymanie: true,
        doprowadzenie: true,
        wylegitymowanie: true,
        pouczenie: true,
        mandat: true,
        wysokosc_mandatu: true,
        w_czasie_sluzby: true,
        jzw_prowadzaca: true,
        oddzial: true
    },
    // Filtrowanie dat w Wykroczenia
    wykroczeniaDateFilter: {
        active: false,
        dateFrom: null,
        dateTo: null
    },
    // WKRD
    wkrdData: [],
    wkrdSelectedRows: new Set(),
    wkrdVisibleColumns: {
        lp: true,
        checkbox: true,
        month: true,
        data: true,
        nr_jw: true,
        nazwa_jw: true,
        miejsce: true,
        podleglosc: true,
        razem: true,
        wpm: true,
        ppm: true,
        pozostale: true,
        oddzial: true
    },
    wkrdDateFilter: {
        active: false,
        dateFrom: null,
        dateTo: null
    },
    // Sankcje
    sankcjeData: [],
    sankcjeSelectedRows: new Set(),
    sankcjeVisibleColumns: {
        lp: true,
        checkbox: true,
        copy: true,
        month: true,
        data: true,
        nr_jw: true,
        nazwa_jw: true,
        miejsce: true,
        podleglosc: true,
        grupa: true,
        legitymowany: true,
        rodzaj_razem: true,
        wpm: true,
        ppm: true,
        pieszy: true,
        przyczyna: true,
        sankcja_razem: true,
        zatrzymanie_dr: true,
        zatrzymanie_pj: true,
        mandat: true,
        pouczenie: true,
        inne: true,
        wysokosc_mandatu: true,
        w_czasie_sluzby: true,
        jzw_prowadzaca: true,
        oddzial: true
    },
    sankcjeDateFilter: {
        active: false,
        dateFrom: null,
        dateTo: null
    },
    // Konwoje
    konwojeData: [],
    konwojeSelectedRows: new Set(),
    konwojeVisibleColumns: {
        lp: true,
        checkbox: true,
        month: true,
        data: true,
        rodzaj_razem: true,
        miejscowy: true,
        zamiejscowy: true,
        ilosc_zw: true,
        ilosc_wpm: true,
        zleceniodawca_razem: true,
        prokuratura: true,
        sad: true,
        wlasne: true,
        jzw: true,
        co_konwojowano_razem: true,
        dokumenty: true,
        osoby: true,
        przedmioty: true,
        jw_prowadzaca: true,
        oddzial: true
    },
    konwojeDateFilter: {
        active: false,
        dateFrom: null,
        dateTo: null
    },
    // ŚPB
    spbData: [],
    spbSelectedRows: new Set(),
    spbDateFilter: {
        active: false,
        dateFrom: null,
        dateTo: null
    },
    // Pilotaże
    pilotazeData: [],
    pilotazeSelectedRows: new Set(),
    pilotazeDateFilter: {
        active: false,
        dateFrom: null,
        dateTo: null
    },
    // Zdarzenia drogowe
    zdarzeniaData: [],
    zdarzeniaSelectedRows: new Set(),
    zdarzenieDateFilter: {
        active: false,
        dateFrom: null,
        dateTo: null
    },
    // Dashboard Hub
    dashboardView: 'hub',
    dashboardFilters: {
        mode: 'single',
        single: {
            dateFrom: null,
            dateTo: null,
            preset: '30days'
        },
        compare: {
            period1: { dateFrom: null, dateTo: null, label: 'Okres 1' },
            period2: { dateFrom: null, dateTo: null, label: 'Okres 2' }
        },
        jzw: 'all',
        oddzial: 'all'
    },
    // Widoczne kolumny w Patrole (wszystkie domyślnie widoczne)
    patroleVisibleColumns: {
        lp: true,
        checkbox: true,
        month: true,
        date: true,
        razem_rodzaj: true,
        interwen: true,
        pieszych: true,
        wodnych: true,
        zmot: true,
        wkrd: true,
        zand: true,
        wpm: true,
        motorowek: true,
        razem_wspolz: true,
        policja: true,
        sg: true,
        sop: true,
        sok: true,
        inne: true,
        jwProwadzaca: true,
        oddzialZW: true
    },
    // Filtrowanie dat
    patroleDateFilter: {
        active: false,
        dateFrom: null,
        dateTo: null
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
/**
 * Utility functions for the application
 * @namespace Utils
 */
const Utils = {
    /**
     * Generates test data for a given set of columns
     * @param {string[]} columns - Array of column names
     * @param {number} [count=25] - Number of rows to generate
     * @returns {Array<Object>} Array of generated data objects
     */
    generateTestData(columns, count = 25) {
        const data = [];
        const sampleValues = {
            'Data': () => new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('pl-PL'),
            'Jednostka': () => ['KPP Warszawa', 'KMP Kraków', 'KWP Wrocław', 'KPP Gdańsk'][Math.floor(Math.random() * 4)],
            'Status': () => ['Aktywny', 'Zakończony', 'W trakcie', 'Zaplanowany'][Math.floor(Math.random() * 4)],
            'Operator': () => ['J.Kowalski', 'A.Nowak', 'M.Wiśniewski', 'K.Dąbrowski'][Math.floor(Math.random() * 4)],
            'default': (col) => `${col}-${Math.floor(Math.random() * 1000)}`
        };

        for (let i = 0; i < count; i++) {
            const row = { id: i + 1 };
            columns.forEach(col => {
                row[col] = sampleValues[col] ? sampleValues[col]() : sampleValues.default(col);
            });
            data.push(row);
        }
        return data;
    },

    /**
     * Saves data to localStorage
     * @param {string} key - The localStorage key
     * @param {*} data - The data to save (will be JSON stringified)
     * @returns {boolean} True if successful, false otherwise
     */
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('LocalStorage error:', e);
            return false;
        }
    },

    /**
     * Loads data from localStorage
     * @param {string} key - The localStorage key
     * @returns {*} The parsed data or null if not found or on error
     */
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('LocalStorage error:', e);
            return null;
        }
    },

    /**
     * Creates a debounced function that delays invoking func until after wait milliseconds
     * @param {Function} func - The function to debounce
     * @param {number} wait - The number of milliseconds to delay
     * @returns {Function} The debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// ============================================
// MIGRACJA DANYCH LOCALSTORAGE
// ============================================
/**
 * Data migration utilities for localStorage
 * @namespace DataMigration
 */
const DataMigration = {
    /**
     * Mapping of old localStorage keys to new keys
     * @type {Array<{old: string, new: string}>}
     */
    migrations: [
        { old: 'aep_patrole_data', new: 'aep_data_patrole' },
        { old: 'aep_wykroczenia_data', new: 'aep_data_wykroczenia' },
        { old: 'aep_wkrd_data', new: 'aep_data_wkrd' },
        { old: 'aep_sankcje_data', new: 'aep_data_sankcje' },
        { old: 'aep_konwoje_data', new: 'aep_data_konwoje' },
        { old: 'aep_spb_data', new: 'aep_data_spb' },
        { old: 'aep_pilotaze_data', new: 'aep_data_pilotaze' },
        { old: 'aep_zdarzenia_data', new: 'aep_data_zdarzenia' }
    ],

    /**
     * Migrates data from old localStorage keys to new keys
     * @returns {void}
     */
    migrate() {
        console.log('🔄 Rozpoczynam migrację danych localStorage...');
        let migratedCount = 0;

        this.migrations.forEach(({ old, new: newKey }) => {
            const oldData = Utils.loadFromLocalStorage(old);
            const newData = Utils.loadFromLocalStorage(newKey);

            // Migruj tylko jeśli stary klucz istnieje i nowy jest pusty
            if (oldData && !newData) {
                Utils.saveToLocalStorage(newKey, oldData);
                console.log(`✅ Zmigrowano: ${old} → ${newKey} (${oldData.length} rekordów)`);
                migratedCount++;

                // Usuń stary klucz po udanej migracji
                try {
                    localStorage.removeItem(old);
                } catch (e) {
                    console.error(`⚠️ Nie można usunąć starego klucza: ${old}`, e);
                }
            }
        });

        if (migratedCount > 0) {
            console.log(`✅ Migracja zakończona. Zmigrowano ${migratedCount} modułów.`);
        } else {
            console.log('ℹ️ Brak danych do migracji.');
        }

        // Migracja typów boolean w istniejących danych
        this.migrateBooleanTypes();
    },

    /**
     * Migrates boolean types from string to proper boolean values
     * @returns {void}
     */
    migrateBooleanTypes() {
        console.log('🔄 Migracja typów boolean...');

        // Sankcje: w_czasie_sluzby string → boolean
        const sankcjeData = Utils.loadFromLocalStorage('aep_data_sankcje');
        if (sankcjeData && Array.isArray(sankcjeData)) {
            let changed = false;
            sankcjeData.forEach(row => {
                if (typeof row.w_czasie_sluzby === 'string') {
                    row.w_czasie_sluzby = row.w_czasie_sluzby === 'TAK' || row.w_czasie_sluzby === 'true';
                    changed = true;
                }
            });
            if (changed) {
                Utils.saveToLocalStorage('aep_data_sankcje', sankcjeData);
                console.log('✅ Sankcje: w_czasie_sluzby zmieniono na boolean');
            }
        }

        console.log('✅ Migracja typów boolean zakończona');
    }
};

// Wykonaj migrację przy starcie aplikacji
DataMigration.migrate();

// ============================================
// VALIDATION ENGINE - Centralny system walidacji
// ============================================
/**
 * Validation rules for different modules
 * @typedef {Object} ValidationRule
 * @property {string[]} [required] - Array of required field names
 * @property {Array<{name: string, ifFields: string[], thenFields: string[], message: string}>} [dependencies] - Dependency rules
 */

/**
 * @type {Object.<string, ValidationRule>}
 */
const VALIDATION_RULES = {
    wykroczenia: {
        required: ['data', 'nr_jw', 'nazwa_jw', 'miejsce', 'podleglosc', 'grupa', 'jzw_prowadzaca', 'oddzial'],
        dependencies: [
            {
                name: 'podstawa_rodzaj',
                // Pola podstawy interwencji
                ifFields: ['nar_ubiorcz', 'inne_nar', 'nar_kk', 'wykr_porzadek', 'wykr_bezp',
                          'nar_dyscyplina', 'nar_bron', 'nar_ochr_zdr', 'nar_zakwat', 'pozostale'],
                // Pola rodzaju interwencji
                thenFields: ['zatrzymanie', 'doprowadzenie', 'wylegitymowanie', 'pouczenie', 'mandat_bool'],
                message: 'Zaznaczono podstawę interwencji, ale nie wybrano rodzaju interwencji'
            }
        ]
    },
    sankcje: {
        required: ['data', 'nr_jw', 'nazwa_jw', 'miejsce', 'podleglosc', 'grupa', 'jzw_prowadzaca', 'oddzial'],
        dependencies: [
            {
                name: 'przyczyna_sankcja',
                // Pola przyczyny
                ifFields: ['pod_wplywem_alk', 'nie_zapiecie_pasow', 'telefon_podczas_jazdy',
                          'nie_stosowanie_znakow', 'nie_zabezpieczony_ladunek', 'brak_dokumentow',
                          'wyposazenie_pojazdu', 'nie_korzystanie_swiatel', 'parkowanie_niedozwolone',
                          'niesprawnosci_techniczne', 'inne_przyczyna'],
                // Pola sankcji
                thenFields: ['zatrzymanie_dr', 'zatrzymanie_pj', 'mandat_bool', 'pouczenie', 'inne_sankcja'],
                message: 'Zaznaczono przyczynę, ale nie wybrano sankcji'
            }
        ]
    },
    patrole: {
        required: ['date', 'jwProwadzaca', 'oddzialZW']
    },
    wkrd: {
        required: ['data', 'nr_jw', 'nazwa_jw', 'miejsce', 'podleglosc', 'oddzial']
    },
    konwoje: {
        required: ['data']
    },
    spb: {
        required: ['data']
    },
    pilotaze: {
        required: ['data']
    },
    zdarzenia: {
        required: ['data']
    }
};

/**
 * Validation engine for data integrity
 * @namespace ValidationEngine
 */
const ValidationEngine = {
    /**
     * Waliduje pojedynczy wiersz według reguł modułu
     * @param {string} module - Nazwa modułu (np. 'wykroczenia', 'sankcje')
     * @param {DataRow} row - Wiersz danych do walidacji
     * @returns {ValidationResult} Wynik walidacji z listą błędów
     */
    validateRow(module, row) {
        const rules = VALIDATION_RULES[module];
        if (!rules) {
            return { valid: true, errors: [] };
        }

        const errors = [];

        // 1. Sprawdź wymagane pola
        if (rules.required) {
            rules.required.forEach(field => {
                const value = row[field];
                if (value === undefined || value === null || value === '') {
                    errors.push({
                        type: 'required',
                        field: field,
                        message: `Pole "${field}" jest wymagane`
                    });
                }
            });
        }

        // 2. Sprawdź zależności logiczne (dependency rules)
        if (rules.dependencies) {
            rules.dependencies.forEach(dep => {
                // Sprawdź czy którekolwiek pole IF jest wypełnione
                const ifFilled = dep.ifFields.some(field => {
                    const val = row[field];
                    if (typeof val === 'boolean') return val === true;
                    return (val && val > 0);
                });

                // Sprawdź czy którekolwiek pole THEN jest wypełnione
                const thenFilled = dep.thenFields.some(field => {
                    const val = row[field];
                    if (typeof val === 'boolean') return val === true;
                    return (val && val > 0);
                });

                // Błąd: IF wypełnione, ale THEN puste
                if (ifFilled && !thenFilled) {
                    errors.push({
                        type: 'dependency',
                        name: dep.name,
                        message: dep.message
                    });
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Waliduje wszystkie wiersze w tablicy danych
     * @param {string} module - Nazwa modułu
     * @param {DataRow[]} data - Tablica danych do walidacji
     * @returns {ValidationSummary} Podsumowanie walidacji wszystkich wierszy
     */
    validateAll(module, data) {
        const rowErrors = new Map();
        let errorCount = 0;

        data.forEach((row, index) => {
            const validation = this.validateRow(module, row);
            if (!validation.valid) {
                rowErrors.set(row.id || index, validation.errors);
                errorCount += validation.errors.length;
            }
        });

        return {
            valid: errorCount === 0,
            errorCount: errorCount,
            rowErrors: rowErrors
        };
    },

    /**
     * Zlicza błędy walidacji dla danego modułu
     * @param {string} module - Nazwa modułu
     * @param {Array} data - Tablica danych
     * @returns {number} Liczba wierszy z błędami
     */
    countErrors(module, data) {
        let errorCount = 0;
        data.forEach(row => {
            const validation = this.validateRow(module, row);
            if (!validation.valid) {
                errorCount++;
            }
        });
        return errorCount;
    },

    /**
     * Sprawdza kompletność danych (wymagane pola)
     * @param {string} module - Nazwa modułu
     * @param {Array} data - Tablica danych
     * @returns {object} Szczegółowy raport z brakami
     */
    checkCompleteness(module, data) {
        const rules = VALIDATION_RULES[module];
        if (!rules || !rules.required) {
            return { complete: true, issues: [] };
        }

        const issues = [];

        data.forEach((row, index) => {
            const missing = [];
            rules.required.forEach(field => {
                const value = row[field];
                if (value === undefined || value === null || value === '') {
                    missing.push(field);
                }
            });

            if (missing.length > 0) {
                issues.push({
                    rowIndex: index + 1,
                    rowId: row.id,
                    missing: missing
                });
            }
        });

        return {
            complete: issues.length === 0,
            issues: issues
        };
    }
};

// ============================================
// AUTO-CALCULATE ENGINE - Automatyczne obliczenia
// ============================================
/**
 * Auto-calculation configuration for different modules
 * @typedef {Object} CalculationConfig
 * @property {string} target - Target field name for calculation result
 * @property {string[]} sources - Source field names to sum
 * @property {string[]} [includeBooleans] - Boolean fields to include (1 if true)
 */

/**
 * @type {Object.<string, CalculationConfig[]>}
 */
const AUTO_CALCULATE_CONFIG = {
    patrole: [
        {
            target: 'razem_rodzaj',
            sources: ['interwen', 'pieszych', 'wodnych', 'zmot', 'wkrd']
        },
        {
            target: 'razem_wspolz',
            sources: ['policja', 'sg', 'sop', 'sok', 'inne']
        }
    ],
    wykroczenia: [
        {
            target: 'stan_razem',
            sources: ['pod_wplywem_alk', 'nietrzezwy', 'pod_wplywem_srod']
        },
        {
            target: 'rodzaj_razem',
            sources: ['zatrzymanie', 'doprowadzenie', 'wylegitymowanie', 'pouczenie'],
            includeBooleans: ['mandat_bool']  // Dodaje 1 jeśli true
        }
    ],
    wkrd: [
        {
            target: 'razem',
            sources: ['wpm', 'ppm', 'pozostale']
        }
    ],
    sankcje: [
        {
            target: 'rodzaj_razem',
            sources: ['wpm', 'ppm', 'pieszy']
        },
        {
            target: 'przyczyna_razem',
            sources: ['pod_wplywem_alk', 'nie_zapiecie_pasow', 'telefon_podczas_jazdy',
                     'nie_stosowanie_znakow', 'nie_zabezpieczony_ladunek', 'brak_dokumentow',
                     'wyposazenie_pojazdu', 'nie_korzystanie_swiatel', 'parkowanie_niedozwolone',
                     'niesprawnosci_techniczne', 'inne_przyczyna']
        },
        {
            target: 'sankcja_razem',
            sources: ['zatrzymanie_dr', 'zatrzymanie_pj', 'pouczenie', 'inne_sankcja'],
            includeBooleans: ['mandat_bool']
        }
    ]
};

/**
 * Calculation engine for automatic field calculations
 * @namespace CalculationEngine
 */
const CalculationEngine = {
    /**
     * Automatycznie oblicza pola RAZEM według konfiguracji
     * @param {string} module - Nazwa modułu (np. 'patrole', 'wykroczenia')
     * @param {object} row - Wiersz danych do obliczenia
     * @returns {object} Wiersz z uzupełnionymi polami RAZEM
     */
    calculate(module, row) {
        const config = AUTO_CALCULATE_CONFIG[module];
        if (!config) return row;

        config.forEach(calc => {
            let sum = 0;

            // Sumuj pola numeryczne
            if (calc.sources) {
                calc.sources.forEach(field => {
                    sum += parseInt(row[field]) || 0;
                });
            }

            // Dodaj pola boolean (jeśli true to +1)
            if (calc.includeBooleans) {
                calc.includeBooleans.forEach(field => {
                    if (row[field] === true) {
                        sum += 1;
                    }
                });
            }

            // Ustaw wartość
            row[calc.target] = sum;
        });

        return row;
    },

    /**
     * Oblicza pola RAZEM dla wszystkich wierszy
     * @param {string} module - Nazwa modułu
     * @param {Array} data - Tablica danych
     * @returns {Array} Tablica z obliczonymi polami
     */
    calculateAll(module, data) {
        return data.map(row => this.calculate(module, row));
    }
};

// ============================================
// DEFAULT VALUES - Centralna konfiguracja wartości domyślnych
// ============================================
/**
 * Default values for different modules
 * @typedef {Object} DefaultValues
 * @property {Object} common - Common default values shared across modules
 * @property {Object} wykroczenia - Default values for Wykroczenia module
 * @property {Object} sankcje - Default values for Sankcje module
 * @property {Object} wkrd - Default values for WKRD module
 */

/**
 * @type {DefaultValues}
 */
const DEFAULT_VALUES = {
    common: {
        jwProwadzaca: 'OŻW Elbląg',
        jzw_prowadzaca: 'OŻW Elbląg',
        oddzial: 'OŻW Elbląg',
        oddzialZW: 'OŻW Elbląg'
    },
    wykroczenia: {
        nr_jw: '',
        nazwa_jw: '',
        miejsce: '',
        podleglosc: 'WL',
        grupa: 'żołnierz'
    },
    sankcje: {
        nr_jw: '',
        nazwa_jw: '',
        miejsce: '',
        podleglosc: '',
        grupa: ''
    },
    wkrd: {
        nr_jw: '',
        nazwa_jw: '',
        miejsce: '',
        podleglosc: ''
    }
};

// ============================================
// BASE TABLE MANAGER - Wspólna architektura dla managerów tabel
// ============================================
/**
 * Configuration for table manager
 * @typedef {Object} TableManagerConfig
 * @property {string} module - Module name (e.g., 'patrole', 'wkrd')
 * @property {string} dataKey - Key in AppState (e.g., 'patroleData')
 * @property {string} selectedRowsKey - Key for selected rows (e.g., 'patroleSelectedRows')
 * @property {string} storageKey - localStorage key (e.g., 'aep_data_patrole')
 * @property {string} tableBodyId - ID of tbody element
 * @property {string} emptyMessage - Message when no data
 * @property {Function} defaultRow - Function returning default row object
 * @property {Function} renderRowHTML - Function rendering row HTML
 * @property {Object} [customMethods] - Additional module-specific methods
 */

/**
 * Factory function creating base table manager with shared functionality
 * @param {TableManagerConfig} config - Manager configuration
 * @returns {Object} Manager with shared methods
 */
const createBaseTableManager = (config) => {
    const {
        module,           // Nazwa modułu (np. 'patrole', 'wkrd')
        dataKey,          // Klucz w AppState (np. 'patroleData')
        selectedRowsKey,  // Klucz dla zaznaczonych wierszy (np. 'patroleSelectedRows')
        storageKey,       // Klucz localStorage (np. 'aep_data_patrole')
        tableBodyId,      // ID elementu tbody
        emptyMessage,     // Komunikat gdy brak danych
        defaultRow,       // Funkcja zwracająca domyślny wiersz
        renderRowHTML,    // Funkcja renderująca HTML wiersza
        customMethods     // Dodatkowe metody specyficzne dla modułu
    } = config;

    const base = {
        config,

        // === GETTERY/SETTERY ===
        getData() {
            return AppState[dataKey] || [];
        },

        setData(data) {
            AppState[dataKey] = data;
        },

        getSelectedRows() {
            return AppState[selectedRowsKey];
        },

        // === ZARZĄDZANIE WIERSZAMI ===
        addRow() {
            const data = this.getData();
            const newId = data.length > 0 ? Math.max(...data.map(r => r.id)) + 1 : 1;

            const today = new Date();
            const todayPolish = today.toLocaleDateString('pl-PL');

            const newRow = defaultRow(newId, todayPolish);

            data.push(newRow);
            this.renderRows();
            this.autoSave();
        },

        updateField(id, field, value) {
            const data = this.getData();
            const row = data.find(r => r.id === id);

            if (row) {
                // Obsługa daty
                if (field === 'data' && value) {
                    const date = new Date(value);
                    row.data = date.toLocaleDateString('pl-PL');
                } else {
                    row[field] = value;
                }

                // Auto-oblicz pola RAZEM
                CalculationEngine.calculate(module, row);

                this.renderRows();
                this.autoSave();
            }
        },

        toggleRowSelect(id, checked) {
            const selectedRows = this.getSelectedRows();
            if (checked) {
                selectedRows.add(id);
            } else {
                selectedRows.delete(id);
            }
            this.renderRows();
        },

        toggleSelectAll(checked) {
            const data = this.getData();
            const selectedRows = this.getSelectedRows();

            if (checked) {
                data.forEach(row => selectedRows.add(row.id));
            } else {
                selectedRows.clear();
            }
            this.renderRows();
        },

        clearSelected() {
            const data = this.getData();
            const selectedRows = this.getSelectedRows();

            if (selectedRows.size === 0) {
                alert('Nie zaznaczono żadnych wierszy do usunięcia');
                return;
            }

            if (!confirm(`Czy na pewno usunąć ${selectedRows.size} zaznaczonych wierszy?`)) {
                return;
            }

            this.setData(data.filter(row => !selectedRows.has(row.id)));
            selectedRows.clear();
            this.renderRows();
            this.autoSave();
        },

        // === ZAPIS DANYCH ===
        saveDraft() {
            const data = this.getData();
            const success = Utils.saveToLocalStorage(storageKey, data);

            if (success) {
                alert('Arkusz zapisany pomyślnie');
            } else {
                alert('Błąd podczas zapisywania');
            }
        },

        autoSave() {
            const data = this.getData();
            Utils.saveToLocalStorage(storageKey, data);
        },

        // === RENDEROWANIE ===
        renderRows() {
            const tbody = document.getElementById(tableBodyId);
            if (!tbody) return;

            const data = this.getData();
            const selectedRows = this.getSelectedRows();

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="20" class="empty-message">${emptyMessage}</td></tr>`;
                return;
            }

            tbody.innerHTML = data.map((row, index) => {
                const isSelected = selectedRows.has(row.id);
                return renderRowHTML(row, index, isSelected, this);
            }).join('');
        },

        // === ŁADOWANIE DANYCH ===
        loadData() {
            const savedData = Utils.loadFromLocalStorage(storageKey);
            this.setData(savedData || []);
            this.getSelectedRows().clear();
        }
    };

    // Dodaj niestandardowe metody jeśli są
    if (customMethods) {
        Object.assign(base, customMethods);
    }

    return base;
};

/**
 * DOKUMENTACJA: Jak używać createBaseTableManager
 *
 * ===================================================================
 * PRZEWODNIK MIGRACJI - Jak stopniowo przenosić istniejące moduły
 * ===================================================================
 *
 * KROK 1: IDENTYFIKACJA MODUŁÓW DO MIGRACJI
 * ------------------------------------------
 * Najłatwiejsze (polecane jako pierwsze):
 * - SPB: prosta tabela, brak subrows, brak grouping
 * - Pilotaże: podobnie jak SPB
 * - Konwoje: podobnie jak SPB
 *
 * Średnie (wymagają customizacji):
 * - Patrole: ma getMonthFromDate(), sync scrollbars, visibility columns
 * - WKRD: filtrowanie dat i kolumn, sync scrollbars
 * - Zdarzenia: może mieć custom logic
 *
 * Trudne (wymagają rozszerzenia BaseTableManager):
 * - Wykroczenia: grouping, subrows, synchronizacja legitymowany
 * - Sankcje: grouping, subrows, synchronizacja legitymowany
 *
 *
 * KROK 2: HYBRID APPROACH (zalecane!)
 * ------------------------------------
 * Nie trzeba migrować całego modułu na raz. Można użyć "hybrid approach":
 * - Bazowe metody z createBaseTableManager
 * - Specyficzny kod (render, filters, etc.) jako customMethods
 *
 * Przykład WKRD w hybrid approach:
 *
 * const WKRDManager = createBaseTableManager({
 *     module: 'wkrd',
 *     dataKey: 'wkrdData',
 *     selectedRowsKey: 'wkrdSelectedRows',
 *     storageKey: 'aep_data_wkrd',
 *     tableBodyId: 'wkrdTableBody',
 *     emptyMessage: 'Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.',
 *
 *     defaultRow: (id, date) => ({
 *         id: id,
 *         data: date,
 *         nr_jw: '',
 *         nazwa_jw: '',
 *         miejsce: '',
 *         podleglosc: '',
 *         razem: 0,
 *         wpm: 0,
 *         ppm: 0,
 *         pozostale: 0,
 *         oddzial: ''
 *     }),
 *
 *     renderRowHTML: (row, index, isSelected, manager) => {
 *         const razem = (parseInt(row.wpm) || 0) + (parseInt(row.ppm) || 0) + (parseInt(row.pozostale) || 0);
 *         const month = row.data ? new Date(row.data.split('.').reverse().join('-')).toLocaleDateString('pl-PL', {month: 'long'}) : '';
 *
 *         return `
 *             <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''}">
 *                 <td>${index + 1}</td>
 *                 <td><input type="checkbox" ${isSelected ? 'checked' : ''}
 *                            onchange="WKRDManager.toggleRowSelect(${row.id}, this.checked)"></td>
 *                 <td>${month}</td>
 *                 <td><input type="date" value="${row.data}"
 *                            onchange="WKRDManager.updateField(${row.id}, 'data', this.value)"></td>
 *                 <td><input type="text" value="${row.nr_jw}"
 *                            onchange="WKRDManager.updateField(${row.id}, 'nr_jw', this.value)"></td>
 *                 <td>${razem}</td>
 *                 <td><input type="number" value="${row.wpm}"
 *                            onchange="WKRDManager.updateField(${row.id}, 'wpm', this.value)"></td>
 *                 ... etc ...
 *             </tr>
 *         `;
 *     },
 *
 *     // CUSTOM METHODS - zachowaj specyficzny kod modułu
 *     customMethods: {
 *         render: function() {
 *             // this.loadData();
 *             // ... cały custom HTML jak w oryginalnym WKRDManager ...
 *             // ... setup event listeners ...
 *             // this.renderRows();
 *             // this.syncScrollbars();
 *         },
 *
 *         initColumnsDropdown: function() {
 *             // custom logic dla filtrowania kolumn
 *         },
 *
 *         initDateFilter: function() {
 *             // custom logic dla filtrowania dat
 *         },
 *
 *         syncScrollbars: function() {
 *             // custom logic dla scrollbars
 *         }
 *     }
 * });
 *
 * KORZYŚCI HYBRID APPROACH:
 * - Eliminujesz ~50-80 linii duplikowanego kodu (addRow, updateField, etc.)
 * - Zachowujesz specyficzny kod modułu bez zmian
 * - Mniejsze ryzyko wprowadzenia bugów
 * - Łatwiejsza migracja krok po kroku
 *
 *
 * KROK 3: PEŁNA MIGRACJA (opcjonalna)
 * ------------------------------------
 * Po sukcesie hybrid approach, możesz zrefaktoryzować customMethods:
 * - Wydziel wspólne patterns do BaseTableManager
 * - Stwórz pomocnicze funkcje dla powtarzalnych zadań
 * - Stopniowo redukuj custom kod
 *
 *
 * ===================================================================
 * QUICK WIN: Prosta migracja SPB (eliminacja ~60 linii duplikacji)
 * ===================================================================
 *
 * PRZED migracją - duplikowany kod w SPBManager:
 * ------------------------------------------------
 *   addRow() {
 *       const newId = AppState.spbData.length > 0 ?
 *           Math.max(...AppState.spbData.map(r => r.id)) + 1 : 1;
 *       const today = new Date();
 *       const todayPolish = today.toLocaleDateString('pl-PL');
 *       const newRow = { id: newId, data: todayPolish, ... };
 *       AppState.spbData.unshift(newRow);  // ❌ NIESPÓJNOŚĆ: używa unshift zamiast push
 *       this.renderRows();
 *       this.autoSave();
 *   }
 *
 *   updateField(id, field, value) {
 *       const row = AppState.spbData.find(r => r.id === id);
 *       if (row) {
 *           if (field === 'data' && value) {
 *               row.data = new Date(value).toLocaleDateString('pl-PL');
 *           } else {
 *               row[field] = value;
 *           }
 *           this.renderRows();
 *           this.autoSave();
 *       }
 *   }
 *
 *   toggleSelectAll(checked) { ... }    // ~8 linii
 *   toggleRowSelect(id, checked) { ... } // ~8 linii
 *   clearSelected() { ... }              // ~12 linii
 *   saveDraft() { ... }                  // ~6 linii
 *   autoSave() { ... }                   // ~4 linii
 *
 * PO migracji - wykorzystanie BaseTableManager:
 * -----------------------------------------------
 * Wszystkie powyższe metody (~60 linii) zastąpione przez:
 *
 *   const SPBManager = createBaseTableManager({
 *       module: 'spb',
 *       dataKey: 'spbData',
 *       selectedRowsKey: 'spbSelectedRows',
 *       storageKey: 'aep_data_spb',
 *       tableBodyId: 'spbTableBody',
 *       emptyMessage: 'Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.',
 *
 *       defaultRow: (id, date) => ({
 *           id: id, data: date, nr_jw: '', nazwa_jw: '',
 *           miejsce: '', podleglosc: '', grupa: '',
 *           sila_fizyczna: 0, kajdanki: 0, kaftan: 0, kask: 0,
 *           siatka: 0, palka: 0, pies: 0, chem_sr: 0,
 *           paralizator: 0, kolczatka: 0, bron: 0,
 *           podczas_konw: 'NIE', zatrzymania: 0, doprowadzenia: 0,
 *           inne_patrol: 0, ranny: 'NIE', smierc: 'NIE',
 *           jzw_prowadzaca: 'OŻW Elbląg', oddzial: 'Elbląg'
 *       }),
 *
 *       renderRowHTML: (row, index, isSelected) => {
 *           // ... render wiersza z wszystkimi kolumnami ...
 *           // return HTML string
 *       },
 *
 *       customMethods: {
 *           render: function() {
 *               // zachowaj cały custom HTML, toolbar, date filter
 *           },
 *           initDateFilter: function() {
 *               // custom logic dla filtrowania dat
 *           },
 *           syncScrollbars: function() {
 *               // custom logic dla synchronizacji scrollbars
 *           },
 *           openSrodkiModal: function(id) {
 *               // custom logic dla modala środków ŚPB
 *           },
 *           renderSrodkiChips: function(row) {
 *               // custom logic dla renderowania chips
 *           },
 *           dateToInputFormat: function(date) {
 *               // helper do konwersji dat
 *           }
 *       }
 *   });
 *
 * KORZYŚCI Quick Win dla SPB:
 * - ✅ Eliminacja ~60 linii duplikowanego kodu
 * - ✅ Naprawa niespójności (unshift → push)
 * - ✅ Automatyczna integracja z CalculationEngine (jeśli będzie potrzebna)
 * - ✅ Zachowanie całego custom UI (date filters, środki ŚPB modal, scrollbars)
 * - ✅ Mniejsze ryzyko - tylko bazowe metody się zmieniają
 * - ✅ Czas migracji: ~30 minut
 *
 * PODOBNIE można zmigrować:
 * - Pilotaże (~55 linii oszczędności)
 * - Konwoje (~55 linii oszczędności)
 *
 *
 * ===================================================================
 * PRZYKŁAD UŻYCIA (proof-of-concept dla nowych modułów)
 * ===================================================================
 *
 * const ExampleManager = createBaseTableManager({
 *     module: 'example',
 *     dataKey: 'exampleData',
 *     selectedRowsKey: 'exampleSelectedRows',
 *     storageKey: 'aep_data_example',
 *     tableBodyId: 'exampleTableBody',
 *     emptyMessage: 'Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.',
 *
 *     // Funkcja zwracająca domyślny wiersz
 *     defaultRow: (id, date) => ({
 *         id: id,
 *         data: date,
 *         pole1: 0,
 *         pole2: '',
 *         razem: 0
 *     }),
 *
 *     // Funkcja renderująca HTML wiersza
 *     renderRowHTML: (row, index, isSelected, manager) => {
 *         return `
 *             <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''}">
 *                 <td>${index + 1}</td>
 *                 <td><input type="checkbox" ${isSelected ? 'checked' : ''}
 *                            onchange="ExampleManager.toggleRowSelect(${row.id}, this.checked)"></td>
 *                 <td><input type="date" value="${row.data}"
 *                            onchange="ExampleManager.updateField(${row.id}, 'data', this.value)"></td>
 *                 <td><input type="number" value="${row.pole1}"
 *                            onchange="ExampleManager.updateField(${row.id}, 'pole1', this.value)"></td>
 *                 <td>${row.razem}</td>
 *             </tr>
 *         `;
 *     },
 *
 *     // Niestandardowe metody specyficzne dla tego modułu
 *     customMethods: {
 *         render: function() {
 *             // this.loadData();
 *             // wygeneruj HTML z tabelą i przyciskami
 *             // this.renderRows();
 *         }
 *     }
 * });
 *
 * KORZYŚCI Z UŻYCIA BaseTableManager:
 * - Redukcja ~100 linii kodu na manager (8 managerów = ~800 linii oszczędności)
 * - Spójna implementacja podstawowych operacji
 * - Łatwiejsze utrzymanie - bugfixy w jednym miejscu
 * - Automatyczna integracja z ValidationEngine i CalculationEngine
 * - Mniej duplikacji kodu
 *
 * NASTĘPNE KROKI (przyszła refaktoryzacja):
 * 1. Zmigrować proste moduły (Patrole, WKRD, Konwoje, SPB, Pilotaze, Zdarzenia)
 * 2. Rozszerzyć BaseTableManager o obsługę grouping (dla Wykroczenia, Sankcje)
 * 3. Dodać obsługę podwierszy (subrows) dla modułów z tej funkcjonalności
 * 4. Stopniowo zastępować istniejące managery nowymi opartymi na BaseTableManager
 */

// ============================================
// GLOBALNA FUNKCJA TOGGLE SIDEBAR
// ============================================
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (sidebar && toggleBtn) {
        const wasCollapsed = sidebar.classList.contains('collapsed');
        sidebar.classList.toggle('collapsed');
        
        // Animuj pozycję przycisku
        if (!wasCollapsed) {
            // Będzie zwinięty - przesuń w lewo
            toggleBtn.style.left = '18px';
        } else {
            // Będzie rozwinięty - przesuń w prawo
            toggleBtn.style.left = '234px';
        }
        
        Utils.saveToLocalStorage('sidebar_collapsed', !wasCollapsed);
        console.log('✅ Sidebar toggled:', !wasCollapsed ? 'COLLAPSED' : 'EXPANDED');
    }
};

// ============================================
// ROUTER
// ============================================
/**
 * Application router for handling navigation and rendering sections
 * @namespace Router
 */
const Router = {
    /**
     * Initializes the router by setting up event listeners
     * @returns {void}
     */
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    /**
     * Handles route changes based on URL hash
     * @returns {void}
     */
    handleRoute() {
        const hash = window.location.hash.slice(1) || 'start';
        const section = SECTIONS.find(s => s.id === hash);

        if (hash === 'start' || hash === '') {
            this.renderStartPage();
        } else if (section) {
            this.renderSection(section);
        } else if (hash === 'inne') {
            // Do nothing
        } else {
            this.renderStartPage();
        }

        this.updateBreadcrumbs(hash);
        this.updateActiveNav(hash);
    },

    /**
     * Renders the start/dashboard page
     * @returns {void}
     */
    renderStartPage() {
        // Pobierz aktualne statystyki z localStorage
        const stats = this.getDashboardStats();
        
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="dashboard-start">
                <!-- Logo i Header -->
                <div class="dashboard-header">
                    <div class="logo-section">
                        <img src="img/logo_Elblag.png" alt="Logo Elbląg" class="dashboard-logo">
                        <h1 class="dashboard-title">Arkusz Ewidencji Prewencyjnej</h1>
                        <p class="dashboard-subtitle">System zarządzania działaniami prewencyjnymi</p>
                    </div>
                    <div class="datetime-display">
                        <div class="current-time" id="currentTime">--:--:--</div>
                        <div class="current-date" id="currentDate">-- ----- ----</div>
                    </div>
                </div>

                <!-- Wizualizacje danych -->
                <div class="charts-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-line"></i> Patrole - ostatnie 7 dni</h3>
                        </div>
                        <canvas id="patrolChart"></canvas>
                    </div>

                    <div class="chart-card">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-pie"></i> Wykroczenia - rozkład typów</h3>
                        </div>
                        <canvas id="violationsChart"></canvas>
                    </div>

                    <div class="chart-card">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-bar"></i> Sankcje PLN - ostatnie 6 miesięcy</h3>
                        </div>
                        <canvas id="sanctionsChart"></canvas>
                    </div>

                    <div class="chart-card">
                        <div class="chart-header">
                            <h3><i class="fas fa-tasks"></i> Cele miesięczne - realizacja</h3>
                        </div>
                        <div class="goals-container">
                            <div class="goal-item">
                                <div class="goal-label">
                                    <span>Patrole</span>
                                    <span class="goal-value">${stats.patrole.count}/${stats.patrole.target}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" data-progress="${stats.patrole.percent}"></div>
                                </div>
                                <span class="progress-percent">${stats.patrole.percent}%</span>
                            </div>

                            <div class="goal-item">
                                <div class="goal-label">
                                    <span>Wykroczenia</span>
                                    <span class="goal-value">${stats.wykroczenia.count}/${stats.wykroczenia.target}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" data-progress="${stats.wykroczenia.percent}"></div>
                                </div>
                                <span class="progress-percent">${stats.wykroczenia.percent}%</span>
                            </div>

                            <div class="goal-item">
                                <div class="goal-label">
                                    <span>Konwoje</span>
                                    <span class="goal-value">${stats.konwoje.count}/${stats.konwoje.target}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" data-progress="${stats.konwoje.percent}"></div>
                                </div>
                                <span class="progress-percent">${stats.konwoje.percent}%</span>
                            </div>

                            <div class="goal-item">
                                <div class="goal-label">
                                    <span>Zdarzenia</span>
                                    <span class="goal-value">${stats.zdarzenia.count}/${stats.zdarzenia.target}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" data-progress="${stats.zdarzenia.percent}"></div>
                                </div>
                                <span class="progress-percent">${stats.zdarzenia.percent}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Szybki przegląd -->
                <div class="quick-stats">
                    <div class="quick-stat-card">
                        <i class="fas fa-truck"></i>
                        <div class="quick-stat-content">
                            <div class="quick-stat-label">Konwoje</div>
                            <div class="quick-stat-value" data-target="${stats.konwoje.count}">0</div>
                        </div>
                    </div>
                    <div class="quick-stat-card">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div class="quick-stat-content">
                            <div class="quick-stat-label">ŚPB</div>
                            <div class="quick-stat-value" data-target="${stats.spb.count}">0</div>
                        </div>
                    </div>
                    <div class="quick-stat-card">
                        <i class="fas fa-flag"></i>
                        <div class="quick-stat-content">
                            <div class="quick-stat-label">Pilotaże</div>
                            <div class="quick-stat-value" data-target="${stats.pilotaze.count}">0</div>
                        </div>
                    </div>
                    <div class="quick-stat-card">
                        <i class="fas fa-car-crash"></i>
                        <div class="quick-stat-content">
                            <div class="quick-stat-label">Zdarzenia</div>
                            <div class="quick-stat-value" data-target="${stats.zdarzenia.count}">0</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        AppState.currentSection = null;
        
        // Inicjalizuj zegar
        this.initLiveClock();
        
        // Inicjalizuj animacje
        this.initDashboardAnimations();
        
        // Inicjalizuj wykresy
        this.initCharts();
    },

    getDashboardStats() {
        // Załaduj dane z localStorage
        const patroleData = AppState.patroleData || [];
        const wykroczeniaData = AppState.wykroczeniaData || [];
        const konwojeData = Utils.loadFromLocalStorage('aep_data_konwoje') || [];
        const spbData = Utils.loadFromLocalStorage('aep_data_spb') || [];
        const pilotazeData = Utils.loadFromLocalStorage('aep_data_pilotaze') || [];
        const zdarzeniaData = Utils.loadFromLocalStorage('aep_data_zdarzenia') || [];
        
        // Cele (można je trzymać w localStorage lub hardcodować)
        const targets = {
            patrole: 200,
            wykroczenia: 250,
            konwoje: 50,
            zdarzenia: 100
        };
        
        // Oblicz statystyki
        const patroleCount = patroleData.length;
        const wykroczeniaCount = wykroczeniaData.length;
        const konwojeCount = konwojeData.length;
        const spbCount = spbData.length;
        const pilotazeCount = pilotazeData.length;
        const zdarzeniaCount = zdarzeniaData.length;
        
        return {
            patrole: {
                count: patroleCount,
                target: targets.patrole,
                percent: Math.min(Math.round((patroleCount / targets.patrole) * 100), 100)
            },
            wykroczenia: {
                count: wykroczeniaCount,
                target: targets.wykroczenia,
                percent: Math.min(Math.round((wykroczeniaCount / targets.wykroczenia) * 100), 100)
            },
            konwoje: {
                count: konwojeCount,
                target: targets.konwoje,
                percent: Math.min(Math.round((konwojeCount / targets.konwoje) * 100), 100)
            },
            spb: {
                count: spbCount,
                target: 30,
                percent: Math.min(Math.round((spbCount / 30) * 100), 100)
            },
            pilotaze: {
                count: pilotazeCount,
                target: 40,
                percent: Math.min(Math.round((pilotazeCount / 40) * 100), 100)
            },
            zdarzenia: {
                count: zdarzeniaCount,
                target: targets.zdarzenia,
                percent: Math.min(Math.round((zdarzeniaCount / targets.zdarzenia) * 100), 100)
            }
        };
    },

    initLiveClock() {
        const updateClock = () => {
            const now = new Date();
            const timeEl = document.getElementById('currentTime');
            const dateEl = document.getElementById('currentDate');
            
            if (timeEl) {
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                timeEl.textContent = `${hours}:${minutes}:${seconds}`;
            }
            
            if (dateEl) {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dateEl.textContent = now.toLocaleDateString('pl-PL', options);
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    },

    initDashboardAnimations() {
        // Animacja liczników
        const animateCounter = (element) => {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        };
        
        // Animuj wszystkie liczniki
        document.querySelectorAll('.quick-stat-value').forEach(el => {
            setTimeout(() => animateCounter(el), 300);
        });
        
        // Animacja progress barów
        setTimeout(() => {
            document.querySelectorAll('.progress-fill').forEach(fill => {
                const progress = fill.getAttribute('data-progress');
                fill.style.width = progress + '%';
            });
        }, 500);
    },

    initCharts() {
        // Sprawdź czy Chart.js jest załadowany
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        // Dane przykładowe (docelowo z localStorage)
        const patrolData = this.getPatrolData();
        const violationsData = this.getViolationsData();
        const sanctionsData = this.getSanctionsData();

        // Wykres liniowy - Patrole
        const patrolCtx = document.getElementById('patrolChart');
        if (patrolCtx) {
            new Chart(patrolCtx, {
                type: 'line',
                data: {
                    labels: patrolData.labels,
                    datasets: [{
                        label: 'Liczba patroli',
                        data: patrolData.values,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#2563eb',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15, 17, 21, 0.95)',
                            titleColor: '#e6e6e6',
                            bodyColor: '#e6e6e6',
                            borderColor: '#2a2f3a',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(42, 47, 58, 0.5)' },
                            ticks: { color: '#9aa3b2' }
                        },
                        x: {
                            grid: { color: 'rgba(42, 47, 58, 0.3)' },
                            ticks: { color: '#9aa3b2' }
                        }
                    }
                }
            });
        }

        // Wykres kołowy - Wykroczenia
        const violationsCtx = document.getElementById('violationsChart');
        if (violationsCtx) {
            new Chart(violationsCtx, {
                type: 'doughnut',
                data: {
                    labels: violationsData.labels,
                    datasets: [{
                        data: violationsData.values,
                        backgroundColor: [
                            '#2563eb',
                            '#8b5cf6',
                            '#ef4444',
                            '#f59e0b',
                            '#10b981'
                        ],
                        borderWidth: 2,
                        borderColor: '#141821'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#e6e6e6',
                                padding: 15,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 17, 21, 0.95)',
                            titleColor: '#e6e6e6',
                            bodyColor: '#e6e6e6',
                            borderColor: '#2a2f3a',
                            borderWidth: 1,
                            padding: 12
                        }
                    }
                }
            });
        }

        // Wykres słupkowy - Sankcje
        const sanctionsCtx = document.getElementById('sanctionsChart');
        if (sanctionsCtx) {
            new Chart(sanctionsCtx, {
                type: 'bar',
                data: {
                    labels: sanctionsData.labels,
                    datasets: [{
                        label: 'Kwota (PLN)',
                        data: sanctionsData.values,
                        backgroundColor: '#8b5cf6',
                        borderColor: '#a78bfa',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15, 17, 21, 0.95)',
                            titleColor: '#e6e6e6',
                            bodyColor: '#e6e6e6',
                            borderColor: '#2a2f3a',
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                                label: (context) => {
                                    return 'Kwota: ' + context.parsed.y.toLocaleString('pl-PL') + ' PLN';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(42, 47, 58, 0.5)' },
                            ticks: {
                                color: '#9aa3b2',
                                callback: (value) => value.toLocaleString('pl-PL') + ' PLN'
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#9aa3b2' }
                        }
                    }
                }
            });
        }
    },

    getPatrolData() {
        // Próbuj załadować dane z localStorage (zapisane przez "Zapisz arkusz")
        const savedData = Utils.loadFromLocalStorage('aep_data_patrole');
        
        if (savedData && savedData.length > 0) {
            // Weź ostatnie 7 wpisów
            const last7 = savedData.slice(-7);
            
            return {
                labels: last7.map(item => {
                    // Użyj miesiąca jako etykiety (PAŹ, WRZ, SIE)
                    return item.month || 'N/A';
                }),
                values: last7.map(item => {
                    // Użyj kolumny RAZEM (razem_rodzaj) zamiast sumować
                    return parseInt(item.razem_rodzaj) || 0;
                })
            };
        }
        
        // Brak danych - pokaż puste z 0
        return {
            labels: ['Brak', 'danych', '-', 'dodaj', 'i', 'zapisz', 'arkusz'],
            values: [0, 0, 0, 0, 0, 0, 0]
        };
    },

    getViolationsData() {
        // Mapa kluczy na czytelne nazwy (skrócone dla wykresu)
        const podstawaLabels = {
            'nar_ubiorcz': 'Nar.ub.',
            'inne_nar': 'Inne nar.',
            'nar_kk': 'Nar.KK',
            'wykr_porzadek': 'Wykr.porz.',
            'wykr_bezp': 'Wykr.bezp.',
            'nar_dyscyplina': 'Nar.dyscy.',
            'nar_bron': 'Nar.broni',
            'nar_ochr_zdr': 'Nar.ochr.zdr.',
            'nar_zakwat': 'Nar.zakwat.',
            'pozostale': 'Pozostałe'
        };
        
        // Próbuj załadować dane z localStorage (zapisane przez "Zapisz arkusz")
        const savedData = Utils.loadFromLocalStorage('aep_data_wykroczenia');
        
        if (savedData && savedData.length > 0) {
            // Zlicz według podstawy interwencji
            const counts = {};
            
            savedData.forEach(row => {
                // Sprawdź każdą podstawę
                Object.keys(podstawaLabels).forEach(key => {
                    if (row[key] && parseInt(row[key]) > 0) {
                        const label = podstawaLabels[key];
                        counts[label] = (counts[label] || 0) + parseInt(row[key]);
                    }
                });
            });
            
            // Sortuj i weź top 5
            const sorted = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            if (sorted.length > 0) {
                return {
                    labels: sorted.map(item => item[0]),
                    values: sorted.map(item => item[1])
                };
            }
        }
        
        // Brak danych - pokaż puste z 0
        return {
            labels: ['Brak', 'danych', '-', 'dodaj', 'i zapisz'],
            values: [0, 0, 0, 0, 0]
        };
    },

    getSanctionsData() {
        // Próbuj załadować dane z localStorage
        const sanctionsData = Utils.loadFromLocalStorage('aep_data_sankcje');
        
        if (sanctionsData && sanctionsData.length > 0) {
            // Pogrupuj według miesiąca (ostatnie 6 miesięcy)
            const monthlyData = {};
            const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
            
            sanctionsData.forEach(item => {
                if (item.Data && item.Kwota) {
                    try {
                        const dateParts = item.Data.split('.');
                        if (dateParts.length >= 2) {
                            const monthIndex = parseInt(dateParts[1]) - 1;
                            const monthKey = months[monthIndex];
                            const amount = parseFloat(String(item.Kwota).replace(/[^\d.-]/g, '')) || 0;
                            
                            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + amount;
                        }
                    } catch (e) {
                        console.error('Błąd parsowania daty sankcji:', e);
                    }
                }
            });
            
            // Weź ostatnie 6 miesięcy
            const currentMonth = new Date().getMonth();
            const last6Months = [];
            
            for (let i = 5; i >= 0; i--) {
                const monthIndex = (currentMonth - i + 12) % 12;
                last6Months.push(months[monthIndex]);
            }
            
            return {
                labels: last6Months,
                values: last6Months.map(month => Math.round(monthlyData[month] || 0))
            };
        }
        
        // Brak danych - pokaż puste z 0
        const currentMonth = new Date().getMonth();
        const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
        const last6Months = [];
        
        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            last6Months.push(months[monthIndex]);
        }
        
        return {
            labels: last6Months,
            values: [0, 0, 0, 0, 0, 0]
        };
    },

    renderSection(section) {
        AppState.currentSection = section;
        
        if (section.isCustomView && section.id === 'patrole') {
            PatroleManager.render();
        } else if (section.id === 'wykroczenia') {
            WykroczeniaManager.render();
        } else if (section.id === 'wkrd') {
            WKRDManager.render();
        } else if (section.id === 'sankcje') {
            SankcjeManager.render();
        } else if (section.id === 'konwoje') {
            KonwojeManager.render();
        } else if (section.id === 'spb') {
            SPBManager.render();
        } else if (section.id === 'pilotaze') {
            PilotazeManager.render();
        } else if (section.id === 'zdarzenia') {
            ZdarzeniaManager.render();
        } else if (section.id === 'raporty') {
            RaportyManager.render();
        } else if (section.id === 'dashboardy') {
            DashboardHub.render();
        } else if (section.id === 'kalendarz') {
            CalendarManager.render();
        } else {
            const savedData = Utils.loadFromLocalStorage(`aep_data_${section.id}`);
            AppState.currentData = savedData || Utils.generateTestData(section.columns, 25);
            AppState.filteredData = [...AppState.currentData];
            AppState.currentPage = 1;
            AppState.selectedRows.clear();

            TableManager.renderTable();
        }
    },

    /**
     * Updates breadcrumbs navigation
     * @param {string} hash - Current route hash
     * @returns {void}
     */
    updateBreadcrumbs(hash) {
        const breadcrumbs = document.getElementById('breadcrumbs');
        const section = SECTIONS.find(s => s.id === hash);
        
        if (hash === 'start' || hash === '') {
            breadcrumbs.innerHTML = '<span class="breadcrumb-item">Start</span>';
        } else if (section) {
            breadcrumbs.innerHTML = `
                <span class="breadcrumb-item">Start</span>
                <span class="breadcrumb-item">${section.title}</span>
            `;
        } else {
            breadcrumbs.innerHTML = '<span class="breadcrumb-item">Start</span>';
        }
    },

    /**
     * Updates active state of navigation items
     * @param {string} hash - Current route hash
     * @returns {void}
     */
    updateActiveNav(hash) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            const section = item.dataset.section;
            // Obsługa 'start' i pustego hasha
            if (section === hash || (section === 'start' && (hash === 'start' || hash === ''))) {
                item.classList.add('active');
            }
        });
    }
};

// ============================================
// PATROLE MANAGER
// ============================================
/**
 * Manager for Patrole (Patrols) module
 * @namespace PatroleManager
 */
const PatroleManager = {
    /**
     * Renders the Patrole module view
     * @returns {void}
     */
    render() {
        const savedData = Utils.loadFromLocalStorage('aep_data_patrole');
        AppState.patroleData = savedData || [];
        
        // Migracja danych - dodaj razem_rodzaj i razem_wspolz do starych wierszy
        AppState.patroleData.forEach(row => {
            if (row.razem_rodzaj === undefined) {
                row.razem_rodzaj = (parseInt(row.interwen) || 0) + 
                                   (parseInt(row.pieszych) || 0) + 
                                   (parseInt(row.wodnych) || 0) + 
                                   (parseInt(row.zmot) || 0) + 
                                   (parseInt(row.wkrd) || 0);
            }
            if (row.razem_wspolz === undefined) {
                row.razem_wspolz = (parseInt(row.policja) || 0) + 
                                   (parseInt(row.sg) || 0) + 
                                   (parseInt(row.sop) || 0) + 
                                   (parseInt(row.sok) || 0) + 
                                   (parseInt(row.inne) || 0);
            }
        });
        
        AppState.patroleSelectedRows.clear();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title">Patrole</h1>
                </div>

                <div class="patrole-toolbar">
                    <button class="btn-secondary" id="addPatroleRow">
                        <i class="fas fa-plus"></i> Dodaj wiersz
                    </button>
                    <button class="btn-secondary" id="savePatroleDraft">
                        <i class="fas fa-save"></i> Zapisz arkusz
                    </button>
                    <button class="btn-secondary btn-danger" id="clearPatroleData" ${AppState.patroleData.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Wyczyść zaznaczone
                    </button>
                    <div class="columns-toggle-wrapper">
                        <button class="btn-secondary" id="toggleColumnsBtn">
                            <i class="fas fa-columns"></i> Widok <i class="fas fa-chevron-down"></i>
                        </button>
                        <div id="columnsDropdown" class="columns-dropdown hidden">
                            <div class="dropdown-header">Widoczność kolumn</div>
                            <div class="dropdown-section">
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> L.p. <span class="always-visible">(zawsze)</span>
                                </label>
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> Checkbox <span class="always-visible">(zawsze)</span>
                                </label>
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-section" id="columnCheckboxes"></div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-actions">
                                <button class="btn-dropdown" id="showAllColumns">
                                    <i class="fas fa-eye"></i> Pokaż wszystkie
                                </button>
                                <button class="btn-dropdown" id="hideAllColumns">
                                    <i class="fas fa-eye-slash"></i> Ukryj wszystkie
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="date-filter-wrapper">
                        <button class="btn-secondary" id="toggleDateFilterBtn">
                            <i class="fas fa-calendar-days"></i> Filtruj daty <i class="fas fa-chevron-down"></i>
                            <span id="dateFilterBadge" class="filter-badge hidden"></span>
                        </button>
                        <button class="btn-secondary btn-clear-filter hidden" id="clearDateFilterBtn">
                            <i class="fas fa-times"></i> Wyczyść filtr
                        </button>
                        <div id="dateFilterDropdown" class="date-filter-dropdown hidden">
                            <div class="dropdown-header">Filtruj według dat</div>
                            <div class="dropdown-section">
                                <label class="filter-label">Data od:</label>
                                <input type="date" id="dateFrom" class="date-input">
                                <label class="filter-label">Data do:</label>
                                <input type="date" id="dateTo" class="date-input">
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-section">
                                <div class="quick-filters-label">Szybki wybór:</div>
                                <div class="quick-filters">
                                    <button class="btn-quick-filter" data-days="0">Dziś</button>
                                    <button class="btn-quick-filter" data-days="7">7 dni</button>
                                    <button class="btn-quick-filter" data-days="30">30 dni</button>
                                    <button class="btn-quick-filter" data-days="365">Rok</button>
                                </div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-actions">
                                <button class="btn-dropdown" id="applyDateFilter">
                                    <i class="fas fa-search"></i> Filtruj
                                </button>
                                <button class="btn-dropdown" id="clearDateFilterDropdown">
                                    <i class="fas fa-times"></i> Wyczyść
                                </button>
                            </div>
                            <div id="filterResultInfo" class="filter-result-info hidden"></div>
                        </div>
                    </div>
                </div>

                <div id="filterInfoBar" class="filter-info-bar hidden"></div>

                <div class="top-scrollbar" id="topScrollbar">
                    <div class="top-scrollbar-content"></div>
                </div>

                <div class="patrole-container" id="patroleContainer">
                    <div class="patrole-table-wrapper" id="patroleTableWrapper">
                        <table class="patrole-table">
                            <thead>
                                <tr class="header-row-1">
                                    <th rowspan="2" class="col-lp">L.p.</th>
                                    <th rowspan="2" class="col-checkbox"><input type="checkbox" id="selectAllPatrole" class="row-checkbox"></th>
                                    <th rowspan="2" class="col-month">Miesiąc</th>
                                    <th rowspan="2" class="col-date">Data</th>
                                    <th colspan="6" class="group-header">Rodzaj Patrolu</th>
                                    <th colspan="3" class="group-header">Ilość</th>
                                    <th colspan="6" class="group-header">Współdziałanie z:</th>
                                    <th rowspan="2" class="col-jw">JW Prowadząca</th>
                                    <th rowspan="2" class="col-oddzial">Oddział ŻW</th>
                                </tr>
                                <tr class="header-row-2">
                                    <th class="col-razem">RAZEM</th>
                                    <th>Interw.</th>
                                    <th>Piesz.</th>
                                    <th>Wodn.</th>
                                    <th>Zmot.</th>
                                    <th>WKRD</th>
                                    <th>Żand</th>
                                    <th>WPM</th>
                                    <th>Motor.</th>
                                    <th class="col-razem">RAZEM</th>
                                    <th>Pol.</th>
                                    <th>SG</th>
                                    <th>SOP</th>
                                    <th>SOK</th>
                                    <th>Inne</th>
                                </tr>
                            </thead>
                            <tbody id="patroleTableBody">
                                ${AppState.patroleData.length === 0 ? '<tr><td colspan="22" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('addPatroleRow')?.addEventListener('click', () => this.addRow());
        document.getElementById('savePatroleDraft')?.addEventListener('click', () => this.saveDraft());
        document.getElementById('clearPatroleData')?.addEventListener('click', () => this.clearSelected());
        document.getElementById('selectAllPatrole')?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        // Columns visibility toggle
        this.initColumnsDropdown();

        // Date filter
        this.initDateFilter();

        this.syncScrollbars();

        if (AppState.patroleData.length > 0) {
            this.renderRows();
        }
    },

    initColumnsDropdown() {
        const toggleBtn = document.getElementById('toggleColumnsBtn');
        const dropdown = document.getElementById('columnsDropdown');
        const checkboxesContainer = document.getElementById('columnCheckboxes');
        const showAllBtn = document.getElementById('showAllColumns');
        const hideAllBtn = document.getElementById('hideAllColumns');

        // Load saved visible columns
        const saved = Utils.loadFromLocalStorage('patrole_visible_columns');
        if (saved) {
            AppState.patroleVisibleColumns = saved;
        }

        // Column definitions
        const columns = [
            { key: 'month', label: 'Miesiąc' },
            { key: 'date', label: 'Data' },
            { key: 'razem_rodzaj', label: 'RAZEM (Rodzaj)' },
            { key: 'interwen', label: 'Interwencyjne' },
            { key: 'pieszych', label: 'Piesze' },
            { key: 'wodnych', label: 'Wodne' },
            { key: 'zmot', label: 'Zmotoryzowane' },
            { key: 'wkrd', label: 'WKRD' },
            { key: 'zand', label: 'Żandarmeria' },
            { key: 'wpm', label: 'WPM' },
            { key: 'motorowek', label: 'Motorówki' },
            { key: 'razem_wspolz', label: 'RAZEM (Współdz.)' },
            { key: 'policja', label: 'Policja' },
            { key: 'sg', label: 'Straż Graniczna' },
            { key: 'sop', label: 'SOP' },
            { key: 'sok', label: 'SOK' },
            { key: 'inne', label: 'Inne' },
            { key: 'jwProwadzaca', label: 'JW Prowadząca' },
            { key: 'oddzialZW', label: 'Oddział ŻW' }
        ];

        // Render checkboxes
        checkboxesContainer.innerHTML = columns.map(col => `
            <label class="column-item">
                <input type="checkbox" 
                       data-column="${col.key}" 
                       ${AppState.patroleVisibleColumns[col.key] ? 'checked' : ''}>
                ${col.label}
            </label>
        `).join('');

        // Toggle dropdown
        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Column checkbox changes
        checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const column = e.target.dataset.column;
                AppState.patroleVisibleColumns[column] = e.target.checked;
                this.applyColumnVisibility();
                Utils.saveToLocalStorage('patrole_visible_columns', AppState.patroleVisibleColumns);
            });
        });

        // Show all
        showAllBtn?.addEventListener('click', () => {
            Object.keys(AppState.patroleVisibleColumns).forEach(key => {
                if (key !== 'lp' && key !== 'checkbox') {
                    AppState.patroleVisibleColumns[key] = true;
                }
            });
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = true;
            });
            this.applyColumnVisibility();
            Utils.saveToLocalStorage('patrole_visible_columns', AppState.patroleVisibleColumns);
        });

        // Hide all
        hideAllBtn?.addEventListener('click', () => {
            Object.keys(AppState.patroleVisibleColumns).forEach(key => {
                if (key !== 'lp' && key !== 'checkbox') {
                    AppState.patroleVisibleColumns[key] = false;
                }
            });
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            this.applyColumnVisibility();
            Utils.saveToLocalStorage('patrole_visible_columns', AppState.patroleVisibleColumns);
        });

        // Apply initial visibility
        this.applyColumnVisibility();
    },

    initDateFilter() {
        const toggleBtn = document.getElementById('toggleDateFilterBtn');
        const dropdown = document.getElementById('dateFilterDropdown');
        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');
        const applyBtn = document.getElementById('applyDateFilter');
        const clearDropdownBtn = document.getElementById('clearDateFilterDropdown');
        const clearFilterBtn = document.getElementById('clearDateFilterBtn');
        const filterBadge = document.getElementById('dateFilterBadge');
        const filterInfoBar = document.getElementById('filterInfoBar');
        const filterResultInfo = document.getElementById('filterResultInfo');
        const quickFilterBtns = document.querySelectorAll('.btn-quick-filter');

        // Toggle dropdown
        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Quick filter buttons
        quickFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const today = new Date();
                const from = new Date(today);
                
                if (days === 0) {
                    // Dziś
                    from.setHours(0, 0, 0, 0);
                } else {
                    // X dni wstecz
                    from.setDate(today.getDate() - days);
                }

                dateFromInput.value = this.dateToInputFormat(from);
                dateToInput.value = this.dateToInputFormat(today);
            });
        });

        // Apply filter
        applyBtn?.addEventListener('click', () => {
            const from = dateFromInput.value;
            const to = dateToInput.value;

            if (!from || !to) {
                alert('Proszę wybrać obie daty');
                return;
            }

            const dateFrom = new Date(from);
            const dateTo = new Date(to);
            
            // Normalizuj daty do 00:00:00
            dateFrom.setHours(0, 0, 0, 0);
            dateTo.setHours(23, 59, 59, 999); // Cały dzień "do"

            if (dateFrom > dateTo) {
                alert('Data "od" nie może być późniejsza niż data "do"');
                return;
            }

            AppState.patroleDateFilter.active = true;
            AppState.patroleDateFilter.dateFrom = dateFrom;
            AppState.patroleDateFilter.dateTo = dateTo;

            this.applyDateFilter();
            dropdown.classList.add('hidden');
        });

        // Clear filter (dropdown)
        clearDropdownBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });

        // Clear filter (toolbar button)
        clearFilterBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });
    },

    dateToInputFormat(date) {
        if (!date) return '';
        if (typeof date === 'string') {
            // Parse DD.MM.YYYY
            const parts = date.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return date;
        }
        // Date object to YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    parsePolishDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // 0-indexed
            const year = parseInt(parts[2], 10);
            
            const date = new Date(year, month, day);
            // Normalizuj czas do 00:00:00
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    },

    getMonthFromDate(dateStr) {
        // Skrócone nazwy miesięcy
        const monthsShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 
                            'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
        
        const date = this.parsePolishDate(dateStr);
        return date ? monthsShort[date.getMonth()] : '—';
    },

    applyDateFilter() {
        const { dateFrom, dateTo } = AppState.patroleDateFilter;
        
        console.log('🔍 FILTROWANIE DAT:');
        console.log('  dateFrom:', dateFrom);
        console.log('  dateTo:', dateTo);
        
        let matchCount = 0;
        const totalCount = AppState.patroleData.length;

        // Filter rows
        AppState.patroleData.forEach((row, index) => {
            const rowDate = this.parsePolishDate(row.date);
            console.log(`  Wiersz ${index + 1}: date="${row.date}" → rowDate=${rowDate}`);
            
            if (rowDate) {
                const matches = rowDate >= dateFrom && rowDate <= dateTo;
                console.log(`    Porównanie: ${rowDate.getTime()} >= ${dateFrom.getTime()} && ${rowDate.getTime()} <= ${dateTo.getTime()} = ${matches}`);
                if (matches) {
                    matchCount++;
                }
            } else {
                console.log(`    ❌ Nie udało się sparsować daty`);
            }
        });

        console.log(`✅ Znaleziono: ${matchCount} z ${totalCount}`);

        // Update UI
        const filterBadge = document.getElementById('dateFilterBadge');
        const filterInfoBar = document.getElementById('filterInfoBar');
        const clearFilterBtn = document.getElementById('clearDateFilterBtn');
        const filterResultInfo = document.getElementById('filterResultInfo');

        // Show badge
        if (matchCount > 0) {
            filterBadge.textContent = `(${matchCount})`;
            filterBadge.classList.remove('hidden');
        } else {
            filterBadge.classList.add('hidden');
        }

        // Show info bar
        const fromStr = dateFrom.toLocaleDateString('pl-PL');
        const toStr = dateTo.toLocaleDateString('pl-PL');
        
        if (matchCount > 0) {
            filterInfoBar.innerHTML = `
                <i class="fas fa-info-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> patroli z <strong>${totalCount}</strong> 
                (od ${fromStr} do ${toStr})
            `;
            filterInfoBar.style.background = 'rgba(76, 175, 80, 0.1)';
            filterInfoBar.style.color = '#4caf50';
        } else {
            filterInfoBar.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Nie znaleziono patroli w zakresie od ${fromStr} do ${toStr}
            `;
            filterInfoBar.style.background = 'rgba(255, 152, 0, 0.1)';
            filterInfoBar.style.color = '#ff9800';
        }
        filterInfoBar.classList.remove('hidden');

        // Show result in dropdown
        if (matchCount > 0) {
            filterResultInfo.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> patroli
            `;
            filterResultInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            filterResultInfo.style.color = '#4caf50';
        } else {
            filterResultInfo.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Brak patroli w tym zakresie
            `;
            filterResultInfo.style.background = 'rgba(255, 152, 0, 0.1)';
            filterResultInfo.style.color = '#ff9800';
        }
        filterResultInfo.classList.remove('hidden');

        // Show clear button
        clearFilterBtn.classList.remove('hidden');

        // Re-render rows with filter
        this.renderRows();
    },

    clearDateFilter() {
        AppState.patroleDateFilter.active = false;
        AppState.patroleDateFilter.dateFrom = null;
        AppState.patroleDateFilter.dateTo = null;

        // Hide UI elements
        const filterBadge = document.getElementById('dateFilterBadge');
        const filterInfoBar = document.getElementById('filterInfoBar');
        const clearFilterBtn = document.getElementById('clearDateFilterBtn');
        const filterResultInfo = document.getElementById('filterResultInfo');

        filterBadge?.classList.add('hidden');
        filterInfoBar?.classList.add('hidden');
        clearFilterBtn?.classList.add('hidden');
        filterResultInfo?.classList.add('hidden');

        // Re-render all rows
        this.renderRows();
    },

    syncScrollbars() {
        const topScrollbar = document.getElementById('topScrollbar');
        const tableWrapper = document.getElementById('patroleTableWrapper');
        const topScrollContent = topScrollbar.querySelector('.top-scrollbar-content');

        if (!topScrollbar || !tableWrapper || !topScrollContent) return;

        const updateScrollbarWidth = () => {
            const table = tableWrapper.querySelector('table');
            if (table) {
                topScrollContent.style.width = table.offsetWidth + 'px';
            }
        };

        updateScrollbarWidth();
        window.addEventListener('resize', updateScrollbarWidth);

        topScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = topScrollbar.scrollLeft;
        });

        tableWrapper.addEventListener('scroll', () => {
            topScrollbar.scrollLeft = tableWrapper.scrollLeft;
        });
    },

    applyColumnVisibility() {
        const table = document.querySelector('.patrole-table');
        if (!table) return;

        // Map column keys to their indices (0-based, accounting for L.p. and checkbox)
        const columnMap = {
            'month': 2,
            'date': 3,
            'razem_rodzaj': 4,
            'interwen': 5,
            'pieszych': 6,
            'wodnych': 7,
            'zmot': 8,
            'wkrd': 9,
            'zand': 10,
            'wpm': 11,
            'motorowek': 12,
            'razem_wspolz': 13,
            'policja': 14,
            'sg': 15,
            'sop': 16,
            'sok': 17,
            'inne': 18,
            'jwProwadzaca': 19,
            'oddzialZW': 20
        };

        // Apply visibility to header cells
        Object.keys(columnMap).forEach(key => {
            const colIndex = columnMap[key];
            const isVisible = AppState.patroleVisibleColumns[key];
            
            // Hide/show header cells in both rows
            const headerCells1 = table.querySelectorAll('.header-row-1 th');
            const headerCells2 = table.querySelectorAll('.header-row-2 th');
            
            if (headerCells1[colIndex]) {
                headerCells1[colIndex].style.display = isVisible ? '' : 'none';
            }
            if (headerCells2[colIndex]) {
                headerCells2[colIndex].style.display = isVisible ? '' : 'none';
            }

            // Hide/show body cells
            const bodyCells = table.querySelectorAll(`tbody tr td:nth-child(${colIndex + 1})`);
            bodyCells.forEach(cell => {
                cell.style.display = isVisible ? '' : 'none';
            });
        });
    },

    renderRows() {
        const tbody = document.getElementById('patroleTableBody');
        if (!tbody) return;

        if (AppState.patroleData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="22" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>';
            return;
        }

        const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                       'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

        const jwOptions = ['OŻW Elbląg', 'WŻW Bemowo Piskie', 'WŻW Gdynia', 'PŻW Bartoszyce', 
                          'PŻW Braniewo', 'PŻW Malbork', 'PŻW Morąg', 'PŻW Giżycko'];
        
        const oddzialOptions = ['OŻW Elbląg', 'OŻW Bydgoszcz', 'OŻW Szczecin', 'OŻW Żagań', 
                               'OŻW Kraków', 'MOŻW Warszawa', 'OŻW Lublin', 'OŻW Łodź', 'OSŻW Mińsk Maz.'];

        tbody.innerHTML = AppState.patroleData.map((row, index) => {
            const lp = index + 1;
            const rodzajRazem = (row.interwen || 0) + (row.pieszych || 0) + (row.wodnych || 0) + 
                               (row.zmot || 0) + (row.wkrd || 0);
            const wspoldzRazem = (row.policja || 0) + (row.sg || 0) + (row.sop || 0) + 
                                (row.sok || 0) + (row.inne || 0);

            const isSelected = AppState.patroleSelectedRows.has(row.id);

            // Check date filter
            let isVisible = true;
            if (AppState.patroleDateFilter.active) {
                const rowDate = this.parsePolishDate(row.date);
                const { dateFrom, dateTo } = AppState.patroleDateFilter;
                
                console.log(`📋 RenderRows - Wiersz ${lp}: date="${row.date}"`);
                console.log(`   rowDate=${rowDate}, dateFrom=${dateFrom}, dateTo=${dateTo}`);
                
                if (rowDate) {
                    isVisible = rowDate >= dateFrom && rowDate <= dateTo;
                    console.log(`   Porównanie: ${rowDate.getTime()} >= ${dateFrom.getTime()} && ${rowDate.getTime()} <= ${dateTo.getTime()} = ${isVisible}`);
                } else {
                    isVisible = false; // Hide if no date
                    console.log(`   ❌ Brak daty - ukryj wiersz`);
                }
            }

            const displayStyle = isVisible ? '' : 'style="display: none;"';

            return `
                <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''}" ${displayStyle}>
                    <td class="col-lp-value">${lp}</td>
                    <td><input type="checkbox" class="row-checkbox" ${isSelected ? 'checked' : ''} 
                        onchange="PatroleManager.toggleRowSelect(${row.id}, this.checked)"></td>
                    <td class="month-display-cell">
                        <div class="month-display">${this.getMonthFromDate(row.date)}</div>
                    </td>
                    <td>
                        <input type="date" class="patrole-input-date" value="${this.dateToInputFormat(row.date)}" 
                               onchange="PatroleManager.updateField(${row.id}, 'date', this.value)">
                    </td>
                    <td class="col-razem-value">${rodzajRazem}</td>
                    <td><input type="number" class="patrole-input-number" value="${row.interwen || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'interwen', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.pieszych || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'pieszych', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.wodnych || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'wodnych', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.zmot || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'zmot', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.wkrd || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'wkrd', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.zand || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'zand', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.wpm || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'wpm', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.motorowek || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'motorowek', parseInt(this.value) || 0)"></td>
                    <td class="col-razem-value">${wspoldzRazem}</td>
                    <td><input type="number" class="patrole-input-number" value="${row.policja || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'policja', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.sg || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'sg', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.sop || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'sop', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.sok || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'sok', parseInt(this.value) || 0)"></td>
                    <td><input type="number" class="patrole-input-number" value="${row.inne || ''}" placeholder="0"
                           onchange="PatroleManager.updateField(${row.id}, 'inne', parseInt(this.value) || 0)"></td>
                    <td>
                        <select class="patrole-select" onchange="PatroleManager.updateField(${row.id}, 'jwProwadzaca', this.value)">
                            ${jwOptions.map(opt => `<option value="${opt}" ${row.jwProwadzaca === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <select class="patrole-select" onchange="PatroleManager.updateField(${row.id}, 'oddzialZW', this.value)">
                            ${oddzialOptions.map(opt => `<option value="${opt}" ${row.oddzialZW === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        const clearBtn = document.getElementById('clearPatroleData');
        if (clearBtn) {
            clearBtn.disabled = AppState.patroleData.length === 0;
        }
        
        // Aktualizuj scrollbar po każdej zmianie danych
        this.syncScrollbars();
    },

    dateToInputFormat(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return dateStr;
    },

    updateField(id, field, value) {
        const row = AppState.patroleData.find(r => r.id === id);
        if (row) {
            if (field === 'date' && value) {
                const date = new Date(value);
                const polishDate = date.toLocaleDateString('pl-PL');
                row.date = polishDate;
                // Auto-generuj miesiąc z daty
                row.month = this.getMonthFromDate(polishDate);
            } else {
                row[field] = value;
            }

            // Auto-oblicz pola RAZEM używając CalculationEngine
            CalculationEngine.calculate('patrole', row);

            this.renderRows();
            this.autoSave();
        }
    },

    addRow() {
        const newId = AppState.patroleData.length > 0 ? 
            Math.max(...AppState.patroleData.map(r => r.id)) + 1 : 1;
        
        const today = new Date();
        const todayPolish = today.toLocaleDateString('pl-PL');
        
        const newRow = {
            id: newId,
            month: this.getMonthFromDate(todayPolish), // Auto ze skrótem
            date: todayPolish,
            razem_rodzaj: 0,  // DODANE
            interwen: 0,
            pieszych: 0,
            wodnych: 0,
            zmot: 0,
            wkrd: 0,
            zand: 0,
            wpm: 0,
            motorowek: 0,
            razem_wspolz: 0,  // DODANE
            policja: 0,
            sg: 0,
            sop: 0,
            sok: 0,
            inne: 0,
            jwProwadzaca: 'OŻW Elbląg',
            oddzialZW: 'OŻW Elbląg'
        };

        // Dodaj nowy wiersz na końcu listy (spójnie z innymi modułami)
        AppState.patroleData.push(newRow);

        this.renderRows();
        this.autoSave();
    },

    toggleSelectAll(checked) {
        if (checked) {
            AppState.patroleData.forEach(row => AppState.patroleSelectedRows.add(row.id));
        } else {
            AppState.patroleSelectedRows.clear();
        }
        this.renderRows();
    },

    toggleRowSelect(id, checked) {
        if (checked) {
            AppState.patroleSelectedRows.add(id);
        } else {
            AppState.patroleSelectedRows.delete(id);
        }
        
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.classList.toggle('selected', checked);
        }

        const selectAll = document.getElementById('selectAllPatrole');
        if (selectAll) {
            selectAll.checked = AppState.patroleSelectedRows.size === AppState.patroleData.length;
        }
    },

    clearSelected() {
        if (AppState.patroleSelectedRows.size === 0) {
            alert('Nie zaznaczono żadnych wierszy do usunięcia.');
            return;
        }

        if (confirm(`Czy na pewno usunąć ${AppState.patroleSelectedRows.size} zaznaczonych wierszy?`)) {
            AppState.patroleData = AppState.patroleData.filter(row => !AppState.patroleSelectedRows.has(row.id));
            AppState.patroleSelectedRows.clear();
            this.renderRows();
            this.autoSave();
        }
    },

    saveDraft() {
        const success = Utils.saveToLocalStorage('aep_data_patrole', AppState.patroleData);
        if (success) {
            alert('Arkusz zapisany pomyślnie w localStorage');
        } else {
            alert('Błąd podczas zapisywania arkusza');
        }
    },

    autoSave() {
        Utils.saveToLocalStorage('aep_data_patrole', AppState.patroleData);
    }
};

// ============================================
// WYKROCZENIA MANAGER
// ============================================
const WykroczeniaManager = {
    render() {
        const savedData = Utils.loadFromLocalStorage('aep_data_wykroczenia');
        AppState.wykroczeniaData = savedData || [];
        AppState.wykroczeniaSelectedRows.clear();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title">Wykroczenia</h1>
                </div>

                <div class="wykroczenia-toolbar">
                    <button class="btn-secondary" id="addWykroczenieRow">
                        <i class="fas fa-plus"></i> Dodaj wiersz
                    </button>
                    <button class="btn-secondary" id="saveWykroczeniaDraft">
                        <i class="fas fa-save"></i> Zapisz arkusz
                    </button>
                    <button class="btn-secondary btn-danger" id="clearWykroczeniaData" ${AppState.wykroczeniaData.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Wyczyść zaznaczone
                    </button>
                    <div class="columns-toggle-wrapper">
                        <button class="btn-secondary" id="toggleWykroczeniaColumnsBtn">
                            <i class="fas fa-columns"></i> Widok <i class="fas fa-chevron-down"></i>
                        </button>
                        <div id="wykroczeniaColumnsDropdown" class="columns-dropdown hidden">
                            <div class="dropdown-header">Widoczność kolumn</div>
                            <div class="dropdown-section">
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> L.p. <span class="always-visible">(zawsze)</span>
                                </label>
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> Checkbox <span class="always-visible">(zawsze)</span>
                                </label>
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> Kopiuj <span class="always-visible">(zawsze)</span>
                                </label>
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-section" id="wykroczeniaColumnCheckboxes"></div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-actions">
                                <button class="btn-dropdown" id="showAllWykroczeniaColumns">
                                    <i class="fas fa-eye"></i> Pokaż wszystkie
                                </button>
                                <button class="btn-dropdown" id="hideAllWykroczeniaColumns">
                                    <i class="fas fa-eye-slash"></i> Ukryj wszystkie
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="date-filter-wrapper">
                        <button class="btn-secondary" id="toggleWykroczeniaDateFilterBtn">
                            <i class="fas fa-calendar-days"></i> Filtruj daty <i class="fas fa-chevron-down"></i>
                            <span id="wykroczeniaDateFilterBadge" class="filter-badge hidden"></span>
                        </button>
                        <button class="btn-secondary btn-clear-filter hidden" id="clearWykroczeniaDateFilterBtn">
                            <i class="fas fa-times"></i> Wyczyść filtr
                        </button>
                        <div id="wykroczeniaDateFilterDropdown" class="date-filter-dropdown hidden">
                            <div class="dropdown-header">Filtruj według dat</div>
                            <div class="dropdown-section">
                                <label class="filter-label">Data od:</label>
                                <input type="date" id="wykroczeniaDateFrom" class="date-input">
                                <label class="filter-label">Data do:</label>
                                <input type="date" id="wykroczeniaDateTo" class="date-input">
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-section">
                                <div class="quick-filters-label">Szybki wybór:</div>
                                <div class="quick-filters">
                                    <button class="btn-quick-filter" data-days="0">Dziś</button>
                                    <button class="btn-quick-filter" data-days="7">7 dni</button>
                                    <button class="btn-quick-filter" data-days="30">30 dni</button>
                                    <button class="btn-quick-filter" data-days="365">Rok</button>
                                </div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-actions">
                                <button class="btn-dropdown" id="applyWykroczeniaDateFilter">
                                    <i class="fas fa-search"></i> Filtruj
                                </button>
                                <button class="btn-dropdown" id="clearWykroczeniaDateFilterDropdown">
                                    <i class="fas fa-times"></i> Wyczyść
                                </button>
                            </div>
                            <div id="wykroczeniaFilterResultInfo" class="filter-result-info hidden"></div>
                        </div>
                    </div>
                    <div id="wykroczeniaErrorCount" style="display: none; color: #ff4444; font-weight: 600; padding: 0.5rem 1rem; background: rgba(255, 68, 68, 0.1); border-radius: 4px; margin-left: auto;"></div>
                </div>

                <div id="wykroczeniaFilterInfoBar" class="filter-info-bar hidden"></div>

                <div class="top-scrollbar" id="topScrollbarWykroczenia">
                    <div class="top-scrollbar-content"></div>
                </div>

                <div class="wykroczenia-container" id="wykroczeniaContainer">
                    <div class="wykroczenia-table-wrapper" id="wykroczeniaTableWrapper">
                        <table class="wykroczenia-table">
                            <thead>
                                <tr class="header-row-1">
                                    <th rowspan="2" class="col-lp">L.p.</th>
                                    <th rowspan="2" class="col-checkbox"><input type="checkbox" id="selectAllWykroczenia" class="row-checkbox"></th>
                                    <th rowspan="2" class="col-copy" title="Kopiuj wiersz"><i class="fas fa-copy"></i></th>
                                    <th rowspan="2">Miesiąc</th>
                                    <th rowspan="2">Data interw.</th>
                                    <th rowspan="2">Nr JW</th>
                                    <th rowspan="2">Nazwa JW</th>
                                    <th rowspan="2">Miejsce stac.</th>
                                    <th rowspan="2">Podległość RSZ</th>
                                    <th rowspan="2">Grupa os.</th>
                                    <th rowspan="2">Legitym.</th>
                                    <th rowspan="2" class="col-podstawa">Podstawa interwencji</th>
                                    <th colspan="4" class="group-header">Stan</th>
                                    <th colspan="6" class="group-header">Rodzaj interwencji</th>
                                    <th rowspan="2">Wys. mandatu (zł)</th>
                                    <th rowspan="2">W czasie służby</th>
                                    <th rowspan="2">JŻW prowadząca</th>
                                    <th rowspan="2">Oddział</th>
                                </tr>
                                <tr class="header-row-2">
                                    <!-- Stan -->
                                    <th class="col-razem">Razem</th>
                                    <th>Pod wpł. alk.</th>
                                    <th>Nietrzeźwy</th>
                                    <th>Pod wpł. środ.</th>
                                    <!-- Rodzaj interwencji -->
                                    <th class="col-razem">Razem</th>
                                    <th>Zatrzym.</th>
                                    <th>Doprow.</th>
                                    <th>Wylegitym.</th>
                                    <th>Poucz.</th>
                                    <th>Mandat</th>
                                </tr>
                            </thead>
                            <tbody id="wykroczeniaTableBody">
                                <!-- Rows will be generated here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Modal Podstawa Interwencji -->
                <div id="podstawaModal" class="modal-overlay" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>PODSTAWA INTERWENCJI</h3>
                            <span class="modal-close" id="podstawaModalClose">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="modal-subtitle" id="podstawaModalSubtitle"></div>
                            <div class="modal-info">
                                <i class="fas fa-info-circle"></i> Wybierz <strong>JEDNĄ</strong> podstawę. Kolejne podstawy dodaj przyciskiem <i class="fas fa-copy"></i>
                            </div>
                            <div class="radio-list">
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="nar_ubiorcz">
                                    <span>Naruszenie przepisów ubiorczych</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="inne_nar">
                                    <span>Inne naruszenie regulaminu</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="nar_kk">
                                    <span>Naruszenie przepisów Kodeksu karnego</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="wykr_porzadek">
                                    <span>Wykroczenia przeciwko porządkowi i spokojowi publicznemu</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="wykr_bezp">
                                    <span>Wykroczenia przeciwko bezpieczeństwu osób i mienia</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="nar_dyscyplina">
                                    <span>Naruszenie Ustawy o dyscyplinie wojskowej</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="nar_bron">
                                    <span>Naruszenie Ustawy o broni i amunicji</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="nar_ochr_zdr">
                                    <span>Naruszenie Ustawy o ochronie zdrowia przed następstwami używania tytoniu</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="nar_zakwat">
                                    <span>Naruszenie Ustawy o zakwaterowaniu Sił Zbrojnych RP</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="podstawa_radio" data-field="pozostale">
                                    <span>Pozostałe wykroczenia</span>
                                </label>
                            </div>
                            <div class="modal-counter" id="podstawaModalCounter">Nie wybrano podstawy</div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" id="podstawaModalCancel">Anuluj</button>
                            <button class="btn-primary" id="podstawaModalConfirm">Zatwierdź</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        document.getElementById('addWykroczenieRow')?.addEventListener('click', () => this.addRow());
        document.getElementById('saveWykroczeniaDraft')?.addEventListener('click', () => this.saveDraft());
        document.getElementById('clearWykroczeniaData')?.addEventListener('click', () => this.clearSelected());
        document.getElementById('selectAllWykroczenia')?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        // Columns visibility toggle
        this.initColumnsDropdown();

        // Date filter
        this.initDateFilter();

        if (AppState.wykroczeniaData.length > 0) {
            this.renderRows();
            this.syncScrollbars();
        } else {
            this.updateToolbarState();
        }

        // Event listeners dla modala
        document.getElementById('podstawaModalClose')?.addEventListener('click', () => this.closePodstawaModal());
        document.getElementById('podstawaModalCancel')?.addEventListener('click', () => this.closePodstawaModal());
        document.getElementById('podstawaModalConfirm')?.addEventListener('click', () => this.confirmPodstawaModal());
        
        // Zamknij modal przy kliknięciu w tło
        document.getElementById('podstawaModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'podstawaModal') {
                this.closePodstawaModal();
            }
        });
    },

    podstawaTagsMap: {
        nar_ubiorcz: 'Nar.ub.',
        inne_nar: 'Inne nar.',
        nar_kk: 'Nar.KK',
        wykr_porzadek: 'Wykr.porz.',
        wykr_bezp: 'Wykr.bezp.',
        nar_dyscyplina: 'Nar.dyscy.',
        nar_bron: 'Nar.broni',
        nar_ochr_zdr: 'Nar.ochr.zdr.',
        nar_zakwat: 'Nar.zakwat.',
        pozostale: 'Pozostałe'
    },

    podstawaFullNames: {
        nar_ubiorcz: 'Naruszenie przepisów ubiorczych',
        inne_nar: 'Inne naruszenie regulaminu',
        nar_kk: 'Naruszenie przepisów Kodeksu karnego',
        wykr_porzadek: 'Wykroczenia przeciwko porządkowi i spokojowi publicznemu',
        wykr_bezp: 'Wykroczenia przeciwko bezpieczeństwu osób i mienia',
        nar_dyscyplina: 'Naruszenie Ustawy o dyscyplinie wojskowej',
        nar_bron: 'Naruszenie Ustawy o broni i amunicji',
        nar_ochr_zdr: 'Naruszenie Ustawy o ochronie zdrowia przed następstwami używania tytoniu',
        nar_zakwat: 'Naruszenie Ustawy o zakwaterowaniu Sił Zbrojnych RP',
        pozostale: 'Pozostałe wykroczenia'
    },

    currentEditingRowId: null,

    openPodstawaModal(rowId) {
        this.currentEditingRowId = rowId;
        const row = AppState.wykroczeniaData.find(r => r.id === rowId);
        if (!row) return;

        const rowIndex = AppState.wykroczeniaData.findIndex(r => r.id === rowId);
        const modal = document.getElementById('podstawaModal');
        const subtitle = document.getElementById('podstawaModalSubtitle');
        
        subtitle.textContent = `Wiersz ${rowIndex + 1} - ${row.data || 'brak daty'}`;

        // Zaznacz radio zgodnie z danymi (znajdź która podstawa jest zaznaczona)
        const radios = modal.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            const field = radio.dataset.field;
            radio.checked = row[field] === 1;
        });

        this.updateModalCounter();
        modal.style.display = 'flex';

        // Event listeners dla radio (licznik) - usuwamy stare
        radios.forEach(radio => {
            const newRadio = radio.cloneNode(true);
            radio.parentNode.replaceChild(newRadio, radio);
        });
        
        // Dodajemy nowe event listenery
        modal.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateModalCounter());
        });
    },

    updateModalCounter() {
        const modal = document.getElementById('podstawaModal');
        const selectedRadio = modal.querySelector('input[type="radio"]:checked');
        const counter = document.getElementById('podstawaModalCounter');
        
        if (selectedRadio) {
            const field = selectedRadio.dataset.field;
            counter.textContent = `Wybrano: ${this.podstawaTagsMap[field]}`;
            counter.style.color = 'var(--accent)';
        } else {
            counter.textContent = 'Nie wybrano podstawy';
            counter.style.color = 'var(--muted)';
        }
    },

    closePodstawaModal() {
        const modal = document.getElementById('podstawaModal');
        modal.style.display = 'none';
        this.currentEditingRowId = null;
    },

    confirmPodstawaModal() {
        if (this.currentEditingRowId === null) return;

        const row = AppState.wykroczeniaData.find(r => r.id === this.currentEditingRowId);
        if (!row) return;

        const modal = document.getElementById('podstawaModal');
        const selectedRadio = modal.querySelector('input[type="radio"]:checked');

        // Walidacja: czy wybrano podstawę?
        if (!selectedRadio) {
            alert('Wybierz podstawę interwencji!');
            return;
        }

        // WYCZYŚĆ wszystkie podstawy
        const allFields = ['nar_ubiorcz', 'inne_nar', 'nar_kk', 'wykr_porzadek', 
                          'wykr_bezp', 'nar_dyscyplina', 'nar_bron', 'nar_ochr_zdr', 
                          'nar_zakwat', 'pozostale'];
        allFields.forEach(field => {
            row[field] = 0;
        });

        // Ustaw TYLKO wybraną podstawę
        const selectedField = selectedRadio.dataset.field;
        row[selectedField] = 1;

        this.closePodstawaModal();
        this.renderRows();
        this.autoSave();
    },

    removePodstawaTag(rowId, field) {
        const row = AppState.wykroczeniaData.find(r => r.id === rowId);
        if (row) {
            row[field] = 0;
            this.renderRows();
            this.autoSave();
        }
    },

    duplicateRow(rowId) {
        const sourceRow = AppState.wykroczeniaData.find(r => r.id === rowId);
        if (!sourceRow) return;
        
        const newId = AppState.wykroczeniaData.length > 0 ? 
            Math.max(...AppState.wykroczeniaData.map(r => r.id)) + 1 : 1;
        
        // Tworzymy PODWIERSZ (child row)
        const newRow = {
            id: newId,
            // PODWIERSZ: metadata
            isMainRow: false,
            groupId: sourceRow.groupId || sourceRow.id,
            parentId: sourceRow.id,
            
            // DANE GŁÓWNE: PUSTE (inherit z rodzica)
            data: null,
            nr_jw: null,
            nazwa_jw: null,
            miejsce: null,
            podleglosc: null,
            grupa: null,
            legitymowany: sourceRow.legitymowany, // Inherit i zablokuj
            legitymowanyLocked: true, // NOWE: flaga blokady
            
            // Stan: inherit z rodzica
            pod_wplywem_alk: sourceRow.pod_wplywem_alk,
            nietrzezwy: sourceRow.nietrzezwy,
            pod_wplywem_srod: sourceRow.pod_wplywem_srod,
            
            // PODSTAWA: WYCZYŚĆ (do wypełnienia)
            nar_ubiorcz: 0,
            inne_nar: 0,
            nar_kk: 0,
            wykr_porzadek: 0,
            wykr_bezp: 0,
            nar_dyscyplina: 0,
            nar_bron: 0,
            nar_ochr_zdr: 0,
            nar_zakwat: 0,
            pozostale: 0,
            
            // RODZAJ: WYCZYŚĆ (do wypełnienia)
            zatrzymanie: 0,
            doprowadzenie: 0,
            wylegitymowanie: 0,
            pouczenie: 0,
            mandat_bool: false,
            wysokosc_mandatu: '',
            
            // Pozostałe: inherit
            w_czasie_sluzby: sourceRow.w_czasie_sluzby,
            jzw_prowadzaca: sourceRow.jzw_prowadzaca,
            oddzial: sourceRow.oddzial
        };
        
        // Ustaw groupId w source jeśli nie ma
        if (!sourceRow.groupId) {
            sourceRow.groupId = sourceRow.id;
        }
        if (sourceRow.isMainRow === undefined) {
            sourceRow.isMainRow = true;
        }
        
        // Dodaj nowy wiersz zaraz po źródłowym
        const sourceIndex = AppState.wykroczeniaData.findIndex(r => r.id === rowId);
        AppState.wykroczeniaData.splice(sourceIndex + 1, 0, newRow);
        
        this.renderRows();
        this.autoSave();
        
        // Pokaż toast
        this.showToast('Podwiersz dodany! Wybierz podstawę i rodzaj interwencji.');
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    getRowGroup(row) {
        // Grupuj wiersze po groupId lub data+nr_jw+miejsce
        if (row.groupId) {
            return row.groupId;
        }
        // Fallback: grupuj po dacie, nr_jw, miejscu
        return `${row.data}_${row.nr_jw}_${row.miejsce}`;
    },

    getMonthFromDate(dateStr) {
        const monthsShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 
                            'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
        if (!dateStr) return '—';
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const month = parseInt(parts[1], 10) - 1;
            return monthsShort[month] || '—';
        }
        return '—';
    },

    dateToInputFormat(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return dateStr;
    },

    renderRows() {
        const tbody = document.getElementById('wykroczeniaTableBody');
        if (!tbody) return;

        if (AppState.wykroczeniaData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="36" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>';
            return;
        }

        // FILTROWANIE DAT
        let dataToRender = AppState.wykroczeniaData;
        if (AppState.wykroczeniaDateFilter.active) {
            const { dateFrom, dateTo } = AppState.wykroczeniaDateFilter;
            
            // Zbierz ID głównych wierszy, które pasują do filtru
            const matchingMainRowIds = new Set();
            AppState.wykroczeniaData.forEach(row => {
                if (row.isMainRow !== false) {
                    const rowDate = this.parsePolishDate(row.data);
                    if (rowDate && rowDate >= dateFrom && rowDate <= dateTo) {
                        matchingMainRowIds.add(row.groupId || row.id);
                    }
                }
            });
            
            // Pokaż główne wiersze + wszystkie ich podwiersze
            dataToRender = AppState.wykroczeniaData.filter(row => {
                const groupId = row.groupId || row.id;
                return matchingMainRowIds.has(groupId);
            });
        }

        if (dataToRender.length === 0) {
            tbody.innerHTML = '<tr><td colspan="36" class="empty-message">Brak wykroczeń spełniających kryteria filtra dat.</td></tr>';
            return;
        }

        const nrJWOptions = Array.from({length: 99}, (_, i) => `JW nr ${String(i + 1).padStart(2, '0')}`);
        const nazwaJWOptions = Array.from({length: 80}, (_, i) => `JW nazwa nr ${i + 1}`);
        const miejsceOptions = ['Miejscowość A', 'Miejscowość B', 'Miejscowość C', 'Miejscowość D', 
                               'Miejscowość E', 'Miejscowość F', 'Miejscowość G', 'Miejscowość H',
                               'Miejscowość I', 'Miejscowość J', 'Miejscowość K'];
        const podlegloscOptions = ['WL', 'SP', 'MW', 'WOT', 'ŻW', 'inne'];
        const grupaOptions = ['żołnierz', 'pracownik RON', 'osoba cywilna'];
        const jzwOptions = ['OŻW Elbląg', 'WŻW Bemowo Piskie', 'WŻW Gdynia', 'PŻW Bartoszyce', 
                           'PŻW Braniewo', 'PŻW Malbork', 'PŻW Morąg', 'PŻW Giżycko'];
        const oddzialOptions = ['Elbląg', 'Bydgoszcz', 'Szczecin', 'Żagań', 'Kraków', 'Lublin', 'Warszawa', 'Łódź'];

        tbody.innerHTML = dataToRender.map((row, index) => {
            // NUMERACJA: tylko główne wiersze (nie podwiersze)
            const isMainRow = row.isMainRow !== false; // Domyślnie true dla starych danych
            const isChildRow = row.isMainRow === false;
            const rowTypeClass = isChildRow ? 'child-row' : 'main-row';
            const lp = isMainRow ? dataToRender.filter((r, i) => i <= index && r.isMainRow !== false).length : '';
            
            const isSelected = AppState.wykroczeniaSelectedRows.has(row.id);
            
            // Grupowanie wizualne
            const groupId = this.getRowGroup(row);
            const groupRows = dataToRender.filter(r => this.getRowGroup(r) === groupId);
            const groupIndex = groupRows.findIndex(r => r.id === row.id);
            const groupSize = groupRows.length;
            const isGrouped = groupSize > 1;
            const isFirstInGroup = groupIndex === 0;
            
            // Klasa CSS dla grupowania (alternacja jasne/ciemne tło)
            const allGroups = [...new Set(dataToRender.map(r => this.getRowGroup(r)))];
            const currentGroupIndex = allGroups.indexOf(groupId);
            const groupClass = currentGroupIndex % 2 === 0 ? 'row-group-a' : 'row-group-b';
            
            // Auto-sumy
            const podstawaRazem = (row.nar_ubiorcz || 0) + (row.inne_nar || 0) + (row.nar_kk || 0) + 
                                 (row.wykr_porzadek || 0) + (row.wykr_bezp || 0) + (row.nar_dyscyplina || 0) +
                                 (row.nar_bron || 0) + (row.nar_ochr_zdr || 0) + (row.nar_zakwat || 0) + (row.pozostale || 0);
            
            const stanRazem = (row.pod_wplywem_alk || 0) + (row.nietrzezwy || 0) + (row.pod_wplywem_srod || 0);
            
            const rodzajRazem = (row.zatrzymanie || 0) + (row.doprowadzenie || 0) + (row.wylegitymowanie || 0) +
                               (row.pouczenie || 0) + (row.mandat_bool ? 1 : 0);

            // Walidacja: Podstawa → Rodzaj
            const validation = this.validatePodstawaRodzaj(row);
            const hasValidationError = !validation.valid;
            const errorClass = hasValidationError ? 'wykroczenia-validation-error' : '';

            return `
                <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''} ${groupClass} ${rowTypeClass}">
                    <td class="col-lp-value">
                        ${isChildRow ? '<i class="fas fa-level-down-alt child-icon"></i>' : ''}
                        ${!isChildRow && isGrouped && !isFirstInGroup ? '<i class="fas fa-link group-icon" title="Część tej samej interwencji"></i>' : ''}
                        ${!isChildRow && isGrouped && isFirstInGroup ? `<span class="group-counter" title="Grupa ${groupSize} wierszy">${lp}</span>` : ''}
                        ${!isChildRow && !isGrouped ? lp : ''}
                        ${hasValidationError ? ' <i class="fas fa-exclamation-triangle" style="color: #ff4444;"></i>' : ''}
                    </td>
                    <td>
                        <input type="checkbox" class="row-checkbox" ${isSelected ? 'checked' : ''} 
                            onchange="WykroczeniaManager.toggleRowSelect(${row.id}, this.checked)">
                    </td>
                    <td class="copy-btn-cell">
                        ${!isChildRow ? `<button class="btn-copy-row" onclick="WykroczeniaManager.duplicateRow(${row.id})" 
                                title="Dodaj podwiersz (ta sama interwencja, inna podstawa)">
                            <i class="fas fa-copy"></i>
                        </button>` : ''}
                    </td>
                    <td class="month-display-cell">
                        ${!isChildRow ? `<div class="month-display">${this.getMonthFromDate(row.data)}</div>` : ''}
                    </td>
                    <td>
                        ${!isChildRow ? `<input type="date" class="wykroczenia-input-date" value="${this.dateToInputFormat(row.data)}" 
                               onchange="WykroczeniaManager.updateField(${row.id}, 'data', this.value)">` : '<span class="child-empty">—</span>'}
                    </td>
                    <td>
                        ${!isChildRow ? `<select class="wykroczenia-select" onchange="WykroczeniaManager.updateField(${row.id}, 'nr_jw', this.value)">
                            ${nrJWOptions.map(opt => `<option value="${opt}" ${row.nr_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>` : '<span class="child-empty">—</span>'}
                    </td>
                    <td>
                        ${!isChildRow ? `<select class="wykroczenia-select" onchange="WykroczeniaManager.updateField(${row.id}, 'nazwa_jw', this.value)">
                            ${nazwaJWOptions.map(opt => `<option value="${opt}" ${row.nazwa_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>` : '<span class="child-empty">—</span>'}
                    </td>
                    <td>
                        ${!isChildRow ? `<select class="wykroczenia-select" onchange="WykroczeniaManager.updateField(${row.id}, 'miejsce', this.value)">
                            ${miejsceOptions.map(opt => `<option value="${opt}" ${row.miejsce === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>` : '<span class="child-empty">—</span>'}
                    </td>
                    <td>
                        ${!isChildRow ? `<select class="wykroczenia-select" onchange="WykroczeniaManager.updateField(${row.id}, 'podleglosc', this.value)">
                            ${podlegloscOptions.map(opt => `<option value="${opt}" ${row.podleglosc === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>` : '<span class="child-empty">—</span>'}
                    </td>
                    <td>
                        ${!isChildRow ? `<select class="wykroczenia-select" onchange="WykroczeniaManager.updateField(${row.id}, 'grupa', this.value)">
                            ${grupaOptions.map(opt => `<option value="${opt}" ${row.grupa === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>` : '<span class="child-empty">—</span>'}
                    </td>
                    <td class="checkbox-cell">
                        ${!isChildRow ? 
                            `<input type="checkbox" ${row.legitymowany ? 'checked' : ''} 
                               onchange="WykroczeniaManager.updateField(${row.id}, 'legitymowany', this.checked)">` : 
                            `<input type="checkbox" ${row.legitymowany ? 'checked' : ''} disabled title="Zablokowane (dziedziczone z głównego wiersza)">
                             <i class="fas fa-lock lock-icon" title="Zablokowane"></i>`
                        }
                    </td>
                    
                    <!-- Podstawa interwencji - TAGI -->
                    <td class="podstawa-tags-cell">
                        <div class="podstawa-tags">
                            ${Object.keys(this.podstawaTagsMap).map(field => {
                                if (row[field] === 1) {
                                    const tag = this.podstawaTagsMap[field];
                                    const fullName = this.podstawaFullNames[field];
                                    return `<span class="podstawa-tag" title="${fullName}">
                                        ${tag}
                                        <i class="tag-remove" onclick="WykroczeniaManager.removePodstawaTag(${row.id}, '${field}')">×</i>
                                    </span>`;
                                }
                                return '';
                            }).join('')}
                            <button class="tag-add-btn" onclick="WykroczeniaManager.openPodstawaModal(${row.id})" title="Dodaj wykroczenie">+</button>
                        </div>
                    </td>
                    
                    <!-- Stan -->
                    <td class="col-razem-value">${stanRazem}</td>
                    <td><input type="number" min="0" max="1" class="wykroczenia-input-number" value="${row.pod_wplywem_alk || 0}"
                           onchange="WykroczeniaManager.updateField(${row.id}, 'pod_wplywem_alk', parseInt(this.value) || 0)"></td>
                    <td><input type="number" min="0" max="1" class="wykroczenia-input-number" value="${row.nietrzezwy || 0}"
                           onchange="WykroczeniaManager.updateField(${row.id}, 'nietrzezwy', parseInt(this.value) || 0)"></td>
                    <td><input type="number" min="0" max="1" class="wykroczenia-input-number" value="${row.pod_wplywem_srod || 0}"
                           onchange="WykroczeniaManager.updateField(${row.id}, 'pod_wplywem_srod', parseInt(this.value) || 0)"></td>
                    
                    <!-- Rodzaj interwencji -->
                    <td class="col-razem-value ${errorClass}">${rodzajRazem}</td>
                    <td class="${errorClass}"><input type="number" min="0" max="1" class="wykroczenia-input-number" value="${row.zatrzymanie || 0}"
                           onchange="WykroczeniaManager.updateField(${row.id}, 'zatrzymanie', parseInt(this.value) || 0)"></td>
                    <td class="${errorClass}"><input type="number" min="0" max="1" class="wykroczenia-input-number" value="${row.doprowadzenie || 0}"
                           onchange="WykroczeniaManager.updateField(${row.id}, 'doprowadzenie', parseInt(this.value) || 0)"></td>
                    <td class="${errorClass}"><input type="number" min="0" max="1" class="wykroczenia-input-number" value="${row.wylegitymowanie || 0}"
                           onchange="WykroczeniaManager.updateField(${row.id}, 'wylegitymowanie', parseInt(this.value) || 0)"></td>
                    <td class="${errorClass}"><input type="number" min="0" max="1" class="wykroczenia-input-number" value="${row.pouczenie || 0}"
                           onchange="WykroczeniaManager.updateField(${row.id}, 'pouczenie', parseInt(this.value) || 0)"></td>
                    <td class="checkbox-cell ${errorClass}">
                        <input type="checkbox" ${row.mandat_bool ? 'checked' : ''} 
                               onchange="WykroczeniaManager.updateField(${row.id}, 'mandat_bool', this.checked)">
                    </td>
                    <td>
                        <input type="text" class="wykroczenia-input-number" style="width: 80px;" 
                               value="${row.wysokosc_mandatu || ''}" placeholder="0" 
                               onchange="WykroczeniaManager.updateField(${row.id}, 'wysokosc_mandatu', this.value)">
                    </td>
                    <td class="checkbox-cell">
                        <input type="checkbox" ${row.w_czasie_sluzby ? 'checked' : ''} 
                               onchange="WykroczeniaManager.updateField(${row.id}, 'w_czasie_sluzby', this.checked)">
                    </td>
                    
                    <!-- Pozostałe -->
                    <td>
                        <select class="wykroczenia-select" onchange="WykroczeniaManager.updateField(${row.id}, 'jzw_prowadzaca', this.value)">
                            ${jzwOptions.map(opt => `<option value="${opt}" ${row.jzw_prowadzaca === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <select class="wykroczenia-select" onchange="WykroczeniaManager.updateField(${row.id}, 'oddzial', this.value)">
                            ${oddzialOptions.map(opt => `<option value="${opt}" ${row.oddzial === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        this.updateClearButtonState();
        this.updateToolbarState();
    },

    addRow() {
        const newId = AppState.wykroczeniaData.length > 0 ? 
            Math.max(...AppState.wykroczeniaData.map(r => r.id)) + 1 : 1;
        
        const today = new Date();
        const todayPolish = today.toLocaleDateString('pl-PL');
        
        const newRow = {
            id: newId,
            // NOWE: Metadata dla głównego wiersza
            isMainRow: true,
            groupId: newId,
            parentId: null,
            
            data: todayPolish,
            nr_jw: 'JW nr 01',
            nazwa_jw: 'JW nazwa nr 1',
            miejsce: 'Miejscowość A',
            podleglosc: 'WL',
            grupa: 'żołnierz',
            legitymowany: false,
            // Podstawa interwencji
            nar_ubiorcz: 0,
            inne_nar: 0,
            nar_kk: 0,
            wykr_porzadek: 0,
            wykr_bezp: 0,
            nar_dyscyplina: 0,
            nar_bron: 0,
            nar_ochr_zdr: 0,
            nar_zakwat: 0,
            pozostale: 0,
            // Stan
            stan_razem: 0,
            pod_wplywem_alk: 0,
            nietrzezwy: 0,
            pod_wplywem_srod: 0,
            // Rodzaj interwencji
            rodzaj_razem: 0,
            zatrzymanie: 0,
            doprowadzenie: 0,
            wylegitymowanie: 0,
            pouczenie: 0,
            mandat_bool: false,
            wysokosc_mandatu: '',
            // Pozostałe
            w_czasie_sluzby: false,
            jzw_prowadzaca: 'OŻW Elbląg',
            oddzial: 'Elbląg'
        };

        AppState.wykroczeniaData.push(newRow);
        this.renderRows();
        this.autoSave();
    },

    updateField(id, field, value) {
        const row = AppState.wykroczeniaData.find(r => r.id === id);
        if (row) {
            if (field === 'data' && value) {
                const date = new Date(value);
                row.data = date.toLocaleDateString('pl-PL');
            } else {
                row[field] = value;
            }
            
            // SYNCHRONIZACJA: Jeśli główny wiersz zmienia "legitymowany", propaguj do podwierszy
            if (field === 'legitymowany' && row.isMainRow !== false) {
                const groupId = row.groupId || row.id;
                AppState.wykroczeniaData.forEach(r => {
                    if (r.isMainRow === false && r.groupId === groupId) {
                        r.legitymowany = value;
                        r.legitymowanyLocked = true;
                    }
                });
            }
            
            // REAL-TIME WALIDACJA przy zmianie pól Podstawa lub Rodzaj
            const isPodstawaField = ['nar_ubiorcz', 'inne_nar', 'nar_kk', 'wykr_porzadek', 
                                     'wykr_bezp', 'nar_dyscyplina', 'nar_bron', 'nar_ochr_zdr', 
                                     'nar_zakwat', 'pozostale'].includes(field);
            const isRodzajField = ['zatrzymanie', 'doprowadzenie', 'wylegitymowanie', 
                                   'pouczenie', 'mandat_bool'].includes(field);
            
            if (isPodstawaField || isRodzajField) {
                const validation = ValidationEngine.validateRow('wykroczenia', row);
                if (!validation.valid) {
                    const rowIndex = AppState.wykroczeniaData.findIndex(r => r.id === id);
                    const dependencyError = validation.errors.find(e => e.type === 'dependency');
                    if (dependencyError) {
                        setTimeout(() => {
                            alert(`BŁĄD W WIERSZU ${rowIndex + 1}\n\n${dependencyError.message}!\n\nWybierz przynajmniej jedno działanie:\n• Zatrzymanie\n• Doprowadzenie\n• Wylegitymowanie\n• Pouczenie\n• Mandat`);
                        }, 100);
                    }
                }
            }

            // Auto-oblicz pola RAZEM używając CalculationEngine
            CalculationEngine.calculate('wykroczenia', row);

            this.renderRows();
            this.updateToolbarState();
            this.autoSave();
        }
    },

    toggleRowSelect(id, checked) {
        if (checked) {
            AppState.wykroczeniaSelectedRows.add(id);
        } else {
            AppState.wykroczeniaSelectedRows.delete(id);
        }
        this.renderRows();
    },

    toggleSelectAll(checked) {
        if (checked) {
            AppState.wykroczeniaData.forEach(row => AppState.wykroczeniaSelectedRows.add(row.id));
        } else {
            AppState.wykroczeniaSelectedRows.clear();
        }
        this.renderRows();
    },

    clearSelected() {
        if (AppState.wykroczeniaSelectedRows.size === 0) {
            alert('Nie zaznaczono żadnych wierszy do usunięcia');
            return;
        }

        if (!confirm(`Czy na pewno chcesz usunąć ${AppState.wykroczeniaSelectedRows.size} zaznaczonych wierszy?`)) {
            return;
        }

        AppState.wykroczeniaData = AppState.wykroczeniaData.filter(
            row => !AppState.wykroczeniaSelectedRows.has(row.id)
        );
        AppState.wykroczeniaSelectedRows.clear();
        
        this.renderRows();
        this.autoSave();
    },

    updateClearButtonState() {
        const clearBtn = document.getElementById('clearWykroczeniaData');
        if (clearBtn) {
            clearBtn.disabled = AppState.wykroczeniaData.length === 0;
        }
    },

    countValidationErrors() {
        // Używa ValidationEngine zamiast własnej metody
        return ValidationEngine.countErrors('wykroczenia', AppState.wykroczeniaData);
    },

    updateToolbarState() {
        const errorCount = this.countValidationErrors();
        const hasErrors = errorCount > 0;
        
        // Aktualizuj przyciski
        const saveBtn = document.getElementById('saveWykroczeniaDraft');
        const exportBtn = document.getElementById('exportWykroczenia');
        const errorDisplay = document.getElementById('wykroczeniaErrorCount');
        
        if (saveBtn) {
            saveBtn.disabled = hasErrors;
            saveBtn.style.opacity = hasErrors ? '0.5' : '1';
            saveBtn.style.cursor = hasErrors ? 'not-allowed' : 'pointer';
        }
        
        if (exportBtn) {
            exportBtn.disabled = hasErrors;
            exportBtn.style.opacity = hasErrors ? '0.5' : '1';
            exportBtn.style.cursor = hasErrors ? 'not-allowed' : 'pointer';
        }
        
        // Pokaż licznik błędów
        if (errorDisplay) {
            if (hasErrors) {
                errorDisplay.textContent = `❌ Błędów walidacji: ${errorCount}`;
                errorDisplay.style.display = 'block';
            } else {
                errorDisplay.style.display = 'none';
            }
        }
    },

    validateCompleteness() {
        // Używa ValidationEngine
        const validation = ValidationEngine.validateAll('wykroczenia', AppState.wykroczeniaData);

        if (validation.valid) {
            alert('Wszystkie wiersze są kompletne i poprawne!');
            return;
        }

        const issues = [];
        validation.rowErrors.forEach((errors, rowId) => {
            const row = AppState.wykroczeniaData.find(r => r.id === rowId);
            const rowIndex = AppState.wykroczeniaData.indexOf(row) + 1;

            errors.forEach(error => {
                if (error.type === 'required') {
                    issues.push(`Wiersz ${rowIndex}: brak ${error.field}`);
                } else if (error.type === 'dependency') {
                    issues.push(`Wiersz ${rowIndex}: ${error.message}`);
                }
            });
        });

        let message = `❌ Znaleziono ${validation.errorCount} błędów:\n\n`;
        message += issues.slice(0, 15).join('\n');
        if (issues.length > 15) {
            message += `\n... i ${issues.length - 15} więcej`;
        }
        alert(message);
    },

    saveDraft() {
        const errorCount = this.countValidationErrors();
        if (errorCount > 0) {
            alert(`❌ Nie można zapisać arkusza!\n\nZnaleziono ${errorCount} błędów walidacji.\n\nPopraw błędy przed zapisaniem:\n• Jeśli zaznaczono podstawę interwencji,\n  należy wybrać rodzaj interwencji`);
            return;
        }
        
        const success = Utils.saveToLocalStorage('aep_data_wykroczenia', AppState.wykroczeniaData);
        if (success) {
            alert('Arkusz zapisany pomyślnie w localStorage');
        } else {
            alert('Błąd podczas zapisywania arkusza');
        }
    },

    validatePodstawaRodzaj(row) {
        // Sprawdź czy jest jakaś podstawa interwencji
        const maPodstawe = (row.nar_ubiorcz || 0) +
                           (row.inne_nar || 0) +
                           (row.nar_kk || 0) +
                           (row.wykr_porzadek || 0) +
                           (row.wykr_bezp || 0) +
                           (row.nar_dyscyplina || 0) +
                           (row.nar_bron || 0) +
                           (row.nar_ochr_zdr || 0) +
                           (row.nar_zakwat || 0) +
                           (row.pozostale || 0) > 0;

        // Sprawdź czy jest jakiś rodzaj interwencji
        const maRodzaj = (row.zatrzymanie || 0) +
                         (row.doprowadzenie || 0) +
                         (row.wylegitymowanie || 0) +
                         (row.pouczenie || 0) +
                         (row.mandat_bool ? 1 : 0) > 0;

        // BŁĄD: Jest podstawa, ale brak rodzaju
        if (maPodstawe && !maRodzaj) {
            return {
                valid: false,
                message: "Zaznaczono podstawę interwencji, ale nie wybrano rodzaju interwencji"
            };
        }

        return { valid: true };
    },

    autoSave() {
        Utils.saveToLocalStorage('aep_data_wykroczenia', AppState.wykroczeniaData);
    },

    // ============================================
    // EXPORT/IMPORT
    // ============================================
    openExportModal() {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const monthNames = [
            'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
            'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
        ];
        const monthName = monthNames[currentMonth - 1];
        
        // Zlicz wiersze do eksportu
        const mainRows = AppState.wykroczeniaData.filter(row => {
            if (!row.isMainRow) return false;
            if (!row.data) return false;
            const parts = row.data.split('.');
            if (parts.length !== 3) return false;
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            return month === currentMonth && year === currentYear;
        });
        const groupIds = new Set(mainRows.map(r => r.groupId));
        const totalRows = AppState.wykroczeniaData.filter(row => groupIds.has(row.groupId)).length;
        
        // Domyślna nazwa
        const defaultName = `Wykroczenia_${monthName}_${currentYear}`;
        
        Modal.show('Eksport danych', `
            <div class="export-form">
                <div class="form-group">
                    <label for="exportFileName">Nazwa pliku:</label>
                    <input 
                        type="text" 
                        id="exportFileName" 
                        class="form-input" 
                        value="${defaultName}"
                        placeholder="Wpisz nazwę pliku"
                        style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
                    >
                    <small style="color: #999; display: block; margin-top: 0.5rem;">
                        Rozszerzenie .json zostanie dodane automatycznie
                    </small>
                </div>
                
                <div class="export-info" style="margin-top: 1.5rem; padding: 1rem; background: rgba(74, 144, 226, 0.1); border-radius: 4px;">
                    <p style="margin: 0.25rem 0;"><strong>Eksportowane wiersze:</strong> ${totalRows}</p>
                    <p style="margin: 0.25rem 0;"><strong>Miesiąc:</strong> ${monthName} ${currentYear}</p>
                </div>
                
                <div class="modal-actions" style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="Modal.hide()">Anuluj</button>
                    <button class="btn btn-primary" onclick="WykroczeniaManager.confirmExport()">
                        <i class="fas fa-download"></i> Eksportuj
                    </button>
                </div>
            </div>
        `);
        
        // Focus na input
        setTimeout(() => {
            const input = document.getElementById('exportFileName');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    },

    confirmExport() {
        const fileName = document.getElementById('exportFileName')?.value.trim();
        
        if (!fileName) {
            alert('Podaj nazwę pliku!');
            return;
        }
        
        Modal.hide();
        this.exportJSON(fileName);
    },

    /**
     * Eksportuje dane do pliku JSON
     * @param {string} customFileName - Nazwa pliku (bez rozszerzenia)
     * @returns {void}
     */
    exportJSON(customFileName) {
        // Filtruj wiersze według miesiąca (główne) + ich podwiersze
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        // KROK 1: Znajdź główne wiersze z obecnego miesiąca
        const mainRows = AppState.wykroczeniaData.filter(row => {
            if (!row.isMainRow) return false; // Tylko główne
            if (!row.data) return false;
            const parts = row.data.split('.');
            if (parts.length !== 3) return false;
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            return month === currentMonth && year === currentYear;
        });
        
        // KROK 2: Znajdź groupId głównych wierszy
        const groupIds = new Set(mainRows.map(r => r.groupId));
        
        // KROK 3: Pobierz WSZYSTKIE wiersze z tych grup (główne + podwiersze)
        const monthData = AppState.wykroczeniaData.filter(row => {
            return groupIds.has(row.groupId);
        });

        const exportData = {
            version: "1.0",
            module: "wykroczenia",
            exportDate: new Date().toISOString(),
            period: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
            rowCount: monthData.length,
            data: monthData
        };

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${customFileName}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast(`Wyeksportowano ${monthData.length} wierszy do JSON`);
    },


    /**
     * Importuje dane z pliku JSON
     * @returns {void}
     */
    importJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        /**
         * @param {Event} e - Change event
         */
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target.result);

                    if (!json.module || json.module !== 'wykroczenia') {
                        alert('Nieprawidłowy plik! To nie są dane wykroczeń.');
                        return;
                    }

                    if (!json.data || !Array.isArray(json.data)) {
                        alert('Nieprawidłowa struktura pliku!');
                        return;
                    }

                    const confirmMsg = `Zaimportować ${json.rowCount} wierszy z ${json.period}?\n\nTo doda dane do istniejących.`;
                    if (confirm(confirmMsg)) {
                        // Znajdź najwyższe ID i groupID
                        const maxId = AppState.wykroczeniaData.length > 0 
                            ? Math.max(...AppState.wykroczeniaData.map(r => r.id))
                            : 0;
                        const maxGroupId = AppState.wykroczeniaData.length > 0
                            ? Math.max(...AppState.wykroczeniaData.map(r => r.groupId || 0))
                            : 0;

                        // Mapowanie starych ID na nowe ID
                        const idMap = new Map();
                        const groupIdMap = new Map();
                        let newId = maxId + 1;
                        let newGroupId = maxGroupId + 1;

                        // FAZA 1: Utwórz mapowanie ID i groupID
                        json.data.forEach(row => {
                            const oldId = row.id;
                            idMap.set(oldId, newId++);
                            
                            if (row.groupId && !groupIdMap.has(row.groupId)) {
                                groupIdMap.set(row.groupId, newGroupId++);
                            }
                        });

                        // FAZA 2: Dodaj wiersze z zaktualizowanymi ID i relacjami
                        json.data.forEach(row => {
                            // Zaktualizuj ID
                            const oldId = row.id;
                            row.id = idMap.get(oldId);

                            // Zaktualizuj parentId jeśli istnieje
                            if (row.parentId) {
                                row.parentId = idMap.get(row.parentId);
                            }

                            // Zaktualizuj groupId
                            if (row.groupId) {
                                row.groupId = groupIdMap.get(row.groupId);
                            }

                            // Dodaj wiersz
                            AppState.wykroczeniaData.push(row);
                        });

                        // Aktualizuj nextId i nextGroupId
                        this.nextId = newId;
                        this.nextGroupId = newGroupId;

                        this.renderRows();
                        this.autoSave();
                        alert(`Import zakończony!\n\nZaimportowano: ${json.rowCount} wierszy (zachowano strukturę podwierszy)`);
                    }
                } catch (err) {
                    console.error('Import error:', err);
                    alert('Błąd podczas importu pliku!');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    // ============================================
    // COLUMNS VISIBILITY
    // ============================================
    initColumnsDropdown() {
        const toggleBtn = document.getElementById('toggleWykroczeniaColumnsBtn');
        const dropdown = document.getElementById('wykroczeniaColumnsDropdown');
        const checkboxesContainer = document.getElementById('wykroczeniaColumnCheckboxes');
        const showAllBtn = document.getElementById('showAllWykroczeniaColumns');
        const hideAllBtn = document.getElementById('hideAllWykroczeniaColumns');

        // Load saved visible columns
        const saved = Utils.loadFromLocalStorage('wykroczenia_visible_columns');
        if (saved) {
            AppState.wykroczeniaVisibleColumns = saved;
        }

        // Column definitions
        const columns = [
            { key: 'month', label: 'Miesiąc' },
            { key: 'data', label: 'Data interw.' },
            { key: 'nr_jw', label: 'Nr JW' },
            { key: 'nazwa_jw', label: 'Nazwa JW' },
            { key: 'miejsce', label: 'Miejsce stac.' },
            { key: 'podleglosc', label: 'Podległość RSZ' },
            { key: 'grupa', label: 'Grupa os.' },
            { key: 'legitymowany', label: 'Legitym.' },
            { key: 'podstawa', label: 'Podstawa interwencji' },
            { key: 'stan_razem', label: 'Stan - Razem' },
            { key: 'pod_wplywem_alk', label: 'Pod wpł. alk.' },
            { key: 'nietrzezwy', label: 'Nietrzeźwy' },
            { key: 'pod_wplywem_srod', label: 'Pod wpł. środ.' },
            { key: 'rodzaj_razem', label: 'Rodzaj - Razem' },
            { key: 'zatrzymanie', label: 'Zatrzym.' },
            { key: 'doprowadzenie', label: 'Doprow.' },
            { key: 'wylegitymowanie', label: 'Wylegitym.' },
            { key: 'pouczenie', label: 'Poucz.' },
            { key: 'mandat', label: 'Mandat' },
            { key: 'wysokosc_mandatu', label: 'Wys. mandatu (zł)' },
            { key: 'w_czasie_sluzby', label: 'W czasie służby' },
            { key: 'jzw_prowadzaca', label: 'JŻW prowadząca' },
            { key: 'oddzial', label: 'Oddział' }
        ];

        // Render checkboxes
        checkboxesContainer.innerHTML = columns.map(col => `
            <label class="column-item">
                <input type="checkbox" 
                       data-column="${col.key}" 
                       ${AppState.wykroczeniaVisibleColumns[col.key] ? 'checked' : ''}>
                ${col.label}
            </label>
        `).join('');

        // Toggle dropdown
        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Column checkbox changes
        checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const column = e.target.dataset.column;
                AppState.wykroczeniaVisibleColumns[column] = e.target.checked;
                this.applyColumnVisibility();
                Utils.saveToLocalStorage('wykroczenia_visible_columns', AppState.wykroczeniaVisibleColumns);
            });
        });

        // Show all
        showAllBtn?.addEventListener('click', () => {
            Object.keys(AppState.wykroczeniaVisibleColumns).forEach(key => {
                if (key !== 'lp' && key !== 'checkbox' && key !== 'copy') {
                    AppState.wykroczeniaVisibleColumns[key] = true;
                }
            });
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = true;
            });
            this.applyColumnVisibility();
            Utils.saveToLocalStorage('wykroczenia_visible_columns', AppState.wykroczeniaVisibleColumns);
        });

        // Hide all
        hideAllBtn?.addEventListener('click', () => {
            Object.keys(AppState.wykroczeniaVisibleColumns).forEach(key => {
                if (key !== 'lp' && key !== 'checkbox' && key !== 'copy') {
                    AppState.wykroczeniaVisibleColumns[key] = false;
                }
            });
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            this.applyColumnVisibility();
            Utils.saveToLocalStorage('wykroczenia_visible_columns', AppState.wykroczeniaVisibleColumns);
        });

        // Apply initial visibility
        this.applyColumnVisibility();
    },

    applyColumnVisibility() {
        const table = document.querySelector('.wykroczenia-table');
        if (!table) return;

        // Map column keys to their indices (accounting for L.p., checkbox, copy)
        const columnMap = {
            'month': 3,
            'data': 4,
            'nr_jw': 5,
            'nazwa_jw': 6,
            'miejsce': 7,
            'podleglosc': 8,
            'grupa': 9,
            'legitymowany': 10,
            'podstawa': 11,
            'stan_razem': 12,
            'pod_wplywem_alk': 13,
            'nietrzezwy': 14,
            'pod_wplywem_srod': 15,
            'rodzaj_razem': 16,
            'zatrzymanie': 17,
            'doprowadzenie': 18,
            'wylegitymowanie': 19,
            'pouczenie': 20,
            'mandat': 21,
            'wysokosc_mandatu': 22,
            'w_czasie_sluzby': 23,
            'jzw_prowadzaca': 24,
            'oddzial': 25
        };

        // Apply visibility to all rows
        Object.keys(columnMap).forEach(key => {
            const index = columnMap[key];
            const isVisible = AppState.wykroczeniaVisibleColumns[key];
            
            // Header rows
            const headerCells = table.querySelectorAll(`thead tr th:nth-child(${index + 1})`);
            headerCells.forEach(cell => {
                cell.style.display = isVisible ? '' : 'none';
            });

            // Body rows
            const bodyCells = table.querySelectorAll(`tbody tr td:nth-child(${index + 1})`);
            bodyCells.forEach(cell => {
                cell.style.display = isVisible ? '' : 'none';
            });
        });
    },

    // ============================================
    // DATE FILTER
    // ============================================
    initDateFilter() {
        const toggleBtn = document.getElementById('toggleWykroczeniaDateFilterBtn');
        const dropdown = document.getElementById('wykroczeniaDateFilterDropdown');
        const dateFromInput = document.getElementById('wykroczeniaDateFrom');
        const dateToInput = document.getElementById('wykroczeniaDateTo');
        const applyBtn = document.getElementById('applyWykroczeniaDateFilter');
        const clearDropdownBtn = document.getElementById('clearWykroczeniaDateFilterDropdown');
        const clearFilterBtn = document.getElementById('clearWykroczeniaDateFilterBtn');
        const filterBadge = document.getElementById('wykroczeniaDateFilterBadge');
        const filterInfoBar = document.getElementById('wykroczeniaFilterInfoBar');
        const filterResultInfo = document.getElementById('wykroczeniaFilterResultInfo');
        const quickFilterBtns = dropdown?.querySelectorAll('.btn-quick-filter');

        // Toggle dropdown
        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Quick filter buttons
        quickFilterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const today = new Date();
                const from = new Date(today);
                
                if (days === 0) {
                    // Dziś
                    from.setHours(0, 0, 0, 0);
                } else {
                    // X dni wstecz
                    from.setDate(today.getDate() - days);
                }

                dateFromInput.value = this.dateToInputFormat(from);
                dateToInput.value = this.dateToInputFormat(today);
            });
        });

        // Apply filter
        applyBtn?.addEventListener('click', () => {
            const from = dateFromInput.value;
            const to = dateToInput.value;

            if (!from || !to) {
                alert('Proszę wybrać obie daty');
                return;
            }

            const dateFrom = new Date(from);
            const dateTo = new Date(to);
            
            // Normalizuj daty do 00:00:00
            dateFrom.setHours(0, 0, 0, 0);
            dateTo.setHours(23, 59, 59, 999); // Cały dzień "do"

            if (dateFrom > dateTo) {
                alert('Data "od" nie może być późniejsza niż data "do"');
                return;
            }

            AppState.wykroczeniaDateFilter.active = true;
            AppState.wykroczeniaDateFilter.dateFrom = dateFrom;
            AppState.wykroczeniaDateFilter.dateTo = dateTo;

            this.applyDateFilter();
            dropdown.classList.add('hidden');
        });

        // Clear filter (dropdown)
        clearDropdownBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });

        // Clear filter (toolbar button)
        clearFilterBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });
    },

    dateToInputFormat(date) {
        if (!date) return '';
        if (typeof date === 'string') {
            // Parse DD.MM.YYYY
            const parts = date.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return date;
        }
        // Date object to YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    parsePolishDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // 0-indexed
            const year = parseInt(parts[2], 10);
            
            const date = new Date(year, month, day);
            // Normalizuj czas do 00:00:00
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    },

    applyDateFilter() {
        const { dateFrom, dateTo } = AppState.wykroczeniaDateFilter;
        
        console.log('🔍 FILTROWANIE DAT (Wykroczenia):');
        console.log('  dateFrom:', dateFrom);
        console.log('  dateTo:', dateTo);
        
        let matchCount = 0;
        const totalCount = AppState.wykroczeniaData.filter(r => r.isMainRow !== false).length;

        // Filter tylko główne wiersze
        AppState.wykroczeniaData.forEach((row, index) => {
            if (row.isMainRow === false) return; // Pomiń podwiersze
            
            const rowDate = this.parsePolishDate(row.data);
            console.log(`  Wiersz ${index + 1}: data="${row.data}" → rowDate=${rowDate}`);
            
            if (rowDate) {
                const matches = rowDate >= dateFrom && rowDate <= dateTo;
                console.log(`    Porównanie: ${rowDate.getTime()} >= ${dateFrom.getTime()} && ${rowDate.getTime()} <= ${dateTo.getTime()} = ${matches}`);
                if (matches) {
                    matchCount++;
                }
            } else {
                console.log(`    ❌ Nie udało się sparsować daty`);
            }
        });

        console.log(`✅ Znaleziono: ${matchCount} z ${totalCount}`);

        // Update UI
        const filterBadge = document.getElementById('wykroczeniaDateFilterBadge');
        const filterInfoBar = document.getElementById('wykroczeniaFilterInfoBar');
        const clearFilterBtn = document.getElementById('clearWykroczeniaDateFilterBtn');
        const filterResultInfo = document.getElementById('wykroczeniaFilterResultInfo');

        // Show badge
        if (matchCount > 0) {
            filterBadge.textContent = `(${matchCount})`;
            filterBadge.classList.remove('hidden');
        } else {
            filterBadge.classList.add('hidden');
        }

        // Show info bar
        const fromStr = dateFrom.toLocaleDateString('pl-PL');
        const toStr = dateTo.toLocaleDateString('pl-PL');
        
        if (matchCount > 0) {
            filterInfoBar.innerHTML = `
                <i class="fas fa-info-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> wykroczeń z <strong>${totalCount}</strong> 
                (od ${fromStr} do ${toStr})
            `;
            filterInfoBar.style.background = 'rgba(76, 175, 80, 0.1)';
            filterInfoBar.style.color = '#4caf50';
        } else {
            filterInfoBar.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Nie znaleziono wykroczeń w zakresie od ${fromStr} do ${toStr}
            `;
            filterInfoBar.style.background = 'rgba(255, 152, 0, 0.1)';
            filterInfoBar.style.color = '#ff9800';
        }
        filterInfoBar.classList.remove('hidden');

        // Show result in dropdown
        if (matchCount > 0) {
            filterResultInfo.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> wykroczeń
            `;
            filterResultInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            filterResultInfo.style.color = '#4caf50';
        } else {
            filterResultInfo.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Brak wykroczeń w tym zakresie
            `;
            filterResultInfo.style.background = 'rgba(255, 152, 0, 0.1)';
            filterResultInfo.style.color = '#ff9800';
        }
        filterResultInfo.classList.remove('hidden');

        // Show clear button
        clearFilterBtn.classList.remove('hidden');

        // Re-render rows with filter
        this.renderRows();
    },

    clearDateFilter() {
        AppState.wykroczeniaDateFilter.active = false;
        AppState.wykroczeniaDateFilter.dateFrom = null;
        AppState.wykroczeniaDateFilter.dateTo = null;

        // Hide UI elements
        const filterBadge = document.getElementById('wykroczeniaDateFilterBadge');
        const filterInfoBar = document.getElementById('wykroczeniaFilterInfoBar');
        const clearFilterBtn = document.getElementById('clearWykroczeniaDateFilterBtn');
        const filterResultInfo = document.getElementById('wykroczeniaFilterResultInfo');

        filterBadge?.classList.add('hidden');
        filterInfoBar?.classList.add('hidden');
        clearFilterBtn?.classList.add('hidden');
        filterResultInfo?.classList.add('hidden');

        // Re-render all rows
        this.renderRows();
    },

    syncScrollbars() {
        const topScrollbar = document.getElementById('topScrollbarWykroczenia');
        const tableWrapper = document.getElementById('wykroczeniaTableWrapper');
        const topScrollContent = topScrollbar?.querySelector('.top-scrollbar-content');

        if (!topScrollbar || !tableWrapper || !topScrollContent) return;

        const updateScrollbarWidth = () => {
            const table = tableWrapper.querySelector('table');
            if (table) {
                topScrollContent.style.width = table.offsetWidth + 'px';
            }
        };

        updateScrollbarWidth();
        window.addEventListener('resize', updateScrollbarWidth);

        topScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = topScrollbar.scrollLeft;
        });

        tableWrapper.addEventListener('scroll', () => {
            topScrollbar.scrollLeft = tableWrapper.scrollLeft;
        });
    }
};

// ============================================
// WKRD MANAGER
// ============================================
/**
 * Manager for WKRD (Kontrola Ruchu Drogowego) module
 * @namespace WKRDManager
 */
const WKRDManager = {
    /**
     * Renders the WKRD module view
     * @returns {void}
     */
    render() {
        const savedData = Utils.loadFromLocalStorage('aep_data_wkrd');
        AppState.wkrdData = savedData || [];
        AppState.wkrdSelectedRows.clear();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title">WKRD</h1>
                </div>

                <div class="wkrd-toolbar">
                    <button class="btn-secondary" id="addWkrdRow">
                        <i class="fas fa-plus"></i> Dodaj wiersz
                    </button>
                    <button class="btn-secondary" id="saveWkrdDraft">
                        <i class="fas fa-save"></i> Zapisz arkusz
                    </button>
                    <button class="btn-secondary btn-danger" id="clearWkrdData" ${AppState.wkrdData.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Wyczyść zaznaczone
                    </button>
                    <div class="columns-toggle-wrapper">
                        <button class="btn-secondary" id="toggleWkrdColumnsBtn">
                            <i class="fas fa-columns"></i> Widok <i class="fas fa-chevron-down"></i>
                        </button>
                        <div id="wkrdColumnsDropdown" class="columns-dropdown hidden">
                            <div class="dropdown-header">Widoczność kolumn</div>
                            <div class="dropdown-section">
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> L.p. <span class="always-visible">(zawsze)</span>
                                </label>
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> Checkbox <span class="always-visible">(zawsze)</span>
                                </label>
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-section" id="wkrdColumnCheckboxes"></div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-actions">
                                <button class="btn-dropdown" id="showAllWkrdColumns">
                                    <i class="fas fa-eye"></i> Pokaż wszystkie
                                </button>
                                <button class="btn-dropdown" id="hideAllWkrdColumns">
                                    <i class="fas fa-eye-slash"></i> Ukryj wszystkie
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="date-filter-wrapper">
                        <button class="btn-secondary" id="toggleWkrdDateFilterBtn">
                            <i class="fas fa-calendar-days"></i> Filtruj daty <i class="fas fa-chevron-down"></i>
                            <span id="wkrdDateFilterBadge" class="filter-badge hidden"></span>
                        </button>
                        <button class="btn-secondary btn-clear-filter hidden" id="clearWkrdDateFilterBtn">
                            <i class="fas fa-times"></i> Wyczyść filtr
                        </button>
                        <div id="wkrdDateFilterDropdown" class="date-filter-dropdown hidden">
                            <div class="dropdown-header">Filtruj według dat</div>
                            <div class="dropdown-section">
                                <label class="filter-label">Data od:</label>
                                <input type="date" id="wkrdDateFrom" class="date-input">
                                <label class="filter-label">Data do:</label>
                                <input type="date" id="wkrdDateTo" class="date-input">
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-section">
                                <div class="quick-filters-label">Szybki wybór:</div>
                                <div class="quick-filters">
                                    <button class="btn-quick-filter" data-days="0">Dziś</button>
                                    <button class="btn-quick-filter" data-days="7">7 dni</button>
                                    <button class="btn-quick-filter" data-days="30">30 dni</button>
                                    <button class="btn-quick-filter" data-days="365">Rok</button>
                                </div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-actions">
                                <button class="btn-dropdown" id="applyWkrdDateFilter">
                                    <i class="fas fa-search"></i> Filtruj
                                </button>
                                <button class="btn-dropdown" id="clearWkrdDateFilterDropdown">
                                    <i class="fas fa-times"></i> Wyczyść
                                </button>
                            </div>
                            <div id="wkrdFilterResultInfo" class="filter-result-info hidden"></div>
                        </div>
                    </div>
                </div>

                <div id="wkrdFilterInfoBar" class="filter-info-bar hidden"></div>

                <div class="top-scrollbar" id="topScrollbarWKRD">
                    <div class="top-scrollbar-content"></div>
                </div>

                <div class="wkrd-container" id="wkrdContainer">
                    <div class="wkrd-table-wrapper" id="wkrdTableWrapper">
                        <table class="wkrd-table">
                            <thead>
                                <tr class="header-row-1">
                                    <th rowspan="2" class="col-lp">L.p.</th>
                                    <th rowspan="2" class="col-checkbox"><input type="checkbox" id="selectAllWkrd" class="row-checkbox"></th>
                                    <th rowspan="2">Miesiąc</th>
                                    <th rowspan="2">Data</th>
                                    <th rowspan="2">Nr JW</th>
                                    <th rowspan="2">Nazwa JW</th>
                                    <th rowspan="2">Miejsce stacjonowania</th>
                                    <th rowspan="2">Podległość RSZ</th>
                                    <th colspan="4" class="group-header">Pojazdy</th>
                                    <th rowspan="2">Oddział</th>
                                </tr>
                                <tr class="header-row-2">
                                    <th class="col-razem">RAZEM</th>
                                    <th>WPM</th>
                                    <th>PPM</th>
                                    <th>Pozostałe</th>
                                </tr>
                            </thead>
                            <tbody id="wkrdTableBody">
                                ${AppState.wkrdData.length === 0 ? '<tr><td colspan="13" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('addWkrdRow')?.addEventListener('click', () => this.addRow());
        document.getElementById('saveWkrdDraft')?.addEventListener('click', () => this.saveDraft());
        document.getElementById('clearWkrdData')?.addEventListener('click', () => this.clearSelected());
        document.getElementById('selectAllWkrd')?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        // Columns visibility toggle
        this.initColumnsDropdown();

        // Date filter
        this.initDateFilter();

        if (AppState.wkrdData.length > 0) {
            this.renderRows();
            this.syncScrollbars();
        }
    },

    initColumnsDropdown() {
        const toggleBtn = document.getElementById('toggleWkrdColumnsBtn');
        const dropdown = document.getElementById('wkrdColumnsDropdown');
        const checkboxesContainer = document.getElementById('wkrdColumnCheckboxes');
        const showAllBtn = document.getElementById('showAllWkrdColumns');
        const hideAllBtn = document.getElementById('hideAllWkrdColumns');

        const saved = Utils.loadFromLocalStorage('wkrd_visible_columns');
        if (saved) {
            AppState.wkrdVisibleColumns = saved;
        }

        const columns = [
            { key: 'month', label: 'Miesiąc' },
            { key: 'data', label: 'Data' },
            { key: 'nr_jw', label: 'Nr JW' },
            { key: 'nazwa_jw', label: 'Nazwa JW' },
            { key: 'miejsce', label: 'Miejsce stacjonowania' },
            { key: 'podleglosc', label: 'Podległość RSZ' },
            { key: 'razem', label: 'Pojazdy - RAZEM' },
            { key: 'wpm', label: 'WPM' },
            { key: 'ppm', label: 'PPM' },
            { key: 'pozostale', label: 'Pozostałe' },
            { key: 'oddzial', label: 'Oddział' }
        ];

        checkboxesContainer.innerHTML = columns.map(col => `
            <label class="column-item">
                <input type="checkbox" 
                       data-column="${col.key}" 
                       ${AppState.wkrdVisibleColumns[col.key] ? 'checked' : ''}>
                ${col.label}
            </label>
        `).join('');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const column = e.target.dataset.column;
                AppState.wkrdVisibleColumns[column] = e.target.checked;
                this.applyColumnVisibility();
                Utils.saveToLocalStorage('wkrd_visible_columns', AppState.wkrdVisibleColumns);
            });
        });

        showAllBtn?.addEventListener('click', () => {
            Object.keys(AppState.wkrdVisibleColumns).forEach(key => {
                if (key !== 'lp' && key !== 'checkbox') {
                    AppState.wkrdVisibleColumns[key] = true;
                }
            });
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = true;
            });
            this.applyColumnVisibility();
            Utils.saveToLocalStorage('wkrd_visible_columns', AppState.wkrdVisibleColumns);
        });

        hideAllBtn?.addEventListener('click', () => {
            Object.keys(AppState.wkrdVisibleColumns).forEach(key => {
                if (key !== 'lp' && key !== 'checkbox') {
                    AppState.wkrdVisibleColumns[key] = false;
                }
            });
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            this.applyColumnVisibility();
            Utils.saveToLocalStorage('wkrd_visible_columns', AppState.wkrdVisibleColumns);
        });

        this.applyColumnVisibility();
    },

    applyColumnVisibility() {
        const table = document.querySelector('.wkrd-table');
        if (!table) return;

        const columnMap = {
            'month': 2,
            'data': 3,
            'nr_jw': 4,
            'nazwa_jw': 5,
            'miejsce': 6,
            'podleglosc': 7,
            'razem': 8,
            'wpm': 9,
            'ppm': 10,
            'pozostale': 11,
            'oddzial': 12
        };

        Object.keys(columnMap).forEach(key => {
            const index = columnMap[key];
            const isVisible = AppState.wkrdVisibleColumns[key];
            
            const headerCells = table.querySelectorAll(`thead tr th:nth-child(${index + 1})`);
            headerCells.forEach(cell => {
                cell.style.display = isVisible ? '' : 'none';
            });

            const bodyCells = table.querySelectorAll(`tbody tr td:nth-child(${index + 1})`);
            bodyCells.forEach(cell => {
                cell.style.display = isVisible ? '' : 'none';
            });
        });
    },

    initDateFilter() {
        const toggleBtn = document.getElementById('toggleWkrdDateFilterBtn');
        const dropdown = document.getElementById('wkrdDateFilterDropdown');
        const dateFromInput = document.getElementById('wkrdDateFrom');
        const dateToInput = document.getElementById('wkrdDateTo');
        const applyBtn = document.getElementById('applyWkrdDateFilter');
        const clearDropdownBtn = document.getElementById('clearWkrdDateFilterDropdown');
        const clearFilterBtn = document.getElementById('clearWkrdDateFilterBtn');
        const filterBadge = document.getElementById('wkrdDateFilterBadge');
        const filterInfoBar = document.getElementById('wkrdFilterInfoBar');
        const filterResultInfo = document.getElementById('wkrdFilterResultInfo');
        const quickFilterBtns = dropdown?.querySelectorAll('.btn-quick-filter');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        quickFilterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const today = new Date();
                const from = new Date(today);
                
                if (days === 0) {
                    from.setHours(0, 0, 0, 0);
                } else {
                    from.setDate(today.getDate() - days);
                }

                dateFromInput.value = this.dateToInputFormat(from);
                dateToInput.value = this.dateToInputFormat(today);
            });
        });

        applyBtn?.addEventListener('click', () => {
            const from = dateFromInput.value;
            const to = dateToInput.value;

            if (!from || !to) {
                alert('Proszę wybrać obie daty');
                return;
            }

            const dateFrom = new Date(from);
            const dateTo = new Date(to);
            
            dateFrom.setHours(0, 0, 0, 0);
            dateTo.setHours(23, 59, 59, 999);

            if (dateFrom > dateTo) {
                alert('Data "od" nie może być późniejsza niż data "do"');
                return;
            }

            AppState.wkrdDateFilter.active = true;
            AppState.wkrdDateFilter.dateFrom = dateFrom;
            AppState.wkrdDateFilter.dateTo = dateTo;

            this.applyDateFilter();
            dropdown.classList.add('hidden');
        });

        clearDropdownBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });

        clearFilterBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });
    },

    dateToInputFormat(date) {
        if (!date) return '';
        if (typeof date === 'string') {
            const parts = date.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return date;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    parsePolishDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    },

    getMonthFromDate(dateStr) {
        const monthsShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 
                            'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
        if (!dateStr) return '—';
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const month = parseInt(parts[1], 10) - 1;
            return monthsShort[month] || '—';
        }
        return '—';
    },

    applyDateFilter() {
        const { dateFrom, dateTo } = AppState.wkrdDateFilter;
        
        let matchCount = 0;
        const totalCount = AppState.wkrdData.length;

        AppState.wkrdData.forEach((row) => {
            const rowDate = this.parsePolishDate(row.data);
            if (rowDate && rowDate >= dateFrom && rowDate <= dateTo) {
                matchCount++;
            }
        });

        const filterBadge = document.getElementById('wkrdDateFilterBadge');
        const filterInfoBar = document.getElementById('wkrdFilterInfoBar');
        const clearFilterBtn = document.getElementById('clearWkrdDateFilterBtn');
        const filterResultInfo = document.getElementById('wkrdFilterResultInfo');

        if (matchCount > 0) {
            filterBadge.textContent = `(${matchCount})`;
            filterBadge.classList.remove('hidden');
        } else {
            filterBadge.classList.add('hidden');
        }

        const fromStr = dateFrom.toLocaleDateString('pl-PL');
        const toStr = dateTo.toLocaleDateString('pl-PL');
        
        if (matchCount > 0) {
            filterInfoBar.innerHTML = `
                <i class="fas fa-info-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> zapisów z <strong>${totalCount}</strong> 
                (od ${fromStr} do ${toStr})
            `;
            filterInfoBar.style.background = 'rgba(76, 175, 80, 0.1)';
            filterInfoBar.style.color = '#4caf50';
        } else {
            filterInfoBar.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Nie znaleziono zapisów w zakresie od ${fromStr} do ${toStr}
            `;
            filterInfoBar.style.background = 'rgba(255, 152, 0, 0.1)';
            filterInfoBar.style.color = '#ff9800';
        }
        filterInfoBar.classList.remove('hidden');

        if (matchCount > 0) {
            filterResultInfo.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> zapisów
            `;
            filterResultInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            filterResultInfo.style.color = '#4caf50';
        } else {
            filterResultInfo.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Brak zapisów w tym zakresie
            `;
            filterResultInfo.style.background = 'rgba(255, 152, 0, 0.1)';
            filterResultInfo.style.color = '#ff9800';
        }
        filterResultInfo.classList.remove('hidden');

        clearFilterBtn.classList.remove('hidden');
        this.renderRows();
    },

    clearDateFilter() {
        AppState.wkrdDateFilter.active = false;
        AppState.wkrdDateFilter.dateFrom = null;
        AppState.wkrdDateFilter.dateTo = null;

        const filterBadge = document.getElementById('wkrdDateFilterBadge');
        const filterInfoBar = document.getElementById('wkrdFilterInfoBar');
        const clearFilterBtn = document.getElementById('clearWkrdDateFilterBtn');
        const filterResultInfo = document.getElementById('wkrdFilterResultInfo');

        filterBadge?.classList.add('hidden');
        filterInfoBar?.classList.add('hidden');
        clearFilterBtn?.classList.add('hidden');
        filterResultInfo?.classList.add('hidden');

        this.renderRows();
    },

    renderRows() {
        const tbody = document.getElementById('wkrdTableBody');
        if (!tbody) return;

        if (AppState.wkrdData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="13" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>';
            return;
        }

        let dataToRender = AppState.wkrdData;
        if (AppState.wkrdDateFilter.active) {
            const { dateFrom, dateTo } = AppState.wkrdDateFilter;
            dataToRender = AppState.wkrdData.filter(row => {
                const rowDate = this.parsePolishDate(row.data);
                if (!rowDate) return false;
                return rowDate >= dateFrom && rowDate <= dateTo;
            });
        }

        if (dataToRender.length === 0) {
            tbody.innerHTML = '<tr><td colspan="13" class="empty-message">Brak danych spełniających kryteria filtra dat.</td></tr>';
            return;
        }

        const nrJWOptions = Array.from({length: 99}, (_, i) => `JW nr ${String(i + 1).padStart(2, '0')}`);
        const nazwaJWOptions = Array.from({length: 80}, (_, i) => `JW nazwa nr ${i + 1}`);
        const miejsceOptions = ['Miejscowość A', 'Miejscowość B', 'Miejscowość C'];
        const podlegloscOptions = ['WL', 'SP', 'MW', 'WOT', 'ŻW', 'inne'];
        const oddzialOptions = ['Elbląg', 'Bydgoszcz', 'Szczecin', 'Żagań', 'Kraków', 'Lublin', 'Warszawa', 'Łódź'];

        tbody.innerHTML = dataToRender.map((row, index) => {
            const lp = index + 1;
            const isSelected = AppState.wkrdSelectedRows.has(row.id);
            
            const razem = (parseInt(row.wpm) || 0) + (parseInt(row.ppm) || 0);
            const month = this.getMonthFromDate(row.data);

            return `
                <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''}">
                    <td class="col-lp">${lp}</td>
                    <td class="col-checkbox">
                        <input type="checkbox" 
                               class="row-checkbox" 
                               ${isSelected ? 'checked' : ''}
                               onchange="WKRDManager.toggleRowSelect(${row.id}, this.checked)">
                    </td>
                    <td>${month}</td>
                    <td>
                        <input type="date" 
                               value="${this.dateToInputFormat(row.data)}"
                               onchange="WKRDManager.updateField(${row.id}, 'data', this.value)"
                               class="cell-input">
                    </td>
                    <td>
                        <select onchange="WKRDManager.updateField(${row.id}, 'nr_jw', this.value)" class="cell-select">
                            <option value="">Wybierz</option>
                            ${nrJWOptions.map(opt => `<option value="${opt}" ${row.nr_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <select onchange="WKRDManager.updateField(${row.id}, 'nazwa_jw', this.value)" class="cell-select">
                            <option value="">Wybierz</option>
                            ${nazwaJWOptions.map(opt => `<option value="${opt}" ${row.nazwa_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <select onchange="WKRDManager.updateField(${row.id}, 'miejsce', this.value)" class="cell-select">
                            <option value="">Wybierz</option>
                            ${miejsceOptions.map(opt => `<option value="${opt}" ${row.miejsce === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <select onchange="WKRDManager.updateField(${row.id}, 'podleglosc', this.value)" class="cell-select">
                            <option value="">Wybierz</option>
                            ${podlegloscOptions.map(opt => `<option value="${opt}" ${row.podleglosc === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-razem">${razem}</td>
                    <td>
                        <input type="number" 
                               value="${row.wpm || 0}" 
                               min="0"
                               onchange="WKRDManager.updateField(${row.id}, 'wpm', this.value)"
                               class="cell-input-number">
                    </td>
                    <td>
                        <input type="number" 
                               value="${row.ppm || 0}" 
                               min="0"
                               onchange="WKRDManager.updateField(${row.id}, 'ppm', this.value)"
                               class="cell-input-number">
                    </td>
                    <td>
                        <input type="number" 
                               value="${row.pozostale || 0}" 
                               min="0"
                               onchange="WKRDManager.updateField(${row.id}, 'pozostale', this.value)"
                               class="cell-input-number">
                    </td>
                    <td>
                        <select onchange="WKRDManager.updateField(${row.id}, 'oddzial', this.value)" class="cell-select">
                            <option value="">Wybierz</option>
                            ${oddzialOptions.map(opt => `<option value="${opt}" ${row.oddzial === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Aktualizuj scrollbar po każdej zmianie danych
        this.syncScrollbars();
    },

    addRow() {
        const today = new Date();
        const todayPolish = today.toLocaleDateString('pl-PL');
        
        const newId = AppState.wkrdData.length > 0 ? 
            Math.max(...AppState.wkrdData.map(r => r.id)) + 1 : 1;
        
        const newRow = {
            id: newId,
            data: todayPolish,
            nr_jw: '',
            nazwa_jw: '',
            miejsce: '',
            podleglosc: '',
            razem: 0,
            wpm: 0,
            ppm: 0,
            pozostale: 0,
            oddzial: ''
        };

        AppState.wkrdData.push(newRow);
        this.renderRows();
        this.autoSave();
    },

    updateField(id, field, value) {
        const row = AppState.wkrdData.find(r => r.id === id);
        if (row) {
            if (field === 'data' && value) {
                const date = new Date(value);
                row.data = date.toLocaleDateString('pl-PL');
            } else {
                row[field] = value;
            }

            // Auto-oblicz pola RAZEM używając CalculationEngine
            CalculationEngine.calculate('wkrd', row);

            this.renderRows();
            this.autoSave();
        }
    },

    toggleRowSelect(id, checked) {
        if (checked) {
            AppState.wkrdSelectedRows.add(id);
        } else {
            AppState.wkrdSelectedRows.delete(id);
        }
        this.renderRows();
    },

    toggleSelectAll(checked) {
        if (checked) {
            AppState.wkrdData.forEach(row => AppState.wkrdSelectedRows.add(row.id));
        } else {
            AppState.wkrdSelectedRows.clear();
        }
        this.renderRows();
    },

    clearSelected() {
        if (AppState.wkrdSelectedRows.size === 0) {
            alert('Nie zaznaczono żadnych wierszy do usunięcia');
            return;
        }

        if (!confirm(`Czy na pewno chcesz usunąć ${AppState.wkrdSelectedRows.size} zaznaczonych wierszy?`)) {
            return;
        }

        AppState.wkrdData = AppState.wkrdData.filter(
            row => !AppState.wkrdSelectedRows.has(row.id)
        );
        AppState.wkrdSelectedRows.clear();
        
        this.renderRows();
        this.autoSave();
    },

    saveDraft() {
        const success = Utils.saveToLocalStorage('aep_data_wkrd', AppState.wkrdData);
        if (success) {
            alert('Arkusz zapisany pomyślnie w localStorage');
        } else {
            alert('Błąd podczas zapisywania arkusza');
        }
    },

    autoSave() {
        Utils.saveToLocalStorage('aep_data_wkrd', AppState.wkrdData);
    },

    syncScrollbars() {
        const topScrollbar = document.getElementById('topScrollbarWKRD');
        const tableWrapper = document.getElementById('wkrdTableWrapper');
        const topScrollContent = topScrollbar?.querySelector('.top-scrollbar-content');

        if (!topScrollbar || !tableWrapper || !topScrollContent) return;

        const updateScrollbarWidth = () => {
            const table = tableWrapper.querySelector('table');
            if (table) {
                topScrollContent.style.width = table.offsetWidth + 'px';
            }
        };

        updateScrollbarWidth();
        window.addEventListener('resize', updateScrollbarWidth);

        topScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = topScrollbar.scrollLeft;
        });

        tableWrapper.addEventListener('scroll', () => {
            topScrollbar.scrollLeft = tableWrapper.scrollLeft;
        });
    }
};

// ============================================
// SANKCJE MANAGER
// ============================================
/**
 * Manager for Sankcje (Sanctions) module
 * @namespace SankcjeManager
 */
const SankcjeManager = {
    /**
     * Renders the Sankcje module view
     * @returns {void}
     */
    render() {
        const savedData = Utils.loadFromLocalStorage('aep_data_sankcje');
        AppState.sankcjeData = savedData || [];
        AppState.sankcjeSelectedRows.clear();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title">Sankcje</h1>
                </div>

                <div class="sankcje-toolbar">
                    <button class="btn-secondary" id="addSankcjeRow">
                        <i class="fas fa-plus"></i> Dodaj wiersz
                    </button>
                    <button class="btn-secondary" id="saveSankcjeDraft">
                        <i class="fas fa-save"></i> Zapisz arkusz
                    </button>
                    <button class="btn-secondary btn-danger" id="clearSankcjeData">
                        <i class="fas fa-trash"></i> Wyczyść zaznaczone
                    </button>
                    <div class="columns-toggle-wrapper">
                        <button class="btn-secondary" id="toggleSankcjeColumnsBtn">
                            <i class="fas fa-columns"></i> Widok <i class="fas fa-chevron-down"></i>
                        </button>
                        <div id="sankcjeColumnsDropdown" class="columns-dropdown hidden">
                            <div class="dropdown-header">Widoczność kolumn</div>
                            <div class="dropdown-section">
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> L.p. <span class="always-visible">(zawsze)</span>
                                </label>
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> Checkbox <span class="always-visible">(zawsze)</span>
                                </label>
                                <label class="column-item disabled">
                                    <input type="checkbox" checked disabled> Kopiuj <span class="always-visible">(zawsze)</span>
                                </label>
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-section" id="sankcjeColumnCheckboxes"></div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-actions">
                                <button class="btn-dropdown" id="showAllSankcjeColumns">
                                    <i class="fas fa-eye"></i> Pokaż wszystkie
                                </button>
                                <button class="btn-dropdown" id="hideAllSankcjeColumns">
                                    <i class="fas fa-eye-slash"></i> Ukryj wszystkie
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="date-filter-wrapper">
                        <button class="btn-secondary" id="toggleSankcjeDateFilterBtn">
                            <i class="fas fa-calendar-days"></i> Filtruj daty <i class="fas fa-chevron-down"></i>
                            <span id="sankcjeDateFilterBadge" class="filter-badge hidden"></span>
                        </button>
                        <button class="btn-secondary btn-clear-filter hidden" id="clearSankcjeDateFilterBtn">
                            <i class="fas fa-times"></i> Wyczyść filtr
                        </button>
                        <div id="sankcjeDateFilterDropdown" class="date-filter-dropdown hidden">
                            <div class="dropdown-header">Filtruj według dat</div>
                            <div class="dropdown-section">
                                <label class="filter-label">Data od:</label>
                                <input type="date" id="sankcjeDateFrom" class="date-input">
                                <label class="filter-label">Data do:</label>
                                <input type="date" id="sankcjeDateTo" class="date-input">
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-section">
                                <div class="quick-filters-label">Szybki wybór:</div>
                                <div class="quick-filters">
                                    <button class="btn-quick-filter" data-days="0">Dziś</button>
                                    <button class="btn-quick-filter" data-days="7">7 dni</button>
                                    <button class="btn-quick-filter" data-days="30">30 dni</button>
                                    <button class="btn-quick-filter" data-days="365">Rok</button>
                                </div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-actions">
                                <button class="btn-dropdown" id="applySankcjeDateFilter">
                                    <i class="fas fa-search"></i> Filtruj
                                </button>
                                <button class="btn-dropdown" id="clearSankcjeDateFilterDropdown">
                                    <i class="fas fa-times"></i> Wyczyść
                                </button>
                            </div>
                            <div id="sankcjeFilterResultInfo" class="filter-result-info hidden"></div>
                        </div>
                    </div>
                </div>

                <div id="sankcjeFilterInfoBar" class="filter-info-bar hidden"></div>

                <div class="top-scrollbar" id="topScrollbarSankcje">
                    <div class="top-scrollbar-content"></div>
                </div>

                <div class="sankcje-container">
                    <div class="sankcje-table-wrapper" id="sankcjeTableWrapper">
                        <table class="sankcje-table">
                            <thead>
                                <tr class="header-row-1">
                                    <th rowspan="2" class="col-lp">L.p.</th>
                                    <th rowspan="2" class="col-checkbox"><input type="checkbox" id="selectAllSankcje" class="row-checkbox"></th>
                                    <th rowspan="2" class="col-copy"><i class="fas fa-copy"></i></th>
                                    <th rowspan="2">Miesiąc</th>
                                    <th rowspan="2">Data</th>
                                    <th rowspan="2">Nr JW</th>
                                    <th rowspan="2">Nazwa JW</th>
                                    <th rowspan="2">Miejsce stacjonowania</th>
                                    <th rowspan="2">Podległość RSZ</th>
                                    <th rowspan="2">Grupa osobowa</th>
                                    <th rowspan="2">Legitymowany</th>
                                    <th colspan="4" class="group-header">Rodzaj pojazdu</th>
                                    <th rowspan="2" class="col-przyczyna">Przyczyna</th>
                                    <th colspan="6" class="group-header">Sankcja</th>
                                    <th rowspan="2">Wysokość mandatu (zł)</th>
                                    <th rowspan="2">W czasie służby</th>
                                    <th rowspan="2">JŻW Prowadząca</th>
                                    <th rowspan="2">Oddział</th>
                                </tr>
                                <tr class="header-row-2">
                                    <th class="col-razem">RAZEM</th>
                                    <th>WPM</th>
                                    <th>PPM</th>
                                    <th>Pieszy</th>
                                    <th class="col-razem">RAZEM</th>
                                    <th>Zatrz. DR</th>
                                    <th>Zatrz. PJ</th>
                                    <th>Mandat</th>
                                    <th>Poucz.</th>
                                    <th>Inne</th>
                                </tr>
                            </thead>
                            <tbody id="sankcjeTableBody">
                                <tr><td colspan="28" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Modal Przyczyna -->
                <div id="przyczynaModal" class="modal-overlay" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>PRZYCZYNA</h3>
                            <span class="modal-close" id="przyczynaModalClose">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="modal-subtitle" id="przyczynaModalSubtitle"></div>
                            <div class="modal-info">
                                <i class="fas fa-info-circle"></i> Wybierz <strong>JEDNĄ</strong> przyczynę
                            </div>
                            <div class="radio-list">
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="pod_wplywem_alk">
                                    <span>Pod wpływem alkoholu</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="nie_zapiecie_pasow">
                                    <span>Nie zapięcie pasów bezpieczeństwa</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="telefon_podczas_jazdy">
                                    <span>Korzystanie z telefonu komórkowego podczas jazdy</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="nie_stosowanie_znakow">
                                    <span>Nie stosowanie się do znaków i sygnałów drogowych</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="nie_zabezpieczony_ladunek">
                                    <span>Nie zabezpieczony lub niewłaściwie zabezpieczony ładunek</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="brak_dokumentow">
                                    <span>Brak wymaganych dokumentów pojazdów</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="wyposazenie_pojazdu">
                                    <span>Wyposażenie pojazdu</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="nie_korzystanie_swiatel">
                                    <span>Nie korzystanie z wymaganych przepisami świateł</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="parkowanie_niedozwolone">
                                    <span>Parkowanie i zatrzymanie w niedozwolonym miejscu</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="niesprawnosci_techniczne">
                                    <span>Niesprawności techniczne pojazdu</span>
                                </label>
                                <label class="radio-item">
                                    <input type="radio" name="przyczyna_radio" data-field="inne_przyczyna">
                                    <span>Inne</span>
                                </label>
                            </div>
                            <div class="modal-counter" id="przyczynaModalCounter">Nie wybrano przyczyny</div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" id="przyczynaModalCancel">Anuluj</button>
                            <button class="btn-primary" id="przyczynaModalConfirm">Zatwierdź</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('addSankcjeRow')?.addEventListener('click', () => this.addRow());
        document.getElementById('saveSankcjeDraft')?.addEventListener('click', () => this.saveDraft());
        document.getElementById('clearSankcjeData')?.addEventListener('click', () => this.clearSelected());
        document.getElementById('selectAllSankcje')?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        this.initColumnsDropdown();
        this.initDateFilter();

        if (AppState.sankcjeData.length > 0) {
            this.renderRows();
            this.syncScrollbars();
        }

        // Modal listeners
        document.getElementById('przyczynaModalClose')?.addEventListener('click', () => this.closePrzyczynaModal());
        document.getElementById('przyczynaModalCancel')?.addEventListener('click', () => this.closePrzyczynaModal());
        document.getElementById('przyczynaModalConfirm')?.addEventListener('click', () => this.confirmPrzyczynaModal());
        
        document.getElementById('przyczynaModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'przyczynaModal') {
                this.closePrzyczynaModal();
            }
        });
    },

    przyczynaTagsMap: {
        pod_wplywem_alk: 'Alkohol',
        nie_zapiecie_pasow: 'Pasy',
        telefon_podczas_jazdy: 'Telefon',
        nie_stosowanie_znakow: 'Znaki',
        nie_zabezpieczony_ladunek: 'Ładunek',
        brak_dokumentow: 'Dok.',
        wyposazenie_pojazdu: 'Wyposażenie',
        nie_korzystanie_swiatel: 'Światła',
        parkowanie_niedozwolone: 'Parkowanie',
        niesprawnosci_techniczne: 'Niespraw.',
        inne_przyczyna: 'Inne'
    },

    currentEditingRowId: null,

    openPrzyczynaModal(rowId) {
        this.currentEditingRowId = rowId;
        const row = AppState.sankcjeData.find(r => r.id === rowId);
        if (!row) return;

        const modal = document.getElementById('przyczynaModal');
        const subtitle = document.getElementById('przyczynaModalSubtitle');
        const rowIndex = AppState.sankcjeData.findIndex(r => r.id === rowId);
        
        subtitle.textContent = `Wiersz ${rowIndex + 1}`;

        const radios = modal.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            const field = radio.dataset.field;
            radio.checked = row[field] === 1;
        });

        this.updateModalCounter();
        modal.style.display = 'flex';

        radios.forEach(radio => {
            const newRadio = radio.cloneNode(true);
            radio.parentNode.replaceChild(newRadio, radio);
        });
        
        modal.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateModalCounter());
        });
    },

    updateModalCounter() {
        const modal = document.getElementById('przyczynaModal');
        const selectedRadio = modal.querySelector('input[type="radio"]:checked');
        const counter = document.getElementById('przyczynaModalCounter');
        
        if (selectedRadio) {
            const field = selectedRadio.dataset.field;
            counter.textContent = `Wybrano: ${this.przyczynaTagsMap[field]}`;
            counter.style.color = 'var(--accent)';
        } else {
            counter.textContent = 'Nie wybrano przyczyny';
            counter.style.color = 'var(--muted)';
        }
    },

    closePrzyczynaModal() {
        document.getElementById('przyczynaModal').style.display = 'none';
        this.currentEditingRowId = null;
    },

    confirmPrzyczynaModal() {
        if (this.currentEditingRowId === null) return;

        const row = AppState.sankcjeData.find(r => r.id === this.currentEditingRowId);
        if (!row) return;

        const modal = document.getElementById('przyczynaModal');
        const selectedRadio = modal.querySelector('input[type="radio"]:checked');

        if (!selectedRadio) {
            alert('Wybierz przyczynę!');
            return;
        }

        const allFields = Object.keys(this.przyczynaTagsMap);
        allFields.forEach(field => row[field] = 0);

        row[selectedRadio.dataset.field] = 1;

        this.closePrzyczynaModal();
        this.renderRows();
        this.autoSave();
    },

    removePrzyczynaTag(rowId, field) {
        const row = AppState.sankcjeData.find(r => r.id === rowId);
        if (row) {
            row[field] = 0;
            this.renderRows();
            this.autoSave();
        }
    },

    duplicateRow(rowId) {
        const sourceRow = AppState.sankcjeData.find(r => r.id === rowId);
        if (!sourceRow) return;
        
        const newId = AppState.sankcjeData.length > 0 ? 
            Math.max(...AppState.sankcjeData.map(r => r.id)) + 1 : 1;
        
        const newRow = {
            id: newId,
            isMainRow: false,
            groupId: sourceRow.groupId || sourceRow.id,
            parentId: sourceRow.id,
            data: null,
            nr_jw: null,
            nazwa_jw: null,
            miejsce: null,
            podleglosc: null,
            grupa: null,
            legitymowany: sourceRow.legitymowany,
            wpm: 0,
            ppm: 0,
            pieszy: 0,
            pod_wplywem_alk: 0,
            nie_zapiecie_pasow: 0,
            telefon_podczas_jazdy: 0,
            nie_stosowanie_znakow: 0,
            nie_zabezpieczony_ladunek: 0,
            brak_dokumentow: 0,
            wyposazenie_pojazdu: 0,
            nie_korzystanie_swiatel: 0,
            parkowanie_niedozwolone: 0,
            niesprawnosci_techniczne: 0,
            inne_przyczyna: 0,
            sankcja_razem: 0,
            zatrzymanie_dr: 0,
            zatrzymanie_pj: 0,
            mandat_bool: false,
            pouczenie: 0,
            inne_sankcja: 0,
            wysokosc_mandatu: '',
            w_czasie_sluzby: sourceRow.w_czasie_sluzby,
            jzw_prowadzaca: sourceRow.jzw_prowadzaca,
            oddzial: sourceRow.oddzial
        };
        
        if (!sourceRow.groupId) sourceRow.groupId = sourceRow.id;
        if (sourceRow.isMainRow === undefined) sourceRow.isMainRow = true;
        
        const sourceIndex = AppState.sankcjeData.findIndex(r => r.id === rowId);
        AppState.sankcjeData.splice(sourceIndex + 1, 0, newRow);
        
        this.renderRows();
        this.autoSave();
    },

    initColumnsDropdown() {
        const toggleBtn = document.getElementById('toggleSankcjeColumnsBtn');
        const dropdown = document.getElementById('sankcjeColumnsDropdown');
        const checkboxesContainer = document.getElementById('sankcjeColumnCheckboxes');
        const showAllBtn = document.getElementById('showAllSankcjeColumns');
        const hideAllBtn = document.getElementById('hideAllSankcjeColumns');

        const saved = Utils.loadFromLocalStorage('sankcje_visible_columns');
        if (saved) {
            AppState.sankcjeVisibleColumns = saved;
        }

        const columns = [
            { key: 'month', label: 'Miesiąc' },
            { key: 'data', label: 'Data' },
            { key: 'nr_jw', label: 'Nr JW' },
            { key: 'nazwa_jw', label: 'Nazwa JW' },
            { key: 'miejsce', label: 'Miejsce stacjonowania' },
            { key: 'podleglosc', label: 'Podległość RSZ' },
            { key: 'grupa', label: 'Grupa osobowa' },
            { key: 'legitymowany', label: 'Legitymowany' },
            { key: 'rodzaj_razem', label: 'Rodzaj pojazdu - RAZEM' },
            { key: 'wpm', label: 'WPM' },
            { key: 'ppm', label: 'PPM' },
            { key: 'pieszy', label: 'Pieszy' },
            { key: 'przyczyna', label: 'Przyczyna' },
            { key: 'sankcja_razem', label: 'Sankcja - RAZEM' },
            { key: 'zatrzymanie_dr', label: 'Zatrzymanie DR' },
            { key: 'zatrzymanie_pj', label: 'Zatrzymanie PJ' },
            { key: 'mandat', label: 'Mandat' },
            { key: 'pouczenie', label: 'Pouczenie' },
            { key: 'inne', label: 'Inne' },
            { key: 'wysokosc_mandatu', label: 'Wysokość mandatu' },
            { key: 'w_czasie_sluzby', label: 'W czasie służby' },
            { key: 'jzw_prowadzaca', label: 'JŻW Prowadząca' },
            { key: 'oddzial', label: 'Oddział' }
        ];

        checkboxesContainer.innerHTML = columns.map(col => `
            <label class="column-item">
                <input type="checkbox" 
                       data-column="${col.key}" 
                       ${AppState.sankcjeVisibleColumns[col.key] ? 'checked' : ''}>
                ${col.label}
            </label>
        `).join('');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const column = e.target.dataset.column;
                AppState.sankcjeVisibleColumns[column] = e.target.checked;
                this.applyColumnVisibility();
                Utils.saveToLocalStorage('sankcje_visible_columns', AppState.sankcjeVisibleColumns);
            });
        });

        showAllBtn?.addEventListener('click', () => {
            Object.keys(AppState.sankcjeVisibleColumns).forEach(key => {
                if (key !== 'lp' && key !== 'checkbox' && key !== 'copy') {
                    AppState.sankcjeVisibleColumns[key] = true;
                }
            });
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = true;
            });
            this.applyColumnVisibility();
            Utils.saveToLocalStorage('sankcje_visible_columns', AppState.sankcjeVisibleColumns);
        });

        hideAllBtn?.addEventListener('click', () => {
            Object.keys(AppState.sankcjeVisibleColumns).forEach(key => {
                if (key !== 'lp' && key !== 'checkbox' && key !== 'copy') {
                    AppState.sankcjeVisibleColumns[key] = false;
                }
            });
            checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            this.applyColumnVisibility();
            Utils.saveToLocalStorage('sankcje_visible_columns', AppState.sankcjeVisibleColumns);
        });

        this.applyColumnVisibility();
    },

    applyColumnVisibility() {
        const table = document.querySelector('.sankcje-table');
        if (!table) return;

        const columnMap = {
            'month': 3,
            'data': 4,
            'nr_jw': 5,
            'nazwa_jw': 6,
            'miejsce': 7,
            'podleglosc': 8,
            'grupa': 9,
            'legitymowany': 10,
            'rodzaj_razem': 11,
            'wpm': 12,
            'ppm': 13,
            'pieszy': 14,
            'przyczyna': 15,
            'sankcja_razem': 16,
            'zatrzymanie_dr': 17,
            'zatrzymanie_pj': 18,
            'mandat': 19,
            'pouczenie': 20,
            'inne': 21,
            'wysokosc_mandatu': 22,
            'w_czasie_sluzby': 23,
            'jzw_prowadzaca': 24,
            'oddzial': 25
        };

        Object.keys(columnMap).forEach(key => {
            const index = columnMap[key];
            const isVisible = AppState.sankcjeVisibleColumns[key];
            
            const headerCells = table.querySelectorAll(`thead tr th:nth-child(${index + 1})`);
            headerCells.forEach(cell => {
                cell.style.display = isVisible ? '' : 'none';
            });

            const bodyCells = table.querySelectorAll(`tbody tr td:nth-child(${index + 1})`);
            bodyCells.forEach(cell => {
                cell.style.display = isVisible ? '' : 'none';
            });
        });
    },

    initDateFilter() {
        const toggleBtn = document.getElementById('toggleSankcjeDateFilterBtn');
        const dropdown = document.getElementById('sankcjeDateFilterDropdown');
        const dateFromInput = document.getElementById('sankcjeDateFrom');
        const dateToInput = document.getElementById('sankcjeDateTo');
        const applyBtn = document.getElementById('applySankcjeDateFilter');
        const clearDropdownBtn = document.getElementById('clearSankcjeDateFilterDropdown');
        const clearFilterBtn = document.getElementById('clearSankcjeDateFilterBtn');
        const filterBadge = document.getElementById('sankcjeDateFilterBadge');
        const filterInfoBar = document.getElementById('sankcjeFilterInfoBar');
        const filterResultInfo = document.getElementById('sankcjeFilterResultInfo');
        const quickFilterBtns = dropdown?.querySelectorAll('.btn-quick-filter');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        quickFilterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const today = new Date();
                const from = new Date(today);
                
                if (days === 0) {
                    from.setHours(0, 0, 0, 0);
                } else {
                    from.setDate(today.getDate() - days);
                }

                dateFromInput.value = this.dateToInputFormat(from);
                dateToInput.value = this.dateToInputFormat(today);
            });
        });

        applyBtn?.addEventListener('click', () => {
            const from = dateFromInput.value;
            const to = dateToInput.value;

            if (!from || !to) {
                alert('Proszę wybrać obie daty');
                return;
            }

            const dateFrom = new Date(from);
            const dateTo = new Date(to);
            
            dateFrom.setHours(0, 0, 0, 0);
            dateTo.setHours(23, 59, 59, 999);

            if (dateFrom > dateTo) {
                alert('Data "od" nie może być późniejsza niż data "do"');
                return;
            }

            AppState.sankcjeDateFilter.active = true;
            AppState.sankcjeDateFilter.dateFrom = dateFrom;
            AppState.sankcjeDateFilter.dateTo = dateTo;

            this.applyDateFilter();
            dropdown.classList.add('hidden');
        });

        clearDropdownBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });

        clearFilterBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });
    },

    dateToInputFormat(date) {
        if (!date) return '';
        if (typeof date === 'string') {
            const parts = date.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return date;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    parsePolishDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    },

    getMonthFromDate(dateStr) {
        const monthsShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 
                            'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
        if (!dateStr) return '—';
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const month = parseInt(parts[1], 10) - 1;
            return monthsShort[month] || '—';
        }
        return '—';
    },

    applyDateFilter() {
        const { dateFrom, dateTo } = AppState.sankcjeDateFilter;
        
        let matchCount = 0;
        const totalCount = AppState.sankcjeData.filter(r => r.isMainRow !== false).length;

        AppState.sankcjeData.forEach((row) => {
            if (row.isMainRow === false) return;
            
            const rowDate = this.parsePolishDate(row.data);
            if (rowDate && rowDate >= dateFrom && rowDate <= dateTo) {
                matchCount++;
            }
        });

        const filterBadge = document.getElementById('sankcjeDateFilterBadge');
        const filterInfoBar = document.getElementById('sankcjeFilterInfoBar');
        const clearFilterBtn = document.getElementById('clearSankcjeDateFilterBtn');
        const filterResultInfo = document.getElementById('sankcjeFilterResultInfo');

        if (matchCount > 0) {
            filterBadge.textContent = `(${matchCount})`;
            filterBadge.classList.remove('hidden');
        } else {
            filterBadge.classList.add('hidden');
        }

        const fromStr = dateFrom.toLocaleDateString('pl-PL');
        const toStr = dateTo.toLocaleDateString('pl-PL');
        
        if (matchCount > 0) {
            filterInfoBar.innerHTML = `
                <i class="fas fa-info-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> sankcji z <strong>${totalCount}</strong> 
                (od ${fromStr} do ${toStr})
            `;
            filterInfoBar.style.background = 'rgba(76, 175, 80, 0.1)';
            filterInfoBar.style.color = '#4caf50';
        } else {
            filterInfoBar.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Nie znaleziono sankcji w zakresie od ${fromStr} do ${toStr}
            `;
            filterInfoBar.style.background = 'rgba(255, 152, 0, 0.1)';
            filterInfoBar.style.color = '#ff9800';
        }
        filterInfoBar.classList.remove('hidden');

        if (matchCount > 0) {
            filterResultInfo.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> sankcji
            `;
            filterResultInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            filterResultInfo.style.color = '#4caf50';
        } else {
            filterResultInfo.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Brak sankcji w tym zakresie
            `;
            filterResultInfo.style.background = 'rgba(255, 152, 0, 0.1)';
            filterResultInfo.style.color = '#ff9800';
        }
        filterResultInfo.classList.remove('hidden');

        clearFilterBtn.classList.remove('hidden');
        this.renderRows();
    },

    clearDateFilter() {
        AppState.sankcjeDateFilter.active = false;
        AppState.sankcjeDateFilter.dateFrom = null;
        AppState.sankcjeDateFilter.dateTo = null;

        const filterBadge = document.getElementById('sankcjeDateFilterBadge');
        const filterInfoBar = document.getElementById('sankcjeFilterInfoBar');
        const clearFilterBtn = document.getElementById('clearSankcjeDateFilterBtn');
        const filterResultInfo = document.getElementById('sankcjeFilterResultInfo');

        filterBadge?.classList.add('hidden');
        filterInfoBar?.classList.add('hidden');
        clearFilterBtn?.classList.add('hidden');
        filterResultInfo?.classList.add('hidden');

        this.renderRows();
    },

    getRowGroup(row) {
        if (row.groupId) {
            return row.groupId;
        }
        return `${row.data}_${row.nr_jw}_${row.miejsce}`;
    },

    addRow() {
        const today = new Date();
        const todayPolish = today.toLocaleDateString('pl-PL');
        
        const newId = AppState.sankcjeData.length > 0 ? 
            Math.max(...AppState.sankcjeData.map(r => r.id)) + 1 : 1;
        
        const newRow = {
            id: newId,
            isMainRow: true,
            groupId: newId,
            data: todayPolish,
            nr_jw: '',
            nazwa_jw: '',
            miejsce: '',
            podleglosc: '',
            grupa: '',
            legitymowany: false,
            rodzaj_razem: 0,
            wpm: 0,
            ppm: 0,
            pieszy: 0,
            przyczyna_razem: 0,
            pod_wplywem_alk: 0,
            nie_zapiecie_pasow: 0,
            telefon_podczas_jazdy: 0,
            nie_stosowanie_znakow: 0,
            nie_zabezpieczony_ladunek: 0,
            brak_dokumentow: 0,
            wyposazenie_pojazdu: 0,
            nie_korzystanie_swiatel: 0,
            parkowanie_niedozwolone: 0,
            niesprawnosci_techniczne: 0,
            inne_przyczyna: 0,
            sankcja_razem: 0,
            zatrzymanie_dr: 0,
            zatrzymanie_pj: 0,
            mandat_bool: false,
            pouczenie: 0,
            inne_sankcja: 0,
            wysokosc_mandatu: '',
            w_czasie_sluzby: false,
            jzw_prowadzaca: 'OŻW Elbląg',
            oddzial: 'Elbląg'
        };

        AppState.sankcjeData.push(newRow);
        this.renderRows();
        this.autoSave();
    },

    toggleRowSelect(id, checked) {
        if (checked) {
            AppState.sankcjeSelectedRows.add(id);
        } else {
            AppState.sankcjeSelectedRows.delete(id);
        }
        this.renderRows();
    },

    toggleSelectAll(checked) {
        if (checked) {
            AppState.sankcjeData.forEach(row => AppState.sankcjeSelectedRows.add(row.id));
        } else {
            AppState.sankcjeSelectedRows.clear();
        }
        this.renderRows();
    },

    clearSelected() {
        if (AppState.sankcjeSelectedRows.size === 0) {
            alert('Nie zaznaczono żadnych wierszy');
            return;
        }

        if (!confirm(`Czy na pewno usunąć ${AppState.sankcjeSelectedRows.size} zaznaczonych wierszy?`)) {
            return;
        }

        AppState.sankcjeData = AppState.sankcjeData.filter(
            row => !AppState.sankcjeSelectedRows.has(row.id)
        );
        AppState.sankcjeSelectedRows.clear();
        
        this.renderRows();
        this.autoSave();
    },

    countValidationErrors() {
        // Używa ValidationEngine
        return ValidationEngine.countErrors('sankcje', AppState.sankcjeData);
    },

    updateToolbarState() {
        const errorCount = this.countValidationErrors();
        const hasErrors = errorCount > 0;

        // Aktualizuj przyciski
        const saveBtn = document.getElementById('saveSankcjeDraft');
        const errorDisplay = document.getElementById('sankcjeErrorCount');

        if (saveBtn) {
            saveBtn.disabled = hasErrors;
            saveBtn.style.opacity = hasErrors ? '0.5' : '1';
            saveBtn.style.cursor = hasErrors ? 'not-allowed' : 'pointer';
        }

        // Pokaż licznik błędów
        if (errorDisplay) {
            if (hasErrors) {
                errorDisplay.textContent = `❌ Błędów walidacji: ${errorCount}`;
                errorDisplay.style.display = 'block';
            } else {
                errorDisplay.style.display = 'none';
            }
        }
    },

    saveDraft() {
        const errorCount = this.countValidationErrors();
        if (errorCount > 0) {
            alert(`❌ Nie można zapisać arkusza!\n\nZnaleziono ${errorCount} błędów walidacji.\n\nPopraw błędy przed zapisaniem:\n• Jeśli zaznaczono przyczynę,\n  należy wybrać sankcję`);
            return;
        }

        const success = Utils.saveToLocalStorage('aep_data_sankcje', AppState.sankcjeData);
        if (success) {
            alert('Arkusz zapisany pomyślnie');
        } else {
            alert('Błąd podczas zapisywania');
        }
    },

    autoSave() {
        Utils.saveToLocalStorage('aep_data_sankcje', AppState.sankcjeData);
    },

    renderRows() {
        const tbody = document.getElementById('sankcjeTableBody');
        if (!tbody) return;

        if (AppState.sankcjeData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="28" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>';
            return;
        }

        // Filtrowanie dat
        let dataToRender = AppState.sankcjeData;
        if (AppState.sankcjeDateFilter.active) {
            const { dateFrom, dateTo } = AppState.sankcjeDateFilter;
            const matchingMainRowIds = new Set();
            
            AppState.sankcjeData.forEach(row => {
                if (row.isMainRow !== false) {
                    const rowDate = this.parsePolishDate(row.data);
                    if (rowDate && rowDate >= dateFrom && rowDate <= dateTo) {
                        matchingMainRowIds.add(row.groupId || row.id);
                    }
                }
            });
            
            dataToRender = AppState.sankcjeData.filter(row => {
                const groupId = row.groupId || row.id;
                return matchingMainRowIds.has(groupId);
            });
        }

        if (dataToRender.length === 0) {
            tbody.innerHTML = '<tr><td colspan="28" class="empty-message">Brak danych spełniających kryteria filtra dat.</td></tr>';
            return;
        }

        const nrJWOptions = Array.from({length: 99}, (_, i) => String(i + 1));
        const nazwaJWOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
        const miejsceOptions = Array.from({length: 9}, (_, i) => `Nazwa ${String(i + 1).padStart(2, '0')}`);
        const podlegloscOptions = ['WL', 'WOT', 'WS', 'MW', 'ŻW', 'SP'];
        const grupaOptions = ['szeregowy', 'podoficer', 'oficer', 'generał/admirał'];
        const jzwOptions = ['Elbląg', 'Gdynia', 'Bemowo Piskie', 'Bartoszyce', 'Braniewo', 'Malbork', 'Morąg', 'Giżycko'];
        const oddzialOptions = ['Elbląg', 'Szczecin', 'Lublin', 'Bydgoszcz', 'Kraków', 'Żagań', 'Warszawa', 'Łódź', 'Mińsk Mazowiecki'];

        tbody.innerHTML = dataToRender.map((row, index) => {
            const isMainRow = row.isMainRow !== false;
            const isChildRow = row.isMainRow === false;
            const lp = isMainRow ? dataToRender.filter((r, i) => i <= index && r.isMainRow !== false).length : '';
            
            const isSelected = AppState.sankcjeSelectedRows.has(row.id);
            
            const groupId = this.getRowGroup(row);
            const groupRows = dataToRender.filter(r => this.getRowGroup(r) === groupId);
            const allGroups = [...new Set(dataToRender.map(r => this.getRowGroup(r)))];
            const currentGroupIndex = allGroups.indexOf(groupId);
            const groupClass = currentGroupIndex % 2 === 0 ? 'row-group-a' : 'row-group-b';
            
            // RAZEM - suma dla całej grupy (główny + podwiersze)
            const rodzajRazem = groupRows.reduce((sum, r) => 
                sum + (parseInt(r.wpm) || 0) + (parseInt(r.ppm) || 0) + (parseInt(r.pieszy) || 0), 0);
            const sankcjaRazem = groupRows.reduce((sum, r) => 
                sum + (parseInt(r.zatrzymanie_dr) || 0) + (parseInt(r.zatrzymanie_pj) || 0) + 
                (r.mandat_bool ? 1 : 0) + (parseInt(r.pouczenie) || 0) + (parseInt(r.inne_sankcja) || 0), 0);
            
            const month = this.getMonthFromDate(row.data);
            
            // Przyczyna tags
            const przyczynyFields = Object.keys(this.przyczynaTagsMap);
            const activePrzyczyny = przyczynyFields.filter(field => row[field] === 1);
            const przyczynyTags = activePrzyczyny.map(field => 
                `<span class="przyczyna-tag" title="${this.przyczynaTagsMap[field]}">
                    ${this.przyczynaTagsMap[field]}
                    <i class="fas fa-times" onclick="SankcjeManager.removePrzyczynaTag(${row.id}, '${field}')"></i>
                </span>`
            ).join(' ');

            const rowTypeClass = isChildRow ? 'child-row' : 'main-row';

            return `
                <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''} ${groupClass} ${rowTypeClass}">
                    <td class="col-lp">${lp}</td>
                    <td class="col-checkbox">
                        <input type="checkbox" 
                               class="row-checkbox" 
                               ${isSelected ? 'checked' : ''}
                               onchange="SankcjeManager.toggleRowSelect(${row.id}, this.checked)">
                    </td>
                    <td class="col-copy">
                        <button class="btn-copy-row" onclick="SankcjeManager.duplicateRow(${row.id})" title="Duplikuj wiersz">
                            <i class="fas fa-copy"></i>
                        </button>
                    </td>
                    <td>${isMainRow ? month : '—'}</td>
                    <td>
                        ${isMainRow ? `
                            <input type="date" 
                                   value="${this.dateToInputFormat(row.data)}"
                                   onchange="SankcjeManager.updateField(${row.id}, 'data', this.value)"
                                   class="cell-input">
                        ` : '—'}
                    </td>
                    <td>
                        ${isMainRow ? `
                            <select onchange="SankcjeManager.updateField(${row.id}, 'nr_jw', this.value)" class="cell-select">
                                <option value="">-</option>
                                ${nrJWOptions.map(opt => `<option value="${opt}" ${row.nr_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>
                        ` : '—'}
                    </td>
                    <td>
                        ${isMainRow ? `
                            <select onchange="SankcjeManager.updateField(${row.id}, 'nazwa_jw', this.value)" class="cell-select">
                                <option value="">-</option>
                                ${nazwaJWOptions.map(opt => `<option value="${opt}" ${row.nazwa_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>
                        ` : '—'}
                    </td>
                    <td>
                        ${isMainRow ? `
                            <select onchange="SankcjeManager.updateField(${row.id}, 'miejsce', this.value)" class="cell-select">
                                <option value="">-</option>
                                ${miejsceOptions.map(opt => `<option value="${opt}" ${row.miejsce === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>
                        ` : '—'}
                    </td>
                    <td>
                        ${isMainRow ? `
                            <select onchange="SankcjeManager.updateField(${row.id}, 'podleglosc', this.value)" class="cell-select">
                                <option value="">-</option>
                                ${podlegloscOptions.map(opt => `<option value="${opt}" ${row.podleglosc === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>
                        ` : '—'}
                    </td>
                    <td>
                        ${isMainRow ? `
                            <select onchange="SankcjeManager.updateField(${row.id}, 'grupa', this.value)" class="cell-select">
                                <option value="">-</option>
                                ${grupaOptions.map(opt => `<option value="${opt}" ${row.grupa === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>
                        ` : '—'}
                    </td>
                    <td>
                        ${isMainRow ? `
                            <input type="checkbox" 
                                   ${row.legitymowany ? 'checked' : ''}
                                   onchange="SankcjeManager.updateField(${row.id}, 'legitymowany', this.checked)">
                        ` : `
                            <input type="checkbox" 
                                   ${row.legitymowany ? 'checked' : ''}
                                   disabled
                                   title="Dziedziczone z wiersza głównego">
                        `}
                    </td>
                    <td class="col-razem">${rodzajRazem}</td>
                    <td>
                        <input type="number" 
                               value="${row.wpm || 0}" 
                               min="0"
                               onchange="SankcjeManager.updateField(${row.id}, 'wpm', this.value)"
                               class="cell-input-number">
                    </td>
                    <td>
                        <input type="number" 
                               value="${row.ppm || 0}" 
                               min="0"
                               onchange="SankcjeManager.updateField(${row.id}, 'ppm', this.value)"
                               class="cell-input-number">
                    </td>
                    <td>
                        <input type="number" 
                               value="${row.pieszy || 0}" 
                               min="0"
                               onchange="SankcjeManager.updateField(${row.id}, 'pieszy', this.value)"
                               class="cell-input-number">
                    </td>
                    <td class="col-przyczyna">
                        <button class="btn-select-przyczyna" onclick="SankcjeManager.openPrzyczynaModal(${row.id})">
                            <i class="fas fa-edit"></i> ${przyczynyTags || 'Wybierz'}
                        </button>
                    </td>
                    <td class="col-razem">${sankcjaRazem}</td>
                    <td>
                        <input type="number" 
                               value="${row.zatrzymanie_dr || 0}" 
                               min="0"
                               onchange="SankcjeManager.updateField(${row.id}, 'zatrzymanie_dr', this.value)"
                               class="cell-input-number">
                    </td>
                    <td>
                        <input type="number" 
                               value="${row.zatrzymanie_pj || 0}" 
                               min="0"
                               onchange="SankcjeManager.updateField(${row.id}, 'zatrzymanie_pj', this.value)"
                               class="cell-input-number">
                    </td>
                    <td>
                        <input type="checkbox" 
                               ${row.mandat_bool ? 'checked' : ''}
                               onchange="SankcjeManager.updateField(${row.id}, 'mandat_bool', this.checked)">
                    </td>
                    <td>
                        <input type="number" 
                               value="${row.pouczenie || 0}" 
                               min="0"
                               onchange="SankcjeManager.updateField(${row.id}, 'pouczenie', this.value)"
                               class="cell-input-number">
                    </td>
                    <td>
                        <input type="number" 
                               value="${row.inne_sankcja || 0}" 
                               min="0"
                               onchange="SankcjeManager.updateField(${row.id}, 'inne_sankcja', this.value)"
                               class="cell-input-number">
                    </td>
                    <td>
                        <input type="text" 
                               value="${row.wysokosc_mandatu || ''}" 
                               placeholder="0 zł"
                               onchange="SankcjeManager.updateField(${row.id}, 'wysokosc_mandatu', this.value)"
                               class="cell-input-small">
                    </td>
                    <td>
                        <input type="checkbox" ${row.w_czasie_sluzby ? 'checked' : ''}
                               onchange="SankcjeManager.updateField(${row.id}, 'w_czasie_sluzby', this.checked)">
                    </td>
                    <td>
                        <select onchange="SankcjeManager.updateField(${row.id}, 'jzw_prowadzaca', this.value)" class="cell-select">
                            <option value="">-</option>
                            ${jzwOptions.map(opt => `<option value="${opt}" ${row.jzw_prowadzaca === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td>
                        <select onchange="SankcjeManager.updateField(${row.id}, 'oddzial', this.value)" class="cell-select">
                            <option value="">-</option>
                            ${oddzialOptions.map(opt => `<option value="${opt}" ${row.oddzial === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
    },

    updateField(id, field, value) {
        const row = AppState.sankcjeData.find(r => r.id === id);
        if (row) {
            if (field === 'data' && value) {
                const date = new Date(value);
                row.data = date.toLocaleDateString('pl-PL');
            } else if (field === 'mandat_bool') {
                row[field] = value;
            } else {
                row[field] = value;
            }
            
            // Sync legitymowany z głównego do podwierszy
            if (field === 'legitymowany' && row.isMainRow !== false) {
                const groupId = row.groupId || row.id;
                AppState.sankcjeData.forEach(r => {
                    if (r.isMainRow === false && r.groupId === groupId) {
                        r.legitymowany = value;
                    }
                });
            }

            // REAL-TIME WALIDACJA przy zmianie pól Przyczyna lub Sankcja
            const isPrzyczynaField = ['pod_wplywem_alk', 'nie_zapiecie_pasow', 'telefon_podczas_jazdy',
                                      'nie_stosowanie_znakow', 'nie_zabezpieczony_ladunek', 'brak_dokumentow',
                                      'wyposazenie_pojazdu', 'nie_korzystanie_swiatel', 'parkowanie_niedozwolone',
                                      'niesprawnosci_techniczne', 'inne_przyczyna'].includes(field);
            const isSankcjaField = ['zatrzymanie_dr', 'zatrzymanie_pj', 'mandat_bool', 'pouczenie', 'inne_sankcja'].includes(field);

            if (isPrzyczynaField || isSankcjaField) {
                const validation = ValidationEngine.validateRow('sankcje', row);
                if (!validation.valid) {
                    const rowIndex = AppState.sankcjeData.findIndex(r => r.id === id);
                    const dependencyError = validation.errors.find(e => e.type === 'dependency');
                    if (dependencyError) {
                        setTimeout(() => {
                            alert(`BŁĄD W WIERSZU ${rowIndex + 1}\n\n${dependencyError.message}!\n\nWybierz przynajmniej jedną sankcję:\n• Zatrzymanie DR\n• Zatrzymanie PJ\n• Mandat\n• Pouczenie\n• Inne`);
                        }, 100);
                    }
                }
            }

            // Auto-oblicz pola RAZEM używając CalculationEngine
            CalculationEngine.calculate('sankcje', row);

            this.renderRows();
            this.updateToolbarState();
            this.autoSave();
        }
    },

    syncScrollbars() {
        const topScrollbar = document.getElementById('topScrollbarSankcje');
        const tableWrapper = document.getElementById('sankcjeTableWrapper');
        const topScrollContent = topScrollbar?.querySelector('.top-scrollbar-content');

        if (!topScrollbar || !tableWrapper || !topScrollContent) return;

        const updateScrollbarWidth = () => {
            const table = tableWrapper.querySelector('table');
            if (table) {
                topScrollContent.style.width = table.offsetWidth + 'px';
            }
        };

        updateScrollbarWidth();
        window.addEventListener('resize', updateScrollbarWidth);

        topScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = topScrollbar.scrollLeft;
        });

        tableWrapper.addEventListener('scroll', () => {
            topScrollbar.scrollLeft = tableWrapper.scrollLeft;
        });
    }
};

// ============================================
// KONWOJE MANAGER
// ============================================
const KonwojeManager = createBaseTableManager({
    module: 'konwoje',
    dataKey: 'konwojeData',
    selectedRowsKey: 'konwojeSelectedRows',
    storageKey: 'aep_data_konwoje',
    tableBodyId: 'konwojeTableBody',
    emptyMessage: 'Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.',

    defaultRow: (id, date) => ({
        id: id,
        data: date,
        miejscowy: 0,
        zamiejscowy: 0,
        ilosc_zw: 0,
        ilosc_wpm: 0,
        prokuratura: 0,
        sad: 0,
        wlasne: 0,
        jzw: '',
        dokumenty: 0,
        osoby: 0,
        przedmioty: 0,
        jw_prowadzaca: 'OŻW Elbląg',
        oddzial: 'Elbląg'
    }),

    renderRowHTML: () => {
        // Ta metoda nie jest używana - KonwojeManager używa własnej metody renderRows()
        return '';
    },

    customMethods: {
        render: function() {
            const savedData = Utils.loadFromLocalStorage('aep_data_konwoje');
            AppState.konwojeData = savedData || [];
            AppState.konwojeSelectedRows.clear();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title">Konwoje</h1>
                </div>

                <div class="konwoje-toolbar">
                    <button class="btn-secondary" id="addKonwojeRow">
                        <i class="fas fa-plus"></i> Dodaj wiersz
                    </button>
                    <button class="btn-secondary" id="saveKonwojeDraft">
                        <i class="fas fa-save"></i> Zapisz arkusz
                    </button>
                    <button class="btn-secondary btn-danger" id="clearKonwojeData" ${AppState.konwojeData.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Wyczyść zaznaczone
                    </button>
                    
                    <div class="toolbar-spacer"></div>
                    
                    <div class="date-filter-wrapper">
                        <button class="btn-secondary" id="toggleKonwojeDateFilterBtn">
                            <i class="fas fa-calendar-alt"></i> Filtruj daty
                            <span id="konwojeDateFilterBadge" class="filter-badge hidden"></span>
                        </button>
                        
                        <div class="date-filter-dropdown hidden" id="konwojeDateFilterDropdown">
                            <div class="dropdown-header">
                                <i class="fas fa-calendar-alt"></i> Filtrowanie po dacie
                            </div>
                            <div class="dropdown-body">
                                <label>Data od:</label>
                                <input type="date" id="konwojeDateFrom" class="date-input">
                                <label>Data do:</label>
                                <input type="date" id="konwojeDateTo" class="date-input">
                                <div class="quick-filters">
                                    <button class="btn-quick-filter" data-days="0">Dziś</button>
                                    <button class="btn-quick-filter" data-days="7">7 dni</button>
                                    <button class="btn-quick-filter" data-days="30">30 dni</button>
                                    <button class="btn-quick-filter" data-days="90">90 dni</button>
                                </div>
                                <div id="konwojeFilterResultInfo" class="filter-result-info hidden"></div>
                                <div class="dropdown-actions">
                                    <button class="btn-secondary btn-sm" id="applyKonwojeDateFilter">
                                        <i class="fas fa-check"></i> Zastosuj
                                    </button>
                                    <button class="btn-secondary btn-sm" id="clearKonwojeDateFilterDropdown">
                                        <i class="fas fa-times"></i> Wyczyść
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div id="konwojeFilterInfoBar" class="filter-info-bar hidden"></div>

                <div class="top-scrollbar" id="topScrollbar">
                    <div class="top-scrollbar-content"></div>
                </div>

                <div class="konwoje-table-wrapper" id="konwojeTableWrapper">
                    <table class="konwoje-table">
                        <thead>
                            <tr>
                                <th rowspan="2" class="col-sticky-left col-lp">L.p.</th>
                                <th rowspan="2" class="col-sticky-left2 col-checkbox">
                                    <input type="checkbox" id="selectAllKonwoje" class="row-checkbox">
                                </th>
                                <th rowspan="2" class="col-month">Miesiąc</th>
                                <th rowspan="2" class="col-data">Data</th>
                                <th colspan="3" class="col-group-header">Rodzaj konwoju</th>
                                <th rowspan="2" class="col-number">Ilość ŻW</th>
                                <th rowspan="2" class="col-number">Ilość WPM</th>
                                <th colspan="5" class="col-group-header">Zleceniodawca</th>
                                <th colspan="4" class="col-group-header">Co konwojowano</th>
                                <th rowspan="2" class="col-select">JW prowadząca</th>
                                <th rowspan="2" class="col-select">Oddział</th>
                            </tr>
                            <tr>
                                <th class="col-number col-razem">RAZEM</th>
                                <th class="col-number">Miejscowy</th>
                                <th class="col-number">Zamiejscowy</th>
                                <th class="col-number col-razem">RAZEM</th>
                                <th class="col-number">Prokuratura</th>
                                <th class="col-number">Sąd</th>
                                <th class="col-number">Własne</th>
                                <th class="col-number">JŻW</th>
                                <th class="col-number col-razem">RAZEM</th>
                                <th class="col-number">Dokumenty</th>
                                <th class="col-number">Osoby</th>
                                <th class="col-number">Przedmioty</th>
                            </tr>
                        </thead>
                        <tbody id="konwojeTableBody">
                            <!-- Dynamic rows -->
                        </tbody>
                    </table>
                </div>

                <div class="bottom-scrollbar" id="bottomScrollbar">
                    <div class="bottom-scrollbar-content"></div>
                </div>
            </div>
        `;

        document.getElementById('addKonwojeRow')?.addEventListener('click', () => this.addRow());
        document.getElementById('saveKonwojeDraft')?.addEventListener('click', () => this.saveDraft());
        document.getElementById('clearKonwojeData')?.addEventListener('click', () => this.clearSelected());
        document.getElementById('selectAllKonwoje')?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        this.initDateFilter();
        this.renderRows();
        this.syncScrollbars();
    },

    initDateFilter: function() {
        const toggleBtn = document.getElementById('toggleKonwojeDateFilterBtn');
        const dropdown = document.getElementById('konwojeDateFilterDropdown');
        const dateFromInput = document.getElementById('konwojeDateFrom');
        const dateToInput = document.getElementById('konwojeDateTo');
        const applyBtn = document.getElementById('applyKonwojeDateFilter');
        const clearDropdownBtn = document.getElementById('clearKonwojeDateFilterDropdown');
        const filterBadge = document.getElementById('konwojeDateFilterBadge');
        const filterInfoBar = document.getElementById('konwojeFilterInfoBar');
        const filterResultInfo = document.getElementById('konwojeFilterResultInfo');
        const quickFilterBtns = dropdown?.querySelectorAll('.btn-quick-filter');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        quickFilterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const today = new Date();
                const from = new Date(today);
                
                if (days === 0) {
                    from.setHours(0, 0, 0, 0);
                } else {
                    from.setDate(today.getDate() - days);
                }

                dateFromInput.value = this.dateToInputFormat(from);
                dateToInput.value = this.dateToInputFormat(today);
            });
        });

        applyBtn?.addEventListener('click', () => {
            const from = dateFromInput.value;
            const to = dateToInput.value;

            if (!from || !to) {
                alert('Proszę wybrać obie daty');
                return;
            }

            const dateFrom = new Date(from);
            const dateTo = new Date(to);
            
            dateFrom.setHours(0, 0, 0, 0);
            dateTo.setHours(23, 59, 59, 999);

            if (dateFrom > dateTo) {
                alert('Data "od" nie może być późniejsza niż data "do"');
                return;
            }

            AppState.konwojeDateFilter.active = true;
            AppState.konwojeDateFilter.dateFrom = dateFrom;
            AppState.konwojeDateFilter.dateTo = dateTo;

            this.applyDateFilter();
            dropdown.classList.add('hidden');
        });

        clearDropdownBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });
    },

    dateToInputFormat: function(date) {
        if (!date) return '';
        if (typeof date === 'string') {
            const parts = date.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return date;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    parsePolishDate: function(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);

            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    },

    getMonthFromDate: function(dateStr) {
        const monthsShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
                            'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

        const date = this.parsePolishDate(dateStr);
        return date ? monthsShort[date.getMonth()] : '—';
    },

    applyDateFilter: function() {
        const { dateFrom, dateTo } = AppState.konwojeDateFilter;
        
        console.log('🔍 FILTROWANIE KONWOJÓW:', {
            dateFrom: dateFrom.toLocaleDateString('pl-PL'),
            dateTo: dateTo.toLocaleDateString('pl-PL')
        });
        
        let matchCount = 0;
        const totalCount = AppState.konwojeData.length;

        AppState.konwojeData.forEach((row, index) => {
            const rowDate = this.parsePolishDate(row.data);
            
            console.log(`  Wiersz ${index + 1}: data="${row.data}" → rowDate=${rowDate ? rowDate.toLocaleDateString('pl-PL') : 'NULL'}`);
            
            if (rowDate) {
                const matches = rowDate >= dateFrom && rowDate <= dateTo;
                console.log(`    Porównanie: ${rowDate.getTime()} >= ${dateFrom.getTime()} && ${rowDate.getTime()} <= ${dateTo.getTime()} = ${matches}`);
                if (matches) {
                    matchCount++;
                }
            }
        });

        console.log(`✅ Znaleziono: ${matchCount} z ${totalCount}`);

        const filterBadge = document.getElementById('konwojeDateFilterBadge');
        const filterInfoBar = document.getElementById('konwojeFilterInfoBar');
        const filterResultInfo = document.getElementById('konwojeFilterResultInfo');

        if (matchCount > 0) {
            filterBadge.textContent = `(${matchCount})`;
            filterBadge.classList.remove('hidden');
        } else {
            filterBadge.classList.add('hidden');
        }

        const fromStr = dateFrom.toLocaleDateString('pl-PL');
        const toStr = dateTo.toLocaleDateString('pl-PL');
        
        if (matchCount > 0) {
            filterInfoBar.innerHTML = `
                <i class="fas fa-info-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> konwojów z <strong>${totalCount}</strong> 
                (od ${fromStr} do ${toStr})
            `;
            filterInfoBar.style.background = 'rgba(76, 175, 80, 0.1)';
            filterInfoBar.style.color = '#4caf50';
        } else {
            filterInfoBar.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Nie znaleziono konwojów w zakresie od ${fromStr} do ${toStr}
            `;
            filterInfoBar.style.background = 'rgba(255, 152, 0, 0.1)';
            filterInfoBar.style.color = '#ff9800';
        }
        filterInfoBar.classList.remove('hidden');

        if (matchCount > 0) {
            filterResultInfo.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> konwojów
            `;
            filterResultInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            filterResultInfo.style.color = '#4caf50';
        } else {
            filterResultInfo.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Brak konwojów w tym zakresie
            `;
            filterResultInfo.style.background = 'rgba(255, 152, 0, 0.1)';
            filterResultInfo.style.color = '#ff9800';
        }
        filterResultInfo.classList.remove('hidden');

        this.renderRows();
    },

    clearDateFilter: function() {
        AppState.konwojeDateFilter.active = false;
        AppState.konwojeDateFilter.dateFrom = null;
        AppState.konwojeDateFilter.dateTo = null;

        const filterBadge = document.getElementById('konwojeDateFilterBadge');
        const filterInfoBar = document.getElementById('konwojeFilterInfoBar');
        const filterResultInfo = document.getElementById('konwojeFilterResultInfo');

        filterBadge?.classList.add('hidden');
        filterInfoBar?.classList.add('hidden');
        filterResultInfo?.classList.add('hidden');

        this.renderRows();
    },

    syncScrollbars: function() {
        const topScrollbar = document.getElementById('topScrollbar');
        const bottomScrollbar = document.getElementById('bottomScrollbar');
        const tableWrapper = document.getElementById('konwojeTableWrapper');
        const topScrollContent = topScrollbar?.querySelector('.top-scrollbar-content');
        const bottomScrollContent = bottomScrollbar?.querySelector('.bottom-scrollbar-content');

        if (!topScrollbar || !bottomScrollbar || !tableWrapper || !topScrollContent || !bottomScrollContent) return;

        const updateScrollbarWidth = () => {
            const table = tableWrapper.querySelector('table');
            if (table) {
                const width = table.offsetWidth + 'px';
                topScrollContent.style.width = width;
                bottomScrollContent.style.width = width;
            }
        };

        updateScrollbarWidth();
        window.addEventListener('resize', updateScrollbarWidth);

        // Top scrollbar -> table
        topScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = topScrollbar.scrollLeft;
            bottomScrollbar.scrollLeft = topScrollbar.scrollLeft;
        });

        // Bottom scrollbar -> table
        bottomScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = bottomScrollbar.scrollLeft;
            topScrollbar.scrollLeft = bottomScrollbar.scrollLeft;
        });

        // Table -> scrollbars
        tableWrapper.addEventListener('scroll', () => {
            topScrollbar.scrollLeft = tableWrapper.scrollLeft;
            bottomScrollbar.scrollLeft = tableWrapper.scrollLeft;
        });

        // Make bottom scrollbar sticky when scrolling down
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const tableRect = tableWrapper.getBoundingClientRect();
            const isTableVisible = tableRect.top < window.innerHeight && tableRect.bottom > 0;
            
            if (isTableVisible && scrollTop > lastScrollTop) {
                // Scrolling down - show bottom scrollbar
                bottomScrollbar.classList.add('sticky');
            } else {
                // Scrolling up - hide bottom scrollbar
                bottomScrollbar.classList.remove('sticky');
            }
            
            lastScrollTop = scrollTop;
        });
    },

    renderRows: function() {
        const tbody = document.getElementById('konwojeTableBody');
        if (!tbody) return;

        if (AppState.konwojeData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="21" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>';
            return;
        }

        let dataToRender = AppState.konwojeData;
        if (AppState.konwojeDateFilter.active) {
            const { dateFrom, dateTo } = AppState.konwojeDateFilter;
            
            dataToRender = AppState.konwojeData.filter(row => {
                const rowDate = this.parsePolishDate(row.data);
                return rowDate && rowDate >= dateFrom && rowDate <= dateTo;
            });
        }

        if (dataToRender.length === 0) {
            tbody.innerHTML = '<tr><td colspan="21" class="empty-message">Brak danych spełniających kryteria filtra dat.</td></tr>';
            return;
        }

        const jwOptions = ['OŻW Elbląg', 'OŻW Gdynia', 'OŻW Bemowo Piskie', 'Inne'];
        const oddzialOptions = ['Elbląg', 'Szczecin', 'Lublin', 'Bydgoszcz', 'Kraków', 'Żagań', 'Warszawa', 'Łódź', 'Mińsk Mazowiecki'];
        const jzwOptions = ['OŻW Elbląg', 'WŻW Bemowo Piskie', 'WŻW Gdynia', 'PŻW Bartoszyce', 'PŻW Braniewo', 'PŻW Giżycko', 'PŻW Malbork', 'PŻW Morąg'];

        tbody.innerHTML = dataToRender.map((row, index) => {
            const isSelected = AppState.konwojeSelectedRows.has(row.id);
            const month = this.getMonthFromDate(row.data);
            
            // Auto-oblicz RAZEM
            const rodzajRazem = (parseInt(row.miejscowy) || 0) + (parseInt(row.zamiejscowy) || 0);
            const zleceniodawcaRazem = (parseInt(row.prokuratura) || 0) + (parseInt(row.sad) || 0) + 
                                       (parseInt(row.wlasne) || 0) + (row.jzw && row.jzw !== '' ? 1 : 0);
            const coKonwojowanoRazem = (parseInt(row.dokumenty) || 0) + (parseInt(row.osoby) || 0) + 
                                        (parseInt(row.przedmioty) || 0);

            return `
                <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''}">
                    <td class="col-sticky-left col-lp">${index + 1}</td>
                    <td class="col-sticky-left2 col-checkbox">
                        <input type="checkbox" 
                               class="row-checkbox" 
                               ${isSelected ? 'checked' : ''}
                               onchange="KonwojeManager.toggleRowSelect(${row.id}, this.checked)">
                    </td>
                    <td class="col-month">${month}</td>
                    <td class="col-data">
                        <input type="date" 
                               class="cell-input-date" 
                               value="${this.dateToInputFormat(row.data)}"
                               onchange="KonwojeManager.updateField(${row.id}, 'data', this.value)">
                    </td>
                    <td class="col-number col-razem">${rodzajRazem}</td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.miejscowy || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'miejscowy', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.zamiejscowy || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'zamiejscowy', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.ilosc_zw || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'ilosc_zw', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.ilosc_wpm || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'ilosc_wpm', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number col-razem">${zleceniodawcaRazem}</td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.prokuratura || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'prokuratura', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.sad || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'sad', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.wlasne || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'wlasne', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <select class="cell-select" onchange="KonwojeManager.updateField(${row.id}, 'jzw', this.value)">
                            <option value="">-</option>
                            ${jzwOptions.map(opt => `<option value="${opt}" ${row.jzw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-number col-razem">${coKonwojowanoRazem}</td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.dokumenty || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'dokumenty', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.osoby || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'osoby', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.przedmioty || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="KonwojeManager.updateField(${row.id}, 'przedmioty', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="KonwojeManager.updateField(${row.id}, 'jw_prowadzaca', this.value)">
                            ${jwOptions.map(opt => `<option value="${opt}" ${row.jw_prowadzaca === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="KonwojeManager.updateField(${row.id}, 'oddzial', this.value)">
                            ${oddzialOptions.map(opt => `<option value="${opt}" ${row.oddzial === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        const clearBtn = document.getElementById('clearKonwojeData');
        if (clearBtn) {
            clearBtn.disabled = AppState.konwojeData.length === 0;
        }
    }
    }
});

// ============================================
// RAPORTY MANAGER
// ============================================
/**
 * Manager for Raporty (Reports) module
 * @namespace RaportyManager
 */
const RaportyManager = {
    /**
     * Renders the Raporty module view
     * @returns {void}
     */
    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title"><i class="fas fa-file-lines" style="color: #9ca3af;"></i> Raporty</h1>
                    <p class="section-subtitle">Eksportuj dane i generuj raporty</p>
                </div>

                <div class="raporty-container">
                    <!-- SEKCJA 1: RAPORT TABELARYCZNY -->
                    <div class="raport-card">
                        <div class="raport-card-header">
                            <i class="fas fa-table"></i>
                            <h2>Raport tabelaryczny</h2>
                        </div>
                        <div class="raport-card-body">
                            <p class="raport-description">Eksportuj surowe dane z wielu modułów jednocześnie do PDF (landscape) lub Excel</p>

                            <div class="raport-form">
                                <!-- WYBÓR MODUŁÓW (CHECKBOXY) -->
                                <div class="form-row">
                                    <label style="font-weight: 600; margin-bottom: 0.75rem;">Wybierz moduły do uwzględnienia:</label>
                                    <div class="module-checkboxes">
                                        <label class="checkbox-module-item">
                                            <input type="checkbox" name="tabularModule" value="patrole" checked>
                                            <span><i class="fas fa-car-side"></i> Patrole</span>
                                        </label>
                                        <label class="checkbox-module-item">
                                            <input type="checkbox" name="tabularModule" value="wykroczenia" checked>
                                            <span><i class="fas fa-scale-balanced"></i> Wykroczenia</span>
                                        </label>
                                        <label class="checkbox-module-item">
                                            <input type="checkbox" name="tabularModule" value="wkrd" checked>
                                            <span><i class="fas fa-shield-halved"></i> WKRD</span>
                                        </label>
                                        <label class="checkbox-module-item">
                                            <input type="checkbox" name="tabularModule" value="sankcje" checked>
                                            <span><i class="fas fa-money-bill-wave"></i> Sankcje</span>
                                        </label>
                                        <label class="checkbox-module-item">
                                            <input type="checkbox" name="tabularModule" value="konwoje" checked>
                                            <span><i class="fas fa-arrow-right-arrow-left"></i> Konwoje</span>
                                        </label>
                                        <label class="checkbox-module-item">
                                            <input type="checkbox" name="tabularModule" value="spb" checked>
                                            <span><i class="fas fa-hand-fist"></i> ŚPB</span>
                                        </label>
                                        <label class="checkbox-module-item">
                                            <input type="checkbox" name="tabularModule" value="pilotaze" checked>
                                            <span><i class="fas fa-road"></i> Pilotaże</span>
                                        </label>
                                        <label class="checkbox-module-item">
                                            <input type="checkbox" name="tabularModule" value="zdarzenia" checked>
                                            <span><i class="fas fa-car-burst"></i> Zdarzenia drogowe</span>
                                        </label>
                                    </div>
                                </div>

                                <!-- ZAKRES DAT -->
                                <div class="form-row">
                                    <label>Zakres dat (opcjonalnie):</label>
                                    <div class="date-range">
                                        <input type="date" id="tabularDateFrom" class="raport-date">
                                        <span>do</span>
                                        <input type="date" id="tabularDateTo" class="raport-date">
                                    </div>
                                    <p class="form-hint">
                                        <i class="fas fa-info-circle"></i>
                                        Pozostaw puste aby eksportować wszystkie dane
                                    </p>
                                </div>

                                <!-- FORMAT WYJŚCIOWY -->
                                <div class="form-row">
                                    <label>Format wyjściowy:</label>
                                    <div class="format-options">
                                        <label class="radio-label">
                                            <input type="radio" name="tabularFormat" value="pdf" checked>
                                            <span><i class="fas fa-file-pdf"></i> PDF (Landscape, A4)</span>
                                        </label>
                                        <label class="radio-label">
                                            <input type="radio" name="tabularFormat" value="xlsx">
                                            <span><i class="fas fa-file-excel"></i> Excel (.xlsx)</span>
                                        </label>
                                    </div>
                                    <p class="form-hint">
                                        <i class="fas fa-lightbulb"></i>
                                        PDF: Wszystkie tabele w jednym pliku (landscape, numeracja stron)<br>
                                        Excel: Wszystkie moduły w jednym arkuszu (jeden pod drugim)
                                    </p>
                                </div>
                </div>
            </div>

                                <!-- PRZYCISK GENEROWANIA -->
                                <div class="form-actions">
                                    <button class="btn-primary btn-large" id="generateTabularReportButton">
                                        <i class="fas fa-file-arrow-down"></i> Generuj raport tabelaryczny
                                    </button>
                                </div>

                                <!-- PROGRESS BAR (ukryty domyślnie) -->
                                <div id="tabularReportProgress" class="progress-container" style="display: none;">
                                    <div class="progress-bar">
                                        <div class="progress-fill"></div>
                                    </div>
                                    <p class="progress-text">Przygotowywanie danych...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    },

    attachEventListeners() {
        // Raport tabelaryczny (multi-kategoria)
        document.getElementById('generateTabularReportButton')?.addEventListener('click', () => this.generateTabularReport());
    },

    async generateTabularReport() {
        try {
            console.log('📊 Generowanie raportu tabelarycznego...');

            // Get selected modules
            const checkboxes = document.querySelectorAll('input[name="tabularModule"]:checked');
            const selectedModules = Array.from(checkboxes).map(cb => cb.value);

            if (selectedModules.length === 0) {
                alert('Wybierz przynajmniej jeden moduł do eksportu.');
                return;
            }

            // Get date range
            const dateFrom = document.getElementById('tabularDateFrom').value || null;
            const dateTo = document.getElementById('tabularDateTo').value || null;

            // Get format
            const format = document.querySelector('input[name="tabularFormat"]:checked').value;

            // Show progress bar
            const button = document.getElementById('generateTabularReportButton');
            const progressDiv = document.getElementById('tabularReportProgress');
            const progressFill = progressDiv.querySelector('.progress-fill');
            const progressText = progressDiv.querySelector('.progress-text');

            button.disabled = true;
            progressDiv.style.display = 'block';
            progressFill.style.width = '0%';
            progressText.textContent = 'Przygotowywanie danych...';

            // Simulate progress
            await new Promise(resolve => setTimeout(resolve, 300));
            progressFill.style.width = '30%';

            // Export based on format
            if (format === 'pdf') {
                progressText.textContent = 'Generowanie PDF...';
                progressFill.style.width = '60%';
                await TabularExporter.exportToPDF(selectedModules, dateFrom, dateTo);
            } else if (format === 'xlsx') {
                progressText.textContent = 'Generowanie Excel...';
                progressFill.style.width = '60%';
                await TabularExporter.exportToXLSX(selectedModules, dateFrom, dateTo);
            }

            // Complete
            progressFill.style.width = '100%';
            progressText.textContent = 'Pobieranie...';

            // Reset UI
            await new Promise(resolve => setTimeout(resolve, 500));
            button.disabled = false;
            progressDiv.style.display = 'none';

            console.log('✅ Raport tabelaryczny wygenerowany');
        } catch (error) {
            console.error('❌ Błąd generowania raportu tabelarycznego:', error);
            alert('Wystąpił błąd podczas generowania raportu. Sprawdź konsolę przeglądarki.');

            const button = document.getElementById('generateTabularReportButton');
            const progressDiv = document.getElementById('tabularReportProgress');
            button.disabled = false;
            progressDiv.style.display = 'none';
        }
    },

    async generateProfessionalReport() {
        try {
            // Pokaż progress bar
            const progressDiv = document.getElementById('reportProgress');
            const progressText = progressDiv.querySelector('.progress-text');
            const progressFill = progressDiv.querySelector('.progress-fill');
            const button = document.getElementById('generateReportButton');

            button.disabled = true;
            progressDiv.style.display = 'block';
            progressFill.style.width = '0%';

            // Zbierz parametry
            const reportType = document.querySelector('input[name="reportType"]:checked').value;
            const reportPeriod = document.querySelector('input[name="reportPeriod"]:checked').value;

            let dateFrom = null;
            let dateTo = null;

            // Oblicz daty na podstawie okresu
            if (reportPeriod === 'last7') {
                dateTo = new Date();
                dateFrom = new Date(dateTo.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (reportPeriod === 'last30') {
                dateTo = new Date();
                dateFrom = new Date(dateTo.getTime() - 30 * 24 * 60 * 60 * 1000);
            } else if (reportPeriod === 'lastMonth') {
                dateTo = new Date();
                dateTo.setDate(0); // Ostatni dzień poprzedniego miesiąca
                dateFrom = new Date(dateTo.getFullYear(), dateTo.getMonth(), 1);
            } else if (reportPeriod === 'custom') {
                const fromInput = document.getElementById('reportDateFrom').value;
                const toInput = document.getElementById('reportDateTo').value;

                if (!fromInput || !toInput) {
                    alert('Wybierz zakres dat');
                    button.disabled = false;
                    progressDiv.style.display = 'none';
                    return;
                }

                dateFrom = new Date(fromInput);
                dateTo = new Date(toInput);
            }

            // Konwertuj daty na format YYYY-MM-DD
            const dateFromStr = dateFrom ? dateFrom.toISOString().split('T')[0] : null;
            const dateToStr = dateTo ? dateTo.toISOString().split('T')[0] : null;

            // Update progress
            progressFill.style.width = '30%';
            progressText.textContent = 'Przetwarzanie danych...';

            // Generuj raport używając ReportGenerator
            await new Promise(resolve => setTimeout(resolve, 300));
            progressFill.style.width = '60%';
            progressText.textContent = 'Generowanie PDF...';

            const pdf = await ReportGenerator.generate(reportType, {
                dateFrom: dateFromStr,
                dateTo: dateToStr
            });

            progressFill.style.width = '100%';
            progressText.textContent = 'Pobieranie...';

            // Pobierz PDF
            const filename = `Raport_${reportType}_${dateToStr || 'wszystkie'}.pdf`;
            pdf.save(filename);

            // Reset UI
            await new Promise(resolve => setTimeout(resolve, 500));
            button.disabled = false;
            progressDiv.style.display = 'none';

            console.log('Raport wygenerowany:', filename);
        } catch (error) {
            console.error('Błąd generowania raportu:', error);
            alert('Wystąpił błąd podczas generowania raportu. Sprawdź konsolę.');

            const button = document.getElementById('generateReportButton');
            const progressDiv = document.getElementById('reportProgress');
            button.disabled = false;
            progressDiv.style.display = 'none';
        }
    }
};

// ============================================
// ============================================
// DASHBOARD HUB
// ============================================
/**
 * Dashboard Hub for analytics and visualizations
 * @namespace DashboardHub
 */
const DashboardHub = {
    /**
     * Global configuration for all charts
     * @type {Object}
     */
    chartDefaults: {
        devicePixelRatio: 2,
        font: {
            family: "'Oswald', sans-serif",
            size: 13,
            weight: '600'
        },
        color: '#e6e6e6'
    },

    render() {
        if (AppState.dashboardView === 'hub') {
            this.renderHub();
        } else if (AppState.dashboardView === 'ogolne') {
            this.renderOgolne();
        } else if (AppState.dashboardView === 'wykroczenia') {
            this.renderWykroczenia();
        } else if (AppState.dashboardView === 'jzw') {
            this.renderJZW();
        } else if (AppState.dashboardView === 'bezpieczenstwo') {
            this.renderBezpieczenstwo();
        } else if (AppState.dashboardView === 'czasowy') {
            this.renderCzasowy();
        }
    },

    renderHub() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="dashboard-hub">
                <div class="dashboard-header">
                    <h1><i class="fas fa-chart-line"></i> Dashboard Hub - AEP</h1>
                    <p>System analityczny danych operacyjnych</p>
                </div>
                <div class="dashboard-cards-grid">
                    <div class="dashboard-card" onclick="DashboardHub.openDashboard('ogolne')">
                        <div class="card-icon"><i class="fas fa-chart-bar"></i></div>
                        <h3><i class="fas fa-chart-bar"></i> Statystyki Ogólne</h3>
                        <p>Patrole: ${(AppState.patrolData || []).length}</p>
                        <p>Wykroczenia: ${(AppState.wykroczeniaData || []).length}</p>
                        <p class="card-status"><i class="fas fa-check-circle"></i> Aktywny</p>
                        <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
                    </div>
                    <div class="dashboard-card" onclick="DashboardHub.openDashboard('wykroczenia')">
                        <div class="card-icon"><i class="fas fa-exclamation-circle"></i></div>
                        <h3><i class="fas fa-exclamation-triangle"></i> Wykroczenia i Sankcje</h3>
                        <p>Mandaty: ${(AppState.sankcjeData || []).length}</p>
                        <p>WKRD: ${(AppState.wkrdData || []).length}</p>
                        <p class="card-status"><i class="fas fa-hammer"></i> W budowie</p>
                        <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
                    </div>
                    <div class="dashboard-card" onclick="DashboardHub.openDashboard('jzw')">
                        <div class="card-icon"><i class="fas fa-chart-pie"></i></div>
                        <h3><i class="fas fa-building"></i> Porównanie JŻW</h3>
                        <p>Ranking jednostek</p>
                        <p>Analiza efektywności</p>
                        <p class="card-status"><i class="fas fa-hammer"></i> W budowie</p>
                        <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
                    </div>
                    <div class="dashboard-card" onclick="DashboardHub.openDashboard('bezpieczenstwo')">
                        <div class="card-icon"><i class="fas fa-shield-alt"></i></div>
                        <h3><i class="fas fa-car-burst"></i> Bezpieczeństwo</h3>
                        <p>Zdarzenia: ${(AppState.zdarzeniaData || []).length}</p>
                        <p>ŚPB: ${(AppState.spbData || []).length}</p>
                        <p class="card-status"><i class="fas fa-hammer"></i> W budowie</p>
                        <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
                    </div>
                    <div class="dashboard-card" onclick="DashboardHub.openDashboard('czasowy')">
                        <div class="card-icon"><i class="fas fa-clock"></i></div>
                        <h3><i class="fas fa-calendar-alt"></i> Analiza Czasowa</h3>
                        <p>Trendy i predykcje</p>
                        <p>Kalendarz zdarzeń</p>
                        <p class="card-status"><i class="fas fa-hammer"></i> W budowie</p>
                        <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
                    </div>
                    <div class="dashboard-card dashboard-card-full" onclick="DashboardHub.openDashboard('kompletny')">
                        <div class="card-icon"><i class="fas fa-th-large"></i></div>
                        <h3><i class="fas fa-layer-group"></i> Dashboard Kompletny</h3>
                        <p>Wszystkie dashboardy w jednym widoku</p>
                        <p class="card-status"><i class="fas fa-hammer"></i> W budowie</p>
                        <div class="card-arrow"><i class="fas fa-chevron-right"></i></div>
                    </div>
                </div>
            </div>
        `;
    },

    openDashboard(view) {
        AppState.dashboardView = view;
        this.render();
    },

    backToHub() {
        AppState.dashboardView = 'hub';
        this.render();
    },

    // ============================================
    // DASHBOARD OGÓLNE - STATYSTYKI
    // ============================================
    renderOgolne() {
        const mainContent = document.getElementById('mainContent');
        
        // Inicjalizuj filtry jeśli nie istnieją
        if (!AppState.dashboardFilters.single.dateFrom) {
            const now = new Date();
            const ago30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
            AppState.dashboardFilters.single.dateFrom = this.dateToInputFormat(ago30);
            AppState.dashboardFilters.single.dateTo = this.dateToInputFormat(now);
        }

        mainContent.innerHTML = `
            <div class="dashboard-view">
                <div class="dashboard-top-bar">
                    <button class="btn-back" onclick="DashboardHub.backToHub()">
                        <i class="fas fa-arrow-left"></i> Powrót do Hub
                    </button>
                    <h1 class="dashboard-title">
                        <i class="fas fa-chart-bar"></i> Statystyki Ogólne
                    </h1>
                </div>

                <div class="dashboard-filters">
                    <div class="filter-row">
                        <div class="filter-field">
                            <label><i class="fas fa-calendar"></i> Data od:</label>
                            <input type="date" id="filterDateFrom" value="${AppState.dashboardFilters.single.dateFrom || ''}" 
                                   class="filter-input">
                        </div>
                        <div class="filter-field">
                            <label><i class="fas fa-calendar"></i> Data do:</label>
                            <input type="date" id="filterDateTo" value="${AppState.dashboardFilters.single.dateTo || ''}" 
                                   class="filter-input">
                        </div>
                        <div class="filter-quick">
                            <button class="btn-quick" onclick="DashboardHub.setQuickFilter('today')">Dziś</button>
                            <button class="btn-quick" onclick="DashboardHub.setQuickFilter('7days')">7 dni</button>
                            <button class="btn-quick" onclick="DashboardHub.setQuickFilter('30days')">30 dni</button>
                            <button class="btn-quick" onclick="DashboardHub.setQuickFilter('90days')">90 dni</button>
                        </div>
                        <button class="btn-primary" onclick="DashboardHub.applyFilters()">
                            <i class="fas fa-check"></i> Zastosuj
                        </button>
                    </div>
                </div>

                <!-- FAZA 1: TOP INSIGHTS - Automatyczne wnioski -->
                <div class="top-insights-section">
                    <div class="insights-header">
                        <i class="fas fa-lightbulb"></i>
                        <h3>Kluczowe obserwacje</h3>
                    </div>
                    <div class="insights-grid" id="top-insights-container">
                        <!-- Insights będą generowane dynamicznie -->
                        <div class="insight-item insight-info">
                            <i class="fas fa-spinner fa-spin insight-icon"></i>
                            <span class="insight-text">Ładowanie danych...</span>
                        </div>
                    </div>
                </div>

                <!-- PERFORMANCE MATRIX - Wskaźniki Analityczne -->
                <div class="performance-matrix-section">
                    <div class="performance-header">
                        <i class="fas fa-chart-line"></i>
                        <h3>Performance Matrix - Wskaźniki Efektywności</h3>
                    </div>
                    <div id="performance-matrix-grid" class="performance-matrix-grid">
                        <!-- Wypełniane przez renderPerformanceMatrix() -->
                    </div>
                </div>

                <!-- FAZA 2: TOP PERFORMERS -->
                <div class="top-performers-section">
                    <div class="performers-header">
                        <i class="fas fa-trophy"></i>
                        <h3>Top Performers</h3>
                    </div>
                    <div class="performers-grid">
                        <div class="performer-card">
                            <div class="performer-header">
                                <i class="fas fa-building"></i>
                                <h4>Najaktywniejsze JŻW (Patrole)</h4>
                            </div>
                            <div class="performer-list" id="top-jzw-patrole">
                                <!-- Dynamicznie generowane -->
                            </div>
                        </div>
                        <div class="performer-card">
                            <div class="performer-header">
                                <i class="fas fa-exclamation-triangle"></i>
                                <h4>Najaktywniejsze JŻW (Wykroczenia)</h4>
                            </div>
                            <div class="performer-list" id="top-jzw-wykroczenia">
                                <!-- Dynamicznie generowane -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FAZA 2: GAUGE CHARTS - CELE MIESIĘCZNE -->
                <div class="goals-section">
                    <div class="goals-header">
                        <i class="fas fa-bullseye"></i>
                        <h3>Realizacja celów miesięcznych</h3>
                    </div>
                    <div class="goals-grid">
                        <div class="goal-gauge-card">
                            <div id="gauge-patrole"></div>
                        </div>
                        <div class="goal-gauge-card">
                            <div id="gauge-wykroczenia"></div>
                        </div>
                        <div class="goal-gauge-card">
                            <div id="gauge-mandaty"></div>
                        </div>
                        <div class="goal-gauge-card">
                            <div id="gauge-wkrd"></div>
                        </div>
                    </div>
                </div>

                <div class="charts-row-large">
                    <div class="chart-container-large">
                        <h3><i class="fas fa-chart-line"></i> Trend Patroli (ostatnie 30 dni)</h3>
                        <canvas id="chartPatrole"></canvas>
                    </div>
                    <div class="chart-container-large">
                        <h3><i class="fas fa-chart-pie"></i> Podział Wykroczeń (TOP 5)</h3>
                        <canvas id="chartWykroczenia"></canvas>
                    </div>
                </div>

                <div class="charts-row-large">
                    <div class="chart-container-large">
                        <h3><i class="fas fa-shield-halved"></i> WKRD - Trend czasowy</h3>
                        <canvas id="chartWKRD"></canvas>
                    </div>
                    <div class="chart-container-large">
                        <h3><i class="fas fa-money-bill-wave"></i> Mandaty - Suma w czasie</h3>
                        <canvas id="chartMandaty"></canvas>
                    </div>
                </div>

                <div class="charts-row-large">
                    <div class="chart-container-large">
                        <h3><i class="fas fa-arrow-right-arrow-left"></i> Konwoje - Trend</h3>
                        <canvas id="chartKonwoje"></canvas>
                    </div>
                    <div class="chart-container-large">
                        <h3><i class="fas fa-hand-fist"></i> Środki Przymusu Bezpośredniego</h3>
                        <canvas id="chartSPB"></canvas>
                    </div>
                </div>

                <div class="charts-row-large">
                    <div class="chart-container-large">
                        <h3><i class="fas fa-road"></i> Pilotaże - Trend</h3>
                        <canvas id="chartPilotaze"></canvas>
                    </div>
                    <div class="chart-container-large">
                        <h3><i class="fas fa-car-burst"></i> Zdarzenia Drogowe - Wypadki vs Kolizje</h3>
                        <canvas id="chartZdarzenia"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Załaduj statystyki po załadowaniu DOM
        setTimeout(() => {
            console.log('=== DASHBOARD OGÓLNE - START ŁADOWANIA ===');
            console.log('Chart.js dostępny?', typeof Chart !== 'undefined' ? 'TAK' : 'NIE');
            console.log('window.Chart dostępny?', typeof window.Chart !== 'undefined' ? 'TAK' : 'NIE');
            this.loadOgolneStats();
        }, 500);
    },

    setQuickFilter(preset) {
        const now = new Date();
        let from = new Date();

        switch(preset) {
            case 'today':
                from = new Date(now);
                break;
            case '7days':
                from = new Date(now - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                from = new Date(now - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90days':
                from = new Date(now - 90 * 24 * 60 * 60 * 1000);
                break;
        }

        AppState.dashboardFilters.single.dateFrom = this.dateToInputFormat(from);
        AppState.dashboardFilters.single.dateTo = this.dateToInputFormat(now);
        AppState.dashboardFilters.single.preset = preset;

        document.getElementById('filterDateFrom').value = AppState.dashboardFilters.single.dateFrom;
        document.getElementById('filterDateTo').value = AppState.dashboardFilters.single.dateTo;
    },

    applyFilters() {
        const from = document.getElementById('filterDateFrom').value;
        const to = document.getElementById('filterDateTo').value;
        
        if (from && to) {
            AppState.dashboardFilters.single.dateFrom = from;
            AppState.dashboardFilters.single.dateTo = to;
            this.loadOgolneStats();
        } else {
            alert('Proszę wybrać obie daty');
        }
    },

    // ============================================
    // FAZA 1: NOWE METODY POMOCNICZE - TRENDY I ANALITYKA
    // ============================================

    /**
     * Oblicza trend (zmianę procentową) między obecnym a poprzednim okresem
     * @param {number} current - Wartość obecna
     * @param {number} previous - Wartość poprzednia
     * @returns {Object} {percent: number, direction: 'up'|'down'|'neutral', icon: string}
     */
    calculateTrend(current, previous) {
        if (previous === 0) {
            return {
                percent: current > 0 ? 100 : 0,
                direction: current > 0 ? 'up' : 'neutral',
                icon: current > 0 ? 'fa-arrow-up' : 'fa-minus'
            };
        }

        const change = ((current - previous) / previous) * 100;
        const rounded = Math.round(Math.abs(change));

        return {
            percent: rounded,
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
            icon: change > 0 ? 'fa-arrow-up' : change < 0 ? 'fa-arrow-down' : 'fa-minus'
        };
    },

    /**
     * Przygotowuje dane dla sparkline (miniaturowy wykres w karcie)
     * @param {Array} data - Tablica danych
     * @param {number} days - Liczba dni do pokazania
     * @returns {Array<number>} Tablica wartości dla sparkline
     */
    prepareSparklineData(data, days = 7) {
        if (!data || data.length === 0) return Array(days).fill(0);

        // Weź ostatnie N dni
        const recent = data.slice(-days);
        return recent.map(() => Math.floor(Math.random() * 20) + 5); // Placeholder - później zamień na prawdziwe dane
    },

    /**
     * Generuje Top Insights - automatyczne wnioski z danych
     * @param {Object} stats - Obiekt ze statystykami
     * @returns {Array<Object>} Tablica insights
     */
    generateTopInsights(stats) {
        const insights = [];

        // Insight 1: Największy wzrost
        const trends = [
            { name: 'Patrole', trend: stats.patroleTrend },
            { name: 'Wykroczenia', trend: stats.wykroczeniaTrend },
            { name: 'WKRD', trend: stats.wkrdTrend },
            { name: 'Mandaty', trend: stats.mandatyTrend }
        ];

        const maxGrowth = trends.reduce((max, item) =>
            item.trend.direction === 'up' && item.trend.percent > max.trend.percent ? item : max
        );

        if (maxGrowth.trend.percent > 0) {
            insights.push({
                icon: 'fa-arrow-trend-up',
                type: 'success',
                text: `${maxGrowth.name}: Wzrost o ${maxGrowth.trend.percent}% vs poprzedni okres`
            });
        }

        // Insight 2: Największy spadek
        const maxDecline = trends.reduce((max, item) =>
            item.trend.direction === 'down' && item.trend.percent > max.trend.percent ? item : max
        );

        if (maxDecline.trend.percent > 0) {
            insights.push({
                icon: 'fa-arrow-trend-down',
                type: 'warning',
                text: `${maxDecline.name}: Spadek o ${maxDecline.trend.percent}% - wymaga uwagi`
            });
        }

        // Insight 3: Średnia wartość mandatu
        if (stats.mandatyTotal > 0 && stats.mandatyCount > 0) {
            const avg = Math.round(stats.mandatyTotal / stats.mandatyCount);
            insights.push({
                icon: 'fa-money-bill-trend-up',
                type: 'info',
                text: `Średnia wartość mandatu: ${avg.toLocaleString('pl-PL')} PLN`
            });
        }

        // Insight 4: Najaktywniejszy dzień tygodnia (placeholder)
        insights.push({
            icon: 'fa-calendar-check',
            type: 'info',
            text: 'Najaktywniejszy dzień: Poniedziałek (32% działań)'
        });

        return insights.slice(0, 4); // Max 4 insights
    },

    loadOgolneStats() {
        // Pobierz dane BEZPOŚREDNIO z localStorage
        const patrole = Utils.loadFromLocalStorage('aep_data_patrole') || [];
        const wykroczenia = Utils.loadFromLocalStorage('aep_data_wykroczenia') || [];
        const wkrd = Utils.loadFromLocalStorage('aep_data_wkrd') || [];
        const sankcje = Utils.loadFromLocalStorage('aep_data_sankcje') || [];
        const konwoje = Utils.loadFromLocalStorage('aep_data_konwoje') || [];
        const spb = Utils.loadFromLocalStorage('aep_data_spb') || [];
        const pilotaze = Utils.loadFromLocalStorage('aep_data_pilotaze') || [];
        const zdarzenia = Utils.loadFromLocalStorage('aep_data_zdarzenia') || [];

        console.log('📊 DASHBOARD - Dane załadowane z localStorage:');
        console.log('  → Patrole:', patrole.length, 'wierszy');

        // Oblicz obecne wartości
        const currentPatrole = patrole.length;
        const currentWykroczenia = wykroczenia.length;
        const currentWkrd = wkrd.length;
        const sumaMandatow = sankcje.reduce((sum, row) => sum + (parseInt(row.wysokosc_mandatu) || 0), 0);

        // Oblicz poprzednie wartości (połowa danych jako "poprzedni okres" - placeholder)
        const prevPatrole = Math.floor(patrole.length * 0.85);
        const prevWykroczenia = Math.floor(wykroczenia.length * 0.92);
        const prevWkrd = Math.floor(wkrd.length * 0.78);
        const prevMandaty = Math.floor(sumaMandatow * 0.88);

        // Oblicz trendy
        const patroleTrend = this.calculateTrend(currentPatrole, prevPatrole);
        const wykroczeniaTrend = this.calculateTrend(currentWykroczenia, prevWykroczenia);
        const wkrdTrend = this.calculateTrend(currentWkrd, prevWkrd);
        const mandatyTrend = this.calculateTrend(sumaMandatow, prevMandaty);

        // Przygotuj sparklines
        const patroleSparkline = this.prepareSparklineData(patrole, 7);

        // Generuj Top Insights
        const insights = this.generateTopInsights({
            patroleTrend,
            wykroczeniaTrend,
            wkrdTrend,
            mandatyTrend,
            mandatyTotal: sumaMandatow,
            mandatyCount: sankcje.length
        });

        // Renderuj Performance Matrix - Wskaźniki Analityczne
        this.renderPerformanceMatrix({
            patroleCount: currentPatrole,
            wykroczeniaCount: currentWykroczenia,
            wkrdCount: currentWkrd,
            mandatySum: sumaMandatow,
            mandatyCount: sankcje.length,
            konwojeCount: konwoje.length,
            spbCount: spb.length,
            pilotazeCount: pilotaze.length,
            zdarzeniaCount: zdarzenia.length
        });

        // Wyświetl Top Insights
        this.renderTopInsights(insights);

        // FAZA 2: Top Performers
        this.renderTopPerformers(patrole, wykroczenia);

        // FAZA 2: Gauge Charts dla celów
        this.renderGoalGauges({
            patrole: { current: currentPatrole, target: 300 },
            wykroczenia: { current: currentWykroczenia, target: 150 },
            mandaty: { current: sumaMandatow, target: 50000 },
            wkrd: { current: currentWkrd, target: 80 }
        });

        // Rysuj wykresy
        this.drawPatroleTrendChart(patrole);
        this.drawWykroczeniaPieChart(wykroczenia);
        this.drawWKRDChart(wkrd);
        this.drawMandatyChart(sankcje);
        this.drawKonwojeChart(konwoje);
        this.drawSPBChart(spb);
        this.drawPilotazeChart(pilotaze);
        this.drawZdarzeniaChart(zdarzenia);

        // FAZA 2: Renderuj Top Performers
        this.renderTopPerformers(patrole, wykroczenia);

        // FAZA 2: Rysuj Gauge Charts
        this.drawGaugeCharts({
            patrole: currentPatrole,
            wykroczenia: currentWykroczenia,
            mandaty: sumaMandatow,
            wkrd: currentWkrd
        });
    },

    // ============================================
    // FAZA 2: NOWE METODY - PORÓWNANIA, TOP PERFORMERS, GAUGE CHARTS
    // ============================================

    /**
     * Renderuje Top Performers
     */
    renderTopPerformers(patroleData, wykroczeniaData) {
        // Top JŻW dla Patroli (placeholder - w przyszłości z prawdziwymi danymi)
        const topJzwPatrole = [
            { name: 'OŻW Elbląg', value: 89, percent: 100 },
            { name: 'OŻW Warszawa', value: 67, percent: 75 },
            { name: 'OŻW Kraków', value: 45, percent: 51 }
        ];

        const topJzwWykroczenia = [
            { name: 'OŻW Elbląg', value: 134, percent: 100 },
            { name: 'OŻW Gdańsk', value: 98, percent: 73 },
            { name: 'OŻW Poznań', value: 76, percent: 57 }
        ];

        this.renderTopPerformerList('top-jzw-patrole', topJzwPatrole);
        this.renderTopPerformerList('top-jzw-wykroczenia', topJzwWykroczenia);
    },

    renderTopPerformerList(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = data.map((item, index) => `
            <div class="performer-item">
                <div class="performer-rank">${index + 1}</div>
                <div class="performer-name">${item.name}</div>
                <div class="performer-value">${item.value}</div>
                <div class="performer-bar">
                    <div class="performer-bar-fill" style="width: ${item.percent}%"></div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    /**
     * Renderuje Gauge Charts dla celów miesięcznych
     */
    renderGoalGauges(goals) {
        // Gauge dla Patroli
        this.drawGaugeChart('gauge-patrole', 'Patrole', goals.patrole.current, goals.patrole.target);
        this.drawGaugeChart('gauge-wykroczenia', 'Wykroczenia', goals.wykroczenia.current, goals.wykroczenia.target);
        this.drawGaugeChart('gauge-mandaty', 'Mandaty (PLN)', goals.mandaty.current, goals.mandaty.target);
        this.drawGaugeChart('gauge-wkrd', 'WKRD', goals.wkrd.current, goals.wkrd.target);
    },

    /**
     * Rysuje pojedynczy Gauge Chart używając ApexCharts
     */
    drawGaugeChart(containerId, label, current, target) {
        const percent = Math.round((current / target) * 100);

        const options = {
            series: [percent],
            chart: {
                type: 'radialBar',
                height: 250,
                background: 'transparent'
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '65%',
                        background: 'rgba(26, 29, 41, 0.5)'
                    },
                    track: {
                        background: 'rgba(74, 144, 226, 0.1)',
                        strokeWidth: '100%'
                    },
                    dataLabels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '14px',
                            color: '#e6e6e6',
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#e6e6e6',
                            offsetY: 5,
                            formatter: function (val) {
                                return val + '%';
                            }
                        }
                    }
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: 'horizontal',
                    shadeIntensity: 0.5,
                    gradientToColors: percent >= 100 ? ['#10b981'] : percent >= 75 ? ['#4a90e2'] : ['#f59e0b'],
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 100]
                }
            },
            stroke: {
                lineCap: 'round'
            },
            labels: [label],
            colors: percent >= 100 ? ['#10b981'] : percent >= 75 ? ['#4a90e2'] : ['#f59e0b']
        };

        const chart = new ApexCharts(document.getElementById(containerId), options);
        chart.render();

        // Dodaj tekst pod wykresem
        const container = document.getElementById(containerId);
        if (container) {
            const info = document.createElement('div');
            info.className = 'gauge-info';
            info.innerHTML = `<span>${current.toLocaleString('pl-PL')} / ${target.toLocaleString('pl-PL')}</span>`;
            container.appendChild(info);
        }
    },

    drawGaugeCharts(data) {
        // Ta metoda jest już niepotrzebna, usuwamy duplikację
        // Wszystko robi renderGoalGauges
    },

    // ============================================
    // PERFORMANCE MATRIX - WSKAŹNIKI ANALITYCZNE
    // ============================================

    /**
     * Oblicza wskaźniki efektywności dla Performance Matrix
     * @param {Object} data - Dane wejściowe
     * @returns {Array} Tablica wskaźników KPI
     */
    calculatePerformanceMetrics(data) {
        const {
            patroleCount,
            wykroczeniaCount,
            wkrdCount,
            mandatySum,
            mandatyCount,
            konwojeCount,
            spbCount,
            pilotazeCount,
            zdarzeniaCount
        } = data;

        const metrics = [];

        // 1. Wykroczenia na Patrol (Detection Rate)
        const wykroczeniaPerPatrol = patroleCount > 0
            ? (wykroczeniaCount / patroleCount).toFixed(2)
            : '0.00';
        const wykroczeniaPerPatrolBenchmark = 2.5; // Benchmark: 2.5 wykroczeń na patrol
        const wykroczeniaPerPatrolStatus = parseFloat(wykroczeniaPerPatrol) >= wykroczeniaPerPatrolBenchmark ? 'high' : 'low';

        metrics.push({
            name: 'Wykroczenia / Patrol',
            value: wykroczeniaPerPatrol,
            unit: 'wyk/patrol',
            benchmark: wykroczeniaPerPatrolBenchmark,
            status: wykroczeniaPerPatrolStatus,
            description: 'Średnia liczba wykrytych wykroczeń na jeden patrol',
            icon: 'fa-bullseye'
        });

        // 2. Mandaty na Patrol (Revenue Efficiency)
        const mandatyPerPatrol = patroleCount > 0
            ? Math.round(mandatySum / patroleCount)
            : 0;
        const mandatyPerPatrolBenchmark = 1500; // 1500 PLN na patrol
        const mandatyPerPatrolStatus = mandatyPerPatrol >= mandatyPerPatrolBenchmark ? 'high' : 'low';

        metrics.push({
            name: 'Mandaty / Patrol',
            value: mandatyPerPatrol.toLocaleString('pl-PL'),
            unit: 'PLN/patrol',
            benchmark: mandatyPerPatrolBenchmark.toLocaleString('pl-PL'),
            status: mandatyPerPatrolStatus,
            description: 'Średnia wartość mandatów wystawionych na jeden patrol',
            icon: 'fa-coins'
        });

        // 3. Efektywność Wykrywania (Detection Efficiency)
        const detectionEfficiency = wykroczeniaCount > 0
            ? ((mandatyCount / wykroczeniaCount) * 100).toFixed(1)
            : '0.0';
        const detectionEfficiencyBenchmark = 75; // 75% - wykroczenia zakończone mandatem
        const detectionEfficiencyStatus = parseFloat(detectionEfficiency) >= detectionEfficiencyBenchmark ? 'high' : 'low';

        metrics.push({
            name: 'Efektywność Wykrywania',
            value: detectionEfficiency,
            unit: '%',
            benchmark: detectionEfficiencyBenchmark,
            status: detectionEfficiencyStatus,
            description: 'Odsetek wykroczeń zakończonych nałożeniem mandatu',
            icon: 'fa-percentage'
        });

        // 4. Średnia Wartość Mandatu (Avg Fine Value)
        const avgMandat = mandatyCount > 0
            ? Math.round(mandatySum / mandatyCount)
            : 0;
        const avgMandatBenchmark = 300; // 300 PLN średni mandat
        const avgMandatStatus = avgMandat >= avgMandatBenchmark ? 'high' : 'low';

        metrics.push({
            name: 'Średnia Wartość Mandatu',
            value: avgMandat.toLocaleString('pl-PL'),
            unit: 'PLN',
            benchmark: avgMandatBenchmark.toLocaleString('pl-PL'),
            status: avgMandatStatus,
            description: 'Średnia wartość jednego wystawionego mandatu',
            icon: 'fa-money-bill-trend-up'
        });

        // 5. Wskaźnik Zajętości (Activity Rate)
        const totalActivities = wykroczeniaCount + wkrdCount + konwojeCount + spbCount + pilotazeCount + zdarzeniaCount;
        const activityRate = patroleCount > 0
            ? (totalActivities / patroleCount).toFixed(2)
            : '0.00';
        const activityRateBenchmark = 4.0; // 4 aktywności na patrol
        const activityRateStatus = parseFloat(activityRate) >= activityRateBenchmark ? 'high' : 'low';

        metrics.push({
            name: 'Wskaźnik Zajętości',
            value: activityRate,
            unit: 'akt/patrol',
            benchmark: activityRateBenchmark,
            status: activityRateStatus,
            description: 'Średnia liczba wszystkich aktywności na patrol',
            icon: 'fa-gauge-high'
        });

        // 6. WKRD Coverage (WKRD per 100 patroli)
        const wkrdPer100 = patroleCount > 0
            ? ((wkrdCount / patroleCount) * 100).toFixed(1)
            : '0.0';
        const wkrdPer100Benchmark = 15; // 15 WKRD na 100 patroli
        const wkrdPer100Status = parseFloat(wkrdPer100) >= wkrdPer100Benchmark ? 'high' : 'low';

        metrics.push({
            name: 'WKRD Coverage',
            value: wkrdPer100,
            unit: 'na 100 patroli',
            benchmark: wkrdPer100Benchmark,
            status: wkrdPer100Status,
            description: 'Liczba kontroli WKRD na 100 patroli',
            icon: 'fa-shield-halved'
        });

        return metrics;
    },

    /**
     * Renderuje Performance Matrix
     */
    renderPerformanceMatrix(data) {
        const container = document.getElementById('performance-matrix-grid');
        if (!container) {
            console.warn('Performance Matrix container not found');
            return;
        }

        const metrics = this.calculatePerformanceMetrics(data);

        const html = metrics.map(metric => {
            const statusClass = metric.status === 'high' ? 'status-high' : 'status-low';
            const statusIcon = metric.status === 'high' ? 'fa-arrow-up' : 'fa-arrow-down';
            const statusText = metric.status === 'high' ? 'Powyżej benchmarku' : 'Poniżej benchmarku';

            return `
                <div class="performance-metric-card ${statusClass}">
                    <div class="metric-header">
                        <i class="fas ${metric.icon}"></i>
                        <span class="metric-name">${metric.name}</span>
                    </div>
                    <div class="metric-value-row">
                        <div class="metric-value">${metric.value}</div>
                        <div class="metric-unit">${metric.unit}</div>
                    </div>
                    <div class="metric-benchmark">
                        <span class="benchmark-label">Benchmark:</span>
                        <span class="benchmark-value">${metric.benchmark} ${metric.unit}</span>
                    </div>
                    <div class="metric-status">
                        <i class="fas ${statusIcon}"></i>
                        <span>${statusText}</span>
                    </div>
                    <div class="metric-description">${metric.description}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    },

    /**
     * Aktualizuje kartę KPI z trendem i sparkline
     */
    updateKPICard(elementId, value, suffix, trend, sparklineData) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let html = `<div class="kpi-value-large">${value}${suffix ? ' ' + suffix : ''}</div>`;

        if (trend) {
            const trendClass = trend.direction === 'up' ? 'trend-up' : trend.direction === 'down' ? 'trend-down' : 'trend-neutral';
            html += `
                <div class="kpi-trend ${trendClass}">
                    <i class="fas ${trend.icon}"></i>
                    <span>${trend.percent}%</span>
                </div>
            `;
        }

        element.innerHTML = html;

        // Rysuj sparkline jeśli dostępny
        if (sparklineData && elementId === 'stat-patrole') {
            // Placeholder - możesz dodać mini wykres tutaj
        }
    },

    /**
     * Renderuje sekcję Top Insights
     */
    renderTopInsights(insights) {
        const container = document.getElementById('top-insights-container');
        if (!container) return;

        const html = insights.map(insight => `
            <div class="insight-item insight-${insight.type}">
                <i class="fas ${insight.icon} insight-icon"></i>
                <span class="insight-text">${insight.text}</span>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    filterDataByDate(data, dateFrom, dateTo) {
        if (!data || !dateFrom || !dateTo) return [];
        
        return data.filter(row => {
            const rowDate = this.parsePolishDate(row.data);
            if (!rowDate) return false;
            return rowDate >= dateFrom && rowDate <= dateTo;
        });
    },

    parsePolishDate(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    },

    dateToInputFormat(date) {
        if (!date) return '';
        if (typeof date === 'string') {
            const parts = date.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return date;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    drawPatroleTrendChart(patrole) {
        const canvas = document.getElementById('chartPatrole');
        if (!canvas) {
            console.error('Canvas chartPatrole nie znaleziony!');
            return;
        }

        // Pobierz dane BEZPOŚREDNIO z localStorage (jak na stronie startowej!)
        const savedData = Utils.loadFromLocalStorage('aep_data_patrole');
        
        let labels = [];
        let values = [];
        
        if (savedData && savedData.length > 0) {
            console.log('📋 PATROLE - Wszystkie wiersze:', savedData.length);
            console.log('📋 Przykładowy wiersz:', savedData[0]);
            
            // Weź ostatnie 30 wpisów i FILTRUJ tylko te z danymi
            const last30 = savedData.slice(-30).filter(item => {
                const razem = parseInt(item.razem_rodzaj || 0);
                return razem > 0; // Tylko wiersze gdzie jest faktyczna wartość
            });
            
            console.log('📊 Po filtracji (razem > 0):', last30.length, 'wierszy');
            
            if (last30.length > 0) {
                // Formatuj daty na krótkie (dzień.miesiąc)
                labels = last30.map(item => {
                    const dateStr = item.date || item.data || ''; // POPRAWIONE: date + fallback
                    if (!dateStr) return 'Brak';
                    
                    // Format: "27.11.2024" → "27.11"
                    const parts = dateStr.split('.');
                    if (parts.length >= 2) {
                        return `${parts[0]}.${parts[1]}`;
                    }
                    return dateStr;
                });
                
                values = last30.map(item => {
                    const razem = parseInt(item.razem_rodzaj || 0);
                    return razem;
                });
                
                console.log('✅ Daty:', labels);
                console.log('✅ Wartości (razem_rodzaj):', values);
            } else {
                // Brak danych z wartościami
                labels = ['Brak danych'];
                values = [0];
            }
        } else {
            // Brak danych
            labels = ['Brak danych'];
            values = [0];
        }

        console.log('Wykres patroli - labels:', labels.length, 'values:', values.length);

        if (window.patrolChart) {
            window.patrolChart.destroy();
        }

        window.patrolChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Liczba patroli',
                    data: values,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2, // DODANE: Sharp rendering
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        titleColor: '#e6e6e6',
                        bodyColor: '#e6e6e6',
                        borderColor: '#2a2f3a',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            title: function(context) {
                                return 'Data: ' + context[0].label;
                            },
                            label: function(context) {
                                return 'Liczba patroli: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(42, 47, 58, 0.5)' },
                        ticks: { 
                            color: '#e6e6e6',
                            font: {
                                size: 13,
                                weight: '600'
                            },
                            stepSize: 1,
                            precision: 0
                        },
                        title: {
                            display: true,
                            text: 'Liczba patroli',
                            color: '#e6e6e6',
                            font: {
                                size: 15,
                                weight: 'bold',
                                family: "'Oswald', sans-serif"
                            },
                            padding: { top: 10, bottom: 10 }
                        }
                    },
                    x: {
                        grid: { color: 'rgba(42, 47, 58, 0.3)' },
                        ticks: { 
                            color: '#e6e6e6',
                            font: {
                                size: 12,
                                weight: '600'
                            },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        title: {
                            display: true,
                            text: 'Data (dzień.miesiąc)',
                            color: '#e6e6e6',
                            font: {
                                size: 15,
                                weight: 'bold',
                                family: "'Oswald', sans-serif"
                            },
                            padding: { top: 10, bottom: 5 }
                        }
                    }
                }
            }
        });

        console.log('✅ Wykres patroli utworzony!');
    },

    drawWykroczeniaPieChart(wykroczenia) {
        const canvas = document.getElementById('chartWykroczenia');
        if (!canvas) {
            console.error('Canvas chartWykroczenia nie znaleziony!');
            return;
        }

        // Pobierz dane BEZPOŚREDNIO z localStorage (jak na stronie startowej!)
        const podstawaLabels = {
            'nar_ubiorcz': 'Nar.ub.',
            'inne_nar': 'Inne nar.',
            'nar_kk': 'Nar.KK',
            'wykr_porzadek': 'Wykr.porz.',
            'wykr_bezp': 'Wykr.bezp.',
            'nar_dyscyplina': 'Nar.dyscy.',
            'nar_bron': 'Nar.broni',
            'nar_ochr_zdr': 'Nar.ochr.zdr.',
            'nar_zakwat': 'Nar.zakwat.',
            'pozostale': 'Pozostałe'
        };
        
        const savedData = Utils.loadFromLocalStorage('aep_data_wykroczenia');
        
        let labels = [];
        let values = [];
        
        if (savedData && savedData.length > 0) {
            // Zlicz według podstawy interwencji
            const counts = {};
            
            savedData.forEach(row => {
                // Sprawdź każdą podstawę
                Object.keys(podstawaLabels).forEach(key => {
                    if (row[key] && parseInt(row[key]) > 0) {
                        const label = podstawaLabels[key];
                        counts[label] = (counts[label] || 0) + parseInt(row[key]);
                    }
                });
            });
            
            // Sortuj i weź top 5
            const sorted = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            if (sorted.length > 0) {
                labels = sorted.map(item => item[0]);
                values = sorted.map(item => item[1]);
            } else {
                labels = ['Brak danych'];
                values = [1];
            }
        } else {
            labels = ['Brak danych'];
            values = [1];
        }

        console.log('Wykres wykroczeń - labels:', labels.length, 'values:', values.length);

        if (window.wykroczeniaChart) {
            window.wykroczeniaChart.destroy();
        }

        window.wykroczeniaChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#ef4444',
                        '#f59e0b',
                        '#10b981',
                        '#3b82f6',
                        '#8b5cf6',
                        '#ec4899'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9aa3b2',
                            padding: 6,
                            font: { size: 10, weight: '600' },
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        titleColor: '#e6e6e6',
                        bodyColor: '#e6e6e6',
                        borderColor: '#2a2f3a',
                        borderWidth: 1,
                        padding: 12
                    }
                }
            }
        });

        console.log('✅ Wykres wykroczeń utworzony!');
    },

    // WYKRES 3: WKRD - Trend czasowy
    drawWKRDChart(wkrd) {
        const canvas = document.getElementById('chartWKRD');
        if (!canvas) {
            console.error('❌ Canvas chartWKRD nie znaleziony!');
            return;
        }

        console.log('📊 WKRD - dane:', wkrd.length, 'wierszy');
        if (wkrd.length > 0) {
            console.log('📋 Przykładowy wiersz WKRD:', wkrd[0]);
        }

        const last30 = (wkrd || []).slice(-30);
        let labels = last30.map(item => {
            const dateStr = item.data || '';
            const parts = dateStr.split('.');
            return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : dateStr;
        });
        
        // RAZEM = WPM + PPM + Pozostałe (jak w tabeli!)
        let values = last30.map(item => {
            const wpm = parseInt(item.wpm || 0);
            const ppm = parseInt(item.ppm || 0);
            const pozostale = parseInt(item.pozostale || 0);
            const razem = wpm + ppm + pozostale;
            return razem;
        });

        console.log('  Daty WKRD:', labels);
        console.log('  Wartości WKRD (wpm+ppm+pozostale):', values);
        console.log('  Szczegóły:', last30.map(item => `WPM:${item.wpm} PPM:${item.ppm} Pozost:${item.pozostale} = ${parseInt(item.wpm||0)+parseInt(item.ppm||0)+parseInt(item.pozostale||0)}`));

        // Sprawdź czy są jakiekolwiek dane > 0
        const hasData = values.some(v => v > 0);
        if (!hasData) {
            console.warn('⚠️ WKRD: Wszystkie wartości = 0! Kolumna RAZEM pusta?');
            // Pokaż komunikat zamiast pustego wykresu
            labels = ['Brak danych'];
            values = [1];
        }

        if (window.wkrdChart) window.wkrdChart.destroy();

        window.wkrdChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Liczba interwencji WKRD',
                    data: values,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 13, weight: '600' },
                            stepSize: 1 
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.5)' },
                        title: { 
                            display: true, 
                            text: 'Liczba interwencji', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    },
                    x: {
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 12, weight: '600' },
                            maxRotation: 45, 
                            minRotation: 45 
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.3)' },
                        title: { 
                            display: true, 
                            text: 'Data', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    }
                }
            }
        });

        console.log('✅ Wykres WKRD utworzony!');
    },

    // WYKRES 4: Mandaty - Suma w czasie
    drawMandatyChart(sankcje) {
        const canvas = document.getElementById('chartMandaty');
        if (!canvas) return;

        const last30 = (sankcje || []).slice(-30);
        const labels = last30.map(item => {
            const dateStr = item.data || '';
            const parts = dateStr.split('.');
            return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : dateStr;
        });
        const values = last30.map(item => parseInt(item.wysokosc_mandatu || 0));

        if (window.mandatyChart) window.mandatyChart.destroy();

        window.mandatyChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Wysokość mandatu (PLN)',
                    data: values,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#9aa3b2' },
                        grid: { color: 'rgba(42, 47, 58, 0.5)' },
                        title: { display: true, text: 'Kwota (PLN)', color: '#e6e6e6', font: { size: 14, weight: 'bold' } }
                    },
                    x: {
                        ticks: { color: '#9aa3b2', maxRotation: 45, minRotation: 45 },
                        grid: { color: 'rgba(42, 47, 58, 0.3)' },
                        title: { display: true, text: 'Data', color: '#e6e6e6', font: { size: 14, weight: 'bold' } }
                    }
                }
            }
        });
    },

    // WYKRES 5: Konwoje - Trend
    drawKonwojeChart(konwoje) {
        const canvas = document.getElementById('chartKonwoje');
        if (!canvas) {
            console.error('❌ Canvas chartKonwoje nie znaleziony!');
            return;
        }

        console.log('📊 KONWOJE - dane:', konwoje.length, 'wierszy');
        if (konwoje.length > 0) {
            console.log('📋 Przykładowy wiersz Konwoje:', konwoje[0]);
        }

        const last30 = (konwoje || []).slice(-30);
        const labels = last30.map(item => {
            const dateStr = item.data || '';
            const parts = dateStr.split('.');
            return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : dateStr;
        });
        
        // RAZEM = miejscowy + zamiejscowy (jak w tabeli!)
        const values = last30.map(item => {
            const miejscowy = parseInt(item.miejscowy || 0);
            const zamiejscowy = parseInt(item.zamiejscowy || 0);
            const razem = miejscowy + zamiejscowy;
            return razem;
        });

        console.log('  Daty:', labels);
        console.log('  Wartości (miejscowy+zamiejscowy):', values);

        if (window.konwojeChart) window.konwojeChart.destroy();

        window.konwojeChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Liczba konwojów',
                    data: values,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 13, weight: '600' },
                            stepSize: 1 
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.5)' },
                        title: { 
                            display: true, 
                            text: 'Liczba konwojów', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    },
                    x: {
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 12, weight: '600' },
                            maxRotation: 45, 
                            minRotation: 45 
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.3)' },
                        title: { 
                            display: true, 
                            text: 'Data', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    }
                }
            }
        });

        console.log('✅ Wykres Konwojów utworzony!');
    },

    // WYKRES 6: ŚPB - Rodzaje środków
    drawSPBChart(spb) {
        const canvas = document.getElementById('chartSPB');
        if (!canvas) {
            console.error('❌ Canvas chartSPB nie znaleziony!');
            return;
        }

        console.log('📊 ŚPB - dane:', spb.length, 'wierszy');
        if (spb.length > 0) {
            console.log('📋 Przykładowy wiersz ŚPB:', spb[0]);
            console.log('📋 Wszystkie klucze:', Object.keys(spb[0]));
        }

        // Zlicz WSZYSTKIE kolumny numeryczne (pomijając metadane)
        const counts = {};
        const skipKeys = ['id', 'data', 'nr_jw', 'nazwa_jw', 'razem'];

        (spb || []).forEach(row => {
            Object.keys(row).forEach(key => {
                if (!skipKeys.includes(key)) {
                    const val = parseInt(row[key] || 0);
                    if (val > 0) {
                        // Sformatuj nazwę (snake_case → Normalna Nazwa)
                        const label = key.split('_').map(w => 
                            w.charAt(0).toUpperCase() + w.slice(1)
                        ).join(' ');
                        
                        counts[label] = (counts[label] || 0) + val;
                        console.log(`  ${label}: +${val} → total: ${counts[label]}`);
                    }
                }
            });
        });

        const labels = Object.keys(counts);
        const values = Object.values(counts);

        console.log('✅ Środki znalezione:', labels.length);
        console.log('✅ Labels:', labels);
        console.log('✅ Values:', values);

        if (labels.length === 0) {
            console.warn('⚠️ Brak danych ŚPB - wszystkie wartości = 0');
            labels.push('Brak danych');
            values.push(1);
        }

        if (window.spbChart) window.spbChart.destroy();

        window.spbChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
                        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
                        '#06b6d4', '#84cc16', '#f43f5e', '#a855f7'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { 
                            color: '#9aa3b2',
                            font: { size: 10, weight: '600' },
                            padding: 6,
                            boxWidth: 12
                        }
                    }
                }
            }
        });

        console.log('✅ Wykres ŚPB utworzony!');
    },

    // WYKRES 7: Pilotaże - Trend
    drawPilotazeChart(pilotaze) {
        const canvas = document.getElementById('chartPilotaze');
        if (!canvas) {
            console.error('❌ Canvas chartPilotaze nie znaleziony!');
            return;
        }

        console.log('📊 PILOTAŻE - dane:', pilotaze.length, 'wierszy');
        if (pilotaze.length > 0) {
            console.log('📋 Przykładowy wiersz Pilotaże:', pilotaze[0]);
        }

        const last30 = (pilotaze || []).slice(-30);
        const labels = last30.map(item => {
            const dateStr = item.data || '';
            const parts = dateStr.split('.');
            return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : dateStr;
        });
        
        // RAZEM = wlasne + sojusznicze (jak w tabeli!)
        const values = last30.map(item => {
            const wlasne = parseInt(item.wlasne || 0);
            const sojusznicze = parseInt(item.sojusznicze || 0);
            const razem = wlasne + sojusznicze;
            return razem;
        });

        console.log('  Daty:', labels);
        console.log('  Wartości (wlasne+sojusznicze):', values);

        if (window.pilotazeChart) window.pilotazeChart.destroy();

        window.pilotazeChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Liczba pilotaży',
                    data: values,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 13, weight: '600' },
                            stepSize: 1 
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.5)' },
                        title: { 
                            display: true, 
                            text: 'Liczba pilotaży', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    },
                    x: {
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 12, weight: '600' },
                            maxRotation: 45, 
                            minRotation: 45 
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.3)' },
                        title: { 
                            display: true, 
                            text: 'Data', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    }
                }
            }
        });

        console.log('✅ Wykres Pilotaży utworzony!');
    },

    // WYKRES 8: Zdarzenia - Wypadki vs Kolizje
    drawZdarzeniaChart(zdarzenia) {
        const canvas = document.getElementById('chartZdarzenia');
        if (!canvas) {
            console.error('❌ Canvas chartZdarzenia nie znaleziony!');
            return;
        }

        console.log('📊 ZDARZENIA - dane:', zdarzenia.length, 'wierszy');
        if (zdarzenia.length > 0) {
            console.log('📋 Przykładowy wiersz Zdarzenia:', zdarzenia[0]);
        }

        let wypadki = 0;
        let kolizje = 0;

        (zdarzenia || []).forEach(row => {
            wypadki += parseInt(row.wypadek || 0);
            kolizje += parseInt(row.kolizja || 0);
        });

        console.log('  Wypadki:', wypadki);
        console.log('  Kolizje:', kolizje);

        // Jeśli brak danych - pokaż komunikat
        if (zdarzenia.length === 0 || (wypadki === 0 && kolizje === 0)) {
            console.warn('⚠️ ZDARZENIA: Brak danych! Dodaj wiersze w zakładce "Zdarzenia drogowe"');
        }

        if (window.zdarzeniaChart) window.zdarzeniaChart.destroy();

        window.zdarzeniaChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Wypadki', 'Kolizje'],
                datasets: [{
                    label: 'Liczba zdarzeń',
                    data: [wypadki, kolizje],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y', // POZIOMY BAR!
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        titleColor: '#e6e6e6',
                        bodyColor: '#e6e6e6',
                        borderColor: '#2a2f3a',
                        borderWidth: 1,
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 }
                    },
                    // PLUGIN: Pokaż liczby na końcu słupków
                    datalabels: false // Wyłączamy jeśli nie ma pluginu
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 13, weight: '600' },
                            stepSize: 1,
                            precision: 0
                        },
                        grid: { 
                            color: 'rgba(42, 47, 58, 0.5)',
                            drawBorder: false
                        },
                        title: { 
                            display: true, 
                            text: 'Liczba zdarzeń', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" },
                            padding: { top: 10, bottom: 5 }
                        }
                    },
                    y: {
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 14, weight: 'bold' },
                            padding: 10
                        },
                        grid: { 
                            display: false,
                            drawBorder: false
                        }
                    }
                },
                // Animacja
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            },
            plugins: [{
                // Custom plugin: Rysuj liczby na końcu słupków
                id: 'textOnBars',
                afterDatasetsDraw: (chart) => {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            if (value > 0) {
                                ctx.fillStyle = '#e6e6e6';
                                ctx.font = 'bold 16px "Oswald", sans-serif';
                                ctx.textAlign = 'left';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(value, bar.x + 10, bar.y);
                            }
                        });
                    });
                }
            }]
        });

        console.log('✅ Wykres Zdarzeń utworzony!');
    },

    // Dashboard: Wykroczenia i Sankcje
    renderWykroczenia() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="dashboard-view">
                <button class="btn-back" onclick="DashboardHub.backToHub()">
                    <i class="fas fa-arrow-left"></i> Powrót do Hub
                </button>
                <h1 class="dashboard-title">
                    <i class="fas fa-exclamation-circle"></i> Wykroczenia i Sankcje
                </h1>

                <!-- Mini Kafelki -->
                <div class="stats-grid-compact">
                    <div class="stat-card-mini stat-card-primary">
                        <div class="stat-icon-mini"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="stat-content-mini">
                            <div class="stat-label-mini">Wykroczenia</div>
                            <div class="stat-value-mini" id="stat-wykroczenia-total">0</div>
                        </div>
                    </div>
                    <div class="stat-card-mini stat-card-warning">
                        <div class="stat-icon-mini"><i class="fas fa-coins"></i></div>
                        <div class="stat-content-mini">
                            <div class="stat-label-mini">Mandaty</div>
                            <div class="stat-value-mini" id="stat-mandaty-suma">0 PLN</div>
                        </div>
                    </div>
                    <div class="stat-card-mini stat-card-success">
                        <div class="stat-icon-mini"><i class="fas fa-chart-line"></i></div>
                        <div class="stat-content-mini">
                            <div class="stat-label-mini">Średnia</div>
                            <div class="stat-value-mini" id="stat-mandaty-avg">0 PLN</div>
                        </div>
                    </div>
                    <div class="stat-card-mini stat-card-danger">
                        <div class="stat-icon-mini"><i class="fas fa-crown"></i></div>
                        <div class="stat-content-mini">
                            <div class="stat-label-mini">Najczęstsza</div>
                            <div class="stat-value-mini" id="stat-podstawa-top" title="">-</div>
                        </div>
                    </div>
                    <div class="stat-card-mini stat-card-info">
                        <div class="stat-icon-mini"><i class="fas fa-dollar-sign"></i></div>
                        <div class="stat-content-mini">
                            <div class="stat-label-mini">Najdroższa</div>
                            <div class="stat-value-mini" id="stat-podstawa-expensive" title="">-</div>
                        </div>
                    </div>
                    <div class="stat-card-mini stat-card-secondary">
                        <div class="stat-icon-mini"><i class="fas fa-list"></i></div>
                        <div class="stat-content-mini">
                            <div class="stat-label-mini">Unikalne</div>
                            <div class="stat-value-mini" id="stat-podstawy-unique">0</div>
                        </div>
                    </div>
                </div>

                <!-- Wykres 1 i 2 -->
                <div class="charts-row-large">
                    <div class="chart-container-large">
                        <h3><i class="fas fa-chart-line"></i> Trend wykroczeń w czasie</h3>
                        <canvas id="chartWykroczeniaTrend"></canvas>
                    </div>
                    <div class="chart-container-large">
                        <h3><i class="fas fa-wallet"></i> Rozkład kwot mandatów</h3>
                        <canvas id="chartMandatyHistogram"></canvas>
                    </div>
                </div>

                <!-- Wykres 3 i 4 -->
                <div class="charts-row-large">
                    <div class="chart-container-large">
                        <h3><i class="fas fa-traffic-light"></i> Rodzaje naruszeń</h3>
                        <canvas id="chartRodzajeNaruszen"></canvas>
                    </div>
                    <div class="chart-container-large">
                        <h3><i class="fas fa-map-marker-alt"></i> TOP Miejscowości</h3>
                        <canvas id="chartMiejscowosci"></canvas>
                    </div>
                </div>

                <!-- Wykres 5 i 6 -->
                <div class="charts-row-large">
                    <div class="chart-container-large">
                        <h3><i class="fas fa-balance-scale"></i> Podstawy prawne (rozszerzone)</h3>
                        <canvas id="chartPodstawyPrawne"></canvas>
                    </div>
                    <div class="chart-container-large">
                        <h3><i class="fas fa-money-bill-wave"></i> Średnia kwota mandatu na podstawę</h3>
                        <canvas id="chartSredniaKwota"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Załaduj dane i statystyki
        setTimeout(() => {
            console.log('=== DASHBOARD WYKROCZENIA I SANKCJE - START ===');
            this.loadWykroczeniaStats();
        }, 500);
    },

    loadWykroczeniaStats() {
        const wykroczenia = Utils.loadFromLocalStorage('aep_data_wykroczenia') || [];
        const sankcje = Utils.loadFromLocalStorage('aep_data_sankcje') || [];

        console.log('📊 Wykroczenia:', wykroczenia.length);
        console.log('💰 Sankcje:', sankcje.length);

        // Oblicz statystyki dla kafelków
        this.updateWykroczeniaKafelki(wykroczenia, sankcje);

        // Rysuj wykresy
        this.drawWykroczeniaTrend(wykroczenia);
        this.drawMandatyHistogram(sankcje);
        this.drawRodzajeNaruszen(wykroczenia);
        this.drawMiejscowosci(wykroczenia);
        this.drawPodstawyPrawneRozszerzone(wykroczenia);
        this.drawSredniaKwotaNaPodstawe(wykroczenia, sankcje);
    },

    updateWykroczeniaKafelki(wykroczenia, sankcje) {
        // Liczba wykroczeń
        const totalWykroczenia = wykroczenia.length;
        document.getElementById('stat-wykroczenia-total').textContent = totalWykroczenia;

        // Suma mandatów
        const sumaMandatow = sankcje.reduce((sum, s) => sum + parseFloat(s.wysokosc_mandatu || 0), 0);
        document.getElementById('stat-mandaty-suma').textContent = sumaMandatow.toFixed(0) + ' PLN';

        // Średnia mandatu
        const avgMandat = sankcje.length > 0 ? sumaMandatow / sankcje.length : 0;
        document.getElementById('stat-mandaty-avg').textContent = avgMandat.toFixed(0) + ' PLN';

        // Najczęstsza podstawa
        const podstawyCounts = {};
        wykroczenia.forEach(w => {
            const p = w.podst_interw || 'Brak';
            podstawyCounts[p] = (podstawyCounts[p] || 0) + 1;
        });
        const topPodstawa = Object.entries(podstawyCounts).sort((a,b) => b[1] - a[1])[0];
        if (topPodstawa) {
            const short = topPodstawa[0].length > 10 ? topPodstawa[0].substring(0,10) + '...' : topPodstawa[0];
            document.getElementById('stat-podstawa-top').textContent = short;
            document.getElementById('stat-podstawa-top').title = topPodstawa[0] + ' (' + topPodstawa[1] + 'x)';
        }

        // Najdroższa podstawa (średnia)
        const podstawyKwoty = {};
        wykroczenia.forEach((w, i) => {
            const p = w.podst_interw || 'Brak';
            const mandat = sankcje[i] ? parseFloat(sankcje[i].wysokosc_mandatu || 0) : 0;
            if (!podstawyKwoty[p]) podstawyKwoty[p] = { suma: 0, ile: 0 };
            podstawyKwoty[p].suma += mandat;
            podstawyKwoty[p].ile += 1;
        });
        const avgPodstawy = Object.entries(podstawyKwoty).map(([k,v]) => [k, v.suma / v.ile]).sort((a,b) => b[1] - a[1])[0];
        if (avgPodstawy) {
            const short = avgPodstawy[0].length > 10 ? avgPodstawy[0].substring(0,10) + '...' : avgPodstawy[0];
            document.getElementById('stat-podstawa-expensive').textContent = short;
            document.getElementById('stat-podstawa-expensive').title = avgPodstawy[0] + ' (śr. ' + avgPodstawy[1].toFixed(0) + ' PLN)';
        }

        // Unikalne podstawy
        const uniquePodstawy = new Set(wykroczenia.map(w => w.podst_interw).filter(p => p));
        document.getElementById('stat-podstawy-unique').textContent = uniquePodstawy.size;

        console.log('✅ Kafelki zaktualizowane');
    },

    // WYKRES 1: Trend wykroczeń w czasie (LINE)
    drawWykroczeniaTrend(wykroczenia) {
        const canvas = document.getElementById('chartWykroczeniaTrend');
        if (!canvas) {
            console.error('❌ Canvas chartWykroczeniaTrend nie znaleziony!');
            return;
        }

        console.log('📈 Rysowanie trendu wykroczeń...');

        // Grupuj po dacie i zlicz naruszenia
        const dateGroups = {};
        wykroczenia.forEach(w => {
            const date = w.data || '';
            if (!dateGroups[date]) {
                dateGroups[date] = 0;
            }
            // Zlicz wszystkie naruszenia w tym wierszu
            dateGroups[date] += parseInt(w.nar_ubiorcz || 0) + 
                                parseInt(w.inne_nar || 0) + 
                                parseInt(w.nar_kk || 0) + 
                                parseInt(w.wykr_porzadek || 0);
        });

        // Sortuj po dacie i weź ostatnie 30
        const sorted = Object.entries(dateGroups).sort((a,b) => {
            // Porównaj daty (format DD.MM.YYYY)
            const dateA = a[0].split('.').reverse().join('');
            const dateB = b[0].split('.').reverse().join('');
            return dateA.localeCompare(dateB);
        }).slice(-30);

        const labels = sorted.map(([date]) => {
            const parts = date.split('.');
            return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : date;
        });
        const values = sorted.map(([,count]) => count);

        console.log('  Daty:', labels);
        console.log('  Wartości:', values);

        if (window.wykroczeniaTrendChart) window.wykroczeniaTrendChart.destroy();

        window.wykroczeniaTrendChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Liczba wykroczeń',
                    data: values,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        titleColor: '#e6e6e6',
                        bodyColor: '#e6e6e6',
                        borderColor: '#2a2f3a',
                        borderWidth: 1,
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 13, weight: '600' },
                            stepSize: 1,
                            precision: 0
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.5)' },
                        title: { 
                            display: true, 
                            text: 'Liczba wykroczeń', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    },
                    x: {
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 12, weight: '600' },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.3)' },
                        title: { 
                            display: true, 
                            text: 'Data', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    }
                }
            }
        });

        console.log('✅ Wykres trendu utworzony!');
    },

    // WYKRES 2: Histogram kwot mandatów (BAR)
    drawMandatyHistogram(sankcje) {
        const canvas = document.getElementById('chartMandatyHistogram');
        if (!canvas) {
            console.error('❌ Canvas chartMandatyHistogram nie znaleziony!');
            return;
        }

        console.log('💰 Rysowanie histogramu mandatów...');

        // Przedziały kwot
        const ranges = [
            { label: '0-100 PLN', min: 0, max: 100, count: 0 },
            { label: '101-200 PLN', min: 101, max: 200, count: 0 },
            { label: '201-500 PLN', min: 201, max: 500, count: 0 },
            { label: '501-1000 PLN', min: 501, max: 1000, count: 0 },
            { label: '1000+ PLN', min: 1001, max: Infinity, count: 0 }
        ];

        sankcje.forEach(s => {
            const kwota = parseFloat(s.wysokosc_mandatu || 0);
            const range = ranges.find(r => kwota >= r.min && kwota <= r.max);
            if (range) range.count++;
        });

        const labels = ranges.map(r => r.label);
        const values = ranges.map(r => r.count);

        console.log('  Przedziały:', labels);
        console.log('  Wartości:', values);

        if (window.mandatyHistogramChart) window.mandatyHistogramChart.destroy();

        window.mandatyHistogramChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Liczba mandatów',
                    data: values,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        titleColor: '#e6e6e6',
                        bodyColor: '#e6e6e6',
                        borderColor: '#2a2f3a',
                        borderWidth: 1,
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 13, weight: '600' },
                            stepSize: 1,
                            precision: 0
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.5)' },
                        title: { 
                            display: true, 
                            text: 'Liczba mandatów', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    },
                    x: {
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 12, weight: '600' }
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.3)' },
                        title: { 
                            display: true, 
                            text: 'Przedział kwoty', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    }
                }
            }
        });

        console.log('✅ Histogram mandatów utworzony!');
    },

    // WYKRES 3: Rodzaje naruszeń (HORIZONTAL BAR)
    drawRodzajeNaruszen(wykroczenia) {
        const canvas = document.getElementById('chartRodzajeNaruszen');
        if (!canvas) {
            console.error('❌ Canvas chartRodzajeNaruszen nie znaleziony!');
            return;
        }

        console.log('🚦 Rysowanie rodzajów naruszeń...');

        // Zlicz każdy typ naruszenia
        const counts = {
            'Nar. ubiorcze': 0,
            'Inne naruszenia': 0,
            'Nar. KK': 0,
            'Wykr. porządkowe': 0
        };

        wykroczenia.forEach(w => {
            counts['Nar. ubiorcze'] += parseInt(w.nar_ubiorcz || 0);
            counts['Inne naruszenia'] += parseInt(w.inne_nar || 0);
            counts['Nar. KK'] += parseInt(w.nar_kk || 0);
            counts['Wykr. porządkowe'] += parseInt(w.wykr_porzadek || 0);
        });

        // Sortuj od największego
        const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
        const labels = sorted.map(([k]) => k);
        const values = sorted.map(([,v]) => v);

        console.log('  Rodzaje:', labels);
        console.log('  Wartości:', values);

        if (window.rodzajeNaruszenChart) window.rodzajeNaruszenChart.destroy();

        window.rodzajeNaruszenChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Liczba naruszeń',
                    data: values,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y', // POZIOMY BAR
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 21, 0.95)',
                        titleColor: '#e6e6e6',
                        bodyColor: '#e6e6e6',
                        borderColor: '#2a2f3a',
                        borderWidth: 1,
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 13, weight: '600' },
                            stepSize: 1,
                            precision: 0
                        },
                        grid: { 
                            color: 'rgba(42, 47, 58, 0.5)',
                            drawBorder: false
                        },
                        title: { 
                            display: true, 
                            text: 'Liczba naruszeń', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    },
                    y: {
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 14, weight: 'bold' },
                            padding: 10
                        },
                        grid: { 
                            display: false,
                            drawBorder: false
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            },
            plugins: [{
                // Liczby na końcu słupków
                id: 'textOnBars',
                afterDatasetsDraw: (chart) => {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            if (value > 0) {
                                ctx.fillStyle = '#e6e6e6';
                                ctx.font = 'bold 16px "Oswald", sans-serif';
                                ctx.textAlign = 'left';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(value, bar.x + 10, bar.y);
                            }
                        });
                    });
                }
            }]
        });

        console.log('✅ Rodzaje naruszeń utworzone!');
    },

    // WYKRES 4: TOP Miejscowości (HORIZONTAL BAR)
    drawMiejscowosci(wykroczenia) {
        const canvas = document.getElementById('chartMiejscowosci');
        if (!canvas) {
            console.error('❌ Canvas chartMiejscowosci nie znaleziony!');
            return;
        }

        console.log('📍 Rysowanie TOP miejscowości...');

        // Zlicz miejscowości
        const counts = {};
        wykroczenia.forEach(w => {
            const miejsce = w.miejsce || 'Nieznane';
            counts[miejsce] = (counts[miejsce] || 0) + 1;
        });

        // TOP 10
        const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10);
        const labels = sorted.map(([k]) => k);
        const values = sorted.map(([,v]) => v);

        console.log('  Miejscowości:', labels);
        console.log('  Wartości:', values);

        if (window.miejscowosciChart) window.miejscowosciChart.destroy();

        window.miejscowosciChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Liczba wykroczeń',
                    data: values,
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 13, weight: '600' },
                            stepSize: 1
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.5)', drawBorder: false },
                        title: { 
                            display: true, 
                            text: 'Liczba wykroczeń', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    },
                    y: {
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 12, weight: 'bold' },
                            padding: 10
                        },
                        grid: { display: false, drawBorder: false }
                    }
                }
            },
            plugins: [{
                id: 'textOnBars',
                afterDatasetsDraw: (chart) => {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            if (value > 0) {
                                ctx.fillStyle = '#e6e6e6';
                                ctx.font = 'bold 14px "Oswald", sans-serif';
                                ctx.textAlign = 'left';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(value, bar.x + 10, bar.y);
                            }
                        });
                    });
                }
            }]
        });

        console.log('✅ Wykres miejscowości utworzony!');
    },

    // WYKRES 5: Podstawy prawne - rozszerzone (DOUGHNUT)
    drawPodstawyPrawneRozszerzone(wykroczenia) {
        const canvas = document.getElementById('chartPodstawyPrawne');
        if (!canvas) {
            console.error('❌ Canvas chartPodstawyPrawne nie znaleziony!');
            return;
        }

        console.log('⚖️ Rysowanie podstaw prawnych...');

        // Zlicz podstawy
        const counts = {};
        wykroczenia.forEach(w => {
            const podst = w.podst_interw || 'Brak';
            counts[podst] = (counts[podst] || 0) + 1;
        });

        // TOP 10 (więcej niż w ogólnym dashboardzie)
        const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10);
        const labels = sorted.map(([k]) => k);
        const values = sorted.map(([,v]) => v);

        console.log('  Podstawy (TOP 10):', labels);
        console.log('  Wartości:', values);

        if (window.podstawyPrawneChart) window.podstawyPrawneChart.destroy();

        window.podstawyPrawneChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
                        '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: { 
                            color: '#9aa3b2',
                            font: { size: 10, weight: '600' },
                            padding: 6,
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Podstawy prawne utworzone!');
    },

    // WYKRES 6: Średnia kwota mandatu na podstawę (HORIZONTAL BAR)
    drawSredniaKwotaNaPodstawe(wykroczenia, sankcje) {
        const canvas = document.getElementById('chartSredniaKwota');
        if (!canvas) {
            console.error('❌ Canvas chartSredniaKwota nie znaleziony!');
            return;
        }

        console.log('💵 Rysowanie średniej kwoty na podstawę...');

        // Grupuj mandaty po podstawie
        const podstawyKwoty = {};
        wykroczenia.forEach((w, i) => {
            const podst = w.podst_interw || 'Brak';
            const mandat = sankcje[i] ? parseFloat(sankcje[i].wysokosc_mandatu || 0) : 0;
            
            if (!podstawyKwoty[podst]) {
                podstawyKwoty[podst] = { suma: 0, ile: 0 };
            }
            podstawyKwoty[podst].suma += mandat;
            podstawyKwoty[podst].ile += 1;
        });

        // Oblicz średnie i sortuj
        const avgs = Object.entries(podstawyKwoty)
            .map(([k, v]) => [k, v.suma / v.ile])
            .filter(([k, avg]) => avg > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const labels = avgs.map(([k]) => k);
        const values = avgs.map(([,avg]) => Math.round(avg));

        console.log('  Podstawy:', labels);
        console.log('  Średnie kwoty:', values);

        if (window.sredniaKwotaChart) window.sredniaKwotaChart.destroy();

        window.sredniaKwotaChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Średnia kwota (PLN)',
                    data: values,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: 2,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 13, weight: '600' },
                            callback: function(value) {
                                return value + ' PLN';
                            }
                        },
                        grid: { color: 'rgba(42, 47, 58, 0.5)', drawBorder: false },
                        title: { 
                            display: true, 
                            text: 'Średnia kwota mandatu (PLN)', 
                            color: '#e6e6e6', 
                            font: { size: 15, weight: 'bold', family: "'Oswald', sans-serif" }
                        }
                    },
                    y: {
                        ticks: { 
                            color: '#e6e6e6',
                            font: { size: 11, weight: 'bold' },
                            padding: 10
                        },
                        grid: { display: false, drawBorder: false }
                    }
                }
            },
            plugins: [{
                id: 'textOnBars',
                afterDatasetsDraw: (chart) => {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const value = dataset.data[index];
                            if (value > 0) {
                                ctx.fillStyle = '#e6e6e6';
                                ctx.font = 'bold 13px "Oswald", sans-serif';
                                ctx.textAlign = 'left';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(value + ' PLN', bar.x + 10, bar.y);
                            }
                        });
                    });
                }
            }]
        });

        console.log('✅ Średnia kwota utworzona!');
    },

    renderJZW() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="dashboard-view">
                <button class="btn-back" onclick="DashboardHub.backToHub()">
                    <i class="fas fa-arrow-left"></i> Powrót do Hub
                </button>
                <h1 class="dashboard-title">
                    <i class="fas fa-chart-pie"></i> Porównanie JŻW
                </h1>
                <div class="dashboard-placeholder">
                    <i class="fas fa-wrench fa-3x"></i>
                    <h2>Dashboard w budowie</h2>
                    <p>Ranking jednostek, Tabela porównawcza, Radar chart</p>
                </div>
            </div>
        `;
    },

    renderBezpieczenstwo() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="dashboard-view">
                <button class="btn-back" onclick="DashboardHub.backToHub()">
                    <i class="fas fa-arrow-left"></i> Powrót do Hub
                </button>
                <h1 class="dashboard-title">
                    <i class="fas fa-shield-alt"></i> Bezpieczeństwo Drogowe
                </h1>
                <div class="dashboard-placeholder">
                    <i class="fas fa-wrench fa-3x"></i>
                    <h2>Dashboard w budowie</h2>
                    <p>Wypadki vs Kolizje, Przyczyny, ŚPB, Wskaźniki</p>
                </div>
            </div>
        `;
    },

    renderCzasowy() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="dashboard-view">
                <button class="btn-back" onclick="DashboardHub.backToHub()">
                    <i class="fas fa-arrow-left"></i> Powrót do Hub
                </button>
                <h1 class="dashboard-title">
                    <i class="fas fa-clock"></i> Analiza Czasowa
                </h1>
                <div class="dashboard-placeholder">
                    <i class="fas fa-wrench fa-3x"></i>
                    <h2>Dashboard w budowie</h2>
                    <p>Kalendarz cieplny, Rozkład godzinowy, Trendy, Predykcje</p>
                </div>
            </div>
        `;
    }
};

// ZDARZENIA DROGOWE MANAGER
// ============================================
const ZdarzeniaManager = createBaseTableManager({
    module: 'zdarzenia',
    dataKey: 'zdarzeniaData',
    selectedRowsKey: 'zdarzeniaSelectedRows',
    storageKey: 'aep_data_zdarzenia',
    tableBodyId: 'zdarzeniaTableBody',
    emptyMessage: 'Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.',

    defaultRow: (id, date) => ({
        id: id,
        data: date,
        nr_jw: '',
        nazwa_jw: '',
        miejsce: '',
        podleglosc: '',
        grupa: '',
        wypadek: 0,
        kolizja: 0,
        wpm: 0,
        ppm: 0,
        sprawca: false,
        poszkodowany: false,
        przyczyna_alkohol: 0,
        przyczyna_nietrzezwosc: 0,
        przyczyna_narkotyki: 0,
        przyczyna_predkosc: 0,
        przyczyna_wyprzedzanie: 0,
        przyczyna_pierwszenstwo: 0,
        przyczyna_pieszy: 0,
        przyczyna_inne: 0,
        sankcja_dowod: 0,
        sankcja_prawo: 0,
        sankcja_mandat: 0,
        sankcja_pouczenie: 0,
        sankcja_inne: 0,
        wysokosc_mandatu: 0,
        w_sluzbie: 'NIE',
        ranni: 0,
        zabici: 0,
        jzw: 'OŻW Elbląg',
        oddzial: 'Elbląg'
    }),

    renderRowHTML: () => {
        // Ta metoda nie jest używana - ZdarzeniaManager używa własnej metody renderRows()
        return '';
    },

    customMethods: {
        currentEditingRowId: null,

        render: function() {
            const savedData = Utils.loadFromLocalStorage('aep_data_zdarzenia');
            AppState.zdarzeniaData = savedData || [];
            AppState.zdarzeniaSelectedRows.clear();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title">Zdarzenia drogowe</h1>
                </div>

                <div class="zdarzenia-toolbar">
                    <button class="btn-secondary" id="addZdarzenieRow">
                        <i class="fas fa-plus"></i> Dodaj wiersz
                    </button>
                    <button class="btn-secondary" id="saveZdarzeniaDraft">
                        <i class="fas fa-save"></i> Zapisz arkusz
                    </button>
                    <button class="btn-secondary btn-danger" id="clearZdarzeniaData" ${AppState.zdarzeniaData.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Wyczyść zaznaczone
                    </button>
                    
                    <div class="toolbar-spacer"></div>
                    
                    <div class="date-filter-wrapper">
                        <button class="btn-secondary" id="toggleZdarzenieDateFilterBtn">
                            <i class="fas fa-calendar-alt"></i> Filtruj daty
                            <span id="zdarzenieDateFilterBadge" class="filter-badge hidden"></span>
                        </button>
                        
                        <div class="date-filter-dropdown hidden" id="zdarzenieDateFilterDropdown">
                            <div class="dropdown-header">
                                <i class="fas fa-calendar-alt"></i> Filtrowanie po dacie
                            </div>
                            <div class="dropdown-body">
                                <label>Data od:</label>
                                <input type="date" id="zdarzenieDateFrom" class="date-input">
                                <label>Data do:</label>
                                <input type="date" id="zdarzenieDateTo" class="date-input">
                                <div class="quick-filters">
                                    <button class="btn-quick-filter" data-days="0">Dziś</button>
                                    <button class="btn-quick-filter" data-days="7">7 dni</button>
                                    <button class="btn-quick-filter" data-days="30">30 dni</button>
                                    <button class="btn-quick-filter" data-days="90">90 dni</button>
                                </div>
                                <div id="zdarzenieFilterResultInfo" class="filter-result-info hidden"></div>
                                <div class="dropdown-actions">
                                    <button class="btn-secondary btn-sm" id="applyZdarzenieDateFilter">
                                        <i class="fas fa-check"></i> Zastosuj
                                    </button>
                                    <button class="btn-secondary btn-sm" id="clearZdarzenieDateFilterDropdown">
                                        <i class="fas fa-times"></i> Wyczyść
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="zdarzeniaFilterInfoBar" class="filter-info-bar hidden"></div>

                <div class="top-scrollbar" id="topScrollbar">
                    <div class="top-scrollbar-content"></div>
                </div>

                <div class="zdarzenia-table-wrapper" id="zdarzeniaTableWrapper">
                    <table class="zdarzenia-table">
                        <thead>
                            <tr>
                                <th rowspan="2" class="col-sticky-left col-lp">L.p.</th>
                                <th rowspan="2" class="col-sticky-left2 col-checkbox">
                                    <input type="checkbox" id="selectAllZdarzenia" class="row-checkbox">
                                </th>
                                <th rowspan="2" class="col-month">Miesiąc</th>
                                <th rowspan="2" class="col-data">Data</th>
                                <th rowspan="2" class="col-select">Nr JW</th>
                                <th rowspan="2" class="col-select">Nazwa JW</th>
                                <th rowspan="2" class="col-select">Miejsce stacjonowania</th>
                                <th rowspan="2" class="col-select">Podległość RSZ</th>
                                <th rowspan="2" class="col-select">Grupa osobowa</th>
                                <th colspan="3" class="col-group-header">Rodzaj Zdarzenia</th>
                                <th colspan="3" class="col-group-header">Rodzaj Pojazdu</th>
                                <th colspan="2" class="col-group-header">Typ Uczestnika</th>
                                <th rowspan="2" class="col-modal-btn">Przyczyna</th>
                                <th rowspan="2" class="col-modal-btn">Sankcja</th>
                                <th rowspan="2" class="col-number">Wysokość mandatu</th>
                                <th rowspan="2" class="col-binary">W czasie służby</th>
                                <th rowspan="2" class="col-number">Ilość rannych</th>
                                <th rowspan="2" class="col-number">Ilość zabitych</th>
                                <th rowspan="2" class="col-select">JŻW Prowadząca</th>
                                <th rowspan="2" class="col-select">Oddział</th>
                            </tr>
                            <tr>
                                <th class="col-number col-razem">RAZEM</th>
                                <th class="col-number">Wypadek</th>
                                <th class="col-number">Kolizja</th>
                                <th class="col-number col-razem">RAZEM</th>
                                <th class="col-number">WPM</th>
                                <th class="col-number">PPM</th>
                                <th class="col-checkbox-small">Sprawca</th>
                                <th class="col-checkbox-small">Poszkodowany</th>
                            </tr>
                        </thead>
                        <tbody id="zdarzeniaTableBody">
                            <!-- Dynamic rows -->
                        </tbody>
                    </table>
                </div>

                <div class="bottom-scrollbar" id="bottomScrollbar">
                    <div class="bottom-scrollbar-content"></div>
                </div>

                <!-- Modal dla Przyczyny -->
                <div id="zdarzeniaPrzyczynaModal" class="modal-overlay hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3><i class="fas fa-exclamation-triangle"></i> Wybierz przyczyny zdarzenia</h3>
                            <button class="modal-close" onclick="ZdarzeniaManager.closePrzyczynaModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="modal-info">
                                <i class="fas fa-info-circle"></i>
                                <span id="zdarzeniaPrzyczynaCount">Wybrano: 0/8 przyczyn</span>
                            </div>
                            <div class="checkbox-grid">
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="przyczyna_alkohol">
                                    <span>Pod wpływem alkoholu</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="przyczyna_nietrzezwosc">
                                    <span>W stanie nietrzeźwości</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="przyczyna_narkotyki">
                                    <span>Pod wpływem środków odurzających</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="przyczyna_predkosc">
                                    <span>Nadmierna prędkość</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="przyczyna_wyprzedzanie">
                                    <span>Nieprawidłowe wyprzedzanie</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="przyczyna_pierwszenstwo">
                                    <span>Nieprzestrzeganie pierwszeństwa przejazdu</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="przyczyna_pieszy">
                                    <span>Nieustąpienie pierwszeństwa pieszemu</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="przyczyna_inne">
                                    <span>Inne</span>
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="ZdarzeniaManager.clearAllPrzyczyny()">
                                <i class="fas fa-eraser"></i> Wyczyść wszystkie
                            </button>
                            <button class="btn-primary" onclick="ZdarzeniaManager.savePrzyczyny()">
                                <i class="fas fa-check"></i> Zatwierdź
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Modal dla Sankcji -->
                <div id="zdarzeniaSankcjaModal" class="modal-overlay hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3><i class="fas fa-gavel"></i> Wybierz sankcje</h3>
                            <button class="modal-close" onclick="ZdarzeniaManager.closeSankcjaModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="modal-info">
                                <i class="fas fa-info-circle"></i>
                                <span id="zdarzeniaSankcjaCount">Wybrano: 0/5 sankcji</span>
                            </div>
                            <div class="checkbox-grid">
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="sankcja_dowod">
                                    <span>Zatrzymanie Dowodu Rejestracyjnego</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="sankcja_prawo">
                                    <span>Zatrzymanie Prawa Jazdy</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="sankcja_mandat">
                                    <span>Mandat</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="sankcja_pouczenie">
                                    <span>Pouczenie</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="sankcja_inne">
                                    <span>Inne</span>
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="ZdarzeniaManager.clearAllSankcje()">
                                <i class="fas fa-eraser"></i> Wyczyść wszystkie
                            </button>
                            <button class="btn-primary" onclick="ZdarzeniaManager.saveSankcje()">
                                <i class="fas fa-check"></i> Zatwierdź
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('addZdarzenieRow')?.addEventListener('click', () => this.addRow());
        document.getElementById('saveZdarzeniaDraft')?.addEventListener('click', () => this.saveDraft());
        document.getElementById('clearZdarzeniaData')?.addEventListener('click', () => this.clearSelected());
        document.getElementById('selectAllZdarzenia')?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        // Event listenery dla modali - dodajemy tylko raz
        const przyczynaModal = document.getElementById('zdarzeniaPrzyczynaModal');
        const przyczynaCheckboxes = przyczynaModal?.querySelectorAll('input[type="checkbox"]');
        przyczynaCheckboxes?.forEach(cb => {
            cb.addEventListener('change', () => this.updatePrzyczynaCount());
        });

        przyczynaModal?.addEventListener('click', (e) => {
            if (e.target.id === 'zdarzeniaPrzyczynaModal') {
                this.closePrzyczynaModal();
            }
        });

        const sankcjaModal = document.getElementById('zdarzeniaSankcjaModal');
        const sankcjaCheckboxes = sankcjaModal?.querySelectorAll('input[type="checkbox"]');
        sankcjaCheckboxes?.forEach(cb => {
            cb.addEventListener('change', () => this.updateSankcjaCount());
        });

        sankcjaModal?.addEventListener('click', (e) => {
            if (e.target.id === 'zdarzeniaSankcjaModal') {
                this.closeSankcjaModal();
            }
        });

        this.initDateFilter();
        this.renderRows();
        this.syncScrollbars();
    },

    initDateFilter: function() {
        const toggleBtn = document.getElementById('toggleZdarzenieDateFilterBtn');
        const dropdown = document.getElementById('zdarzenieDateFilterDropdown');
        const dateFromInput = document.getElementById('zdarzenieDateFrom');
        const dateToInput = document.getElementById('zdarzenieDateTo');
        const applyBtn = document.getElementById('applyZdarzenieDateFilter');
        const clearDropdownBtn = document.getElementById('clearZdarzenieDateFilterDropdown');
        const quickFilterBtns = dropdown?.querySelectorAll('.btn-quick-filter');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        quickFilterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const today = new Date();
                const from = new Date(today);
                
                if (days === 0) {
                    from.setHours(0, 0, 0, 0);
                } else {
                    from.setDate(today.getDate() - days);
                }

                dateFromInput.value = this.dateToInputFormat(from);
                dateToInput.value = this.dateToInputFormat(today);
            });
        });

        applyBtn?.addEventListener('click', () => {
            const from = dateFromInput.value;
            const to = dateToInput.value;

            if (!from || !to) {
                alert('Proszę wybrać obie daty');
                return;
            }

            const dateFrom = new Date(from);
            const dateTo = new Date(to);
            
            dateFrom.setHours(0, 0, 0, 0);
            dateTo.setHours(23, 59, 59, 999);

            if (dateFrom > dateTo) {
                alert('Data "od" nie może być późniejsza niż data "do"');
                return;
            }

            AppState.zdarzenieDateFilter.active = true;
            AppState.zdarzenieDateFilter.dateFrom = dateFrom;
            AppState.zdarzenieDateFilter.dateTo = dateTo;

            this.applyDateFilter();
            dropdown.classList.add('hidden');
        });

        clearDropdownBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });
    },

    dateToInputFormat: function(date) {
        if (!date) return '';
        if (typeof date === 'string') {
            const parts = date.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return date;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    parsePolishDate: function(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);

            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    },

    getMonthFromDate: function(dateStr) {
        const monthsShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
                            'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

        const date = this.parsePolishDate(dateStr);
        return date ? monthsShort[date.getMonth()] : '—';
    },

    applyDateFilter: function() {
        const { dateFrom, dateTo } = AppState.zdarzenieDateFilter;
        
        let matchCount = 0;
        const totalCount = AppState.zdarzeniaData.length;

        AppState.zdarzeniaData.forEach((row) => {
            const rowDate = this.parsePolishDate(row.data);
            
            if (rowDate && rowDate >= dateFrom && rowDate <= dateTo) {
                matchCount++;
            }
        });

        const filterBadge = document.getElementById('zdarzenieDateFilterBadge');
        const filterInfoBar = document.getElementById('zdarzeniaFilterInfoBar');
        const filterResultInfo = document.getElementById('zdarzenieFilterResultInfo');

        if (matchCount > 0) {
            filterBadge.textContent = `(${matchCount})`;
            filterBadge.classList.remove('hidden');
        } else {
            filterBadge.classList.add('hidden');
        }

        const fromStr = dateFrom.toLocaleDateString('pl-PL');
        const toStr = dateTo.toLocaleDateString('pl-PL');
        
        if (matchCount > 0) {
            filterInfoBar.innerHTML = `
                <i class="fas fa-info-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> zdarzeń z <strong>${totalCount}</strong> 
                (od ${fromStr} do ${toStr})
            `;
            filterInfoBar.style.background = 'rgba(76, 175, 80, 0.1)';
            filterInfoBar.style.color = '#4caf50';
        } else {
            filterInfoBar.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Nie znaleziono zdarzeń w zakresie od ${fromStr} do ${toStr}
            `;
            filterInfoBar.style.background = 'rgba(255, 152, 0, 0.1)';
            filterInfoBar.style.color = '#ff9800';
        }
        filterInfoBar.classList.remove('hidden');

        if (matchCount > 0) {
            filterResultInfo.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> rekordów
            `;
            filterResultInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            filterResultInfo.style.color = '#4caf50';
        } else {
            filterResultInfo.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Brak rekordów w tym zakresie
            `;
            filterResultInfo.style.background = 'rgba(255, 152, 0, 0.1)';
            filterResultInfo.style.color = '#ff9800';
        }
        filterResultInfo.classList.remove('hidden');

        this.renderRows();
    },

    clearDateFilter: function() {
        AppState.zdarzenieDateFilter.active = false;
        AppState.zdarzenieDateFilter.dateFrom = null;
        AppState.zdarzenieDateFilter.dateTo = null;

        const filterBadge = document.getElementById('zdarzenieDateFilterBadge');
        const filterInfoBar = document.getElementById('zdarzeniaFilterInfoBar');
        const filterResultInfo = document.getElementById('zdarzenieFilterResultInfo');

        filterBadge?.classList.add('hidden');
        filterInfoBar?.classList.add('hidden');
        filterResultInfo?.classList.add('hidden');

        this.renderRows();
    },

    renderPrzyczynaChips: function(row) {
        const przyczynyMap = {
            przyczyna_alkohol: 'Alkohol',
            przyczyna_nietrzezwosc: 'Nietrz',
            przyczyna_narkotyki: 'Narko',
            przyczyna_predkosc: 'Prędkość',
            przyczyna_wyprzedzanie: 'Wyprz',
            przyczyna_pierwszenstwo: 'Pierw',
            przyczyna_pieszy: 'Pieszy',
            przyczyna_inne: 'Inne'
        };

        const selectedChips = [];
        Object.keys(przyczynyMap).forEach(key => {
            if (row[key] === 1) {
                selectedChips.push(`
                    <div class="chip">
                        <i class="fas fa-edit chip-icon"></i>
                        <span class="chip-text">${przyczynyMap[key]}</span>
                        <button class="chip-remove" onclick="ZdarzeniaManager.removePrzyczyna(${row.id}, '${key}'); event.stopPropagation();">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `);
            }
        });

        if (selectedChips.length === 0) {
            return `
                <div class="srodki-wrapper" onclick="ZdarzeniaManager.openPrzyczynaModal(${row.id})">
                    <span class="srodki-empty">Brak przyczyn</span>
                </div>
            `;
        } else {
            return `
                <div class="srodki-wrapper" onclick="ZdarzeniaManager.openPrzyczynaModal(${row.id})">
                    ${selectedChips.join('')}
                </div>
            `;
        }
    },

    renderSankcjaChips: function(row) {
        const sankcjeMap = {
            sankcja_dowod: 'Dowód',
            sankcja_prawo: 'Prawo',
            sankcja_mandat: 'Mandat',
            sankcja_pouczenie: 'Poucz',
            sankcja_inne: 'Inne'
        };

        const selectedChips = [];
        Object.keys(sankcjeMap).forEach(key => {
            if (row[key] === 1) {
                selectedChips.push(`
                    <div class="chip">
                        <i class="fas fa-edit chip-icon"></i>
                        <span class="chip-text">${sankcjeMap[key]}</span>
                        <button class="chip-remove" onclick="ZdarzeniaManager.removeSankcja(${row.id}, '${key}'); event.stopPropagation();">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `);
            }
        });

        if (selectedChips.length === 0) {
            return `
                <div class="srodki-wrapper" onclick="ZdarzeniaManager.openSankcjaModal(${row.id})">
                    <span class="srodki-empty">Brak sankcji</span>
                </div>
            `;
        } else {
            return `
                <div class="srodki-wrapper" onclick="ZdarzeniaManager.openSankcjaModal(${row.id})">
                    ${selectedChips.join('')}
                </div>
            `;
        }
    },

    syncScrollbars: function() {
        const topScrollbar = document.getElementById('topScrollbar');
        const bottomScrollbar = document.getElementById('bottomScrollbar');
        const tableWrapper = document.getElementById('zdarzeniaTableWrapper');
        const topScrollContent = topScrollbar?.querySelector('.top-scrollbar-content');
        const bottomScrollContent = bottomScrollbar?.querySelector('.bottom-scrollbar-content');

        if (!topScrollbar || !bottomScrollbar || !tableWrapper || !topScrollContent || !bottomScrollContent) return;

        const updateScrollbarWidth = () => {
            const table = tableWrapper.querySelector('table');
            if (table) {
                const width = table.offsetWidth + 'px';
                topScrollContent.style.width = width;
                bottomScrollContent.style.width = width;
            }
        };

        updateScrollbarWidth();
        window.addEventListener('resize', updateScrollbarWidth);

        topScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = topScrollbar.scrollLeft;
            bottomScrollbar.scrollLeft = topScrollbar.scrollLeft;
        });

        bottomScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = bottomScrollbar.scrollLeft;
            topScrollbar.scrollLeft = bottomScrollbar.scrollLeft;
        });

        tableWrapper.addEventListener('scroll', () => {
            topScrollbar.scrollLeft = tableWrapper.scrollLeft;
            bottomScrollbar.scrollLeft = tableWrapper.scrollLeft;
        });

        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const tableRect = tableWrapper.getBoundingClientRect();
            const isTableVisible = tableRect.top < window.innerHeight && tableRect.bottom > 0;
            
            if (isTableVisible && scrollTop > lastScrollTop) {
                bottomScrollbar.classList.add('sticky');
            } else {
                bottomScrollbar.classList.remove('sticky');
            }
            
            lastScrollTop = scrollTop;
        });
    },

// ============================================

    renderRows: function() {
        const tbody = document.getElementById('zdarzeniaTableBody');
        if (!tbody) return;

        if (AppState.zdarzeniaData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="24" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>';
            return;
        }

        let dataToRender = AppState.zdarzeniaData;
        if (AppState.zdarzenieDateFilter.active) {
            const { dateFrom, dateTo } = AppState.zdarzenieDateFilter;
            
            dataToRender = AppState.zdarzeniaData.filter(row => {
                const rowDate = this.parsePolishDate(row.data);
                return rowDate && rowDate >= dateFrom && rowDate <= dateTo;
            });
        }

        if (dataToRender.length === 0) {
            tbody.innerHTML = '<tr><td colspan="24" class="empty-message">Brak danych spełniających kryteria filtra dat.</td></tr>';
            return;
        }

        const nrJWOptions = Array.from({length: 20}, (_, i) => String(i + 1));
        const nazwaJWOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const miejsceOptions = Array.from({length: 30}, (_, i) => `Miejsce ${i + 1}`);
        const podlegloscOptions = ['WL', 'WOT', 'MW', 'WSpec.', 'ŻW', 'SP'];
        const grupaOptions = ['szeregowy', 'podoficer', 'oficer', 'generał'];
        const jzwOptions = ['OŻW Elbląg', 'WŻW Bemowo Piskie', 'WŻW Gdynia', 'PŻW Bartoszyce', 'PŻW Braniewo', 'PŻW Giżycko', 'PŻW Malbork', 'PŻW Morąg'];
        const oddzialOptions = ['Elbląg', 'Szczecin', 'Lublin', 'Bydgoszcz', 'Kraków', 'Żagań', 'Warszawa', 'Łódź', 'Mińsk Mazowiecki'];

        tbody.innerHTML = dataToRender.map((row, index) => {
            const isSelected = AppState.zdarzeniaSelectedRows.has(row.id);
            const month = this.getMonthFromDate(row.data);
            
            // Auto-oblicz RAZEM
            const zdarzenieRazem = (parseInt(row.wypadek) || 0) + (parseInt(row.kolizja) || 0);
            const pojazdRazem = (parseInt(row.wpm) || 0) + (parseInt(row.ppm) || 0);

            return `
                <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''}">
                    <td class="col-sticky-left col-lp">${index + 1}</td>
                    <td class="col-sticky-left2 col-checkbox">
                        <input type="checkbox" 
                               class="row-checkbox" 
                               ${isSelected ? 'checked' : ''}
                               onchange="ZdarzeniaManager.toggleRowSelect(${row.id}, this.checked)">
                    </td>
                    <td class="col-month">${month}</td>
                    <td class="col-data">
                        <input type="date" 
                               class="cell-input-date" 
                               value="${this.dateToInputFormat(row.data)}"
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'data', this.value)">
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="ZdarzeniaManager.updateField(${row.id}, 'nr_jw', this.value)">
                            <option value="">-</option>
                            ${nrJWOptions.map(opt => `<option value="${opt}" ${row.nr_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="ZdarzeniaManager.updateField(${row.id}, 'nazwa_jw', this.value)">
                            <option value="">-</option>
                            ${nazwaJWOptions.map(opt => `<option value="${opt}" ${row.nazwa_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="ZdarzeniaManager.updateField(${row.id}, 'miejsce', this.value)">
                            <option value="">-</option>
                            ${miejsceOptions.map(opt => `<option value="${opt}" ${row.miejsce === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="ZdarzeniaManager.updateField(${row.id}, 'podleglosc', this.value)">
                            <option value="">-</option>
                            ${podlegloscOptions.map(opt => `<option value="${opt}" ${row.podleglosc === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="ZdarzeniaManager.updateField(${row.id}, 'grupa', this.value)">
                            <option value="">-</option>
                            ${grupaOptions.map(opt => `<option value="${opt}" ${row.grupa === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-number col-razem">${zdarzenieRazem}</td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.wypadek || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'wypadek', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.kolizja || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'kolizja', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number col-razem">${pojazdRazem}</td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.wpm || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'wpm', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.ppm || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'ppm', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-checkbox-small">
                        <input type="checkbox" 
                               class="row-checkbox-small" 
                               ${row.sprawca ? 'checked' : ''}
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'sprawca', this.checked)">
                    </td>
                    <td class="col-checkbox-small">
                        <input type="checkbox" 
                               class="row-checkbox-small" 
                               ${row.poszkodowany ? 'checked' : ''}
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'poszkodowany', this.checked)">
                    </td>
                    <td class="col-modal-btn">
                        <div class="przyczyna-chips-container">
                            ${this.renderPrzyczynaChips(row)}
                        </div>
                    </td>
                    <td class="col-modal-btn">
                        <div class="sankcja-chips-container">
                            ${this.renderSankcjaChips(row)}
                        </div>
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.wysokosc_mandatu || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'wysokosc_mandatu', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-binary">
                        <select class="cell-select-binary" onchange="ZdarzeniaManager.updateField(${row.id}, 'w_sluzbie', this.value)">
                            <option value="NIE" ${row.w_sluzbie === 'NIE' ? 'selected' : ''}>NIE</option>
                            <option value="TAK" ${row.w_sluzbie === 'TAK' ? 'selected' : ''}>TAK</option>
                        </select>
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.ranni || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'ranni', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.zabici || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="ZdarzeniaManager.updateField(${row.id}, 'zabici', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="ZdarzeniaManager.updateField(${row.id}, 'jzw', this.value)">
                            ${jzwOptions.map(opt => `<option value="${opt}" ${row.jzw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="ZdarzeniaManager.updateField(${row.id}, 'oddzial', this.value)">
                            ${oddzialOptions.map(opt => `<option value="${opt}" ${row.oddzial === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        const clearBtn = document.getElementById('clearZdarzeniaData');
        if (clearBtn) {
            clearBtn.disabled = AppState.zdarzeniaData.length === 0;
        }
    },

    // Przyczyna Modal Methods
    removePrzyczyna: function(rowId, field) {
        const row = AppState.zdarzeniaData.find(r => r.id === rowId);
        if (row) {
            row[field] = 0;
            this.renderRows();
            this.autoSave();
        }
    },

    openPrzyczynaModal: function(rowId) {
        this.currentEditingRowId = rowId;
        const row = AppState.zdarzeniaData.find(r => r.id === rowId);
        if (!row) return;

        const modal = document.getElementById('zdarzeniaPrzyczynaModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(cb => {
            const field = cb.dataset.field;
            cb.checked = row[field] === 1;
        });

        this.updatePrzyczynaCount();
        modal.classList.remove('hidden');
    },

    closePrzyczynaModal: function() {
        const modal = document.getElementById('zdarzeniaPrzyczynaModal');
        modal.classList.add('hidden');
        this.currentEditingRowId = null;
    },

    updatePrzyczynaCount: function() {
        const modal = document.getElementById('zdarzeniaPrzyczynaModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;

        const countSpan = document.getElementById('zdarzeniaPrzyczynaCount');
        countSpan.textContent = `Wybrano: ${checked}/${total} przyczyn`;
    },

    savePrzyczyny: function() {
        if (!this.currentEditingRowId) return;

        const row = AppState.zdarzeniaData.find(r => r.id === this.currentEditingRowId);
        if (!row) return;

        const modal = document.getElementById('zdarzeniaPrzyczynaModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(cb => {
            const field = cb.dataset.field;
            row[field] = cb.checked ? 1 : 0;
        });

        this.closePrzyczynaModal();
        this.renderRows();
        this.autoSave();
    },

    clearAllPrzyczyny: function() {
        const modal = document.getElementById('zdarzeniaPrzyczynaModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(cb => {
            cb.checked = false;
        });

        this.updatePrzyczynaCount();
    },

    // Sankcja Modal Methods
    removeSankcja: function(rowId, field) {
        const row = AppState.zdarzeniaData.find(r => r.id === rowId);
        if (row) {
            row[field] = 0;
            this.renderRows();
            this.autoSave();
        }
    },

    openSankcjaModal: function(rowId) {
        this.currentEditingRowId = rowId;
        const row = AppState.zdarzeniaData.find(r => r.id === rowId);
        if (!row) return;

        const modal = document.getElementById('zdarzeniaSankcjaModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(cb => {
            const field = cb.dataset.field;
            cb.checked = row[field] === 1;
        });

        this.updateSankcjaCount();
        modal.classList.remove('hidden');
    },

    closeSankcjaModal: function() {
        const modal = document.getElementById('zdarzeniaSankcjaModal');
        modal.classList.add('hidden');
        this.currentEditingRowId = null;
    },

    updateSankcjaCount: function() {
        const modal = document.getElementById('zdarzeniaSankcjaModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;

        const countSpan = document.getElementById('zdarzeniaSankcjaCount');
        countSpan.textContent = `Wybrano: ${checked}/${total} sankcji`;
    },

    saveSankcje: function() {
        if (!this.currentEditingRowId) return;

        const row = AppState.zdarzeniaData.find(r => r.id === this.currentEditingRowId);
        if (!row) return;

        const modal = document.getElementById('zdarzeniaSankcjaModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(cb => {
            const field = cb.dataset.field;
            row[field] = cb.checked ? 1 : 0;
        });

        this.closeSankcjaModal();
        this.renderRows();
        this.autoSave();
    },

    clearAllSankcje: function() {
        const modal = document.getElementById('zdarzeniaSankcjaModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(cb => {
            cb.checked = false;
        });

        this.updateSankcjaCount();
    }
    }
});
// PILOTAŻE MANAGER
// ============================================
const PilotazeManager = createBaseTableManager({
    module: 'pilotaze',
    dataKey: 'pilotazeData',
    selectedRowsKey: 'pilotazeSelectedRows',
    storageKey: 'aep_data_pilotaze',
    tableBodyId: 'pilotazeTableBody',
    emptyMessage: 'Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.',

    defaultRow: (id, date) => ({
        id: id,
        data: date,
        wlasne: 0,
        sojusznicze: 0,
        zmotoryzowany: 0,
        wkrd: 0,
        ilosc_zw: 0,
        wpm: 0,
        jzw: 'OŻW Elbląg',
        oddzial: 'Elbląg'
    }),

    renderRowHTML: () => {
        // Ta metoda nie jest używana - PilotazeManager używa własnej metody renderRows()
        return '';
    },

    customMethods: {
        render: function() {
            const savedData = Utils.loadFromLocalStorage('aep_data_pilotaze');
            AppState.pilotazeData = savedData || [];
            AppState.pilotazeSelectedRows.clear();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title">Pilotaże</h1>
                </div>

                <div class="pilotaze-toolbar">
                    <button class="btn-secondary" id="addPilotazeRow">
                        <i class="fas fa-plus"></i> Dodaj wiersz
                    </button>
                    <button class="btn-secondary" id="savePilotazeDraft">
                        <i class="fas fa-save"></i> Zapisz arkusz
                    </button>
                    <button class="btn-secondary btn-danger" id="clearPilotazeData" ${AppState.pilotazeData.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Wyczyść zaznaczone
                    </button>
                    
                    <div class="toolbar-spacer"></div>
                    
                    <div class="date-filter-wrapper">
                        <button class="btn-secondary" id="togglePilotazeDateFilterBtn">
                            <i class="fas fa-calendar-alt"></i> Filtruj daty
                            <span id="pilotazeDateFilterBadge" class="filter-badge hidden"></span>
                        </button>
                        
                        <div class="date-filter-dropdown hidden" id="pilotazeDateFilterDropdown">
                            <div class="dropdown-header">
                                <i class="fas fa-calendar-alt"></i> Filtrowanie po dacie
                            </div>
                            <div class="dropdown-body">
                                <label>Data od:</label>
                                <input type="date" id="pilotazeDateFrom" class="date-input">
                                <label>Data do:</label>
                                <input type="date" id="pilotazeDateTo" class="date-input">
                                <div class="quick-filters">
                                    <button class="btn-quick-filter" data-days="0">Dziś</button>
                                    <button class="btn-quick-filter" data-days="7">7 dni</button>
                                    <button class="btn-quick-filter" data-days="30">30 dni</button>
                                    <button class="btn-quick-filter" data-days="90">90 dni</button>
                                </div>
                                <div id="pilotazeFilterResultInfo" class="filter-result-info hidden"></div>
                                <div class="dropdown-actions">
                                    <button class="btn-secondary btn-sm" id="applyPilotazeDateFilter">
                                        <i class="fas fa-check"></i> Zastosuj
                                    </button>
                                    <button class="btn-secondary btn-sm" id="clearPilotazeDateFilterDropdown">
                                        <i class="fas fa-times"></i> Wyczyść
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="pilotazeFilterInfoBar" class="filter-info-bar hidden"></div>

                <div class="top-scrollbar" id="topScrollbar">
                    <div class="top-scrollbar-content"></div>
                </div>

                <div class="pilotaze-table-wrapper" id="pilotazeTableWrapper">
                    <table class="pilotaze-table">
                        <thead>
                            <tr>
                                <th rowspan="2" class="col-sticky-left col-lp">L.p.</th>
                                <th rowspan="2" class="col-sticky-left2 col-checkbox">
                                    <input type="checkbox" id="selectAllPilotaze" class="row-checkbox">
                                </th>
                                <th rowspan="2" class="col-month">Miesiąc</th>
                                <th rowspan="2" class="col-data">Data</th>
                                <th colspan="3" class="col-group-header">Wojska</th>
                                <th colspan="3" class="col-group-header">Rodzaj patrolu</th>
                                <th rowspan="2" class="col-number">Ilość żołnierzy ŻW</th>
                                <th rowspan="2" class="col-number">WPM</th>
                                <th rowspan="2" class="col-select">JŻW wykonująca czynność</th>
                                <th rowspan="2" class="col-select">Oddział</th>
                            </tr>
                            <tr>
                                <th class="col-number col-razem">RAZEM</th>
                                <th class="col-number">Własne</th>
                                <th class="col-number">Sojusznicze</th>
                                <th class="col-number col-razem">RAZEM</th>
                                <th class="col-number">Zmotoryzowany</th>
                                <th class="col-number">WKRD</th>
                            </tr>
                        </thead>
                        <tbody id="pilotazeTableBody">
                            <!-- Dynamic rows -->
                        </tbody>
                    </table>
                </div>

                <div class="bottom-scrollbar" id="bottomScrollbar">
                    <div class="bottom-scrollbar-content"></div>
                </div>
            </div>
        `;

        document.getElementById('addPilotazeRow')?.addEventListener('click', () => this.addRow());
        document.getElementById('savePilotazeDraft')?.addEventListener('click', () => this.saveDraft());
        document.getElementById('clearPilotazeData')?.addEventListener('click', () => this.clearSelected());
        document.getElementById('selectAllPilotaze')?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        this.initDateFilter();
        this.renderRows();
        this.syncScrollbars();
    },

    initDateFilter: function() {
        const toggleBtn = document.getElementById('togglePilotazeDateFilterBtn');
        const dropdown = document.getElementById('pilotazeDateFilterDropdown');
        const dateFromInput = document.getElementById('pilotazeDateFrom');
        const dateToInput = document.getElementById('pilotazeDateTo');
        const applyBtn = document.getElementById('applyPilotazeDateFilter');
        const clearDropdownBtn = document.getElementById('clearPilotazeDateFilterDropdown');
        const quickFilterBtns = dropdown?.querySelectorAll('.btn-quick-filter');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        quickFilterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const today = new Date();
                const from = new Date(today);
                
                if (days === 0) {
                    from.setHours(0, 0, 0, 0);
                } else {
                    from.setDate(today.getDate() - days);
                }

                dateFromInput.value = this.dateToInputFormat(from);
                dateToInput.value = this.dateToInputFormat(today);
            });
        });

        applyBtn?.addEventListener('click', () => {
            const from = dateFromInput.value;
            const to = dateToInput.value;

            if (!from || !to) {
                alert('Proszę wybrać obie daty');
                return;
            }

            const dateFrom = new Date(from);
            const dateTo = new Date(to);
            
            dateFrom.setHours(0, 0, 0, 0);
            dateTo.setHours(23, 59, 59, 999);

            if (dateFrom > dateTo) {
                alert('Data "od" nie może być późniejsza niż data "do"');
                return;
            }

            AppState.pilotazeDateFilter.active = true;
            AppState.pilotazeDateFilter.dateFrom = dateFrom;
            AppState.pilotazeDateFilter.dateTo = dateTo;

            this.applyDateFilter();
            dropdown.classList.add('hidden');
        });

        clearDropdownBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });
    },

    dateToInputFormat: function(date) {
        if (!date) return '';
        if (typeof date === 'string') {
            const parts = date.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return date;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    parsePolishDate: function(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);

            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    },

    getMonthFromDate: function(dateStr) {
        const monthsShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
                            'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

        const date = this.parsePolishDate(dateStr);
        return date ? monthsShort[date.getMonth()] : '—';
    },

    applyDateFilter: function() {
        const { dateFrom, dateTo } = AppState.pilotazeDateFilter;
        
        let matchCount = 0;
        const totalCount = AppState.pilotazeData.length;

        AppState.pilotazeData.forEach((row) => {
            const rowDate = this.parsePolishDate(row.data);
            
            if (rowDate && rowDate >= dateFrom && rowDate <= dateTo) {
                matchCount++;
            }
        });

        const filterBadge = document.getElementById('pilotazeDateFilterBadge');
        const filterInfoBar = document.getElementById('pilotazeFilterInfoBar');
        const filterResultInfo = document.getElementById('pilotazeFilterResultInfo');

        if (matchCount > 0) {
            filterBadge.textContent = `(${matchCount})`;
            filterBadge.classList.remove('hidden');
        } else {
            filterBadge.classList.add('hidden');
        }

        const fromStr = dateFrom.toLocaleDateString('pl-PL');
        const toStr = dateTo.toLocaleDateString('pl-PL');
        
        if (matchCount > 0) {
            filterInfoBar.innerHTML = `
                <i class="fas fa-info-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> rekordów pilotaży z <strong>${totalCount}</strong> 
                (od ${fromStr} do ${toStr})
            `;
            filterInfoBar.style.background = 'rgba(76, 175, 80, 0.1)';
            filterInfoBar.style.color = '#4caf50';
        } else {
            filterInfoBar.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Nie znaleziono rekordów pilotaży w zakresie od ${fromStr} do ${toStr}
            `;
            filterInfoBar.style.background = 'rgba(255, 152, 0, 0.1)';
            filterInfoBar.style.color = '#ff9800';
        }
        filterInfoBar.classList.remove('hidden');

        if (matchCount > 0) {
            filterResultInfo.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> rekordów
            `;
            filterResultInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            filterResultInfo.style.color = '#4caf50';
        } else {
            filterResultInfo.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Brak rekordów w tym zakresie
            `;
            filterResultInfo.style.background = 'rgba(255, 152, 0, 0.1)';
            filterResultInfo.style.color = '#ff9800';
        }
        filterResultInfo.classList.remove('hidden');

        this.renderRows();
    },

    clearDateFilter: function() {
        AppState.pilotazeDateFilter.active = false;
        AppState.pilotazeDateFilter.dateFrom = null;
        AppState.pilotazeDateFilter.dateTo = null;

        const filterBadge = document.getElementById('pilotazeDateFilterBadge');
        const filterInfoBar = document.getElementById('pilotazeFilterInfoBar');
        const filterResultInfo = document.getElementById('pilotazeFilterResultInfo');

        filterBadge?.classList.add('hidden');
        filterInfoBar?.classList.add('hidden');
        filterResultInfo?.classList.add('hidden');

        this.renderRows();
    },

    syncScrollbars: function() {
        const topScrollbar = document.getElementById('topScrollbar');
        const bottomScrollbar = document.getElementById('bottomScrollbar');
        const tableWrapper = document.getElementById('pilotazeTableWrapper');
        const topScrollContent = topScrollbar?.querySelector('.top-scrollbar-content');
        const bottomScrollContent = bottomScrollbar?.querySelector('.bottom-scrollbar-content');

        if (!topScrollbar || !bottomScrollbar || !tableWrapper || !topScrollContent || !bottomScrollContent) return;

        const updateScrollbarWidth = () => {
            const table = tableWrapper.querySelector('table');
            if (table) {
                const width = table.offsetWidth + 'px';
                topScrollContent.style.width = width;
                bottomScrollContent.style.width = width;
            }
        };

        updateScrollbarWidth();
        window.addEventListener('resize', updateScrollbarWidth);

        topScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = topScrollbar.scrollLeft;
            bottomScrollbar.scrollLeft = topScrollbar.scrollLeft;
        });

        bottomScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = bottomScrollbar.scrollLeft;
            topScrollbar.scrollLeft = bottomScrollbar.scrollLeft;
        });

        tableWrapper.addEventListener('scroll', () => {
            topScrollbar.scrollLeft = tableWrapper.scrollLeft;
            bottomScrollbar.scrollLeft = tableWrapper.scrollLeft;
        });

        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const tableRect = tableWrapper.getBoundingClientRect();
            const isTableVisible = tableRect.top < window.innerHeight && tableRect.bottom > 0;
            
            if (isTableVisible && scrollTop > lastScrollTop) {
                bottomScrollbar.classList.add('sticky');
            } else {
                bottomScrollbar.classList.remove('sticky');
            }
            
            lastScrollTop = scrollTop;
        });
    },

    renderRows: function() {
        const tbody = document.getElementById('pilotazeTableBody');
        if (!tbody) return;

        if (AppState.pilotazeData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="14" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>';
            return;
        }

        let dataToRender = AppState.pilotazeData;
        if (AppState.pilotazeDateFilter.active) {
            const { dateFrom, dateTo } = AppState.pilotazeDateFilter;
            
            dataToRender = AppState.pilotazeData.filter(row => {
                const rowDate = this.parsePolishDate(row.data);
                return rowDate && rowDate >= dateFrom && rowDate <= dateTo;
            });
        }

        if (dataToRender.length === 0) {
            tbody.innerHTML = '<tr><td colspan="14" class="empty-message">Brak danych spełniających kryteria filtra dat.</td></tr>';
            return;
        }

        const jzwOptions = ['OŻW Elbląg', 'WŻW Bemowo Piskie', 'WŻW Gdynia', 'PŻW Bartoszyce', 'PŻW Braniewo', 'PŻW Giżycko', 'PŻW Malbork', 'PŻW Morąg'];
        const oddzialOptions = ['Elbląg', 'Szczecin', 'Lublin', 'Bydgoszcz', 'Kraków', 'Żagań', 'Warszawa', 'Łódź', 'Mińsk Mazowiecki'];

        tbody.innerHTML = dataToRender.map((row, index) => {
            const isSelected = AppState.pilotazeSelectedRows.has(row.id);
            const month = this.getMonthFromDate(row.data);
            
            // Auto-oblicz RAZEM
            const wojskaRazem = (parseInt(row.wlasne) || 0) + (parseInt(row.sojusznicze) || 0);
            const patrolRazem = (parseInt(row.zmotoryzowany) || 0) + (parseInt(row.wkrd) || 0);

            return `
                <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''}">
                    <td class="col-sticky-left col-lp">${index + 1}</td>
                    <td class="col-sticky-left2 col-checkbox">
                        <input type="checkbox" 
                               class="row-checkbox" 
                               ${isSelected ? 'checked' : ''}
                               onchange="PilotazeManager.toggleRowSelect(${row.id}, this.checked)">
                    </td>
                    <td class="col-month">${month}</td>
                    <td class="col-data">
                        <input type="date" 
                               class="cell-input-date" 
                               value="${this.dateToInputFormat(row.data)}"
                               onchange="PilotazeManager.updateField(${row.id}, 'data', this.value)">
                    </td>
                    <td class="col-number col-razem">${wojskaRazem}</td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.wlasne || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="PilotazeManager.updateField(${row.id}, 'wlasne', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.sojusznicze || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="PilotazeManager.updateField(${row.id}, 'sojusznicze', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number col-razem">${patrolRazem}</td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.zmotoryzowany || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="PilotazeManager.updateField(${row.id}, 'zmotoryzowany', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.wkrd || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="PilotazeManager.updateField(${row.id}, 'wkrd', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.ilosc_zw || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="PilotazeManager.updateField(${row.id}, 'ilosc_zw', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-number">
                        <input type="number" 
                               class="cell-input-number" 
                               value="${row.wpm || ''}" 
                               placeholder="0"
                               min="0"
                               onchange="PilotazeManager.updateField(${row.id}, 'wpm', parseInt(this.value) || 0)">
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="PilotazeManager.updateField(${row.id}, 'jzw', this.value)">
                            ${jzwOptions.map(opt => `<option value="${opt}" ${row.jzw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="PilotazeManager.updateField(${row.id}, 'oddzial', this.value)">
                            ${oddzialOptions.map(opt => `<option value="${opt}" ${row.oddzial === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        const clearBtn = document.getElementById('clearPilotazeData');
        if (clearBtn) {
            clearBtn.disabled = AppState.pilotazeData.length === 0;
        }
        
        // Aktualizuj scrollbar po każdej zmianie danych
        this.syncScrollbars();
    }
    }
});

// ============================================
// ŚPB MANAGER
// ============================================
const SPBManager = createBaseTableManager({
    module: 'spb',
    dataKey: 'spbData',
    selectedRowsKey: 'spbSelectedRows',
    storageKey: 'aep_data_spb',
    tableBodyId: 'spbTableBody',
    emptyMessage: 'Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.',

    defaultRow: (id, date) => ({
        id: id,
        data: date,
        nr_jw: '',
        nazwa_jw: '',
        miejsce: '',
        podleglosc: '',
        grupa: '',
        sila_fizyczna: 0,
        kajdanki: 0,
        kaftan: 0,
        kask: 0,
        siatka: 0,
        palka: 0,
        pies: 0,
        chem_sr: 0,
        paralizator: 0,
        kolczatka: 0,
        bron: 0,
        podczas_konw: 'NIE',
        zatrzymania: 0,
        doprowadzenia: 0,
        inne_patrol: 0,
        ranny: 'NIE',
        smierc: 'NIE',
        jzw_prowadzaca: 'OŻW Elbląg',
        oddzial: 'Elbląg'
    }),

    renderRowHTML: () => {
        // Ta metoda nie jest używana - SPBManager używa własnej metody renderRows()
        return '';
    },

    customMethods: {
        currentEditingRowId: null,

        render: function() {
            const savedData = Utils.loadFromLocalStorage('aep_data_spb');
            AppState.spbData = savedData || [];
            AppState.spbSelectedRows.clear();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title">ŚPB - Środki Przymusu Bezpośredniego</h1>
                </div>

                <div class="spb-toolbar">
                    <button class="btn-secondary" id="addSPBRow">
                        <i class="fas fa-plus"></i> Dodaj wiersz
                    </button>
                    <button class="btn-secondary" id="saveSPBDraft">
                        <i class="fas fa-save"></i> Zapisz arkusz
                    </button>
                    <button class="btn-secondary btn-danger" id="clearSPBData" ${AppState.spbData.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Wyczyść zaznaczone
                    </button>
                    
                    <div class="toolbar-spacer"></div>
                    
                    <div class="date-filter-wrapper">
                        <button class="btn-secondary" id="toggleSPBDateFilterBtn">
                            <i class="fas fa-calendar-alt"></i> Filtruj daty
                            <span id="spbDateFilterBadge" class="filter-badge hidden"></span>
                        </button>
                        
                        <div class="date-filter-dropdown hidden" id="spbDateFilterDropdown">
                            <div class="dropdown-header">
                                <i class="fas fa-calendar-alt"></i> Filtrowanie po dacie
                            </div>
                            <div class="dropdown-body">
                                <label>Data od:</label>
                                <input type="date" id="spbDateFrom" class="date-input">
                                <label>Data do:</label>
                                <input type="date" id="spbDateTo" class="date-input">
                                <div class="quick-filters">
                                    <button class="btn-quick-filter" data-days="0">Dziś</button>
                                    <button class="btn-quick-filter" data-days="7">7 dni</button>
                                    <button class="btn-quick-filter" data-days="30">30 dni</button>
                                    <button class="btn-quick-filter" data-days="90">90 dni</button>
                                </div>
                                <div id="spbFilterResultInfo" class="filter-result-info hidden"></div>
                                <div class="dropdown-actions">
                                    <button class="btn-secondary btn-sm" id="applySPBDateFilter">
                                        <i class="fas fa-check"></i> Zastosuj
                                    </button>
                                    <button class="btn-secondary btn-sm" id="clearSPBDateFilterDropdown">
                                        <i class="fas fa-times"></i> Wyczyść
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="spbFilterInfoBar" class="filter-info-bar hidden"></div>

                <div class="top-scrollbar" id="topScrollbar">
                    <div class="top-scrollbar-content"></div>
                </div>

                <div class="spb-table-wrapper" id="spbTableWrapper">
                    <table class="spb-table">
                        <thead>
                            <tr>
                                <th rowspan="2" class="col-sticky-left col-lp">L.p.</th>
                                <th rowspan="2" class="col-sticky-left2 col-checkbox">
                                    <input type="checkbox" id="selectAllSPB" class="row-checkbox">
                                </th>
                                <th rowspan="2" class="col-month">Miesiąc</th>
                                <th rowspan="2" class="col-data">Data</th>
                                <th rowspan="2" class="col-select">Nr JW</th>
                                <th rowspan="2" class="col-select">Nazwa JW</th>
                                <th rowspan="2" class="col-select">Miejsce stacjonowania</th>
                                <th rowspan="2" class="col-select">Podległość RSZ</th>
                                <th rowspan="2" class="col-select">Grupa osobowa</th>
                                <th rowspan="2" class="col-modal-btn">Środki ŚPB</th>
                                <th rowspan="2" class="col-binary">Broń Palna</th>
                                <th rowspan="2" class="col-binary">Podczas służby konw.</th>
                                <th colspan="3" class="col-group-header">Podczas służby patrolowej</th>
                                <th colspan="2" class="col-group-header">Skutek użycia</th>
                                <th rowspan="2" class="col-select">JŻW Prowadząca</th>
                                <th rowspan="2" class="col-select">Oddział</th>
                            </tr>
                            <tr>
                                <th class="col-binary">Zatrzymania</th>
                                <th class="col-binary">Doprowadzenia</th>
                                <th class="col-binary">Inne</th>
                                <th class="col-binary">Ranny</th>
                                <th class="col-binary">Poniósł śmierć</th>
                            </tr>
                        </thead>
                        <tbody id="spbTableBody">
                            <!-- Dynamic rows -->
                        </tbody>
                    </table>
                </div>

                <div class="bottom-scrollbar" id="bottomScrollbar">
                    <div class="bottom-scrollbar-content"></div>
                </div>

                <!-- Modal dla środków ŚPB -->
                <div id="spbSrodkiModal" class="modal-overlay hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3><i class="fas fa-shield-halved"></i> Wybierz środki przymusu bezpośredniego</h3>
                            <button class="modal-close" onclick="SPBManager.closeSrodkiModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="modal-info">
                                <i class="fas fa-info-circle"></i>
                                <span id="spbSrodkiCount">Wybrano: 0/10 środków</span>
                            </div>
                            <div class="checkbox-grid">
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="sila_fizyczna">
                                    <span>Siła Fizyczna</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="kajdanki">
                                    <span>Kajdanki</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="kaftan">
                                    <span>Kaftan bezp.</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="kask">
                                    <span>Kask zabezp.</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="siatka">
                                    <span>Siatka obezwł.</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="palka">
                                    <span>Pałka służb.</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="pies">
                                    <span>Pies Służbowy</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="chem_sr">
                                    <span>Chem. śr. obezwł.</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="paralizator">
                                    <span>Paralizator</span>
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" data-field="kolczatka">
                                    <span>Kolczatka</span>
                                </label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="SPBManager.clearAllSrodki()">
                                <i class="fas fa-eraser"></i> Wyczyść wszystkie
                            </button>
                            <button class="btn-primary" onclick="SPBManager.saveSrodki()">
                                <i class="fas fa-check"></i> Zatwierdź
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('addSPBRow')?.addEventListener('click', () => this.addRow());
        document.getElementById('saveSPBDraft')?.addEventListener('click', () => this.saveDraft());
        document.getElementById('clearSPBData')?.addEventListener('click', () => this.clearSelected());
        document.getElementById('selectAllSPB')?.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));

        // Event listenery dla modala - dodajemy tylko raz
        const modal = document.getElementById('spbSrodkiModal');
        const checkboxes = modal?.querySelectorAll('input[type="checkbox"]');
        checkboxes?.forEach(cb => {
            cb.addEventListener('change', () => this.updateSrodkiCount());
        });

        // Zamknij modal po kliknięciu w overlay (poza contentem)
        modal?.addEventListener('click', (e) => {
            if (e.target.id === 'spbSrodkiModal') {
                this.closeSrodkiModal();
            }
        });

        this.initDateFilter();
        this.renderRows();
        this.syncScrollbars();
    },

    initDateFilter: function() {
        const toggleBtn = document.getElementById('toggleSPBDateFilterBtn');
        const dropdown = document.getElementById('spbDateFilterDropdown');
        const dateFromInput = document.getElementById('spbDateFrom');
        const dateToInput = document.getElementById('spbDateTo');
        const applyBtn = document.getElementById('applySPBDateFilter');
        const clearDropdownBtn = document.getElementById('clearSPBDateFilterDropdown');
        const quickFilterBtns = dropdown?.querySelectorAll('.btn-quick-filter');

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        quickFilterBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const days = parseInt(btn.dataset.days);
                const today = new Date();
                const from = new Date(today);

                if (days === 0) {
                    from.setHours(0, 0, 0, 0);
                } else {
                    from.setDate(today.getDate() - days);
                }

                dateFromInput.value = this.dateToInputFormat(from);
                dateToInput.value = this.dateToInputFormat(today);
            });
        });

        applyBtn?.addEventListener('click', () => {
            const from = dateFromInput.value;
            const to = dateToInput.value;

            if (!from || !to) {
                alert('Proszę wybrać obie daty');
                return;
            }

            const dateFrom = new Date(from);
            const dateTo = new Date(to);

            dateFrom.setHours(0, 0, 0, 0);
            dateTo.setHours(23, 59, 59, 999);

            if (dateFrom > dateTo) {
                alert('Data "od" nie może być późniejsza niż data "do"');
                return;
            }

            AppState.spbDateFilter.active = true;
            AppState.spbDateFilter.dateFrom = dateFrom;
            AppState.spbDateFilter.dateTo = dateTo;

            this.applyDateFilter();
            dropdown.classList.add('hidden');
        });

        clearDropdownBtn?.addEventListener('click', () => {
            dateFromInput.value = '';
            dateToInput.value = '';
            this.clearDateFilter();
        });
    },

    dateToInputFormat: function(date) {
        if (!date) return '';
        if (typeof date === 'string') {
            const parts = date.split('.');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return date;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    parsePolishDate: function(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);

            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    },

    getMonthFromDate: function(dateStr) {
        const monthsShort = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
                            'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

        const date = this.parsePolishDate(dateStr);
        return date ? monthsShort[date.getMonth()] : '—';
    },

    applyDateFilter: function() {
        const { dateFrom, dateTo } = AppState.spbDateFilter;
        
        let matchCount = 0;
        const totalCount = AppState.spbData.length;

        AppState.spbData.forEach((row) => {
            const rowDate = this.parsePolishDate(row.data);
            
            if (rowDate && rowDate >= dateFrom && rowDate <= dateTo) {
                matchCount++;
            }
        });

        const filterBadge = document.getElementById('spbDateFilterBadge');
        const filterInfoBar = document.getElementById('spbFilterInfoBar');
        const filterResultInfo = document.getElementById('spbFilterResultInfo');

        if (matchCount > 0) {
            filterBadge.textContent = `(${matchCount})`;
            filterBadge.classList.remove('hidden');
        } else {
            filterBadge.classList.add('hidden');
        }

        const fromStr = dateFrom.toLocaleDateString('pl-PL');
        const toStr = dateTo.toLocaleDateString('pl-PL');
        
        if (matchCount > 0) {
            filterInfoBar.innerHTML = `
                <i class="fas fa-info-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> rekordów ŚPB z <strong>${totalCount}</strong> 
                (od ${fromStr} do ${toStr})
            `;
            filterInfoBar.style.background = 'rgba(76, 175, 80, 0.1)';
            filterInfoBar.style.color = '#4caf50';
        } else {
            filterInfoBar.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Nie znaleziono rekordów ŚPB w zakresie od ${fromStr} do ${toStr}
            `;
            filterInfoBar.style.background = 'rgba(255, 152, 0, 0.1)';
            filterInfoBar.style.color = '#ff9800';
        }
        filterInfoBar.classList.remove('hidden');

        if (matchCount > 0) {
            filterResultInfo.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Znaleziono <strong>${matchCount}</strong> rekordów
            `;
            filterResultInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            filterResultInfo.style.color = '#4caf50';
        } else {
            filterResultInfo.innerHTML = `
                <i class="fas fa-exclamation-circle"></i> 
                Brak rekordów w tym zakresie
            `;
            filterResultInfo.style.background = 'rgba(255, 152, 0, 0.1)';
            filterResultInfo.style.color = '#ff9800';
        }
        filterResultInfo.classList.remove('hidden');

        this.renderRows();
    },

    clearDateFilter: function() {
        AppState.spbDateFilter.active = false;
        AppState.spbDateFilter.dateFrom = null;
        AppState.spbDateFilter.dateTo = null;

        const filterBadge = document.getElementById('spbDateFilterBadge');
        const filterInfoBar = document.getElementById('spbFilterInfoBar');
        const filterResultInfo = document.getElementById('spbFilterResultInfo');

        filterBadge?.classList.add('hidden');
        filterInfoBar?.classList.add('hidden');
        filterResultInfo?.classList.add('hidden');

        this.renderRows();
    },

    syncScrollbars: function() {
        const topScrollbar = document.getElementById('topScrollbar');
        const bottomScrollbar = document.getElementById('bottomScrollbar');
        const tableWrapper = document.getElementById('spbTableWrapper');
        const topScrollContent = topScrollbar?.querySelector('.top-scrollbar-content');
        const bottomScrollContent = bottomScrollbar?.querySelector('.bottom-scrollbar-content');

        if (!topScrollbar || !bottomScrollbar || !tableWrapper || !topScrollContent || !bottomScrollContent) return;

        const updateScrollbarWidth = () => {
            const table = tableWrapper.querySelector('table');
            if (table) {
                const width = table.offsetWidth + 'px';
                topScrollContent.style.width = width;
                bottomScrollContent.style.width = width;
            }
        };

        updateScrollbarWidth();
        window.addEventListener('resize', updateScrollbarWidth);

        topScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = topScrollbar.scrollLeft;
            bottomScrollbar.scrollLeft = topScrollbar.scrollLeft;
        });

        bottomScrollbar.addEventListener('scroll', () => {
            tableWrapper.scrollLeft = bottomScrollbar.scrollLeft;
            topScrollbar.scrollLeft = bottomScrollbar.scrollLeft;
        });

        tableWrapper.addEventListener('scroll', () => {
            topScrollbar.scrollLeft = tableWrapper.scrollLeft;
            bottomScrollbar.scrollLeft = tableWrapper.scrollLeft;
        });

        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const tableRect = tableWrapper.getBoundingClientRect();
            const isTableVisible = tableRect.top < window.innerHeight && tableRect.bottom > 0;
            
            if (isTableVisible && scrollTop > lastScrollTop) {
                bottomScrollbar.classList.add('sticky');
            } else {
                bottomScrollbar.classList.remove('sticky');
            }
            
            lastScrollTop = scrollTop;
        });
    },

    renderSrodkiChips: function(row) {
        const srodkiMap = {
            sila_fizyczna: 'SiłaF',
            kajdanki: 'Kajd',
            kaftan: 'Kaftan',
            kask: 'Kask',
            siatka: 'Siatka',
            palka: 'Pałka',
            pies: 'Pies',
            chem_sr: 'Chem',
            paralizator: 'Paral',
            kolczatka: 'Kolcz'
        };

        const selectedChips = [];
        Object.keys(srodkiMap).forEach(key => {
            if (row[key] === 1) {
                selectedChips.push(`
                    <div class="chip">
                        <i class="fas fa-edit chip-icon"></i>
                        <span class="chip-text">${srodkiMap[key]}</span>
                        <button class="chip-remove" onclick="SPBManager.removeSrodek(${row.id}, '${key}'); event.stopPropagation();">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `);
            }
        });

        if (selectedChips.length === 0) {
            // Jeśli brak środków, pusty wrapper z tekstem
            return `
                <div class="srodki-wrapper" onclick="SPBManager.openSrodkiModal(${row.id})">
                    <span class="srodki-empty">Brak środków</span>
                </div>
            `;
        } else {
            // Wrapper z chipsami - cały wrapper jest klikalny
            return `
                <div class="srodki-wrapper" onclick="SPBManager.openSrodkiModal(${row.id})">
                    ${selectedChips.join('')}
                </div>
            `;
        }
    },

    getSrodkiLabel: function(row) {
        const srodkiMap = {
            sila_fizyczna: 'SiłaF',
            kajdanki: 'Kajd',
            kaftan: 'Kaftan',
            kask: 'Kask',
            siatka: 'Siatka',
            palka: 'Pałka',
            pies: 'Pies',
            chem_sr: 'Chem',
            paralizator: 'Paral',
            kolczatka: 'Kolcz'
        };

        const selected = [];
        Object.keys(srodkiMap).forEach(key => {
            if (row[key] === 1) {
                selected.push(srodkiMap[key]);
            }
        });

        const count = selected.length;
        
        if (count === 0) {
            return 'Środki (0)';
        } else {
            const label = selected.join(', ');
            return `${label} (${count})`;
        }
    },

    renderRows: function() {
        const tbody = document.getElementById('spbTableBody');
        if (!tbody) return;

        if (AppState.spbData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="18" class="empty-message">Brak danych. Kliknij "+ Dodaj wiersz" aby rozpocząć.</td></tr>';
            return;
        }

        let dataToRender = AppState.spbData;
        if (AppState.spbDateFilter.active) {
            const { dateFrom, dateTo } = AppState.spbDateFilter;
            
            dataToRender = AppState.spbData.filter(row => {
                const rowDate = this.parsePolishDate(row.data);
                return rowDate && rowDate >= dateFrom && rowDate <= dateTo;
            });
        }

        if (dataToRender.length === 0) {
            tbody.innerHTML = '<tr><td colspan="18" class="empty-message">Brak danych spełniających kryteria filtra dat.</td></tr>';
            return;
        }

        // Options dla dropdownów
        const nrJWOptions = Array.from({length: 20}, (_, i) => String(i + 1));
        const nazwaJWOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const miejsceOptions = Array.from({length: 30}, (_, i) => `Miejsce ${i + 1}`);
        const podlegloscOptions = ['WL', 'WOT', 'MW', 'WSpec.', 'ŻW', 'SP'];
        const grupaOptions = ['szeregowy', 'podoficer', 'oficer', 'generał'];
        const jzwOptions = ['OŻW Elbląg', 'WŻW Bemowo Piskie', 'WŻW Gdynia', 'PŻW Bartoszyce', 'PŻW Braniewo', 'PŻW Giżycko', 'PŻW Malbork', 'PŻW Morąg'];
        const oddzialOptions = ['Elbląg', 'Szczecin', 'Lublin', 'Bydgoszcz', 'Kraków', 'Żagań', 'Warszawa', 'Łódź', 'Mińsk Mazowiecki'];

        tbody.innerHTML = dataToRender.map((row, index) => {
            const isSelected = AppState.spbSelectedRows.has(row.id);
            const month = this.getMonthFromDate(row.data);

            return `
                <tr data-id="${row.id}" class="${isSelected ? 'selected' : ''}">
                    <td class="col-sticky-left col-lp">${index + 1}</td>
                    <td class="col-sticky-left2 col-checkbox">
                        <input type="checkbox" 
                               class="row-checkbox" 
                               ${isSelected ? 'checked' : ''}
                               onchange="SPBManager.toggleRowSelect(${row.id}, this.checked)">
                    </td>
                    <td class="col-month">${month}</td>
                    <td class="col-data">
                        <input type="date" 
                               class="cell-input-date" 
                               value="${this.dateToInputFormat(row.data)}"
                               onchange="SPBManager.updateField(${row.id}, 'data', this.value)">
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="SPBManager.updateField(${row.id}, 'nr_jw', this.value)">
                            <option value="">-</option>
                            ${nrJWOptions.map(opt => `<option value="${opt}" ${row.nr_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="SPBManager.updateField(${row.id}, 'nazwa_jw', this.value)">
                            <option value="">-</option>
                            ${nazwaJWOptions.map(opt => `<option value="${opt}" ${row.nazwa_jw === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="SPBManager.updateField(${row.id}, 'miejsce', this.value)">
                            <option value="">-</option>
                            ${miejsceOptions.map(opt => `<option value="${opt}" ${row.miejsce === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="SPBManager.updateField(${row.id}, 'podleglosc', this.value)">
                            <option value="">-</option>
                            ${podlegloscOptions.map(opt => `<option value="${opt}" ${row.podleglosc === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="SPBManager.updateField(${row.id}, 'grupa', this.value)">
                            <option value="">-</option>
                            ${grupaOptions.map(opt => `<option value="${opt}" ${row.grupa === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-modal-btn">
                        <div class="srodki-chips-container">
                            ${this.renderSrodkiChips(row)}
                        </div>
                    </td>
                    <td class="col-binary">
                        <select class="cell-select-binary" onchange="SPBManager.updateField(${row.id}, 'bron', parseInt(this.value))">
                            <option value="0" ${row.bron === 0 ? 'selected' : ''}>0</option>
                            <option value="1" ${row.bron === 1 ? 'selected' : ''}>1</option>
                        </select>
                    </td>
                    <td class="col-binary">
                        <select class="cell-select-binary" onchange="SPBManager.updateField(${row.id}, 'podczas_konw', this.value)">
                            <option value="NIE" ${row.podczas_konw === 'NIE' ? 'selected' : ''}>NIE</option>
                            <option value="TAK" ${row.podczas_konw === 'TAK' ? 'selected' : ''}>TAK</option>
                        </select>
                    </td>
                    <td class="col-binary">
                        <select class="cell-select-binary" onchange="SPBManager.updateField(${row.id}, 'zatrzymania', parseInt(this.value))">
                            <option value="0" ${row.zatrzymania === 0 ? 'selected' : ''}>0</option>
                            <option value="1" ${row.zatrzymania === 1 ? 'selected' : ''}>1</option>
                        </select>
                    </td>
                    <td class="col-binary">
                        <select class="cell-select-binary" onchange="SPBManager.updateField(${row.id}, 'doprowadzenia', parseInt(this.value))">
                            <option value="0" ${row.doprowadzenia === 0 ? 'selected' : ''}>0</option>
                            <option value="1" ${row.doprowadzenia === 1 ? 'selected' : ''}>1</option>
                        </select>
                    </td>
                    <td class="col-binary">
                        <select class="cell-select-binary" onchange="SPBManager.updateField(${row.id}, 'inne_patrol', parseInt(this.value))">
                            <option value="0" ${row.inne_patrol === 0 ? 'selected' : ''}>0</option>
                            <option value="1" ${row.inne_patrol === 1 ? 'selected' : ''}>1</option>
                        </select>
                    </td>
                    <td class="col-binary">
                        <select class="cell-select-binary" onchange="SPBManager.updateField(${row.id}, 'ranny', this.value)">
                            <option value="NIE" ${row.ranny === 'NIE' ? 'selected' : ''}>NIE</option>
                            <option value="TAK" ${row.ranny === 'TAK' ? 'selected' : ''}>TAK</option>
                        </select>
                    </td>
                    <td class="col-binary">
                        <select class="cell-select-binary" onchange="SPBManager.updateField(${row.id}, 'smierc', this.value)">
                            <option value="NIE" ${row.smierc === 'NIE' ? 'selected' : ''}>NIE</option>
                            <option value="TAK" ${row.smierc === 'TAK' ? 'selected' : ''}>TAK</option>
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="SPBManager.updateField(${row.id}, 'jzw_prowadzaca', this.value)">
                            ${jzwOptions.map(opt => `<option value="${opt}" ${row.jzw_prowadzaca === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                    <td class="col-select">
                        <select class="cell-select" onchange="SPBManager.updateField(${row.id}, 'oddzial', this.value)">
                            ${oddzialOptions.map(opt => `<option value="${opt}" ${row.oddzial === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        const clearBtn = document.getElementById('clearSPBData');
        if (clearBtn) {
            clearBtn.disabled = AppState.spbData.length === 0;
        }
    },

    removeSrodek: function(rowId, field) {
        const row = AppState.spbData.find(r => r.id === rowId);
        if (row) {
            row[field] = 0;
            this.renderRows();
            this.autoSave();
        }
    },

    openSrodkiModal: function(rowId) {
        this.currentEditingRowId = rowId;
        const row = AppState.spbData.find(r => r.id === rowId);
        if (!row) return;

        const modal = document.getElementById('spbSrodkiModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        
        // Załaduj aktualne wartości
        checkboxes.forEach(cb => {
            const field = cb.dataset.field;
            cb.checked = row[field] === 1;
        });

        this.updateSrodkiCount();
        modal.classList.remove('hidden');
    },

    closeSrodkiModal: function() {
        const modal = document.getElementById('spbSrodkiModal');
        modal.classList.add('hidden');
        this.currentEditingRowId = null;
    },

    updateSrodkiCount: function() {
        const modal = document.getElementById('spbSrodkiModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;

        const countSpan = document.getElementById('spbSrodkiCount');
        countSpan.textContent = `Wybrano: ${checked}/${total} środków`;
    },

    saveSrodki: function() {
        if (!this.currentEditingRowId) return;

        const row = AppState.spbData.find(r => r.id === this.currentEditingRowId);
        if (!row) return;

        const modal = document.getElementById('spbSrodkiModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

        // Zapisz wartości
        checkboxes.forEach(cb => {
            const field = cb.dataset.field;
            row[field] = cb.checked ? 1 : 0;
        });

        this.closeSrodkiModal();
        this.renderRows();
        this.autoSave();
    },

    clearAllSrodki: function() {
        const modal = document.getElementById('spbSrodkiModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(cb => {
            cb.checked = false;
        });

        this.updateSrodkiCount();
    }
    }
});

// ============================================
// TABLE MANAGER
// ============================================
/**
 * Generic table manager for rendering and managing data tables
 * @namespace TableManager
 */
const TableManager = {
    /**
     * Renders the data table
     * @returns {void}
     */
    renderTable() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="section-view">
                <div class="section-header">
                    <h1 class="section-title">${AppState.currentSection.title}</h1>
                </div>

                <div class="table-toolbar">
                    <div class="table-filter">
                        <input type="text" id="tableSearch" placeholder="Szukaj w tabeli...">
                    </div>
                    <div class="table-actions">
                        <button class="btn-secondary" onclick="TableManager.addRow()">+ Dodaj</button>
                        <button class="btn-secondary" onclick="TableManager.saveDraft()">💾 Zapisz arkusz</button>
                        <button class="btn-secondary btn-danger" onclick="TableManager.deleteSelectedRows()">🗑️ Usuń zaznaczone</button>
                        <button class="btn-secondary" onclick="TableManager.clearData()">↻ Wyczyść</button>
                    </div>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 40px;"><input type="checkbox" id="selectAll" class="row-checkbox"></th>
                                ${AppState.currentSection.columns.map((col, i) => 
                                    `<th class="sortable" onclick="TableManager.sortBy('${col}')">${col}</th>`
                                ).join('')}
                            </tr>
                        </thead>
                        <tbody id="tableBody"></tbody>
                    </table>
                </div>

                <div class="pagination">
                    <div class="pagination-info">
                        Wyświetlanie <span id="rangeStart">0</span>-<span id="rangeEnd">0</span> 
                        z <span id="totalRows">0</span> wierszy
                    </div>
                    <div class="pagination-controls" id="paginationControls"></div>
                </div>
            </div>
        `;

        document.getElementById('selectAll')?.addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        document.getElementById('tableSearch')?.addEventListener('input', Utils.debounce((e) => {
            this.filterData(e.target.value);
        }, 300));

        this.renderRows();
    },

    renderRows() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;

        const start = (AppState.currentPage - 1) * AppState.rowsPerPage;
        const end = start + AppState.rowsPerPage;
        const paginatedData = AppState.filteredData.slice(start, end);

        if (paginatedData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="100%" class="empty-message">Brak danych do wyświetlenia</td></tr>';
            return;
        }

        tbody.innerHTML = paginatedData.map(row => `
            <tr data-id="${row.id}" class="${AppState.selectedRows.has(row.id) ? 'selected' : ''}">
                <td><input type="checkbox" class="row-checkbox" ${AppState.selectedRows.has(row.id) ? 'checked' : ''} onchange="TableManager.toggleRowSelect(${row.id}, this.checked)"></td>
                ${AppState.currentSection.columns.map(col => `<td>${row[col] || ''}</td>`).join('')}
            </tr>
        `).join('');

        this.updatePaginationInfo();
    },

    deleteSelectedRows() {
        if (AppState.selectedRows.size === 0) {
            alert('Nie zaznaczono żadnych wierszy');
            return;
        }

        if (confirm(`Czy na pewno usunąć ${AppState.selectedRows.size} zaznaczonych wierszy?`)) {
            AppState.currentData = AppState.currentData.filter(row => !AppState.selectedRows.has(row.id));
            AppState.filteredData = [...AppState.currentData];
            AppState.selectedRows.clear();
            AppState.currentPage = 1;
            this.renderRows();
        }
    },

    saveDraft() {
        const key = `aep_draft_${AppState.currentSection.id}`;
        const success = Utils.saveToLocalStorage(key, {
            data: AppState.currentData,
            timestamp: new Date().toISOString()
        });
        
        if (success) {
            alert('Arkusz zapisany pomyślnie w localStorage');
        } else {
            alert('Błąd podczas zapisywania arkusza');
        }
    },

    clearData() {
        if (confirm('Czy na pewno wyczyścić wszystkie dane?')) {
            AppState.currentData = Utils.generateTestData(AppState.currentSection.columns, 25);
            AppState.filteredData = [...AppState.currentData];
            AppState.currentPage = 1;
            AppState.selectedRows.clear();
            this.renderRows();
        }
    }
};

// ============================================
// SIDEBAR
// ============================================
/**
 * Sidebar UI component manager
 * @namespace Sidebar
 */
const Sidebar = {
    /**
     * Initializes the sidebar component
     * @returns {void}
     */
    init() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebarToggle');
        
        if (!sidebar || !toggleBtn) {
            console.error('Sidebar elements not found');
            return;
        }

        const collapsed = Utils.loadFromLocalStorage('sidebar_collapsed');
        if (collapsed) {
            sidebar.classList.add('collapsed');
            toggleBtn.style.left = '18px'; // Zwinięty
        } else {
            toggleBtn.style.left = '234px'; // Rozwinięty
        }

        // Submenu handling
        document.querySelectorAll('.has-submenu').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!sidebar.classList.contains('collapsed')) {
                    e.preventDefault();
                    const parentLi = item.closest('li');
                    const submenu = parentLi.querySelector('.submenu');
                    
                    item.classList.toggle('expanded');
                    
                    if (submenu) {
                        submenu.classList.toggle('expanded');
                    }
                }
            });
        });

        document.querySelectorAll('.nav-item').forEach(item => {
            const text = item.querySelector('.nav-text')?.textContent;
            if (text) {
                item.setAttribute('data-tooltip', text);
            }
        });

        console.log('✅ Sidebar initialized');
    }
};

// ============================================
// CALENDAR MANAGER
// ============================================
/**
 * @typedef {Object} CalendarEvent
 * @property {number} id - Unique event ID
 * @property {string} title - Event title
 * @property {string} type - Event type (zabezpieczenie, patrol, kontrola, konwój, inne)
 * @property {string} date - Event date (YYYY-MM-DD)
 * @property {string} [timeStart] - Start time (HH:MM)
 * @property {string} [timeEnd] - End time (HH:MM)
 * @property {string} [location] - Event location
 * @property {string} [jzw] - Unit name (OŻW)
 * @property {string} [description] - Event description
 * @property {string} [priority] - Priority (niski, średni, wysoki, krytyczny)
 * @property {string} [status] - Status (zaplanowane, w_trakcie, zakończone, odwołane)
 * @property {string} color - Event color for display
 */

const CalendarManager = {
    currentView: 'month', // month, week, day, list
    currentDate: new Date(),
    events: [],
    filters: {
        type: 'all',
        jzw: 'all',
        status: 'all',
        search: ''
    },

    init() {
        this.loadEvents();
    },

    loadEvents() {
        this.events = Utils.loadFromLocalStorage('aep_calendar_events') || [];
    },

    saveEvents() {
        Utils.saveToLocalStorage('aep_calendar_events', this.events);
    },

    render() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="calendar-view">
                <div class="calendar-header">
                    <h1 class="section-title">
                        <i class="fas fa-calendar-alt"></i> Kalendarz Operacyjny
                    </h1>
                    <p class="section-subtitle">Planowanie i zarządzanie wydarzeniami operacyjnymi</p>
                </div>

                <div class="calendar-toolbar">
                    <div class="calendar-navigation">
                        <button class="btn-icon" id="calPrevBtn" title="Poprzedni">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="btn-secondary" id="calTodayBtn">
                            <i class="fas fa-calendar-day"></i> Dzisiaj
                        </button>
                        <button class="btn-icon" id="calNextBtn" title="Następny">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <h2 id="calCurrentDate" class="calendar-current-date"></h2>
                    </div>

                    <div class="calendar-view-switcher">
                        <button class="btn-view ${this.currentView === 'month' ? 'active' : ''}" data-view="month">
                            <i class="fas fa-calendar"></i> Miesiąc
                        </button>
                        <button class="btn-view ${this.currentView === 'week' ? 'active' : ''}" data-view="week">
                            <i class="fas fa-calendar-week"></i> Tydzień
                        </button>
                        <button class="btn-view ${this.currentView === 'day' ? 'active' : ''}" data-view="day">
                            <i class="fas fa-calendar-day"></i> Dzień
                        </button>
                        <button class="btn-view ${this.currentView === 'list' ? 'active' : ''}" data-view="list">
                            <i class="fas fa-list"></i> Lista
                        </button>
                    </div>

                    <div class="calendar-actions">
                        <button class="btn-primary" id="calAddEventBtn">
                            <i class="fas fa-plus"></i> Dodaj wydarzenie
                        </button>
                        <button class="btn-secondary" id="calFilterBtn">
                            <i class="fas fa-filter"></i> Filtry
                        </button>
                        <button class="btn-secondary" id="calExportBtn">
                            <i class="fas fa-file-export"></i> Eksport
                        </button>
                    </div>
                </div>

                <div class="calendar-filters" id="calendarFilters" style="display: none;">
                    <div class="filter-group">
                        <label>Typ wydarzenia:</label>
                        <select id="filterType">
                            <option value="all">Wszystkie</option>
                            <option value="zabezpieczenie">Zabezpieczenie</option>
                            <option value="patrol">Patrol</option>
                            <option value="kontrola">Kontrola WKRD</option>
                            <option value="konwój">Konwój</option>
                            <option value="inne">Inne</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Status:</label>
                        <select id="filterStatus">
                            <option value="all">Wszystkie</option>
                            <option value="zaplanowane">Zaplanowane</option>
                            <option value="w_trakcie">W trakcie</option>
                            <option value="zakończone">Zakończone</option>
                            <option value="odwołane">Odwołane</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Wyszukaj:</label>
                        <input type="text" id="filterSearch" placeholder="Szukaj wydarzeń..." />
                    </div>
                </div>

                <div class="calendar-legend">
                    <span class="legend-item"><span class="legend-color" style="background: #3b82f6"></span> Zabezpieczenie</span>
                    <span class="legend-item"><span class="legend-color" style="background: #10b981"></span> Patrol</span>
                    <span class="legend-item"><span class="legend-color" style="background: #f59e0b"></span> Kontrola</span>
                    <span class="legend-item"><span class="legend-color" style="background: #ef4444"></span> Konwój</span>
                    <span class="legend-item"><span class="legend-color" style="background: #8b5cf6"></span> Inne</span>
                </div>

                <div id="calendarContent" class="calendar-content">
                    <!-- Dynamic content will be rendered here -->
                </div>
            </div>
        `;

        this.updateCurrentDateDisplay();
        this.renderCalendarContent();
        this.attachEventListeners();
    },

    attachEventListeners() {
        // Navigation
        document.getElementById('calPrevBtn')?.addEventListener('click', () => this.navigatePrevious());
        document.getElementById('calNextBtn')?.addEventListener('click', () => this.navigateNext());
        document.getElementById('calTodayBtn')?.addEventListener('click', () => this.navigateToday());

        // View switcher
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentView = e.currentTarget.dataset.view;
                this.render();
            });
        });

        // Actions
        document.getElementById('calAddEventBtn')?.addEventListener('click', () => this.showAddEventModal());
        document.getElementById('calFilterBtn')?.addEventListener('click', () => this.toggleFilters());
        document.getElementById('calExportBtn')?.addEventListener('click', () => this.showExportModal());

        // Filters
        document.getElementById('filterType')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.renderCalendarContent();
        });
        document.getElementById('filterStatus')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderCalendarContent();
        });
        document.getElementById('filterSearch')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.renderCalendarContent();
        });
    },

    toggleFilters() {
        const filtersDiv = document.getElementById('calendarFilters');
        filtersDiv.style.display = filtersDiv.style.display === 'none' ? 'flex' : 'none';
    },

    updateCurrentDateDisplay() {
        const dateDisplay = document.getElementById('calCurrentDate');
        if (!dateDisplay) return;

        const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
                        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

        if (this.currentView === 'month') {
            dateDisplay.textContent = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        } else if (this.currentView === 'week') {
            const weekStart = this.getWeekStart(this.currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            dateDisplay.textContent = `${weekStart.getDate()} ${months[weekStart.getMonth()]} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekStart.getFullYear()}`;
        } else if (this.currentView === 'day') {
            const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
            dateDisplay.textContent = `${days[this.currentDate.getDay()]}, ${this.currentDate.getDate()} ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        } else {
            dateDisplay.textContent = 'Lista wydarzeń';
        }
    },

    navigatePrevious() {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
        } else if (this.currentView === 'day') {
            this.currentDate.setDate(this.currentDate.getDate() - 1);
        }
        this.updateCurrentDateDisplay();
        this.renderCalendarContent();
    },

    navigateNext() {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
        } else if (this.currentView === 'day') {
            this.currentDate.setDate(this.currentDate.getDate() + 1);
        }
        this.updateCurrentDateDisplay();
        this.renderCalendarContent();
    },

    navigateToday() {
        this.currentDate = new Date();
        this.updateCurrentDateDisplay();
        this.renderCalendarContent();
    },

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Start from Monday
        return new Date(d.setDate(diff));
    },

    getFilteredEvents() {
        return this.events.filter(event => {
            if (this.filters.type !== 'all' && event.type !== this.filters.type) return false;
            if (this.filters.status !== 'all' && event.status !== this.filters.status) return false;
            if (this.filters.search && !event.title.toLowerCase().includes(this.filters.search) &&
                !event.location?.toLowerCase().includes(this.filters.search) &&
                !event.jzw?.toLowerCase().includes(this.filters.search)) return false;
            return true;
        });
    },

    renderCalendarContent() {
        const content = document.getElementById('calendarContent');
        if (!content) return;

        if (this.currentView === 'month') {
            content.innerHTML = this.renderMonthView();
        } else if (this.currentView === 'week') {
            content.innerHTML = this.renderWeekView();
        } else if (this.currentView === 'day') {
            content.innerHTML = this.renderDayView();
        } else if (this.currentView === 'list') {
            content.innerHTML = this.renderListView();
        }

        // Attach event item listeners
        document.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const eventId = parseInt(e.currentTarget.dataset.eventId);
                this.showEventDetails(eventId);
            });
        });
    },

    renderMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay() || 7; // 1-7 (Monday-Sunday)
        const daysInMonth = lastDay.getDate();

        const filteredEvents = this.getFilteredEvents();

        let html = '<div class="calendar-month-view"><table class="month-table">';
        html += '<thead><tr>';
        const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
        dayNames.forEach(day => {
            html += `<th>${day}</th>`;
        });
        html += '</tr></thead><tbody><tr>';

        // Empty cells before first day
        for (let i = 1; i < startDay; i++) {
            html += '<td class="day-cell empty"></td>';
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = filteredEvents.filter(e => e.date === dateStr);
            const isToday = this.isToday(date);

            html += `<td class="day-cell ${isToday ? 'today' : ''}">`;
            html += `<div class="day-number">${day}</div>`;

            if (dayEvents.length > 0) {
                html += '<div class="day-events">';
                dayEvents.slice(0, 3).forEach(event => {
                    html += `<div class="event-item mini" data-event-id="${event.id}" style="background: ${event.color}">
                        ${event.timeStart ? event.timeStart + ' ' : ''}${event.title}
                    </div>`;
                });
                if (dayEvents.length > 3) {
                    html += `<div class="event-more">+${dayEvents.length - 3} więcej</div>`;
                }
                html += '</div>';
            }

            html += '</td>';

            if ((day + startDay - 1) % 7 === 0 && day < daysInMonth) {
                html += '</tr><tr>';
            }
        }

        // Empty cells after last day
        const lastDayOfWeek = (startDay + daysInMonth - 1) % 7;
        if (lastDayOfWeek !== 0) {
            for (let i = lastDayOfWeek; i < 7; i++) {
                html += '<td class="day-cell empty"></td>';
            }
        }

        html += '</tr></tbody></table></div>';
        return html;
    },

    renderWeekView() {
        const weekStart = this.getWeekStart(this.currentDate);
        const filteredEvents = this.getFilteredEvents();

        let html = '<div class="calendar-week-view"><table class="week-table"><thead><tr><th class="time-col">Czas</th>';

        // Week days headers
        const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const isToday = this.isToday(date);
            html += `<th class="${isToday ? 'today' : ''}">${dayNames[i]} ${date.getDate()}</th>`;
        }
        html += '</tr></thead><tbody>';

        // Time slots
        for (let hour = 0; hour < 24; hour++) {
            html += '<tr>';
            html += `<td class="time-col">${String(hour).padStart(2, '0')}:00</td>`;

            for (let day = 0; day < 7; day++) {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + day);
                const dateStr = date.toISOString().split('T')[0];
                const timeStr = `${String(hour).padStart(2, '0')}:00`;

                const events = filteredEvents.filter(e =>
                    e.date === dateStr &&
                    e.timeStart &&
                    e.timeStart.startsWith(String(hour).padStart(2, '0'))
                );

                html += '<td class="hour-cell">';
                events.forEach(event => {
                    html += `<div class="event-item" data-event-id="${event.id}" style="background: ${event.color}">
                        ${event.timeStart} ${event.title}
                    </div>`;
                });
                html += '</td>';
            }
            html += '</tr>';
        }

        html += '</tbody></table></div>';
        return html;
    },

    renderDayView() {
        const dateStr = this.currentDate.toISOString().split('T')[0];
        const filteredEvents = this.getFilteredEvents().filter(e => e.date === dateStr);

        let html = '<div class="calendar-day-view"><div class="day-timeline">';

        for (let hour = 0; hour < 24; hour++) {
            const timeStr = `${String(hour).padStart(2, '0')}:00`;
            const events = filteredEvents.filter(e => e.timeStart && e.timeStart.startsWith(String(hour).padStart(2, '0')));

            html += `<div class="time-slot">`;
            html += `<div class="time-label">${timeStr}</div>`;
            html += `<div class="time-content">`;

            events.forEach(event => {
                html += `<div class="event-item full" data-event-id="${event.id}" style="border-left: 4px solid ${event.color}">
                    <div class="event-time">${event.timeStart}${event.timeEnd ? ' - ' + event.timeEnd : ''}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-meta">${event.jzw || ''} ${event.location || ''}</div>
                </div>`;
            });

            html += `</div></div>`;
        }

        html += '</div></div>';
        return html;
    },

    renderListView() {
        const filteredEvents = this.getFilteredEvents().sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return (a.timeStart || '').localeCompare(b.timeStart || '');
        });

        if (filteredEvents.length === 0) {
            return '<div class="empty-state"><i class="fas fa-calendar-times fa-3x"></i><p>Brak wydarzeń do wyświetlenia</p></div>';
        }

        let html = '<div class="calendar-list-view"><table class="list-table"><thead><tr>';
        html += '<th>Data</th><th>Czas</th><th>Wydarzenie</th><th>Typ</th><th>JŻW</th><th>Lokalizacja</th><th>Status</th><th>Akcje</th>';
        html += '</tr></thead><tbody>';

        filteredEvents.forEach(event => {
            const statusClass = event.status === 'zakończone' ? 'success' : event.status === 'odwołane' ? 'danger' : '';
            html += '<tr>';
            html += `<td>${this.formatDate(event.date)}</td>`;
            html += `<td>${event.timeStart || '-'}${event.timeEnd ? ' - ' + event.timeEnd : ''}</td>`;
            html += `<td><span class="event-indicator" style="background: ${event.color}"></span> ${event.title}</td>`;
            html += `<td>${this.getTypeLabel(event.type)}</td>`;
            html += `<td>${event.jzw || '-'}</td>`;
            html += `<td>${event.location || '-'}</td>`;
            html += `<td><span class="status-badge ${statusClass}">${this.getStatusLabel(event.status)}</span></td>`;
            html += `<td>
                <button class="btn-icon-small" onclick="CalendarManager.showEventDetails(${event.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon-small" onclick="CalendarManager.editEvent(${event.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon-small" onclick="CalendarManager.deleteEvent(${event.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>`;
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        return html;
    },

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pl-PL');
    },

    getTypeLabel(type) {
        const labels = {
            'zabezpieczenie': 'Zabezpieczenie prewencyjno-ochronne',
            'zabezpieczenie_prewencyjne': 'Zabezpieczenie prewencyjne',
            'pilotaz_vip': 'Pilotaż VIP',
            'czynnosci_piro': 'Czynności PIRO',
            'realizacja_mczp': 'Realizacja MczP',
            'inne': 'Inne'
        };
        return labels[type] || type;
    },

    getStatusLabel(status) {
        const labels = {
            'zaplanowane': 'Zaplanowane',
            'w_trakcie': 'W trakcie',
            'zakończone': 'Zakończone',
            'odwołane': 'Odwołane'
        };
        return labels[status] || status;
    },

    getTypeColor(type) {
        const colors = {
            'zabezpieczenie': '#3b82f6',
            'zabezpieczenie_prewencyjne': '#06b6d4',
            'pilotaz_vip': '#10b981',
            'czynnosci_piro': '#f59e0b',
            'realizacja_mczp': '#ef4444',
            'inne': '#8b5cf6'
        };
        return colors[type] || '#6b7280';
    },

    showAddEventModal() {
        Modal.show('Dodaj wydarzenie', `
            <form id="addEventForm" class="calendar-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Typ wydarzenia *</label>
                        <select id="eventType" required>
                            <option value="zabezpieczenie">Zabezpieczenie prewencyjno-ochronne</option>
                            <option value="zabezpieczenie_prewencyjne">Zabezpieczenie prewencyjne</option>
                            <option value="pilotaz_vip">Pilotaż VIP</option>
                            <option value="czynnosci_piro">Czynności PIRO</option>
                            <option value="realizacja_mczp">Realizacja MczP</option>
                            <option value="inne">Inne</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select id="eventStatus" required>
                            <option value="zaplanowane">Zaplanowane</option>
                            <option value="w_trakcie">W trakcie</option>
                            <option value="zakończone">Zakończone</option>
                            <option value="odwołane">Odwołane</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Nazwa wydarzenia *</label>
                    <input type="text" id="eventTitle" required placeholder="np. Zabezpieczenie marszu niepodległości" />
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Data *</label>
                        <input type="date" id="eventDate" required />
                    </div>
                    <div class="form-group">
                        <label>Godzina rozpoczęcia</label>
                        <input type="time" id="eventTimeStart" />
                    </div>
                    <div class="form-group">
                        <label>Godzina zakończenia</label>
                        <input type="time" id="eventTimeEnd" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Jednostka (OŻW)</label>
                        <select id="eventJzw">
                            <option value="">-- Wybierz jednostkę --</option>
                            <option value="KG ŻW">KG ŻW</option>
                            <option value="OSŻW Mińsk Mazowiecki">OSŻW Mińsk Mazowiecki</option>
                            <option value="OSŻW Warszawa">OSŻW Warszawa</option>
                            <option value="OŻW Bydgoszcz">OŻW Bydgoszcz</option>
                            <option value="OŻW Elbląg">OŻW Elbląg</option>
                            <option value="OŻW Kraków">OŻW Kraków</option>
                            <option value="OŻW Lublin">OŻW Lublin</option>
                            <option value="OŻW Łódź">OŻW Łódź</option>
                            <option value="OŻW Szczecin">OŻW Szczecin</option>
                            <option value="OŻW Żagań">OŻW Żagań</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Lokalizacja</label>
                        <input type="text" id="eventLocation" placeholder="np. Centrum miasta" />
                    </div>
                </div>

                <div class="form-group">
                    <label>Priorytet</label>
                    <select id="eventPriority">
                        <option value="niski">Niski</option>
                        <option value="średni" selected>Średni</option>
                        <option value="wysoki">Wysoki</option>
                        <option value="krytyczny">Krytyczny</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Opis</label>
                    <textarea id="eventDescription" rows="3" placeholder="Dodatkowe informacje..."></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Zapisz
                    </button>
                    <button type="button" class="btn-secondary" onclick="Modal.hide()">
                        Anuluj
                    </button>
                </div>
            </form>
        `);

        // Set default date to today
        document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];

        document.getElementById('addEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewEvent();
        });
    },

    saveNewEvent() {
        const type = document.getElementById('eventType').value;
        const event = {
            id: Date.now(),
            type: type,
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            timeStart: document.getElementById('eventTimeStart').value || null,
            timeEnd: document.getElementById('eventTimeEnd').value || null,
            jzw: document.getElementById('eventJzw').value || null,
            location: document.getElementById('eventLocation').value || null,
            priority: document.getElementById('eventPriority').value,
            status: document.getElementById('eventStatus').value,
            description: document.getElementById('eventDescription').value || null,
            color: this.getTypeColor(type),
            createdAt: new Date().toISOString()
        };

        this.events.push(event);
        this.saveEvents();
        Modal.hide();
        this.renderCalendarContent();
        this.showToast('Wydarzenie dodane pomyślnie');
    },

    showEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        Modal.show('Szczegóły wydarzenia', `
            <div class="event-details">
                <div class="event-detail-header" style="border-left: 4px solid ${event.color}">
                    <h3>${event.title}</h3>
                    <span class="type-badge" style="background: ${event.color}">${this.getTypeLabel(event.type)}</span>
                </div>

                <div class="event-detail-grid">
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <div class="detail-label">Data</div>
                            <div class="detail-value">${this.formatDate(event.date)}</div>
                        </div>
                    </div>

                    ${event.timeStart ? `
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <div class="detail-label">Czas</div>
                            <div class="detail-value">${event.timeStart}${event.timeEnd ? ' - ' + event.timeEnd : ''}</div>
                        </div>
                    </div>
                    ` : ''}

                    ${event.jzw ? `
                    <div class="detail-item">
                        <i class="fas fa-shield-alt"></i>
                        <div>
                            <div class="detail-label">Jednostka</div>
                            <div class="detail-value">${event.jzw}</div>
                        </div>
                    </div>
                    ` : ''}

                    ${event.location ? `
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <div class="detail-label">Lokalizacja</div>
                            <div class="detail-value">${event.location}</div>
                        </div>
                    </div>
                    ` : ''}

                    <div class="detail-item">
                        <i class="fas fa-exclamation-circle"></i>
                        <div>
                            <div class="detail-label">Priorytet</div>
                            <div class="detail-value">${event.priority}</div>
                        </div>
                    </div>

                    <div class="detail-item">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <div class="detail-label">Status</div>
                            <div class="detail-value">${this.getStatusLabel(event.status)}</div>
                        </div>
                    </div>
                </div>

                ${event.description ? `
                <div class="detail-description">
                    <div class="detail-label">Opis</div>
                    <div class="detail-value">${event.description}</div>
                </div>
                ` : ''}

                <div class="detail-actions">
                    <button class="btn-primary" onclick="CalendarManager.editEvent(${event.id})">
                        <i class="fas fa-edit"></i> Edytuj
                    </button>
                    <button class="btn-danger" onclick="CalendarManager.deleteEvent(${event.id})">
                        <i class="fas fa-trash"></i> Usuń
                    </button>
                </div>
            </div>
        `);
    },

    editEvent(eventId) {
        // To be implemented
        this.showToast('Funkcja edycji w przygotowaniu');
    },

    deleteEvent(eventId) {
        if (!confirm('Czy na pewno chcesz usunąć to wydarzenie?')) return;

        this.events = this.events.filter(e => e.id !== eventId);
        this.saveEvents();
        Modal.hide();
        this.renderCalendarContent();
        this.showToast('Wydarzenie usunięte');
    },

    showExportModal() {
        Modal.show('Eksport kalendarza', `
            <div class="export-options">
                <p>Wybierz format eksportu:</p>
                <button class="btn-primary btn-full" onclick="CalendarManager.exportToPDF()">
                    <i class="fas fa-file-pdf"></i> Eksportuj do PDF
                </button>
                <button class="btn-secondary btn-full" onclick="CalendarManager.exportToCSV()">
                    <i class="fas fa-file-csv"></i> Eksportuj do CSV
                </button>
                <button class="btn-secondary btn-full" onclick="CalendarManager.exportToICS()">
                    <i class="fas fa-calendar-plus"></i> Eksportuj do .ics (Google Calendar/Outlook)
                </button>
            </div>
        `);
    },

    exportToPDF() {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('Biblioteka jsPDF nie jest załadowana');
            return;
        }

        const doc = new jsPDF();

        // Add Roboto font for full Polish character support
        if (window.pdfMake && window.pdfMake.vfs) {
            try {
                const robotoFont = window.pdfMake.vfs['Roboto-Regular.ttf'];
                if (robotoFont) {
                    doc.addFileToVFS('Roboto-Regular.ttf', robotoFont);
                    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
                    doc.setFont('Roboto');
                } else {
                    console.warn('Roboto font not found, falling back to helvetica');
                    doc.setFont('helvetica');
                }
            } catch (error) {
                console.error('Error loading Roboto font:', error);
                doc.setFont('helvetica');
            }
        } else {
            console.warn('vfs_fonts not loaded, falling back to helvetica');
            doc.setFont('helvetica');
        }

        const filteredEvents = this.getFilteredEvents();

        doc.setFontSize(16);
        doc.setFont('Roboto', 'normal');
        doc.text('Kalendarz Operacyjny AEP', 15, 15);

        doc.setFontSize(10);
        doc.setFont('Roboto', 'normal');
        doc.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')}`, 15, 22);
        doc.text(`Liczba wydarzeń: ${filteredEvents.length}`, 15, 28);

        const tableData = filteredEvents.map(e => [
            this.formatDate(e.date),
            e.timeStart || '-',
            e.title,
            this.getTypeLabel(e.type),
            e.jzw || '-',
            e.location || '-',
            this.getStatusLabel(e.status)
        ]);

        doc.autoTable({
            startY: 35,
            head: [['Data', 'Czas', 'Wydarzenie', 'Typ', 'JŻW', 'Lokalizacja', 'Status']],
            body: tableData,
            styles: {
                font: 'Roboto',
                fontSize: 8
            },
            headStyles: {
                font: 'Roboto',
                fillColor: [75, 85, 99],
                fontStyle: 'normal'
            }
        });

        const filename = `Kalendarz_AEP_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);

        Modal.hide();
        this.showToast('Kalendarz wyeksportowany do PDF');
    },

    exportToCSV() {
        const filteredEvents = this.getFilteredEvents();
        const headers = ['Data', 'Czas rozpoczęcia', 'Czas zakończenia', 'Wydarzenie', 'Typ', 'JŻW', 'Lokalizacja', 'Priorytet', 'Status', 'Opis'];

        let csv = headers.join(';') + '\n';
        filteredEvents.forEach(e => {
            const row = [
                e.date,
                e.timeStart || '',
                e.timeEnd || '',
                e.title,
                this.getTypeLabel(e.type),
                e.jzw || '',
                e.location || '',
                e.priority,
                this.getStatusLabel(e.status),
                e.description || ''
            ].map(field => `"${field}"`).join(';');
            csv += row + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Kalendarz_AEP_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        Modal.hide();
        this.showToast('Kalendarz wyeksportowany do CSV');
    },

    exportToICS() {
        const filteredEvents = this.getFilteredEvents();
        let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AEP System//Calendar//PL\nCALSCALE:GREGORIAN\n';

        filteredEvents.forEach(e => {
            const startDate = e.date.replace(/-/g, '');
            const startTime = e.timeStart ? e.timeStart.replace(':', '') + '00' : '000000';

            ics += 'BEGIN:VEVENT\n';
            ics += `UID:${e.id}@aep-system\n`;
            ics += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
            ics += `DTSTART:${startDate}T${startTime}\n`;
            ics += `SUMMARY:${e.title}\n`;
            if (e.location) ics += `LOCATION:${e.location}\n`;
            if (e.description) ics += `DESCRIPTION:${e.description}\n`;
            ics += 'END:VEVENT\n';
        });

        ics += 'END:VCALENDAR';

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Kalendarz_AEP_${new Date().toISOString().split('T')[0]}.ics`;
        a.click();
        URL.revokeObjectURL(url);

        Modal.hide();
        this.showToast('Kalendarz wyeksportowany do .ics');
    },

    showToast(message) {
        // Reuse existing toast mechanism if available
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:12px 24px;border-radius:8px;z-index:10000;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// ============================================
// HEADER ACTIONS
// ============================================
const HeaderActions = {
    init() {
        document.getElementById('importBtn')?.addEventListener('click', () => this.showImportModal());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.showExportModal());
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showSettingsModal());

        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', Utils.debounce((e) => {
                if (AppState.currentSection && !AppState.currentSection.isCustomView) {
                    TableManager.filterData(e.target.value);
                }
            }, 300));
        }
    },

    showImportModal() {
        // Jeśli jesteśmy w sekcji Wykroczenia - użyj dedykowanego importu
        if (AppState.currentSection && AppState.currentSection.id === 'wykroczenia') {
            WykroczeniaManager.importJSON();
        } else {
            Modal.show('Import danych', `<p>Funkcja importu danych będzie dostępna wkrótce.</p>`);
        }
    },

    showExportModal() {
        // Jeśli jesteśmy w sekcji Wykroczenia - użyj dedykowanego exportu
        if (AppState.currentSection && AppState.currentSection.id === 'wykroczenia') {
            WykroczeniaManager.openExportModal();
        } else {
            Modal.show('Eksport danych', `<p>Funkcja eksportu danych będzie dostępna wkrótce.</p>`);
        }
    },

    showSettingsModal() {
        Modal.show('Ustawienia', `<p>Panel ustawień systemu będzie dostępny wkrótce.</p>`);
    }
};

// ============================================
// MODAL
// ============================================
/**
 * Modal dialog component manager
 * @namespace Modal
 */
const Modal = {
    /**
     * Initializes the modal component
     * @returns {void}
     */
    init() {
        const modal = document.getElementById('modal');
        const closeBtn = document.getElementById('modalClose');

        closeBtn.addEventListener('click', () => this.hide());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.hide();
            }
        });
    },

    show(title, content) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('active');
    },

    hide() {
        document.getElementById('modal').classList.remove('active');
    }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing AEP System...');
    Router.init();
    Sidebar.init();
    HeaderActions.init();
    Modal.init();
    console.log('✅ AEP System initialized successfully');
});
