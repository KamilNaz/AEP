import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

// Layout
import { Layout } from './components/layout/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatrolePage } from './pages/PatrolePage';
import { GenericTablePage } from './pages/GenericTablePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { darkMode } = useUIStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="patrole" element={<PatrolePage />} />
          <Route
            path="wykroczenia"
            element={
              <GenericTablePage
                title="Wykroczenia"
                endpoint="wykroczenia"
                columns={[
                  { key: 'data', header: 'Data', sortable: true },
                  { key: 'jednostka', header: 'Jednostka', sortable: true },
                  { key: 'rodzaj', header: 'Rodzaj' },
                  { key: 'miejsce', header: 'Miejsce' },
                  { key: 'sprawca', header: 'Sprawca' },
                  { key: 'srodekPrawny', header: 'Środek prawny' },
                  { key: 'status', header: 'Status' },
                ]}
              />
            }
          />
          <Route
            path="wkrd"
            element={
              <GenericTablePage
                title="WKRD"
                endpoint="wkrd"
                columns={[
                  { key: 'data', header: 'Data', sortable: true },
                  { key: 'nrSprawy', header: 'Nr sprawy' },
                  { key: 'rodzajSprawy', header: 'Rodzaj sprawy' },
                  { key: 'podejrzany', header: 'Podejrzany' },
                  { key: 'status', header: 'Status' },
                ]}
              />
            }
          />
          <Route
            path="sankcje"
            element={
              <GenericTablePage
                title="Sankcje"
                endpoint="sankcje"
                columns={[
                  { key: 'data', header: 'Data', sortable: true },
                  { key: 'rodzajSankcji', header: 'Rodzaj sankcji' },
                  { key: 'osoba', header: 'Osoba' },
                  { key: 'podstawaPrawna', header: 'Podstawa prawna' },
                  { key: 'status', header: 'Status' },
                ]}
              />
            }
          />
          <Route
            path="konwoje"
            element={
              <GenericTablePage
                title="Konwoje"
                endpoint="konwoje"
                columns={[
                  { key: 'data', header: 'Data', sortable: true },
                  { key: 'oznaczenie', header: 'Oznaczenie' },
                  { key: 'trasa', header: 'Trasa' },
                  { key: 'celKonwoju', header: 'Cel' },
                  { key: 'dowodca', header: 'Dowódca' },
                  { key: 'status', header: 'Status' },
                ]}
              />
            }
          />
          <Route
            path="spb"
            element={
              <GenericTablePage
                title="ŚPB"
                endpoint="spb"
                columns={[
                  { key: 'data', header: 'Data', sortable: true },
                  { key: 'rodzajSrodka', header: 'Rodzaj środka' },
                  { key: 'osobaWobecKtorej', header: 'Osoba' },
                  { key: 'okolicznosci', header: 'Okoliczności' },
                  { key: 'status', header: 'Status' },
                ]}
              />
            }
          />
          <Route
            path="pilotaze"
            element={
              <GenericTablePage
                title="Pilotaże"
                endpoint="pilotaze"
                columns={[
                  { key: 'data', header: 'Data', sortable: true },
                  { key: 'oznaczenie', header: 'Oznaczenie' },
                  { key: 'trasa', header: 'Trasa' },
                  { key: 'kierowca', header: 'Kierowca' },
                  { key: 'celPodrozy', header: 'Cel podróży' },
                  { key: 'status', header: 'Status' },
                ]}
              />
            }
          />
          <Route
            path="zdarzenia"
            element={
              <GenericTablePage
                title="Zdarzenia drogowe"
                endpoint="zdarzenia"
                columns={[
                  { key: 'data', header: 'Data', sortable: true },
                  { key: 'rodzajZdarzenia', header: 'Rodzaj' },
                  { key: 'miejsce', header: 'Miejsce' },
                  { key: 'poszkodowani', header: 'Poszkodowani' },
                  { key: 'ranni', header: 'Ranni' },
                  { key: 'status', header: 'Status' },
                ]}
              />
            }
          />
          <Route
            path="kalendarz"
            element={
              <GenericTablePage
                title="Kalendarz"
                endpoint="kalendarz"
                columns={[
                  { key: 'data', header: 'Data', sortable: true },
                  { key: 'godzina', header: 'Godzina' },
                  { key: 'wydarzenie', header: 'Wydarzenie' },
                  { key: 'typ', header: 'Typ' },
                  { key: 'lokalizacja', header: 'Lokalizacja' },
                  { key: 'status', header: 'Status' },
                ]}
              />
            }
          />
          <Route
            path="mapa"
            element={
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Mapa zdarzeń</h2>
                <p className="text-gray-500">Mapa zostanie zaimplementowana z użyciem Leaflet</p>
                <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg mt-4 flex items-center justify-center">
                  <span className="text-gray-400">Mapa</span>
                </div>
              </div>
            }
          />
          <Route
            path="raporty"
            element={
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Raporty</h2>
                <p className="text-gray-500">Moduł raportów w przygotowaniu</p>
              </div>
            }
          />
          <Route
            path="ustawienia"
            element={
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Ustawienia</h2>
                <p className="text-gray-500">Moduł ustawień w przygotowaniu</p>
              </div>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
