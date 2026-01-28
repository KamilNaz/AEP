import { useEffect, useState } from 'react';
import {
  Users,
  AlertTriangle,
  FileSearch,
  Gavel,
  Truck,
  Shield,
  Car,
  AlertCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardApi } from '../services/api';
import type { DashboardStats, ChartData } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: number;
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {value}
          </p>
          {trend !== undefined && (
            <p className={`text-sm mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}% vs poprzedni miesiąc
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getCharts(30),
        ]);
        setStats(statsRes.data.data);
        setChartData(chartsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Patrole', value: stats?.patrole || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Wykroczenia', value: stats?.wykroczenia || 0, icon: AlertTriangle, color: 'bg-yellow-500' },
    { title: 'WKRD', value: stats?.wkrd || 0, icon: FileSearch, color: 'bg-purple-500' },
    { title: 'Sankcje', value: stats?.sankcje || 0, icon: Gavel, color: 'bg-red-500' },
    { title: 'Konwoje', value: stats?.konwoje || 0, icon: Truck, color: 'bg-green-500' },
    { title: 'ŚPB', value: stats?.spb || 0, icon: Shield, color: 'bg-orange-500' },
    { title: 'Pilotaże', value: stats?.pilotaze || 0, icon: Car, color: 'bg-cyan-500' },
    { title: 'Zdarzenia', value: stats?.zdarzenia || 0, icon: AlertCircle, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Aktywność - ostatnie 30 dni
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData?.patroleByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
            Rozkład wykroczeń według typu
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData?.wykroczeniaByType || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="type"
                label={({ type, percent }) =>
                  `${type}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData?.wykroczeniaByType?.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Podsumowanie
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600">{stats?.total || 0}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Wszystkich rekordów</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {((stats?.patrole || 0) / (stats?.total || 1) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Patroli</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">
              {((stats?.wykroczenia || 0) / (stats?.total || 1) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Wykroczeń</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">
              {((stats?.zdarzenia || 0) / (stats?.total || 1) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Zdarzeń</p>
          </div>
        </div>
      </div>
    </div>
  );
}
