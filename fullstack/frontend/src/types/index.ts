// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  unit?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  unit?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// ============================================
// PAGINATION & API TYPES
// ============================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

// ============================================
// PATROL TYPES
// ============================================

export interface Patrol {
  id: string;
  data: string;
  nrJw?: string;
  nazwaJw?: string;
  miejsce?: string;
  podleglosc?: string;
  grupa?: string;
  jzwProwadzaca?: string;
  oddzial?: string;
  rejon?: string;
  rodzajPatrolu?: string;
  trasa?: string;
  cel?: string;
  skladPatrolu?: string;
  pojazd?: string;
  czasRozpoczecia?: string;
  czasZakonczenia?: string;
  liczbaCzynnosci?: number;
  status?: string;
  uwagi?: string;
  razemLegitymowanie: number;
  razemPouczenie: number;
  razemNotatka: number;
  razemZatrzymanie: number;
  razemKontrola: number;
  razemInterwencja: number;
  razemInne: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  user?: { name: string; email: string };
}

// ============================================
// WYKROCZENIE TYPES
// ============================================

export interface Wykroczenie {
  id: string;
  data: string;
  jednostka?: string;
  rodzaj?: string;
  artykul?: string;
  miejsce?: string;
  sprawca?: string;
  pesel?: string;
  srodekPrawny?: string;
  mandat?: number;
  punkty?: number;
  pojazd?: string;
  nrRej?: string;
  swiadkowie?: string;
  opis?: string;
  dowody?: string;
  funkcjonariusz?: string;
  nrNotatki?: string;
  zalaczniki?: string;
  status?: string;
  operator?: string;
  nrJw?: string;
  nazwaJw?: string;
  podleglosc?: string;
  grupa?: string;
  jzwProwadzaca?: string;
  oddzial?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// WKRD TYPES
// ============================================

export interface WKRD {
  id: string;
  data: string;
  nrJw?: string;
  nazwaJw?: string;
  miejsce?: string;
  podleglosc?: string;
  grupa?: string;
  jzwProwadzaca?: string;
  oddzial?: string;
  rodzajSprawy?: string;
  nrSprawy?: string;
  kwalifikacja?: string;
  pokrzywdzony?: string;
  podejrzany?: string;
  opisCzynu?: string;
  czynnosci?: string;
  status?: string;
  uwagi?: string;
  wszczecie: boolean;
  umorzenie: boolean;
  zawieszenie: boolean;
  akt: boolean;
  zatrzymaniePodejrzanego: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SANKCJA TYPES
// ============================================

export interface Sankcja {
  id: string;
  data: string;
  nrJw?: string;
  nazwaJw?: string;
  miejsce?: string;
  podleglosc?: string;
  grupa?: string;
  jzwProwadzaca?: string;
  oddzial?: string;
  rodzajSankcji?: string;
  podstawaPrawna?: string;
  osoba?: string;
  stopien?: string;
  jednostkaOsoby?: string;
  wysokoscKary?: number;
  dataWykonania?: string;
  status?: string;
  uwagi?: string;
  mandat: boolean;
  wniosekOUkaranie: boolean;
  wpisDoDokumentow: boolean;
  zatrzymaniePojazdu: boolean;
  zatrzymanieDokumentu: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// KONWOJ TYPES
// ============================================

export interface Konwoj {
  id: string;
  data: string;
  godzRozpoczecia?: string;
  godzZakonczenia?: string;
  oznaczenie?: string;
  trasa?: string;
  pojazdy?: string;
  eskortowani?: string;
  celKonwoju?: string;
  dowodca?: string;
  sklad?: string;
  uwagi?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SPB TYPES
// ============================================

export interface SPB {
  id: string;
  data: string;
  nrJw?: string;
  nazwaJw?: string;
  miejsce?: string;
  podleglosc?: string;
  grupa?: string;
  jzwProwadzaca?: string;
  oddzial?: string;
  rodzajSrodka?: string;
  podstawaPrawna?: string;
  okolicznosci?: string;
  osobaWobecKtorej?: string;
  skutki?: string;
  funkcjonariusz?: string;
  nrNotatki?: string;
  status?: string;
  uwagi?: string;
  silaFizyczna: boolean;
  kajdanki: boolean;
  palkaSluzbowaMultifunkcyjna: boolean;
  chemiczneSrodki: boolean;
  paralizator: boolean;
  bronPalna: boolean;
  inne: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PILOTAZ TYPES
// ============================================

export interface Pilotaz {
  id: string;
  data: string;
  godzRozpoczecia?: string;
  godzZakonczenia?: string;
  oznaczenie?: string;
  trasa?: string;
  pojazdPilotowany?: string;
  nrRej?: string;
  kierowca?: string;
  celPodrozy?: string;
  funkcjonariusze?: string;
  uwagi?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ZDARZENIE TYPES
// ============================================

export interface Zdarzenie {
  id: string;
  data: string;
  godzina?: string;
  nrJw?: string;
  nazwaJw?: string;
  miejsce?: string;
  podleglosc?: string;
  grupa?: string;
  jzwProwadzaca?: string;
  oddzial?: string;
  rodzajZdarzenia?: string;
  okolicznosci?: string;
  uczestnicyOpis?: string;
  pojazdy?: string;
  poszkodowani?: number;
  ranni?: number;
  zabici?: number;
  szkodyMaterialne?: string;
  czynnosci?: string;
  funkcjonariusz?: string;
  nrNotatki?: string;
  status?: string;
  uwagi?: string;
  kolizja: boolean;
  wypadek: boolean;
  katastrofa: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  patrole: number;
  wykroczenia: number;
  wkrd: number;
  sankcje: number;
  konwoje: number;
  spb: number;
  pilotaze: number;
  zdarzenia: number;
  total: number;
}

export interface ChartData {
  patroleByDay: { date: string; count: number }[];
  wykroczeniaByType: { type: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
}

// ============================================
// NAVIGATION TYPES
// ============================================

export interface NavItem {
  id: string;
  title: string;
  icon: string;
  path: string;
}

export const SECTIONS: NavItem[] = [
  { id: 'dashboard', title: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'patrole', title: 'Patrole', icon: 'Users', path: '/patrole' },
  { id: 'wykroczenia', title: 'Wykroczenia', icon: 'AlertTriangle', path: '/wykroczenia' },
  { id: 'wkrd', title: 'WKRD', icon: 'FileSearch', path: '/wkrd' },
  { id: 'sankcje', title: 'Sankcje', icon: 'Gavel', path: '/sankcje' },
  { id: 'konwoje', title: 'Konwoje', icon: 'Truck', path: '/konwoje' },
  { id: 'spb', title: 'ŚPB', icon: 'Shield', path: '/spb' },
  { id: 'pilotaze', title: 'Pilotaże', icon: 'Car', path: '/pilotaze' },
  { id: 'zdarzenia', title: 'Zdarzenia', icon: 'AlertCircle', path: '/zdarzenia' },
  { id: 'kalendarz', title: 'Kalendarz', icon: 'Calendar', path: '/kalendarz' },
  { id: 'mapa', title: 'Mapa', icon: 'Map', path: '/mapa' },
  { id: 'raporty', title: 'Raporty', icon: 'FileText', path: '/raporty' },
  { id: 'ustawienia', title: 'Ustawienia', icon: 'Settings', path: '/ustawienia' },
];
