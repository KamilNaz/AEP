// ============================================
// MAP MANAGER - TACTICAL MAP WITH REAL-TIME MODE
// ============================================
/**
 * MapManager - Zaawansowana mapa taktyczna z trybem czasu rzeczywistego
 * @namespace MapManager
 */
const MapManager = {
    map: null,
    markers: [],
    events: [],
    patrols: [],
    militaryObjects: [],
    heatLayer: null,
    markerClusterGroup: null,
    drawnItems: null,
    currentBaseLayer: 'osm',
    activeLayers: {
        events: true,
        patrols: true,
        heat: false,
        military: true,
        zones: true
    },
    liveMode: false,
    liveUpdateInterval: null,
    measurementMode: false,

    /**
     * Inicjalizacja managera mapy
     */
    init() {
        this.loadEvents();
        this.loadPatrols();
        this.loadMilitaryObjects();
    },

    /**
     * Ładowanie wydarzeń z localStorage
     */
    loadEvents() {
        this.events = Utils.loadFromLocalStorage('aep_map_events') || [];
    },

    /**
     * Zapisywanie wydarzeń do localStorage
     */
    saveEvents() {
        Utils.saveToLocalStorage('aep_map_events', this.events);
    },

    /**
     * Ładowanie patroli z modułu Patrole
     */
    loadPatrols() {
        const patrolData = Utils.loadFromLocalStorage('aep_data_patrole') || [];
        // Konwersja danych patroli na format mapy (potrzebne współrzędne)
        this.patrols = patrolData.filter(p => p.lat && p.lng).map(p => ({
            id: p.id,
            type: 'patrol',
            name: `Patrol ${p.oddzialZW || ''}`,
            lat: p.lat,
            lng: p.lng,
            status: p.status || 'aktywny',
            date: p.date,
            unit: p.oddzialZW,
            details: p
        }));
    },

    /**
     * Ładowanie obiektów wojskowych
     */
    loadMilitaryObjects() {
        // Wczytaj zapisane obiekty lub użyj domyślnych
        const saved = Utils.loadFromLocalStorage('aep_military_objects');
        if (saved) {
            this.militaryObjects = saved;
        } else {
            // Domyślne obiekty wojskowe (przykładowe współrzędne dla głównych miast)
            this.militaryObjects = [
                { id: 1, name: 'KG ŻW', type: 'headquarters', lat: 52.2297, lng: 21.0122, city: 'Warszawa' },
                { id: 2, name: 'OSŻW Warszawa', type: 'unit', lat: 52.2500, lng: 21.0000, city: 'Warszawa' },
                { id: 3, name: 'OSŻW Mińsk Mazowiecki', type: 'unit', lat: 52.1793, lng: 21.5721, city: 'Mińsk Mazowiecki' },
                { id: 4, name: 'OŻW Elbląg', type: 'unit', lat: 54.1522, lng: 19.4044, city: 'Elbląg' },
                { id: 5, name: 'OŻW Szczecin', type: 'unit', lat: 53.4285, lng: 14.5528, city: 'Szczecin' },
                { id: 6, name: 'OŻW Bydgoszcz', type: 'unit', lat: 53.1235, lng: 18.0084, city: 'Bydgoszcz' },
                { id: 7, name: 'OŻW Żagań', type: 'unit', lat: 51.6177, lng: 15.3159, city: 'Żagań' },
                { id: 8, name: 'OŻW Kraków', type: 'unit', lat: 50.0647, lng: 19.9450, city: 'Kraków' },
                { id: 9, name: 'OŻW Lublin', type: 'unit', lat: 51.2465, lng: 22.5684, city: 'Lublin' },
                { id: 10, name: 'OŻW Łódź', type: 'unit', lat: 51.7592, lng: 19.4560, city: 'Łódź' }
            ];
        }
    },

    /**
     * Główna funkcja renderująca widok mapy
     */
    render() {
        this.loadEvents();
        this.loadPatrols();

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="map-view">
                <div class="map-header">
                    <h1 class="section-title">
                        <i class="fas fa-map-location-dot"></i> Mapa Taktyczna Zdarzeń
                    </h1>
                    <p class="section-subtitle">Interaktywna mapa operacyjna z trybem czasu rzeczywistego</p>
                </div>

                <div class="map-toolbar">
                    <div class="toolbar-section">
                        <button class="btn-primary" id="mapAddEventBtn" title="Dodaj zdarzenie">
                            <i class="fas fa-map-pin"></i> Dodaj zdarzenie
                        </button>
                        <button class="btn-secondary" id="mapImportDataBtn" title="Import danych z modułów">
                            <i class="fas fa-download"></i> Import danych
                        </button>
                        <button class="btn-secondary" id="mapLayersBtn" title="Warstwy">
                            <i class="fas fa-layer-group"></i> Warstwy
                        </button>
                        <button class="btn-secondary" id="mapToolsBtn" title="Narzędzia">
                            <i class="fas fa-tools"></i> Narzędzia
                        </button>
                    </div>

                    <div class="toolbar-section">
                        <button class="btn-secondary" id="mapGeocodingBtn" title="Wyszukaj adres">
                            <i class="fas fa-search-location"></i> Szukaj adresu
                        </button>
                        <button class="btn-secondary" id="mapMeasureBtn" title="Pomiar odległości">
                            <i class="fas fa-ruler"></i> Pomiar
                        </button>
                        <button class="btn-secondary toggle-btn" id="mapLiveModeBtn" title="Tryb czasu rzeczywistego">
                            <i class="fas fa-broadcast-tower"></i> Tryb LIVE
                        </button>
                    </div>

                    <div class="toolbar-section">
                        <button class="btn-secondary" id="mapExportBtn" title="Eksport">
                            <i class="fas fa-file-export"></i> Eksport
                        </button>
                        <button class="btn-secondary" id="mapFullscreenBtn" title="Pełny ekran">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>

                <div class="map-container-wrapper">
                    <!-- Sidebar z listą zdarzeń -->
                    <div class="map-sidebar" id="mapSidebar">
                        <div class="map-sidebar-header">
                            <h3><i class="fas fa-list"></i> Wydarzenia</h3>
                            <button class="btn-icon-small" id="toggleSidebarBtn" title="Zwiń">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                        </div>

                        <div class="map-filters">
                            <div class="filter-group">
                                <label>Typ:</label>
                                <select id="mapFilterType">
                                    <option value="all">Wszystkie</option>
                                    <option value="wykroczenie">Wykroczenie</option>
                                    <option value="patrol">Patrol</option>
                                    <option value="kontrola">Kontrola WKRD</option>
                                    <option value="zdarzenie">Zdarzenie drogowe</option>
                                    <option value="konwoj">Konwój</option>
                                    <option value="spb">ŚPB</option>
                                    <option value="pilotaz">Pilotaż</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label>Status:</label>
                                <select id="mapFilterStatus">
                                    <option value="all">Wszystkie</option>
                                    <option value="aktywny">Aktywny</option>
                                    <option value="zakończony">Zakończony</option>
                                    <option value="w_trakcie">W trakcie</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label>Okres:</label>
                                <input type="date" id="mapFilterDateFrom" />
                                <span>do</span>
                                <input type="date" id="mapFilterDateTo" />
                            </div>
                        </div>

                        <div class="map-sidebar-content" id="mapEventsList">
                            <!-- Dynamicznie generowana lista -->
                        </div>

                        <div class="map-stats">
                            <div class="stat-item">
                                <span class="stat-label">Wszystkich zdarzeń:</span>
                                <span class="stat-value" id="totalEvents">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Aktywnych patroli:</span>
                                <span class="stat-value" id="activePatrols">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Główna mapa -->
                    <div class="map-container" id="mapContainer">
                        <div id="tacticalMap" style="width: 100%; height: 100%;"></div>

                        <!-- Legenda -->
                        <div class="map-legend">
                            <div class="legend-title">Legenda</div>
                            <div class="legend-items">
                                <div class="legend-item"><span class="legend-marker wykroczenie"></span> Wykroczenie</div>
                                <div class="legend-item"><span class="legend-marker patrol"></span> Patrol</div>
                                <div class="legend-item"><span class="legend-marker kontrola"></span> Kontrola WKRD</div>
                                <div class="legend-item"><span class="legend-marker zdarzenie"></span> Zdarzenie</div>
                                <div class="legend-item"><span class="legend-marker konwoj"></span> Konwój</div>
                                <div class="legend-item"><span class="legend-marker military"></span> Obiekt wojskowy</div>
                            </div>
                        </div>

                        <!-- Współrzędne kursora -->
                        <div class="map-coordinates" id="mapCoordinates">
                            <i class="fas fa-location-crosshairs"></i>
                            <span id="cursorCoords">-</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Inicjalizacja mapy po renderowaniu DOM
        setTimeout(() => {
            this.initializeMap();
            this.attachEventListeners();
            this.renderEventsList();
            this.updateStats();
        }, 100);
    },

    /**
     * Inicjalizacja mapy Leaflet
     */
    initializeMap() {
        // Centrum Polski jako punkt startowy
        const centerPoland = [52.0693, 19.4803];

        // Inicjalizacja mapy
        this.map = L.map('tacticalMap', {
            center: centerPoland,
            zoom: 7,
            zoomControl: false
        });

        // Dodaj zoom control w prawym dolnym rogu
        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        // Warstwy bazowe
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri',
            maxZoom: 19
        });

        const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenTopoMap',
            maxZoom: 17
        });

        // Domyślna warstwa
        osmLayer.addTo(this.map);

        // Control warstw
        const baseLayers = {
            '<i class="fas fa-map"></i> Standard': osmLayer,
            '<i class="fas fa-satellite"></i> Satelita': satelliteLayer,
            '<i class="fas fa-mountain"></i> Teren': terrainLayer
        };

        L.control.layers(baseLayers, null, { position: 'topright' }).addTo(this.map);

        // Inicjalizacja klastrów markerów
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });
        this.map.addLayer(this.markerClusterGroup);

        // Inicjalizacja warstwy do rysowania
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);

        // Drawing control
        const drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true
                },
                polyline: true,
                circle: true,
                circlemarker: false,
                marker: true,
                rectangle: true
            },
            edit: {
                featureGroup: this.drawnItems,
                remove: true
            }
        });
        this.map.addControl(drawControl);

        // Event dla rysowania
        this.map.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer;
            this.drawnItems.addLayer(layer);

            // Możliwość dodania opisu do narysowanego obiektu
            const description = prompt('Dodaj opis dla tego obszaru/linii:');
            if (description) {
                layer.bindPopup(description);
            }
        });

        // Wyświetlanie współrzędnych kursora
        this.map.on('mousemove', (e) => {
            const { lat, lng } = e.latlng;
            document.getElementById('cursorCoords').textContent =
                `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        });

        // Renderuj wszystkie warstwy
        this.renderAllLayers();
    },

    /**
     * Renderowanie wszystkich warstw na mapie
     */
    renderAllLayers() {
        this.renderEvents();
        this.renderPatrols();
        this.renderMilitaryObjects();
    },

    /**
     * Renderowanie wydarzeń na mapie
     */
    renderEvents() {
        if (!this.activeLayers.events) return;

        this.events.forEach(event => {
            const marker = this.createEventMarker(event);
            this.markerClusterGroup.addLayer(marker);
            this.markers.push(marker);
        });
    },

    /**
     * Tworzenie markera dla wydarzenia
     */
    createEventMarker(event) {
        const icon = this.getIconForType(event.type);

        const marker = L.marker([event.lat, event.lng], {
            icon: icon,
            title: event.name
        });

        const popupContent = `
            <div class="map-popup">
                <div class="popup-header">
                    <h4>${event.name}</h4>
                    <span class="popup-type ${event.type}">${this.getTypeLabel(event.type)}</span>
                </div>
                <div class="popup-body">
                    ${event.date ? `<p><i class="fas fa-calendar"></i> ${event.date}</p>` : ''}
                    ${event.location ? `<p><i class="fas fa-location-dot"></i> ${event.location}</p>` : ''}
                    ${event.unit ? `<p><i class="fas fa-building"></i> ${event.unit}</p>` : ''}
                    ${event.description ? `<p>${event.description}</p>` : ''}
                    ${event.status ? `<p><strong>Status:</strong> ${event.status}</p>` : ''}
                </div>
                <div class="popup-actions">
                    <button onclick="MapManager.showEventDetails(${event.id})" class="btn-sm">
                        <i class="fas fa-eye"></i> Szczegóły
                    </button>
                    <button onclick="MapManager.deleteEvent(${event.id})" class="btn-sm btn-danger">
                        <i class="fas fa-trash"></i> Usuń
                    </button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        return marker;
    },

    /**
     * Renderowanie patroli na mapie
     */
    renderPatrols() {
        if (!this.activeLayers.patrols) return;

        this.patrols.forEach(patrol => {
            const marker = this.createPatrolMarker(patrol);
            this.markerClusterGroup.addLayer(marker);
            this.markers.push(marker);
        });
    },

    /**
     * Tworzenie markera dla patrolu
     */
    createPatrolMarker(patrol) {
        const icon = this.getPatrolIcon(patrol.status);

        const marker = L.marker([patrol.lat, patrol.lng], {
            icon: icon,
            title: patrol.name
        });

        // Dodaj zasięg komunikacji jeśli patrol aktywny
        if (patrol.status === 'aktywny' && this.activeLayers.zones) {
            const circle = L.circle([patrol.lat, patrol.lng], {
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                radius: 5000 // 5km
            }).addTo(this.map);
            circle.bindPopup(`Zasięg komunikacji: ${patrol.name}`);
        }

        const popupContent = `
            <div class="map-popup">
                <div class="popup-header">
                    <h4>${patrol.name}</h4>
                    <span class="popup-status ${patrol.status}">${patrol.status}</span>
                </div>
                <div class="popup-body">
                    ${patrol.date ? `<p><i class="fas fa-calendar"></i> ${patrol.date}</p>` : ''}
                    ${patrol.unit ? `<p><i class="fas fa-building"></i> ${patrol.unit}</p>` : ''}
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        return marker;
    },

    /**
     * Renderowanie obiektów wojskowych
     */
    renderMilitaryObjects() {
        if (!this.activeLayers.military) return;

        this.militaryObjects.forEach(obj => {
            const icon = this.getMilitaryIcon(obj.type);

            const marker = L.marker([obj.lat, obj.lng], {
                icon: icon,
                title: obj.name
            }).addTo(this.map);

            marker.bindPopup(`
                <div class="map-popup">
                    <div class="popup-header">
                        <h4>${obj.name}</h4>
                        <span class="popup-type military">${obj.type === 'headquarters' ? 'Komenda Główna' : 'Jednostka'}</span>
                    </div>
                    <div class="popup-body">
                        <p><i class="fas fa-location-dot"></i> ${obj.city}</p>
                    </div>
                </div>
            `);
        });
    },

    /**
     * Pobierz ikonę dla typu wydarzenia
     */
    getIconForType(type) {
        const icons = {
            'wykroczenie': 'fa-scale-balanced',
            'patrol': 'fa-car-side',
            'kontrola': 'fa-shield-halved',
            'zdarzenie': 'fa-car-burst',
            'konwoj': 'fa-arrow-right-arrow-left',
            'spb': 'fa-hand-fist',
            'pilotaz': 'fa-road'
        };

        const colors = {
            'wykroczenie': '#ef4444',
            'patrol': '#3b82f6',
            'kontrola': '#f59e0b',
            'zdarzenie': '#8b5cf6',
            'konwoj': '#10b981',
            'spb': '#ec4899',
            'pilotaz': '#06b6d4'
        };

        const iconClass = icons[type] || 'fa-map-pin';
        const color = colors[type] || '#6b7280';

        return L.divIcon({
            html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                <i class="fas ${iconClass}" style="color: white; font-size: 14px;"></i>
            </div>`,
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
    },

    /**
     * Pobierz ikonę dla patrolu
     */
    getPatrolIcon(status) {
        const colors = {
            'aktywny': '#10b981',
            'zakończony': '#6b7280',
            'w_trakcie': '#f59e0b'
        };

        const color = colors[status] || '#3b82f6';

        return L.divIcon({
            html: `<div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.4);">
                <i class="fas fa-car-side" style="color: white; font-size: 16px;"></i>
            </div>`,
            className: 'custom-div-icon patrol-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        });
    },

    /**
     * Pobierz ikonę dla obiektu wojskowego
     */
    getMilitaryIcon(type) {
        const color = type === 'headquarters' ? '#dc2626' : '#1e40af';
        const icon = type === 'headquarters' ? 'fa-building-flag' : 'fa-building-shield';

        return L.divIcon({
            html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                <i class="fas ${icon}" style="color: white; font-size: 14px;"></i>
            </div>`,
            className: 'custom-div-icon military-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });
    },

    /**
     * Pobierz etykietę typu
     */
    getTypeLabel(type) {
        const labels = {
            'wykroczenie': 'Wykroczenie',
            'patrol': 'Patrol',
            'kontrola': 'Kontrola WKRD',
            'zdarzenie': 'Zdarzenie drogowe',
            'konwoj': 'Konwój',
            'spb': 'ŚPB',
            'pilotaz': 'Pilotaż'
        };
        return labels[type] || type;
    },

    /**
     * Renderowanie listy wydarzeń w sidebar
     */
    renderEventsList() {
        const list = document.getElementById('mapEventsList');
        if (!list) return;

        const filtered = this.getFilteredEvents();

        if (filtered.length === 0) {
            list.innerHTML = '<div class="empty-state"><i class="fas fa-map-pin"></i><p>Brak wydarzeń</p></div>';
            return;
        }

        list.innerHTML = filtered.map(event => `
            <div class="event-list-item" data-event-id="${event.id}">
                <div class="event-icon ${event.type}">
                    <i class="fas fa-map-pin"></i>
                </div>
                <div class="event-details">
                    <div class="event-name">${event.name}</div>
                    <div class="event-meta">
                        <span class="event-type">${this.getTypeLabel(event.type)}</span>
                        ${event.date ? `<span class="event-date"><i class="fas fa-calendar"></i> ${event.date}</span>` : ''}
                    </div>
                    ${event.location ? `<div class="event-location"><i class="fas fa-location-dot"></i> ${event.location}</div>` : ''}
                </div>
                <button class="event-locate-btn" onclick="MapManager.locateEvent(${event.id})" title="Pokaż na mapie">
                    <i class="fas fa-crosshairs"></i>
                </button>
            </div>
        `).join('');
    },

    /**
     * Pobierz przefiltrowane wydarzenia
     */
    getFilteredEvents() {
        const typeFilter = document.getElementById('mapFilterType')?.value || 'all';
        const statusFilter = document.getElementById('mapFilterStatus')?.value || 'all';
        const dateFrom = document.getElementById('mapFilterDateFrom')?.value;
        const dateTo = document.getElementById('mapFilterDateTo')?.value;

        return this.events.filter(event => {
            if (typeFilter !== 'all' && event.type !== typeFilter) return false;
            if (statusFilter !== 'all' && event.status !== statusFilter) return false;
            if (dateFrom && event.date < dateFrom) return false;
            if (dateTo && event.date > dateTo) return false;
            return true;
        });
    },

    /**
     * Aktualizacja statystyk
     */
    updateStats() {
        document.getElementById('totalEvents').textContent = this.events.length;
        document.getElementById('activePatrols').textContent =
            this.patrols.filter(p => p.status === 'aktywny').length;
    },

    /**
     * Zlokalizuj wydarzenie na mapie
     */
    locateEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.map.setView([event.lat, event.lng], 15);

        // Znajdź i otwórz popup
        this.markers.forEach(marker => {
            if (marker.getLatLng().lat === event.lat && marker.getLatLng().lng === event.lng) {
                marker.openPopup();
            }
        });
    },

    /**
     * Pokaż modal dodawania wydarzenia
     */
    showAddEventModal() {
        Modal.show('Dodaj wydarzenie na mapie', `
            <form id="mapAddEventForm" class="calendar-form">
                <p class="form-info">
                    <i class="fas fa-info-circle"></i>
                    Kliknij na mapie aby wybrać lokalizację lub wpisz współrzędne ręcznie
                </p>

                <div class="form-row">
                    <div class="form-group">
                        <label>Typ wydarzenia *</label>
                        <select id="mapEventType" required>
                            <option value="wykroczenie">Wykroczenie</option>
                            <option value="patrol">Patrol</option>
                            <option value="kontrola">Kontrola WKRD</option>
                            <option value="zdarzenie">Zdarzenie drogowe</option>
                            <option value="konwoj">Konwój</option>
                            <option value="spb">ŚPB</option>
                            <option value="pilotaz">Pilotaż</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status *</label>
                        <select id="mapEventStatus" required>
                            <option value="aktywny">Aktywny</option>
                            <option value="zakończony">Zakończony</option>
                            <option value="w_trakcie">W trakcie</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Nazwa wydarzenia *</label>
                    <input type="text" id="mapEventName" required placeholder="np. Kontrola prędkości DK7" />
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Szerokość geograficzna *</label>
                        <input type="number" id="mapEventLat" step="0.00001" required placeholder="52.2297" />
                    </div>
                    <div class="form-group">
                        <label>Długość geograficzna *</label>
                        <input type="number" id="mapEventLng" step="0.00001" required placeholder="21.0122" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" id="mapEventDate" />
                    </div>
                    <div class="form-group">
                        <label>Jednostka</label>
                        <select id="mapEventUnit">
                            <option value="">-- Wybierz --</option>
                            <option value="KG ŻW">KG ŻW</option>
                            <option value="OSŻW Warszawa">OSŻW Warszawa</option>
                            <option value="OSŻW Mińsk Mazowiecki">OSŻW Mińsk Mazowiecki</option>
                            <option value="OŻW Elbląg">OŻW Elbląg</option>
                            <option value="OŻW Szczecin">OŻW Szczecin</option>
                            <option value="OŻW Bydgoszcz">OŻW Bydgoszcz</option>
                            <option value="OŻW Żagań">OŻW Żagań</option>
                            <option value="OŻW Kraków">OŻW Kraków</option>
                            <option value="OŻW Lublin">OŻW Lublin</option>
                            <option value="OŻW Łódź">OŻW Łódź</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Lokalizacja</label>
                    <input type="text" id="mapEventLocation" placeholder="np. ul. Marszałkowska 1, Warszawa" />
                </div>

                <div class="form-group">
                    <label>Opis</label>
                    <textarea id="mapEventDescription" rows="3" placeholder="Dodatkowe informacje..."></textarea>
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

        // Włącz tryb kliknięcia na mapie
        this.map.once('click', (e) => {
            document.getElementById('mapEventLat').value = e.latlng.lat.toFixed(5);
            document.getElementById('mapEventLng').value = e.latlng.lng.toFixed(5);
        });

        document.getElementById('mapAddEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewEvent();
        });
    },

    /**
     * Zapisz nowe wydarzenie
     */
    saveNewEvent() {
        const event = {
            id: Date.now(),
            type: document.getElementById('mapEventType').value,
            status: document.getElementById('mapEventStatus').value,
            name: document.getElementById('mapEventName').value,
            lat: parseFloat(document.getElementById('mapEventLat').value),
            lng: parseFloat(document.getElementById('mapEventLng').value),
            date: document.getElementById('mapEventDate').value || null,
            unit: document.getElementById('mapEventUnit').value || null,
            location: document.getElementById('mapEventLocation').value || null,
            description: document.getElementById('mapEventDescription').value || null,
            createdAt: new Date().toISOString()
        };

        this.events.push(event);
        this.saveEvents();
        Modal.hide();

        // Odśwież mapę
        this.clearMarkers();
        this.renderAllLayers();
        this.renderEventsList();
        this.updateStats();

        // Pokaż toast
        this.showToast('Wydarzenie dodane pomyślnie');

        // Zlokalizuj na mapie
        this.locateEvent(event.id);
    },

    /**
     * Usuń wydarzenie
     */
    deleteEvent(eventId) {
        if (!confirm('Czy na pewno chcesz usunąć to wydarzenie?')) return;

        this.events = this.events.filter(e => e.id !== eventId);
        this.saveEvents();

        this.clearMarkers();
        this.renderAllLayers();
        this.renderEventsList();
        this.updateStats();

        this.showToast('Wydarzenie usunięte');
    },

    /**
     * Wyczyść wszystkie markery
     */
    clearMarkers() {
        this.markerClusterGroup.clearLayers();
        this.markers = [];
    },

    /**
     * Pokaż szczegóły wydarzenia
     */
    showEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        Modal.show('Szczegóły wydarzenia', `
            <div class="event-details-modal">
                <div class="detail-header">
                    <h3>${event.name}</h3>
                    <span class="type-badge ${event.type}">${this.getTypeLabel(event.type)}</span>
                </div>

                <div class="detail-grid">
                    <div class="detail-item">
                        <i class="fas fa-map-pin"></i>
                        <div>
                            <div class="detail-label">Współrzędne</div>
                            <div class="detail-value">${event.lat.toFixed(5)}, ${event.lng.toFixed(5)}</div>
                        </div>
                    </div>

                    ${event.date ? `
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <div class="detail-label">Data</div>
                            <div class="detail-value">${event.date}</div>
                        </div>
                    </div>
                    ` : ''}

                    ${event.location ? `
                    <div class="detail-item">
                        <i class="fas fa-location-dot"></i>
                        <div>
                            <div class="detail-label">Lokalizacja</div>
                            <div class="detail-value">${event.location}</div>
                        </div>
                    </div>
                    ` : ''}

                    ${event.unit ? `
                    <div class="detail-item">
                        <i class="fas fa-building"></i>
                        <div>
                            <div class="detail-label">Jednostka</div>
                            <div class="detail-value">${event.unit}</div>
                        </div>
                    </div>
                    ` : ''}

                    <div class="detail-item">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <div class="detail-label">Status</div>
                            <div class="detail-value">${event.status}</div>
                        </div>
                    </div>
                </div>

                ${event.description ? `
                <div class="detail-description">
                    <h4>Opis</h4>
                    <p>${event.description}</p>
                </div>
                ` : ''}

                <div class="detail-actions">
                    <button class="btn-primary" onclick="MapManager.locateEvent(${event.id}); Modal.hide();">
                        <i class="fas fa-crosshairs"></i> Pokaż na mapie
                    </button>
                    <button class="btn-secondary" onclick="Modal.hide()">
                        Zamknij
                    </button>
                </div>
            </div>
        `);
    },

    /**
     * Dołącz event listeners
     */
    attachEventListeners() {
        document.getElementById('mapAddEventBtn')?.addEventListener('click', () => this.showAddEventModal());
        document.getElementById('mapFilterType')?.addEventListener('change', () => this.renderEventsList());
        document.getElementById('mapFilterStatus')?.addEventListener('change', () => this.renderEventsList());
        document.getElementById('mapFilterDateFrom')?.addEventListener('change', () => this.renderEventsList());
        document.getElementById('mapFilterDateTo')?.addEventListener('change', () => this.renderEventsList());
    },

    /**
     * Pokaż toast
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:12px 24px;border-radius:8px;z-index:10000;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};
