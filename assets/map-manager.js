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
    heatLayer: null,
    markerClusterGroup: null,
    drawnItems: null,
    currentBaseLayer: 'osm',
    currentBasemap: 'standard',
    activeLayers: {
        events: true,
        water: false,
        traffic: false,
        zones: true
    },
    liveMode: false,
    liveUpdateInterval: null,
    measurementMode: false,

    // Tryb dodawania wydarzenia przez kliknięcie na mapie
    mapClickMode: false,
    tempMarker: null,

    // TODO: Future GPS Integration
    // When mobile patrol app is ready with GPS tracking:
    // - Add 'livePatrols: []' to store real-time patrol positions
    // - Add 'activeLayers.livePatrols: true' for toggling
    // - Implement WebSocket/API polling for live updates
    // - Add patrol tracking visualization (trails, speed, direction)

    /**
     * Inicjalizacja managera mapy
     */
    init() {
        this.loadEvents();
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
     * Główna funkcja renderująca widok mapy
     */
    render() {
        this.loadEvents();

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
                        <button class="btn-secondary" id="mapEventsBtn" title="Wydarzenia">
                            <i class="fas fa-list"></i> Wydarzenia
                        </button>
                        <button class="btn-secondary" id="mapLayersBtn" title="Warstwy mapy">
                            <i class="fas fa-layer-group"></i> Warstwy
                        </button>
                        <button class="btn-secondary" id="mapToolsBtn" title="Narzędzia">
                            <i class="fas fa-tools"></i> Narzędzia
                        </button>
                        <button class="btn-secondary" id="mapUnitsBtn" title="Jednostki">
                            <i class="fas fa-building-shield"></i> Jednostki
                        </button>
                        <button class="btn-secondary" id="mapTeamsBtn" title="Zespoły">
                            <i class="fas fa-users"></i> Zespoły
                        </button>
                        <button class="btn-secondary" id="mapCommunicatorBtn" title="Komunikator">
                            <i class="fas fa-comments"></i> Komunikator
                        </button>
                    </div>

                    <div class="toolbar-section">
                        <button class="btn-secondary" id="mapGeocodingBtn" title="Wyszukaj adres">
                            <i class="fas fa-search-location"></i> Szukaj adresu
                        </button>
                        <button class="btn-secondary" id="mapMeasureBtn" title="Pomiar odległości">
                            <i class="fas fa-ruler"></i> Pomiar
                        </button>
                        <button class="btn-secondary" id="mapFullscreenBtn" title="Pełny ekran">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>

                <div class="map-container-wrapper">
                    <!-- Sidebar z listą zdarzeń - HIDDEN (używany przez modal) -->
                    <div class="map-sidebar" id="mapSidebar" style="display: none;">
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
                                    <option value="zabezpieczenie">Zabezpieczenie prewencyjno-ochronne</option>
                                    <option value="mczp">MczP</option>
                                    <option value="piro">PIRO</option>
                                    <option value="zdarzenie">Zdarzenie drogowe</option>
                                    <option value="wykroczenie">Wykroczenie</option>
                                    <option value="inne">Inne</option>
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
                                <span class="stat-label">Aktywnych zabezpieczeń:</span>
                                <span class="stat-value" id="activeSecurities">0</span>
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
                                <div class="legend-item"><span class="legend-marker zabezpieczenie"></span> Zabezpieczenie</div>
                                <div class="legend-item"><span class="legend-marker mczp"></span> MczP</div>
                                <div class="legend-item"><span class="legend-marker piro"></span> PIRO</div>
                                <div class="legend-item"><span class="legend-marker zdarzenie"></span> Zdarzenie drogowe</div>
                                <div class="legend-item"><span class="legend-marker wykroczenie"></span> Wykroczenie</div>
                                <div class="legend-item"><span class="legend-marker inne"></span> Inne</div>
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
        this.loadCustomMarkers();
        this.loadNotes();
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
     * Pobierz ikonę dla typu wydarzenia
     */
    getIconForType(type) {
        const icons = {
            'zabezpieczenie': 'fa-shield-halved',
            'mczp': 'fa-location-crosshairs',
            'piro': 'fa-traffic-light',
            'zdarzenie': 'fa-car-burst',
            'wykroczenie': 'fa-scale-balanced',
            'inne': 'fa-map-pin'
        };

        const colors = {
            'zabezpieczenie': '#10b981',
            'mczp': '#f59e0b',
            'piro': '#3b82f6',
            'zdarzenie': '#8b5cf6',
            'wykroczenie': '#ef4444',
            'inne': '#6b7280'
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
     * Pobierz etykietę typu
     */
    getTypeLabel(type) {
        const labels = {
            'zabezpieczenie': 'Zabezpieczenie prewencyjno-ochronne',
            'mczp': 'MczP',
            'piro': 'PIRO',
            'zdarzenie': 'Zdarzenie drogowe',
            'wykroczenie': 'Wykroczenie',
            'inne': 'Inne'
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
        document.getElementById('activeSecurities').textContent =
            this.events.filter(e => e.type === 'zabezpieczenie' && e.status === 'aktywny').length;
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
     * Włącz tryb wyboru lokalizacji na mapie
     */
    enableMapClickMode() {
        if (this.mapClickMode) return;

        this.mapClickMode = true;
        this.map.getContainer().style.cursor = 'crosshair';

        // Obsługa kliknięcia na mapie
        this.mapClickHandler = (e) => {
            this.placeTemporaryMarker(e.latlng);
        };

        this.map.on('click', this.mapClickHandler);

        // Informacja dla użytkownika
        this.showToast('Kliknij na mapie aby wybrać lokalizację');
    },

    /**
     * Wyłącz tryb wyboru lokalizacji na mapie
     */
    disableMapClickMode() {
        if (!this.mapClickMode) return;

        this.mapClickMode = false;
        this.map.getContainer().style.cursor = '';

        if (this.mapClickHandler) {
            this.map.off('click', this.mapClickHandler);
            this.mapClickHandler = null;
        }
    },

    /**
     * Umieść tymczasowy marker na mapie
     */
    placeTemporaryMarker(latlng) {
        // Usuń poprzedni tymczasowy marker jeśli istnieje
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }

        // Utwórz nowy tymczasowy marker (pinezka)
        const icon = L.divIcon({
            html: `<div style="background-color: #ef4444; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.5);">
                <i class="fas fa-plus" style="color: white; font-size: 18px; transform: rotate(45deg);"></i>
            </div>`,
            className: 'temp-marker-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        this.tempMarker = L.marker(latlng, {
            icon: icon,
            draggable: true,
            autoPan: true
        }).addTo(this.map);

        // Popup informacyjny
        this.tempMarker.bindPopup(`
            <div style="text-align: center;">
                <strong>Wybrana lokalizacja</strong><br>
                <small>Możesz przesunąć marker</small><br>
                <small>${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}</small>
            </div>
        `).openPopup();

        // Aktualizuj współrzędne w formularzu
        this.updateCoordinatesInForm(latlng);

        // Obsługa przesunięcia markera
        this.tempMarker.on('dragend', (e) => {
            const newLatLng = e.target.getLatLng();
            this.updateCoordinatesInForm(newLatLng);

            // Aktualizuj popup
            e.target.setPopupContent(`
                <div style="text-align: center;">
                    <strong>Wybrana lokalizacja</strong><br>
                    <small>Możesz przesunąć marker</small><br>
                    <small>${newLatLng.lat.toFixed(5)}, ${newLatLng.lng.toFixed(5)}</small>
                </div>
            `);
        });

        this.showToast('Lokalizacja wybrana. Możesz przesunąć marker.');
    },

    /**
     * Aktualizuj współrzędne w formularzu
     */
    updateCoordinatesInForm(latlng) {
        const latInput = document.getElementById('mapEventLat');
        const lngInput = document.getElementById('mapEventLng');

        if (latInput && lngInput) {
            latInput.value = latlng.lat.toFixed(5);
            lngInput.value = latlng.lng.toFixed(5);

            // Podświetl pola żeby pokazać że zostały zaktualizowane
            latInput.style.backgroundColor = '#10b98120';
            lngInput.style.backgroundColor = '#10b98120';

            setTimeout(() => {
                latInput.style.backgroundColor = '';
                lngInput.style.backgroundColor = '';
            }, 1000);
        }
    },

    /**
     * Usuń tymczasowy marker
     */
    removeTemporaryMarker() {
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
    },

    /**
     * Pokaż modal dodawania wydarzenia
     */
    showAddEventModal() {
        Modal.show('Dodaj wydarzenie na mapie', `
            <form id="mapAddEventForm" class="calendar-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Typ wydarzenia *</label>
                        <select id="mapEventType" required>
                            <option value="zabezpieczenie">Zabezpieczenie prewencyjno-ochronne</option>
                            <option value="mczp">MczP</option>
                            <option value="piro">PIRO</option>
                            <option value="zdarzenie">Zdarzenie drogowe</option>
                            <option value="wykroczenie">Wykroczenie</option>
                            <option value="inne">Inne</option>
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

                <div class="form-group">
                    <label>Współrzędne *</label>
                    <button type="button" class="btn-secondary btn-full" id="selectFromMapBtn" style="margin-bottom: 0.5rem;">
                        <i class="fas fa-map-marker-alt"></i> Wybierz lokalizację z mapy
                    </button>
                    <div class="form-row" style="margin-top: 0.5rem;">
                        <div class="form-group" style="margin: 0;">
                            <input type="number" id="mapEventLat" step="0.00001" required placeholder="Szerokość (np. 52.2297)" />
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <input type="number" id="mapEventLng" step="0.00001" required placeholder="Długość (np. 21.0122)" />
                        </div>
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
                    <button type="button" class="btn-secondary" onclick="MapManager.cancelAddEvent()">
                        Anuluj
                    </button>
                </div>
            </form>
        `);

        // Obsługa przycisku "Wybierz z mapy"
        document.getElementById('selectFromMapBtn')?.addEventListener('click', () => {
            this.enableMapClickMode();
        });

        // Obsługa formularza
        document.getElementById('mapAddEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewEvent();
        });
    },

    /**
     * Anuluj dodawanie wydarzenia
     */
    cancelAddEvent() {
        this.disableMapClickMode();
        this.removeTemporaryMarker();
        Modal.hide();
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

        // Wyłącz tryb kliknięcia i usuń tymczasowy marker
        this.disableMapClickMode();
        this.removeTemporaryMarker();

        Modal.hide();

        // Odśwież mapę
        this.clearMarkers();
        this.renderAllLayers();
        this.renderEventsList();
        this.updateStats();

        // Wyśrodkuj mapę na nowym zdarzeniu
        this.map.setView([event.lat, event.lng], 14);

        // Pokaż toast
        this.showToast('Wydarzenie dodane pomyślnie');
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
        document.getElementById('mapEventsBtn')?.addEventListener('click', () => this.showEventsModal());
        document.getElementById('mapLayersBtn')?.addEventListener('click', () => this.showLayersModal());
        document.getElementById('mapToolsBtn')?.addEventListener('click', () => this.showToolsModal());
        document.getElementById('mapUnitsBtn')?.addEventListener('click', () => this.showUnitsModal());
        document.getElementById('mapTeamsBtn')?.addEventListener('click', () => this.showTeamsPanel());
        document.getElementById('mapCommunicatorBtn')?.addEventListener('click', () => this.showCommunicatorPanel());
        document.getElementById('mapGeocodingBtn')?.addEventListener('click', () => this.showGeocodingModal());
        document.getElementById('mapMeasureBtn')?.addEventListener('click', () => this.toggleMeasurementMode());
        document.getElementById('mapFullscreenBtn')?.addEventListener('click', () => this.toggleFullscreen());
    },

    // ============================================
    // PHASE 2: ADVANCED FEATURES
    // ============================================

    /**
     * Zastosuj filtry i odśwież renderowanie
     */
    applyFiltersAndRender() {
        this.clearMarkers();
        this.renderAllLayers();
        this.renderEventsList();
        this.updateStats();
    },

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        const sidebar = document.getElementById('mapSidebar');
        const btn = document.getElementById('toggleSidebarBtn');
        const icon = btn?.querySelector('i');

        sidebar?.classList.toggle('collapsed');

        if (sidebar?.classList.contains('collapsed')) {
            icon?.classList.replace('fa-chevron-left', 'fa-chevron-right');
        } else {
            icon?.classList.replace('fa-chevron-right', 'fa-chevron-left');
        }
    },

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        const container = document.querySelector('.map-view');

        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error('Błąd fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    },

    // ============================================
    // GEOCODING - ADDRESS SEARCH
    // ============================================

    /**
     * Pokaż modal wyszukiwania adresu
     */
    showGeocodingModal() {
        Modal.show('Wyszukaj adres na mapie', `
            <div class="geocoding-modal">
                <p class="form-info">
                    <i class="fas fa-search-location"></i>
                    Wpisz adres, miasto lub współrzędne GPS
                </p>

                <div class="form-group">
                    <label>Wyszukaj lokalizację</label>
                    <div class="search-input-group">
                        <input type="text" id="geocodingSearch" placeholder="np. Aleje Jerozolimskie, Warszawa" />
                        <button class="btn-primary" id="geocodingSearchBtn">
                            <i class="fas fa-search"></i> Szukaj
                        </button>
                    </div>
                </div>

                <div id="geocodingResults" class="geocoding-results" style="display: none;">
                    <!-- Wyniki wyszukiwania -->
                </div>

                <div class="geocoding-examples">
                    <p><strong>Przykłady:</strong></p>
                    <ul>
                        <li>Plac Zamkowy, Warszawa</li>
                        <li>Kraków, Rynek Główny</li>
                        <li>52.2297, 21.0122 (współrzędne)</li>
                        <li>Żandarmeria Wojskowa, Warszawa</li>
                    </ul>
                </div>
            </div>
        `);

        // Event listeners
        const searchBtn = document.getElementById('geocodingSearchBtn');
        const searchInput = document.getElementById('geocodingSearch');

        searchBtn?.addEventListener('click', () => this.performGeocoding());
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performGeocoding();
        });
    },

    /**
     * Wykonaj geocoding (wyszukiwanie adresu)
     */
    async performGeocoding() {
        const query = document.getElementById('geocodingSearch')?.value;
        if (!query) return;

        const resultsDiv = document.getElementById('geocodingResults');
        resultsDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Szukam...</div>';
        resultsDiv.style.display = 'block';

        try {
            // Użyj Nominatim (OpenStreetMap geocoding - darmowy)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=pl`
            );
            const data = await response.json();

            if (data.length === 0) {
                resultsDiv.innerHTML = '<div class="no-results"><i class="fas fa-exclamation-circle"></i> Nie znaleziono wyników</div>';
                return;
            }

            // Wyświetl wyniki
            resultsDiv.innerHTML = data.map(result => `
                <div class="geocoding-result-item" onclick="MapManager.selectGeocodingResult(${result.lat}, ${result.lon}, '${result.display_name.replace(/'/g, "\\'")}')">
                    <div class="result-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="result-details">
                        <div class="result-name">${result.display_name}</div>
                        <div class="result-coords">${parseFloat(result.lat).toFixed(5)}, ${parseFloat(result.lon).toFixed(5)}</div>
                    </div>
                    <div class="result-action">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Błąd geocodingu:', error);
            resultsDiv.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i> Błąd wyszukiwania</div>';
        }
    },

    /**
     * Wybierz wynik geocodingu
     */
    selectGeocodingResult(lat, lon, name) {
        // Zamknij modal
        Modal.hide();

        // Przesuń mapę do wyniku
        this.map.setView([lat, lon], 15);

        // Dodaj tymczasowy marker
        const marker = L.marker([lat, lon], {
            icon: L.divIcon({
                html: '<div style="background-color: #ef4444; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); animation: pulse 2s infinite;"><i class="fas fa-location-dot" style="color: white; font-size: 20px;"></i></div>',
                className: 'geocoding-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(this.map);

        marker.bindPopup(`
            <div class="map-popup">
                <div class="popup-header">
                    <h4>Znaleziono lokalizację</h4>
                </div>
                <div class="popup-body">
                    <p><i class="fas fa-location-dot"></i> ${name}</p>
                    <p><i class="fas fa-map-pin"></i> ${lat.toFixed(5)}, ${lon.toFixed(5)}</p>
                </div>
                <div class="popup-actions">
                    <button onclick="MapManager.createEventAtLocation(${lat}, ${lon}, '${name.replace(/'/g, "\\'")}', this)" class="btn-sm">
                        <i class="fas fa-plus"></i> Dodaj wydarzenie tutaj
                    </button>
                </div>
            </div>
        `).openPopup();

        this.showToast('Znaleziono lokalizację');
    },

    /**
     * Utwórz wydarzenie w znalezionej lokalizacji
     */
    createEventAtLocation(lat, lon, location, buttonElement) {
        // Zamknij popup
        this.map.closePopup();

        // Otwórz modal dodawania z wypełnionymi współrzędnymi
        this.showAddEventModal();

        // Wypełnij pola
        setTimeout(() => {
            document.getElementById('mapEventLat').value = lat.toFixed(5);
            document.getElementById('mapEventLng').value = lon.toFixed(5);
            document.getElementById('mapEventLocation').value = location;
        }, 100);
    },

    // ============================================
    // HEAT MAP - DENSITY VISUALIZATION
    // ============================================

    /**
     * Toggle heat mapa
     */
    toggleHeatMap() {
        this.activeLayers.heat = !this.activeLayers.heat;

        if (this.activeLayers.heat) {
            this.renderHeatMap();
        } else {
            if (this.heatLayer) {
                this.map.removeLayer(this.heatLayer);
                this.heatLayer = null;
            }
        }
    },

    /**
     * Renderuj heat mapę
     */
    renderHeatMap() {
        if (this.heatLayer) {
            this.map.removeLayer(this.heatLayer);
        }

        // Przygotuj dane dla heat mapy (lat, lng, intensity)
        const heatData = this.events.map(event => [event.lat, event.lng, 0.8]);

        if (heatData.length === 0) {
            this.showToast('Brak danych do wyświetlenia heat mapy');
            this.activeLayers.heat = false;
            return;
        }

        // Utwórz heat layer
        this.heatLayer = L.heatLayer(heatData, {
            radius: 25,
            blur: 35,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.0: '#0000ff',
                0.5: '#00ff00',
                0.7: '#ffff00',
                1.0: '#ff0000'
            }
        }).addTo(this.map);

        this.showToast('Heat mapa włączona');
    },

    // ============================================
    // MEASUREMENT TOOL
    // ============================================

    /**
     * Toggle tryb pomiaru odległości
     */
    toggleMeasurementMode() {
        this.measurementMode = !this.measurementMode;
        const btn = document.getElementById('mapMeasureBtn');

        if (this.measurementMode) {
            btn?.classList.add('active');
            this.map.getContainer().style.cursor = 'crosshair';
            this.showToast('Kliknij na mapie aby mierzyć odległość');
            this.startMeasurement();
        } else {
            btn?.classList.remove('active');
            this.map.getContainer().style.cursor = '';
            this.stopMeasurement();
        }
    },

    /**
     * Rozpocznij pomiar
     */
    startMeasurement() {
        this.measurementPoints = [];
        this.measurementMarkers = [];
        this.measurementLines = [];

        this.map.on('click', this.handleMeasurementClick.bind(this));
    },

    /**
     * Zatrzymaj pomiar
     */
    stopMeasurement() {
        this.map.off('click', this.handleMeasurementClick);

        // Usuń markery i linie pomiaru
        if (this.measurementMarkers) {
            this.measurementMarkers.forEach(marker => this.map.removeLayer(marker));
        }
        if (this.measurementLines) {
            this.measurementLines.forEach(line => this.map.removeLayer(line));
        }

        this.measurementPoints = [];
        this.measurementMarkers = [];
        this.measurementLines = [];
    },

    /**
     * Obsługa kliknięcia w trybie pomiaru
     */
    handleMeasurementClick(e) {
        const { lat, lng } = e.latlng;
        this.measurementPoints.push([lat, lng]);

        // Dodaj marker
        const marker = L.circleMarker([lat, lng], {
            radius: 5,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 1
        }).addTo(this.map);
        this.measurementMarkers.push(marker);

        // Jeśli to nie pierwszy punkt, narysuj linię
        if (this.measurementPoints.length > 1) {
            const line = L.polyline(this.measurementPoints, {
                color: '#3b82f6',
                weight: 3,
                dashArray: '10, 10'
            }).addTo(this.map);
            this.measurementLines.push(line);

            // Oblicz odległość
            const distance = this.calculateDistance(
                this.measurementPoints[this.measurementPoints.length - 2],
                this.measurementPoints[this.measurementPoints.length - 1]
            );

            const totalDistance = this.calculateTotalDistance();

            // Pokaż popup z odległością
            marker.bindPopup(`
                <div style="text-align: center;">
                    <strong>Odcinek:</strong> ${distance.toFixed(2)} km<br>
                    <strong>Suma:</strong> ${totalDistance.toFixed(2)} km<br>
                    <button onclick="MapManager.toggleMeasurementMode()" style="margin-top: 8px; padding: 4px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-times"></i> Zakończ pomiar
                    </button>
                </div>
            `).openPopup();
        } else {
            marker.bindPopup('Punkt początkowy pomiaru').openPopup();
        }
    },

    /**
     * Oblicz odległość między dwoma punktami (w km)
     */
    calculateDistance(point1, point2) {
        const R = 6371; // Promień Ziemi w km
        const dLat = this.toRad(point2[0] - point1[0]);
        const dLon = this.toRad(point2[1] - point1[1]);
        const lat1 = this.toRad(point1[0]);
        const lat2 = this.toRad(point2[0]);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    /**
     * Oblicz całkowitą odległość
     */
    calculateTotalDistance() {
        let total = 0;
        for (let i = 1; i < this.measurementPoints.length; i++) {
            total += this.calculateDistance(this.measurementPoints[i - 1], this.measurementPoints[i]);
        }
        return total;
    },

    /**
     * Konwertuj stopnie na radiany
     */
    toRad(degrees) {
        return degrees * Math.PI / 180;
    },

    // ============================================
    // LIVE MODE - REAL-TIME UPDATES
    // ============================================

    /**
     * Toggle tryb LIVE
     */
    toggleLiveMode() {
        this.liveMode = !this.liveMode;
        const btn = document.getElementById('mapLiveModeBtn');

        if (this.liveMode) {
            btn?.classList.add('active');
            btn.innerHTML = '<i class="fas fa-broadcast-tower"></i> <span class="live-indicator">LIVE</span>';
            this.startLiveMode();
            this.showToast('Tryb LIVE włączony - odświeżanie co 10s');
        } else {
            btn?.classList.remove('active');
            btn.innerHTML = '<i class="fas fa-broadcast-tower"></i> Tryb LIVE';
            this.stopLiveMode();
            this.showToast('Tryb LIVE wyłączony');
        }
    },

    /**
     * Rozpocznij tryb LIVE
     */
    startLiveMode() {
        // Odświeżaj co 10 sekund
        this.liveUpdateInterval = setInterval(() => {
            this.refreshLiveData();
        }, 10000);

        // Pierwsze odświeżenie natychmiast
        this.refreshLiveData();
    },

    /**
     * Zatrzymaj tryb LIVE
     */
    stopLiveMode() {
        if (this.liveUpdateInterval) {
            clearInterval(this.liveUpdateInterval);
            this.liveUpdateInterval = null;
        }
    },

    /**
     * Odśwież dane w trybie LIVE
     */
    refreshLiveData() {
        // Załaduj najnowsze dane
        this.loadEvents();

        // Odśwież mapę
        this.clearMarkers();
        this.renderAllLayers();
        this.renderEventsList();
        this.updateStats();

        // Animacja odświeżenia
        const btn = document.getElementById('mapLiveModeBtn');
        btn?.classList.add('refreshing');
        setTimeout(() => btn?.classList.remove('refreshing'), 500);
    },

    // ============================================
    // LAYERS MANAGEMENT
    // ============================================

    /**
     * Pokaż modal zarządzania warstwami
     */
    showLayersModal() {
        Modal.show('Warstwy mapy', `
            <div class="layers-modal">
                <p class="form-info">
                    <i class="fas fa-layer-group"></i>
                    Wybierz podkład mapy oraz dodatkowe warstwy
                </p>

                <div class="layer-section">
                    <h4>Podkład mapy:</h4>
                    <div class="layer-toggles">
                        <div class="layer-toggle-item">
                            <label class="toggle-switch">
                                <input type="radio" name="basemap" value="standard" ${this.currentBasemap === 'standard' ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="toggle-label">
                                <i class="fas fa-map"></i>
                                <span>Standard</span>
                            </div>
                        </div>

                        <div class="layer-toggle-item">
                            <label class="toggle-switch">
                                <input type="radio" name="basemap" value="satellite" ${this.currentBasemap === 'satellite' ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="toggle-label">
                                <i class="fas fa-satellite"></i>
                                <span>Satelita</span>
                            </div>
                        </div>

                        <div class="layer-toggle-item">
                            <label class="toggle-switch">
                                <input type="radio" name="basemap" value="terrain" ${this.currentBasemap === 'terrain' ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="toggle-label">
                                <i class="fas fa-mountain"></i>
                                <span>Teren</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="layer-section">
                    <h4>Dodatkowe warstwy:</h4>
                    <div class="layer-toggles">
                        <div class="layer-toggle-item">
                            <label class="toggle-switch">
                                <input type="checkbox" id="layerWater" ${this.activeLayers.water ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="toggle-label">
                                <i class="fas fa-water"></i>
                                <span>Cieki wodne</span>
                            </div>
                        </div>

                        <div class="layer-toggle-item">
                            <label class="toggle-switch">
                                <input type="checkbox" id="layerTraffic" ${this.activeLayers.traffic ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="toggle-label">
                                <i class="fas fa-car"></i>
                                <span>Natężenie ruchu</span>
                            </div>
                        </div>

                        <div class="layer-toggle-item">
                            <label class="toggle-switch">
                                <input type="checkbox" id="layerZones" ${this.activeLayers.zones ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="toggle-label">
                                <i class="fas fa-circle"></i>
                                <span>Strefy zasięgu</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn-primary" onclick="MapManager.applyLayerChanges()">
                        <i class="fas fa-check"></i> Zastosuj
                    </button>
                    <button class="btn-secondary" onclick="Modal.hide()">
                        Anuluj
                    </button>
                </div>
            </div>
        `);
    },

    /**
     * Zastosuj zmiany w warstwach
     */
    applyLayerChanges() {
        // Pobierz wybrany podkład
        const selectedBasemap = document.querySelector('input[name="basemap"]:checked')?.value || 'standard';

        // Pobierz warstwy
        this.activeLayers.water = document.getElementById('layerWater')?.checked || false;
        this.activeLayers.traffic = document.getElementById('layerTraffic')?.checked || false;
        this.activeLayers.zones = document.getElementById('layerZones')?.checked || false;

        // Zmień podkład jeśli inny
        if (selectedBasemap !== this.currentBasemap) {
            this.currentBasemap = selectedBasemap;
            this.changeBasemap(selectedBasemap);
        }

        Modal.hide();

        // Odśwież mapę
        this.clearMarkers();
        this.renderAllLayers();

        this.showToast('Warstwy zaktualizowane');
    },

    /**
     * Zmień podkład mapy
     */
    changeBasemap(type) {
        // Usuń obecny layer
        this.map.eachLayer((layer) => {
            if (layer._url) {
                this.map.removeLayer(layer);
            }
        });

        // Dodaj nowy layer
        let tileUrl;
        switch (type) {
            case 'satellite':
                tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
                break;
            case 'terrain':
                tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
                break;
            case 'standard':
            default:
                tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }

        L.tileLayer(tileUrl, {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    },

    // ============================================
    // TOOLS MODAL
    // ============================================

    /**
     * Pokaż modal narzędzi
     */
    showToolsModal() {
        Modal.show('Narzędzia mapy', `
            <div class="tools-modal">
                <div class="tool-grid">
                    <div class="tool-item" onclick="MapManager.toggleMeasurementMode(); Modal.hide();">
                        <div class="tool-icon"><i class="fas fa-ruler"></i></div>
                        <div class="tool-name">Pomiar odległości</div>
                        <div class="tool-desc">Mierz odległości między punktami</div>
                    </div>

                    <div class="tool-item" onclick="MapManager.toggleDrawingMode(); Modal.hide();">
                        <div class="tool-icon"><i class="fas fa-draw-polygon"></i></div>
                        <div class="tool-name">Rysowanie obszarów</div>
                        <div class="tool-desc">Zaznacz obszar na mapie</div>
                    </div>

                    <div class="tool-item" onclick="MapManager.addCustomMarker(); Modal.hide();">
                        <div class="tool-icon"><i class="fas fa-map-marker-alt"></i></div>
                        <div class="tool-name">Dodaj znacznik</div>
                        <div class="tool-desc">Dodaj niestandardowy znacznik</div>
                    </div>

                    <div class="tool-item" onclick="MapManager.showNotesPanel(); Modal.hide();">
                        <div class="tool-icon"><i class="fas fa-sticky-note"></i></div>
                        <div class="tool-name">Notatki</div>
                        <div class="tool-desc">Dodaj notatki do mapy</div>
                    </div>

                    <div class="tool-item" onclick="MapManager.centerOnPoland(); Modal.hide();">
                        <div class="tool-icon"><i class="fas fa-globe"></i></div>
                        <div class="tool-name">Wyśrodkuj mapę</div>
                        <div class="tool-desc">Pokaż całą Polskę</div>
                    </div>

                    <div class="tool-item" onclick="MapManager.clearAllDrawings(); Modal.hide();">
                        <div class="tool-icon"><i class="fas fa-eraser"></i></div>
                        <div class="tool-name">Wyczyść rysunki</div>
                        <div class="tool-desc">Usuń wszystkie narysowane obiekty</div>
                    </div>
                </div>
            </div>
        `);
    },

    /**
     * Wyśrodkuj mapę na Polsce
     */
    centerOnPoland() {
        this.map.setView([52.0693, 19.4803], 7);
        this.showToast('Mapa wyśrodkowana');
    },

    /**
     * Wyczyść wszystkie rysunki
     */
    clearAllDrawings() {
        if (confirm('Czy na pewno chcesz usunąć wszystkie rysunki?')) {
            this.drawnItems.clearLayers();
            this.showToast('Rysunki usunięte');
        }
    },

    // ============================================
    // DATA IMPORT FROM MODULES
    // ============================================

    /**
     * Pokaż modal importu danych
     */
    showImportDataModal() {
        Modal.show('Import danych z modułów', `
            <div class="import-modal">
                <p class="form-info">
                    <i class="fas fa-download"></i>
                    Automatycznie nanoś zdarzenia z innych modułów na mapę
                </p>

                <div class="import-options">
                    <div class="import-option">
                        <div class="import-header">
                            <i class="fas fa-scale-balanced"></i>
                            <h4>Wykroczenia</h4>
                        </div>
                        <p>Import wykroczeń z modułu Wykroczenia</p>
                        <button class="btn-secondary btn-full" onclick="MapManager.importWykroczeniaData()">
                            <i class="fas fa-download"></i> Importuj wykroczenia
                        </button>
                    </div>

                    <div class="import-option">
                        <div class="import-header">
                            <i class="fas fa-car-burst"></i>
                            <h4>Zdarzenia drogowe</h4>
                        </div>
                        <p>Import zdarzeń z modułu Zdarzenia</p>
                        <button class="btn-secondary btn-full" onclick="MapManager.importZdarzeniaData()">
                            <i class="fas fa-download"></i> Importuj zdarzenia
                        </button>
                    </div>
                </div>

                <div class="import-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Uwaga: Import wymaga aby dane w modułach zawierały informacje o lokalizacji (współrzędne GPS lub adres)</p>
                </div>
            </div>
        `);
    },


    /**
     * Import wykroczeń (placeholder - wymaga dodania współrzędnych do modułu)
     */
    importWykroczeniaData() {
        this.showToast('Funkcja dostępna po dodaniu współrzędnych do modułu Wykroczenia');
        // TODO: Implementacja po dodaniu pól GPS do formularza wykroczeń
    },


    /**
     * Import zdarzeń drogowych (placeholder)
     */
    importZdarzeniaData() {
        this.showToast('Funkcja dostępna po dodaniu współrzędnych do modułu Zdarzenia');
        // TODO: Implementacja
    },

    // ============================================
    // EXPORT FUNCTIONALITY
    // ============================================

    /**
     * Pokaż modal eksportu
     */
    showExportModal() {
        Modal.show('Eksport danych mapy', `
            <div class="export-modal">
                <p class="form-info">
                    <i class="fas fa-file-export"></i>
                    Wyeksportuj dane mapy w wybranym formacie
                </p>

                <div class="export-options">
                    <button class="btn-primary btn-full" onclick="MapManager.exportToGPX()">
                        <i class="fas fa-map-location-dot"></i> Eksport do GPX
                        <small>Format dla urządzeń GPS</small>
                    </button>

                    <button class="btn-primary btn-full" onclick="MapManager.exportToKML()">
                        <i class="fas fa-earth-americas"></i> Eksport do KML
                        <small>Format dla Google Earth</small>
                    </button>

                    <button class="btn-primary btn-full" onclick="MapManager.exportMapToPDF()">
                        <i class="fas fa-file-pdf"></i> Eksport do PDF
                        <small>Raport z mapą i listą zdarzeń</small>
                    </button>

                    <button class="btn-primary btn-full" onclick="MapManager.exportToCSV()">
                        <i class="fas fa-file-csv"></i> Eksport do CSV
                        <small>Lista zdarzeń z współrzędnymi</small>
                    </button>

                    <button class="btn-primary btn-full" onclick="MapManager.exportToGeoJSON()">
                        <i class="fas fa-code"></i> Eksport do GeoJSON
                        <small>Format dla aplikacji GIS</small>
                    </button>
                </div>
            </div>
        `);
    },

    /**
     * Eksport do GPX
     */
    exportToGPX() {
        const gpx = this.generateGPX();
        this.downloadFile(gpx, `mapa_zdarzen_${new Date().toISOString().split('T')[0]}.gpx`, 'application/gpx+xml');
        Modal.hide();
        this.showToast('Wyeksportowano do GPX');
    },

    /**
     * Generuj GPX
     */
    generateGPX() {
        let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="AEP Tactical Map" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Mapa Zdarzeń AEP</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
`;

        this.events.forEach(event => {
            gpx += `  <wpt lat="${event.lat}" lon="${event.lng}">
    <name>${this.escapeXml(event.name)}</name>
    <desc>${this.escapeXml(event.description || '')}</desc>
    <type>${event.type}</type>
  </wpt>
`;
        });

        gpx += '</gpx>';
        return gpx;
    },

    /**
     * Eksport do KML
     */
    exportToKML() {
        const kml = this.generateKML();
        this.downloadFile(kml, `mapa_zdarzen_${new Date().toISOString().split('T')[0]}.kml`, 'application/vnd.google-earth.kml+xml');
        Modal.hide();
        this.showToast('Wyeksportowano do KML');
    },

    /**
     * Generuj KML
     */
    generateKML() {
        let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Mapa Zdarzeń AEP</name>
    <description>Eksport z dnia ${new Date().toLocaleString('pl-PL')}</description>
`;

        this.events.forEach(event => {
            kml += `    <Placemark>
      <name>${this.escapeXml(event.name)}</name>
      <description>${this.escapeXml(event.description || '')}</description>
      <Point>
        <coordinates>${event.lng},${event.lat},0</coordinates>
      </Point>
    </Placemark>
`;
        });

        kml += `  </Document>
</kml>`;
        return kml;
    },

    /**
     * Eksport do CSV
     */
    exportToCSV() {
        let csv = 'Nazwa;Typ;Status;Data;Jednostka;Szerokość;Długość;Lokalizacja;Opis\n';

        this.events.forEach(event => {
            csv += [
                `"${event.name}"`,
                `"${this.getTypeLabel(event.type)}"`,
                `"${event.status}"`,
                event.date || '',
                event.unit || '',
                event.lat,
                event.lng,
                `"${event.location || ''}"`,
                `"${event.description || ''}"`
            ].join(';') + '\n';
        });

        this.downloadFile(csv, `mapa_zdarzen_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
        Modal.hide();
        this.showToast('Wyeksportowano do CSV');
    },

    /**
     * Eksport do GeoJSON
     */
    exportToGeoJSON() {
        const geojson = {
            type: 'FeatureCollection',
            features: this.events.map(event => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [event.lng, event.lat]
                },
                properties: {
                    name: event.name,
                    type: event.type,
                    status: event.status,
                    date: event.date,
                    unit: event.unit,
                    location: event.location,
                    description: event.description
                }
            }))
        };

        this.downloadFile(
            JSON.stringify(geojson, null, 2),
            `mapa_zdarzen_${new Date().toISOString().split('T')[0]}.geojson`,
            'application/json'
        );
        Modal.hide();
        this.showToast('Wyeksportowano do GeoJSON');
    },

    /**
     * Eksport mapy do PDF
     */
    async exportMapToPDF() {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('Biblioteka jsPDF nie jest załadowana');
            return;
        }

        Modal.hide();
        this.showToast('Generowanie PDF...');

        const doc = new jsPDF();

        // Dodaj czcionkę Roboto
        if (window.pdfMake && window.pdfMake.vfs) {
            try {
                const robotoFont = window.pdfMake.vfs['Roboto-Regular.ttf'];
                if (robotoFont) {
                    doc.addFileToVFS('Roboto-Regular.ttf', robotoFont);
                    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
                    doc.setFont('Roboto');
                }
            } catch (error) {
                console.error('Error loading Roboto font:', error);
            }
        }

        // Tytuł
        doc.setFontSize(18);
        doc.setFont('Roboto', 'normal');
        doc.text('Mapa Taktyczna Zdarzeń AEP', 15, 20);

        doc.setFontSize(10);
        doc.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')}`, 15, 28);
        doc.text(`Liczba zdarzeń: ${this.events.length}`, 15, 34);

        // Tabela z wydarzeniami
        const tableData = this.events.map(e => [
            e.name,
            this.getTypeLabel(e.type),
            e.status,
            e.date || '-',
            e.unit || '-',
            `${e.lat.toFixed(5)}, ${e.lng.toFixed(5)}`
        ]);

        doc.autoTable({
            startY: 40,
            head: [['Wydarzenie', 'Typ', 'Status', 'Data', 'JŻW', 'Współrzędne']],
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

        doc.save(`mapa_taktyczna_${new Date().toISOString().split('T')[0]}.pdf`);
        this.showToast('PDF wygenerowany');
    },

    /**
     * Escape XML
     */
    escapeXml(unsafe) {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    },

    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    // ============================================
    // STATISTICS
    // ============================================

    /**
     * Pokaż modal statystyk
     */
    showStatisticsModal() {
        const stats = this.calculateStatistics();

        Modal.show('Statystyki mapy', `
            <div class="statistics-modal">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-map-pin"></i></div>
                        <div class="stat-value">${stats.totalEvents}</div>
                        <div class="stat-label">Wszystkie wydarzenia</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-shield-halved"></i></div>
                        <div class="stat-value">${stats.activeSecurities}</div>
                        <div class="stat-label">Aktywne zabezpieczenia</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-calendar"></i></div>
                        <div class="stat-value">${stats.todayEvents}</div>
                        <div class="stat-label">Wydarzenia dzisiaj</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="stat-value">${stats.weekEvents}</div>
                        <div class="stat-label">Ten tydzień</div>
                    </div>
                </div>

                <div class="stats-breakdown">
                    <h4>Podział według typu:</h4>
                    ${Object.entries(stats.byType).map(([type, count]) => `
                        <div class="stat-row">
                            <span>${this.getTypeLabel(type)}</span>
                            <span class="stat-bar">
                                <span class="stat-bar-fill" style="width: ${(count / stats.totalEvents * 100)}%; background: ${this.getColorForType(type)}"></span>
                            </span>
                            <span class="stat-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
    },

    /**
     * Oblicz statystyki
     */
    calculateStatistics() {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const stats = {
            totalEvents: this.events.length,
            activeSecurities: this.events.filter(e => e.type === 'zabezpieczenie' && e.status === 'aktywny').length,
            todayEvents: this.events.filter(e => e.date === today).length,
            weekEvents: this.events.filter(e => e.date >= weekAgo).length,
            byType: {}
        };

        // Zlicz po typach
        this.events.forEach(event => {
            stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
        });

        return stats;
    },

    /**
     * Pobierz kolor dla typu
     */
    getColorForType(type) {
        const colors = {
            'zabezpieczenie': '#10b981',
            'mczp': '#f59e0b',
            'piro': '#3b82f6',
            'zdarzenie': '#8b5cf6',
            'wykroczenie': '#ef4444',
            'inne': '#6b7280'
        };
        return colors[type] || '#6b7280';
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
    },

    /**
     * Pokaż panel zespołów
     */
    showTeamsPanel() {
        if (typeof ZespolyManager === 'undefined') {
            this.showToast('Moduł Zespoły nie jest załadowany');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="back-to-map-container">
                <button class="btn-secondary" onclick="MapManager.render()">
                    <i class="fas fa-arrow-left"></i> Powrót do mapy
                </button>
            </div>
            <div id="teamsInMapContainer"></div>
        `;

        // Renderuj Zespoły w kontenerze
        const container = document.getElementById('teamsInMapContainer');
        if (container) {
            // Render teams view inside map context
            ZespolyManager.render();
        }
    },

    /**
     * Pokaż panel komunikatora
     */
    showCommunicatorPanel() {
        if (typeof KomunikatorManager === 'undefined') {
            this.showToast('Moduł Komunikator nie jest załadowany');
            return;
        }

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="back-to-map-container">
                <button class="btn-secondary" onclick="MapManager.render()">
                    <i class="fas fa-arrow-left"></i> Powrót do mapy
                </button>
            </div>
            <div id="communicatorInMapContainer"></div>
        `;

        // Renderuj Komunikator w kontenerze
        const container = document.getElementById('communicatorInMapContainer');
        if (container) {
            // Render communicator view inside map context
            KomunikatorManager.render();
        }
    },

    /**
     * Pokaż modal wydarzeń
     */
    showEventsModal() {
        Modal.show('Wydarzenia na mapie', `
            <div class="events-modal">
                <div class="map-filters">
                    <div class="filter-group">
                        <label>Typ:</label>
                        <select id="modalFilterType" onchange="MapManager.applyEventFilters()">
                            <option value="all">Wszystkie</option>
                            <option value="zabezpieczenie">Zabezpieczenie prewencyjno-ochronne</option>
                            <option value="mczp">MczP</option>
                            <option value="piro">PIRO</option>
                            <option value="zdarzenie">Zdarzenie drogowe</option>
                            <option value="wykroczenie">Wykroczenie</option>
                            <option value="inne">Inne</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Status:</label>
                        <select id="modalFilterStatus" onchange="MapManager.applyEventFilters()">
                            <option value="all">Wszystkie</option>
                            <option value="aktywny">Aktywny</option>
                            <option value="zakończony">Zakończony</option>
                            <option value="w_trakcie">W trakcie</option>
                        </select>
                    </div>
                </div>

                <div class="events-list-modal" id="modalEventsList">
                    <!-- Dynamically generated -->
                </div>

                <div class="modal-stats">
                    <div class="stat-item">
                        <span class="stat-label">Wszystkich zdarzeń:</span>
                        <span class="stat-value" id="modalTotalEvents">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Aktywnych:</span>
                        <span class="stat-value" id="modalActiveEvents">0</span>
                    </div>
                </div>
            </div>
        `);
        this.renderModalEventsList();
    },

    /**
     * Renderuj listę wydarzeń w modalu
     */
    renderModalEventsList() {
        const container = document.getElementById('modalEventsList');
        if (!container) return;

        const typeFilter = document.getElementById('modalFilterType')?.value || 'all';
        const statusFilter = document.getElementById('modalFilterStatus')?.value || 'all';

        let filtered = this.events;
        if (typeFilter !== 'all') filtered = filtered.filter(e => e.type === typeFilter);
        if (statusFilter !== 'all') filtered = filtered.filter(e => e.status === statusFilter);

        container.innerHTML = filtered.length > 0 ? filtered.map(event => `
            <div class="event-item-modal" onclick="MapManager.focusOnEvent(${event.id}); Modal.hide();">
                <div class="event-icon" style="background: ${this.getColorForType(event.type)}">
                    <i class="fas ${this.getIconForType(event.type)}"></i>
                </div>
                <div class="event-info">
                    <div class="event-title">${event.location}</div>
                    <div class="event-meta">${event.date} • ${event.status}</div>
                </div>
            </div>
        `).join('') : '<p class="no-events">Brak wydarzeń</p>';

        document.getElementById('modalTotalEvents').textContent = filtered.length;
        document.getElementById('modalActiveEvents').textContent = filtered.filter(e => e.status === 'aktywny').length;
    },

    /**
     * Zastosuj filtry wydarzeń
     */
    applyEventFilters() {
        this.renderModalEventsList();
    },

    /**
     * Fokus na wydarzeniu
     */
    focusOnEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event && event.coords) {
            this.map.setView(event.coords, 15);
            // Find and open popup for this event
            this.markers.forEach(marker => {
                if (marker.event && marker.event.id === eventId) {
                    marker.openPopup();
                }
            });
        }
    },

    /**
     * Pokaż modal jednostek
     */
    showUnitsModal() {
        const units = [
            // Komendy Wojewódzkie Policji
            { id: 'kwp_bialystok', name: 'KWP Białystok', address: 'ul. Henryka Sienkiewicza 65, 15-005 Białystok', phone: '47 711 29 00', lat: 53.1325, lng: 23.1688 },
            { id: 'kwp_bydgoszcz', name: 'KWP Bydgoszcz', address: 'ul. Jagiellońska 1, 85-950 Bydgoszcz', phone: '52 349 70 00', lat: 53.1235, lng: 18.0076 },
            { id: 'kwp_gdansk', name: 'KWP Gdańsk', address: 'ul. Okopowa 15, 80-810 Gdańsk', phone: '58 32 09 300', lat: 54.3641, lng: 18.6270 },
            { id: 'kwp_gorzow', name: 'KWP Gorzów Wielkopolski', address: 'ul. Jagiellończyka 8, 66-400 Gorzów Wielkopolski', phone: '95 73 88 200', lat: 52.7368, lng: 15.2288 },
            { id: 'kwp_katowice', name: 'KWP Katowice', address: 'ul. Lompy 19, 40-038 Katowice', phone: '32 209 30 00', lat: 50.2649, lng: 19.0238 },
            { id: 'kwp_kielce', name: 'KWP Kielce', address: 'ul. Seminaryjna 12, 25-372 Kielce', phone: '41 342 12 00', lat: 50.8661, lng: 20.6286 },
            { id: 'kwp_krakow', name: 'KWP Kraków', address: 'ul. Mogilska 109, 31-571 Kraków', phone: '12 615 25 12', lat: 50.0780, lng: 19.9890 },
            { id: 'kwp_lublin', name: 'KWP Lublin', address: 'ul. Narutowicza 73, 20-019 Lublin', phone: '81 534 04 00', lat: 51.2465, lng: 22.5684 },
            { id: 'kwp_lodz', name: 'KWP Łódź', address: 'ul. Lutomierska 108/112, 91-048 Łódź', phone: '42 665 41 11', lat: 51.7592, lng: 19.4560 },
            { id: 'kwp_olsztyn', name: 'KWP Olsztyn', address: 'ul. Partyzantów 6/8, 10-521 Olsztyn', phone: '89 523 30 00', lat: 53.7784, lng: 20.4801 },
            { id: 'kwp_opole', name: 'KWP Opole', address: 'ul. Damrota 4, 45-064 Opole', phone: '77 44 32 100', lat: 50.6751, lng: 17.9213 },
            { id: 'kwp_poznan', name: 'KWP Poznań', address: 'ul. Kochanowskiego 2a, 60-845 Poznań', phone: '61 841 56 11', lat: 52.4064, lng: 16.9252 },
            { id: 'kwp_radom', name: 'KWP Radom', address: 'ul. Kościuszki 10, 26-612 Radom', phone: '48 362 22 22', lat: 51.4027, lng: 21.1471 },
            { id: 'kwp_rzeszow', name: 'KWP Rzeszów', address: 'ul. Mieszka I 2a, 35-303 Rzeszów', phone: '17 860 64 00', lat: 50.0412, lng: 21.9991 },
            { id: 'kwp_szczecin', name: 'KWP Szczecin', address: 'ul. Małopolska 47, 70-515 Szczecin', phone: '91 43 00 200', lat: 53.4285, lng: 14.5528 },
            { id: 'kwp_warszawa', name: 'KWP Warszawa', address: 'ul. Nowolipie 2, 00-150 Warszawa', phone: '22 603 11 55', lat: 52.2297, lng: 21.0122 },
            { id: 'kwp_wroclaw', name: 'KWP Wrocław', address: 'ul. Podwale 31-33, 50-040 Wrocław', phone: '71 344 96 97', lat: 51.1079, lng: 17.0385 },

            // Komendy Miejskie Policji (przykłady głównych miast)
            { id: 'kmp_bialystok', name: 'KMP Białystok', address: 'ul. Henryka Sienkiewicza 65, 15-005 Białystok', phone: '47 711 22 00', lat: 53.1325, lng: 23.1688 },
            { id: 'kmp_bydgoszcz', name: 'KMP Bydgoszcz', address: 'ul. Jagiellońska 1, 85-950 Bydgoszcz', phone: '52 349 77 00', lat: 53.1235, lng: 18.0076 },
            { id: 'kmp_gdansk', name: 'KMP Gdańsk', address: 'ul. Okopowa 15, 80-810 Gdańsk', phone: '58 32 09 100', lat: 54.3520, lng: 18.6466 },
            { id: 'kmp_gdynia', name: 'KMP Gdynia', address: 'ul. Portowa 15, 81-350 Gdynia', phone: '58 76 00 255', lat: 54.5189, lng: 18.5305 },
            { id: 'kmp_katowice', name: 'KMP Katowice', address: 'ul. Lompy 19, 40-038 Katowice', phone: '32 209 31 00', lat: 50.2649, lng: 19.0238 },
            { id: 'kmp_kielce', name: 'KMP Kielce', address: 'ul. Seminaryjna 12, 25-372 Kielce', phone: '41 342 15 00', lat: 50.8661, lng: 20.6286 },
            { id: 'kmp_krakow', name: 'KMP Kraków', address: 'ul. Mogilska 109, 31-571 Kraków', phone: '12 615 26 00', lat: 50.0647, lng: 19.9450 },
            { id: 'kmp_lublin', name: 'KMP Lublin', address: 'ul. Narutowicza 73, 20-019 Lublin', phone: '81 534 03 00', lat: 51.2465, lng: 22.5684 },
            { id: 'kmp_lodz', name: 'KMP Łódź', address: 'ul. Lutomierska 108/112, 91-048 Łódź', phone: '42 665 44 00', lat: 51.7592, lng: 19.4560 },
            { id: 'kmp_olsztyn', name: 'KMP Olsztyn', address: 'ul. Partyzantów 6/8, 10-521 Olsztyn', phone: '89 523 33 00', lat: 53.7784, lng: 20.4801 },
            { id: 'kmp_poznan', name: 'KMP Poznań', address: 'ul. Kochanowskiego 2a, 60-845 Poznań', phone: '61 841 57 00', lat: 52.4082, lng: 16.9335 },
            { id: 'kmp_radom', name: 'KMP Radom', address: 'ul. Kościuszki 10, 26-612 Radom', phone: '48 362 23 00', lat: 51.4027, lng: 21.1471 },
            { id: 'kmp_rzeszow', name: 'KMP Rzeszów', address: 'ul. Mieszka I 2a, 35-303 Rzeszów', phone: '17 860 65 00', lat: 50.0412, lng: 21.9991 },
            { id: 'kmp_szczecin', name: 'KMP Szczecin', address: 'ul. Małopolska 47, 70-515 Szczecin', phone: '91 43 00 300', lat: 53.4285, lng: 14.5528 },
            { id: 'kmp_torun', name: 'KMP Toruń', address: 'ul. Kościuszki 23, 87-100 Toruń', phone: '56 64 23 200', lat: 53.0138, lng: 18.5984 },
            { id: 'kmp_wroclaw', name: 'KMP Wrocław', address: 'ul. Podwale 31-33, 50-040 Wrocław', phone: '71 344 97 00', lat: 51.1100, lng: 17.0325 },

            // Komendy Powiatowe Policji (wybrane przykłady)
            { id: 'kpp_elblаg', name: 'KPP Elbląg', address: 'ul. Saperów 14a, 82-300 Elbląg', phone: '55 239 02 00', lat: 54.1564, lng: 19.4087 },
            { id: 'kpp_ostroda', name: 'KPP Ostróda', address: 'ul. Czarnieckiego 2, 14-100 Ostróda', phone: '89 646 42 00', lat: 53.6984, lng: 19.9686 },
            { id: 'kpp_suwalki', name: 'KPP Suwałki', address: 'ul. Noniewicza 71, 16-400 Suwałki', phone: '87 562 62 00', lat: 54.1116, lng: 22.9309 },
            { id: 'kpp_pila', name: 'KPP Piła', address: 'ul. Kazimierza Wielkiego 1, 64-920 Piła', phone: '67 352 46 00', lat: 53.1515, lng: 16.7377 },
            { id: 'kpp_slupsk', name: 'KPP Słupsk', address: 'ul. Szczecińska 36, 76-200 Słupsk', phone: '59 84 18 200', lat: 54.4641, lng: 17.0285 },
            { id: 'kpp_kolobrzeg', name: 'KPP Kołobrzeg', address: 'ul. Armii Krajowej 7, 78-100 Kołobrzeg', phone: '94 35 28 200', lat: 54.1761, lng: 15.5833 },
            { id: 'kpp_tarnow', name: 'KPP Tarnów', address: 'ul. Nowodąbrowska 106, 33-100 Tarnów', phone: '14 688 62 00', lat: 50.0121, lng: 20.9883 },
            { id: 'kpp_nowy_sacz', name: 'KPP Nowy Sącz', address: 'ul. Westerplatte 4, 33-300 Nowy Sącz', phone: '18 44 78 200', lat: 49.6247, lng: 20.6931 },
            { id: 'kpp_zakopane', name: 'KPP Zakopane', address: 'ul. Jagiellońska 9, 34-500 Zakopane', phone: '18 20 12 400', lat: 49.2992, lng: 19.9496 },
            { id: 'kpp_zamosc', name: 'KPP Zamość', address: 'ul. Szczebrzeska 11a, 22-400 Zamość', phone: '84 677 92 00', lat: 50.7231, lng: 23.2519 },
            { id: 'kpp_piotrkow', name: 'KPP Piotrków Trybunalski', address: 'ul. Wojska Polskiego 56, 97-300 Piotrków Trybunalski', phone: '44 732 62 00', lat: 51.4054, lng: 19.7033 },
            { id: 'kpp_sosnowiec', name: 'KPP Sosnowiec', address: 'ul. Małachowskiego 1, 41-200 Sosnowiec', phone: '32 368 92 00', lat: 50.2862, lng: 19.1044 },
            { id: 'kpp_bielsko', name: 'KPP Bielsko-Biała', address: 'ul. Leszczyny 11, 43-300 Bielsko-Biała', phone: '33 812 18 00', lat: 49.8224, lng: 19.0448 },
            { id: 'kpp_kalisz', name: 'KPP Kalisz', address: 'ul. Częstochowska 5a, 62-800 Kalisz', phone: '62 598 52 00', lat: 51.7611, lng: 18.0911 },
            { id: 'kpp_konin', name: 'KPP Konin', address: 'ul. Dworcowa 2, 62-500 Konin', phone: '63 240 92 00', lat: 52.2230, lng: 18.2511 }
        ];

        Modal.show('Jednostki policji', `
            <div class="units-modal">
                <p class="form-info">
                    <i class="fas fa-building-shield"></i>
                    Wybierz jednostki do wyświetlenia na mapie
                </p>

                <div class="units-search">
                    <input type="text" id="unitsSearchInput" placeholder="Szukaj jednostki..." oninput="MapManager.filterUnits()" />
                    <i class="fas fa-search"></i>
                </div>

                <div class="units-list" id="unitsList">
                    ${units.map(unit => `
                        <div class="unit-item" data-name="${unit.name.toLowerCase()}" data-address="${unit.address.toLowerCase()}">
                            <input type="checkbox" id="unit_${unit.id}" class="unit-checkbox"
                                data-lat="${unit.lat}"
                                data-lng="${unit.lng}"
                                data-name="${unit.name}"
                                data-address="${unit.address}"
                                data-phone="${unit.phone}">
                            <label for="unit_${unit.id}" class="unit-label">
                                <i class="fas fa-building-shield"></i>
                                <div class="unit-info">
                                    <span class="unit-name">${unit.name}</span>
                                    <span class="unit-address">${unit.address}</span>
                                </div>
                            </label>
                        </div>
                    `).join('')}
                </div>

                <div class="form-actions">
                    <button class="btn-primary" onclick="MapManager.applyUnitsSelection()">
                        <i class="fas fa-check"></i> Zastosuj
                    </button>
                    <button class="btn-secondary" onclick="Modal.hide()">
                        Anuluj
                    </button>
                </div>
            </div>
        `);
    },

    /**
     * Filtruj jednostki
     */
    filterUnits() {
        const searchValue = document.getElementById('unitsSearchInput')?.value.toLowerCase() || '';
        const items = document.querySelectorAll('.unit-item');

        items.forEach(item => {
            const name = item.dataset.name || '';
            const address = item.dataset.address || '';

            if (name.includes(searchValue) || address.includes(searchValue)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },

    /**
     * Zastosuj wybór jednostek
     */
    applyUnitsSelection() {
        // Clear existing unit markers
        this.markers.forEach(marker => {
            if (marker.isUnit) {
                this.map.removeLayer(marker);
            }
        });

        // Add selected units
        document.querySelectorAll('.unit-checkbox:checked').forEach(checkbox => {
            const lat = parseFloat(checkbox.dataset.lat);
            const lng = parseFloat(checkbox.dataset.lng);
            const name = checkbox.dataset.name;
            const address = checkbox.dataset.address;
            const phone = checkbox.dataset.phone;

            const icon = L.divIcon({
                html: `<div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                    <i class="fas fa-building-shield" style="color: white; font-size: 14px;"></i>
                </div>`,
                className: 'unit-marker-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const marker = L.marker([lat, lng], { icon }).addTo(this.map);
            marker.isUnit = true;
            marker.bindPopup(`
                <div class="unit-popup">
                    <h4 style="margin: 0 0 0.5rem 0; color: #3b82f6; font-size: 14px;">${name}</h4>
                    <p style="margin: 0.25rem 0; font-size: 13px; color: #666;">
                        <i class="fas fa-map-marker-alt" style="width: 16px; color: #3b82f6;"></i> ${address}
                    </p>
                    <p style="margin: 0.25rem 0; font-size: 13px; color: #666;">
                        <i class="fas fa-phone" style="width: 16px; color: #3b82f6;"></i> ${phone}
                    </p>
                </div>
            `);
            this.markers.push(marker);
        });

        Modal.hide();
        this.showToast('Jednostki zaktualizowane');
    },

    /**
     * Placeholder - tryb rysowania
     */
    toggleDrawingMode() {
        this.showToast('Funkcja rysowania zostanie wkrótce dodana');
    },

    /**
     * Dodaj niestandardowy znacznik
     */
    addCustomMarker() {
        this.showToast('Kliknij na mapie aby dodać znacznik', 'info');

        // Enable one-time click handler
        const clickHandler = (e) => {
            const { lat, lng } = e.latlng;

            // Show modal to get marker details
            Modal.show('Nowy znacznik', `
                <div class="form-group">
                    <label for="markerName">Nazwa znacznika:</label>
                    <input type="text" id="markerName" class="form-control" placeholder="np. Punkt zborny" required />
                </div>
                <div class="form-group">
                    <label for="markerDesc">Opis (opcjonalnie):</label>
                    <textarea id="markerDesc" class="form-control" rows="3" placeholder="Dodatkowe informacje..."></textarea>
                </div>
                <div class="form-group">
                    <label for="markerColor">Kolor znacznika:</label>
                    <select id="markerColor" class="form-control">
                        <option value="#ef4444">Czerwony</option>
                        <option value="#f59e0b">Pomarańczowy</option>
                        <option value="#eab308">Żółty</option>
                        <option value="#22c55e">Zielony</option>
                        <option value="#3b82f6" selected>Niebieski</option>
                        <option value="#8b5cf6">Fioletowy</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button class="btn-primary" onclick="MapManager.saveCustomMarker(${lat}, ${lng})">
                        <i class="fas fa-check"></i> Zapisz
                    </button>
                    <button class="btn-secondary" onclick="Modal.hide()">Anuluj</button>
                </div>
            `);

            // Remove the click handler after first click
            this.map.off('click', clickHandler);
        };

        this.map.once('click', clickHandler);
    },

    /**
     * Zapisz niestandardowy znacznik
     */
    saveCustomMarker(lat, lng) {
        const name = document.getElementById('markerName')?.value;
        const desc = document.getElementById('markerDesc')?.value || '';
        const color = document.getElementById('markerColor')?.value || '#3b82f6';

        if (!name) {
            this.showToast('Podaj nazwę znacznika', 'error');
            return;
        }

        // Create custom marker
        const icon = L.divIcon({
            html: `<div style="background: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                <i class="fas fa-map-pin" style="color: white; font-size: 12px;"></i>
            </div>`,
            className: 'custom-marker-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        const marker = L.marker([lat, lng], { icon }).addTo(this.map);
        marker.isCustom = true;
        marker.customData = { name, desc, color, lat, lng };

        marker.bindPopup(`
            <div class="custom-marker-popup">
                <h4 style="margin: 0 0 0.5rem 0; color: ${color}; font-size: 14px;">
                    <i class="fas fa-map-pin"></i> ${name}
                </h4>
                ${desc ? `<p style="margin: 0; font-size: 12px; color: #666;">${desc}</p>` : ''}
                <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #eee;">
                    <button class="btn-danger btn-sm" onclick="MapManager.removeCustomMarker(${lat}, ${lng})" style="font-size: 11px; padding: 0.25rem 0.5rem;">
                        <i class="fas fa-trash"></i> Usuń
                    </button>
                </div>
            </div>
        `);

        this.markers.push(marker);

        // Save to localStorage
        const customMarkers = Utils.loadFromLocalStorage('aep_custom_markers') || [];
        customMarkers.push({ name, desc, color, lat, lng, id: Date.now() });
        Utils.saveToLocalStorage('aep_custom_markers', customMarkers);

        Modal.hide();
        this.showToast('Znacznik dodany');
    },

    /**
     * Usuń niestandardowy znacznik
     */
    removeCustomMarker(lat, lng) {
        // Remove from map
        this.markers = this.markers.filter(marker => {
            if (marker.isCustom && marker.customData.lat === lat && marker.customData.lng === lng) {
                this.map.removeLayer(marker);
                return false;
            }
            return true;
        });

        // Remove from localStorage
        let customMarkers = Utils.loadFromLocalStorage('aep_custom_markers') || [];
        customMarkers = customMarkers.filter(m => !(m.lat === lat && m.lng === lng));
        Utils.saveToLocalStorage('aep_custom_markers', customMarkers);

        this.showToast('Znacznik usunięty');
    },

    /**
     * Wczytaj niestandardowe znaczniki
     */
    loadCustomMarkers() {
        const customMarkers = Utils.loadFromLocalStorage('aep_custom_markers') || [];

        customMarkers.forEach(({ name, desc, color, lat, lng }) => {
            const icon = L.divIcon({
                html: `<div style="background: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                    <i class="fas fa-map-pin" style="color: white; font-size: 12px;"></i>
                </div>`,
                className: 'custom-marker-icon',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const marker = L.marker([lat, lng], { icon }).addTo(this.map);
            marker.isCustom = true;
            marker.customData = { name, desc, color, lat, lng };

            marker.bindPopup(`
                <div class="custom-marker-popup">
                    <h4 style="margin: 0 0 0.5rem 0; color: ${color}; font-size: 14px;">
                        <i class="fas fa-map-pin"></i> ${name}
                    </h4>
                    ${desc ? `<p style="margin: 0; font-size: 12px; color: #666;">${desc}</p>` : ''}
                    <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #eee;">
                        <button class="btn-danger btn-sm" onclick="MapManager.removeCustomMarker(${lat}, ${lng})" style="font-size: 11px; padding: 0.25rem 0.5rem;">
                            <i class="fas fa-trash"></i> Usuń
                        </button>
                    </div>
                </div>
            `);

            this.markers.push(marker);
        });
    },

    /**
     * Panel notatek
     */
    showNotesPanel() {
        const notes = Utils.loadFromLocalStorage('aep_map_notes') || [];

        Modal.show('Notatki na mapie', `
            <div class="notes-panel">
                <div class="notes-list" id="notesList">
                    ${notes.length === 0 ?
                        '<p style="text-align: center; color: #9aa3b2; padding: 2rem;">Brak notatek</p>' :
                        notes.map((note, index) => `
                            <div class="note-item" data-index="${index}">
                                <div class="note-header">
                                    <h4>${note.title}</h4>
                                    <button class="btn-icon" onclick="MapManager.deleteNote(${index})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                <p class="note-content">${note.content}</p>
                                <div class="note-footer">
                                    <span class="note-date">${new Date(note.timestamp).toLocaleString('pl-PL')}</span>
                                    ${note.lat && note.lng ? `
                                        <button class="btn-link" onclick="MapManager.showNoteOnMap(${note.lat}, ${note.lng}); Modal.hide();">
                                            <i class="fas fa-map-marker-alt"></i> Pokaż na mapie
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')
                    }
                </div>

                <div class="form-actions" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <button class="btn-primary" onclick="MapManager.showAddNoteForm()">
                        <i class="fas fa-plus"></i> Nowa notatka
                    </button>
                    <button class="btn-secondary" onclick="Modal.hide()">Zamknij</button>
                </div>
            </div>
        `);
    },

    /**
     * Pokaż formularz dodawania notatki
     */
    showAddNoteForm() {
        Modal.show('Nowa notatka', `
            <div class="form-group">
                <label for="noteTitle">Tytuł:</label>
                <input type="text" id="noteTitle" class="form-control" placeholder="np. Spotkanie sztabu" required />
            </div>
            <div class="form-group">
                <label for="noteContent">Treść:</label>
                <textarea id="noteContent" class="form-control" rows="5" placeholder="Wpisz treść notatki..." required></textarea>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="noteWithLocation" onchange="MapManager.toggleNoteLocation()">
                    Dodaj lokalizację na mapie
                </label>
                <div id="noteLocationInfo" style="display: none; margin-top: 0.5rem; padding: 0.5rem; background: rgba(59, 130, 246, 0.1); border-radius: 4px; font-size: 12px;">
                    <i class="fas fa-info-circle"></i> Kliknij na mapie aby wybrać lokalizację
                </div>
            </div>
            <div class="form-actions">
                <button class="btn-primary" onclick="MapManager.saveNote()">
                    <i class="fas fa-check"></i> Zapisz
                </button>
                <button class="btn-secondary" onclick="MapManager.showNotesPanel()">
                    <i class="fas fa-arrow-left"></i> Powrót
                </button>
            </div>
        `);
    },

    /**
     * Toggle lokalizacji notatki
     */
    toggleNoteLocation() {
        const checkbox = document.getElementById('noteWithLocation');
        const info = document.getElementById('noteLocationInfo');

        if (checkbox.checked) {
            info.style.display = 'block';
            Modal.hide();
            this.showToast('Kliknij na mapie aby wybrać lokalizację notatki', 'info');

            const clickHandler = (e) => {
                const { lat, lng } = e.latlng;
                this.pendingNoteLocation = { lat, lng };
                this.showAddNoteForm();
                this.showToast('Lokalizacja wybrana');
                this.map.off('click', clickHandler);
            };

            this.map.once('click', clickHandler);
        } else {
            info.style.display = 'none';
            this.pendingNoteLocation = null;
        }
    },

    /**
     * Zapisz notatkę
     */
    saveNote() {
        const title = document.getElementById('noteTitle')?.value;
        const content = document.getElementById('noteContent')?.value;

        if (!title || !content) {
            this.showToast('Wypełnij wszystkie pola', 'error');
            return;
        }

        const note = {
            id: Date.now(),
            title,
            content,
            timestamp: new Date().toISOString(),
            lat: this.pendingNoteLocation?.lat || null,
            lng: this.pendingNoteLocation?.lng || null
        };

        const notes = Utils.loadFromLocalStorage('aep_map_notes') || [];
        notes.push(note);
        Utils.saveToLocalStorage('aep_map_notes', notes);

        // Add marker if location is set
        if (note.lat && note.lng) {
            const icon = L.divIcon({
                html: `<div style="background: #8b5cf6; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                    <i class="fas fa-sticky-note" style="color: white; font-size: 12px;"></i>
                </div>`,
                className: 'note-marker-icon',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const marker = L.marker([note.lat, note.lng], { icon }).addTo(this.map);
            marker.isNote = true;
            marker.noteData = note;

            marker.bindPopup(`
                <div class="note-popup">
                    <h4 style="margin: 0 0 0.5rem 0; color: #8b5cf6; font-size: 14px;">
                        <i class="fas fa-sticky-note"></i> ${note.title}
                    </h4>
                    <p style="margin: 0; font-size: 12px; color: #666; white-space: pre-wrap;">${note.content}</p>
                    <div style="margin-top: 0.5rem; font-size: 11px; color: #999;">
                        ${new Date(note.timestamp).toLocaleString('pl-PL')}
                    </div>
                </div>
            `);

            this.markers.push(marker);
        }

        this.pendingNoteLocation = null;
        this.showToast('Notatka zapisana');
        this.showNotesPanel();
    },

    /**
     * Usuń notatkę
     */
    deleteNote(index) {
        if (!confirm('Czy na pewno chcesz usunąć tę notatkę?')) {
            return;
        }

        let notes = Utils.loadFromLocalStorage('aep_map_notes') || [];
        const note = notes[index];

        // Remove marker if exists
        if (note.lat && note.lng) {
            this.markers = this.markers.filter(marker => {
                if (marker.isNote && marker.noteData.id === note.id) {
                    this.map.removeLayer(marker);
                    return false;
                }
                return true;
            });
        }

        notes.splice(index, 1);
        Utils.saveToLocalStorage('aep_map_notes', notes);

        this.showToast('Notatka usunięta');
        this.showNotesPanel();
    },

    /**
     * Pokaż notatkę na mapie
     */
    showNoteOnMap(lat, lng) {
        this.map.setView([lat, lng], 15);

        // Find and open the marker popup
        this.markers.forEach(marker => {
            if (marker.isNote && marker.noteData.lat === lat && marker.noteData.lng === lng) {
                marker.openPopup();
            }
        });
    },

    /**
     * Wczytaj notatki
     */
    loadNotes() {
        const notes = Utils.loadFromLocalStorage('aep_map_notes') || [];

        notes.forEach(note => {
            if (note.lat && note.lng) {
                const icon = L.divIcon({
                    html: `<div style="background: #8b5cf6; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                        <i class="fas fa-sticky-note" style="color: white; font-size: 12px;"></i>
                    </div>`,
                    className: 'note-marker-icon',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                });

                const marker = L.marker([note.lat, note.lng], { icon }).addTo(this.map);
                marker.isNote = true;
                marker.noteData = note;

                marker.bindPopup(`
                    <div class="note-popup">
                        <h4 style="margin: 0 0 0.5rem 0; color: #8b5cf6; font-size: 14px;">
                            <i class="fas fa-sticky-note"></i> ${note.title}
                        </h4>
                        <p style="margin: 0; font-size: 12px; color: #666; white-space: pre-wrap;">${note.content}</p>
                        <div style="margin-top: 0.5rem; font-size: 11px; color: #999;">
                            ${new Date(note.timestamp).toLocaleString('pl-PL')}
                        </div>
                    </div>
                `);

                this.markers.push(marker);
            }
        });
    }
};
