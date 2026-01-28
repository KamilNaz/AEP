import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '../../store/uiStore';
import { clsx } from 'clsx';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/patrole': 'Patrole',
  '/wykroczenia': 'Wykroczenia',
  '/wkrd': 'WKRD - Wykrywanie Przestępstw',
  '/sankcje': 'Sankcje',
  '/konwoje': 'Konwoje',
  '/spb': 'ŚPB - Środki Przymusu Bezpośredniego',
  '/pilotaze': 'Pilotaże',
  '/zdarzenia': 'Zdarzenia Drogowe',
  '/kalendarz': 'Kalendarz',
  '/mapa': 'Mapa Zdarzeń',
  '/raporty': 'Raporty',
  '/ustawienia': 'Ustawienia',
};

export function Layout() {
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'AEP';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div
        className={clsx(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <Header title={title} />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
