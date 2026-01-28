import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileSearch,
  Gavel,
  Truck,
  Shield,
  Car,
  AlertCircle,
  Calendar,
  Map,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';

const menuItems = [
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'patrole', title: 'Patrole', icon: Users, path: '/patrole' },
  { id: 'wykroczenia', title: 'Wykroczenia', icon: AlertTriangle, path: '/wykroczenia' },
  { id: 'wkrd', title: 'WKRD', icon: FileSearch, path: '/wkrd' },
  { id: 'sankcje', title: 'Sankcje', icon: Gavel, path: '/sankcje' },
  { id: 'konwoje', title: 'Konwoje', icon: Truck, path: '/konwoje' },
  { id: 'spb', title: 'ŚPB', icon: Shield, path: '/spb' },
  { id: 'pilotaze', title: 'Pilotaże', icon: Car, path: '/pilotaze' },
  { id: 'zdarzenia', title: 'Zdarzenia', icon: AlertCircle, path: '/zdarzenia' },
  { id: 'kalendarz', title: 'Kalendarz', icon: Calendar, path: '/kalendarz' },
  { id: 'mapa', title: 'Mapa', icon: Map, path: '/mapa' },
  { id: 'raporty', title: 'Raporty', icon: FileText, path: '/raporty' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { logout, user } = useAuthStore();

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
        'flex flex-col transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AEP</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              System AEP
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'sidebar-link',
                    isActive && 'active',
                    sidebarCollapsed && 'justify-center px-2'
                  )
                }
                title={sidebarCollapsed ? item.title : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User & Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-1">
        <NavLink
          to="/ustawienia"
          className={({ isActive }) =>
            clsx(
              'sidebar-link',
              isActive && 'active',
              sidebarCollapsed && 'justify-center px-2'
            )
          }
          title={sidebarCollapsed ? 'Ustawienia' : undefined}
        >
          <Settings className="w-5 h-5" />
          {!sidebarCollapsed && <span>Ustawienia</span>}
        </NavLink>

        {/* User info */}
        {!sidebarCollapsed && user && (
          <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
            <div className="text-xs">{user.email}</div>
          </div>
        )}

        <button
          onClick={logout}
          className={clsx(
            'sidebar-link w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
            sidebarCollapsed && 'justify-center px-2'
          )}
          title={sidebarCollapsed ? 'Wyloguj' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span>Wyloguj</span>}
        </button>
      </div>
    </aside>
  );
}
