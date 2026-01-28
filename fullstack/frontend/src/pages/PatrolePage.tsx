import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { DataTable, Column } from '../components/common/DataTable';
import { patroleApi } from '../services/api';
import type { Patrol, Pagination, QueryParams } from '../types';

const columns: Column<Patrol>[] = [
  {
    key: 'data',
    header: 'Data',
    sortable: true,
    width: '120px',
    render: (value) => value ? format(new Date(value), 'dd.MM.yyyy', { locale: pl }) : '-',
  },
  {
    key: 'nazwaJw',
    header: 'Jednostka',
    sortable: true,
  },
  {
    key: 'miejsce',
    header: 'Miejsce',
    sortable: true,
  },
  {
    key: 'rodzajPatrolu',
    header: 'Rodzaj',
  },
  {
    key: 'trasa',
    header: 'Trasa',
  },
  {
    key: 'skladPatrolu',
    header: 'Skład',
  },
  {
    key: 'czasRozpoczecia',
    header: 'Rozpoczęcie',
    width: '100px',
  },
  {
    key: 'czasZakonczenia',
    header: 'Zakończenie',
    width: '100px',
  },
  {
    key: 'status',
    header: 'Status',
    width: '120px',
    render: (value) => {
      const colors: Record<string, string> = {
        'Aktywny': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'Zakończony': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'W trakcie': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'Zaplanowany': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      };
      return value ? (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || colors['Aktywny']}`}>
          {value}
        </span>
      ) : '-';
    },
  },
  {
    key: 'user.name',
    header: 'Utworzył',
    render: (value, row) => row.user?.name || '-',
  },
];

export function PatrolePage() {
  const [data, setData] = useState<Patrol[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 25,
    sortBy: 'data',
    sortOrder: 'desc',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await patroleApi.getAll(params);
      setData(response.data.data);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch patrole:', error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleSearch = (search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setParams((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  const handleAdd = () => {
    // TODO: Open modal or navigate to create page
    console.log('Add new patrol');
  };

  const handleEdit = (row: Patrol) => {
    // TODO: Open edit modal
    console.log('Edit patrol:', row.id);
  };

  const handleDelete = async (row: Patrol) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten patrol?')) {
      try {
        await patroleApi.delete(row.id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete patrol:', error);
      }
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (window.confirm(`Czy na pewno chcesz usunąć ${ids.length} patroli?`)) {
      try {
        await patroleApi.bulkDelete(ids);
        fetchData();
      } catch (error) {
        console.error('Failed to bulk delete patrols:', error);
      }
    }
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      pagination={pagination}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      onSort={handleSort}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      title="Lista patroli"
    />
  );
}
