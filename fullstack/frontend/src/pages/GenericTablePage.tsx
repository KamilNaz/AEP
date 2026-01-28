import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { DataTable, Column } from '../components/common/DataTable';
import { api } from '../services/api';
import type { Pagination, QueryParams } from '../types';

interface GenericTablePageProps {
  title: string;
  endpoint: string;
  columns: Column<any>[];
}

export function GenericTablePage({ title, endpoint, columns }: GenericTablePageProps) {
  const [data, setData] = useState<any[]>([]);
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

  // Transform columns to add date formatting
  const transformedColumns = columns.map((col) => {
    if (col.key === 'data' && !col.render) {
      return {
        ...col,
        render: (value: string) =>
          value ? format(new Date(value), 'dd.MM.yyyy', { locale: pl }) : '-',
      };
    }
    if (col.key === 'status' && !col.render) {
      return {
        ...col,
        render: (value: string) => {
          if (!value) return '-';
          const colors: Record<string, string> = {
            'Aktywny': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'Zakończony': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'W trakcie': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'Zaplanowany': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          };
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
              {value}
            </span>
          );
        },
      };
    }
    return col;
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const response = await api.get(`/${endpoint}?${searchParams.toString()}`);
      setData(response.data.data);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

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
    console.log('Add new', endpoint);
  };

  const handleEdit = (row: any) => {
    console.log('Edit', endpoint, row.id);
  };

  const handleDelete = async (row: any) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten rekord?')) {
      try {
        await api.delete(`/${endpoint}/${row.id}`);
        fetchData();
      } catch (error) {
        console.error(`Failed to delete ${endpoint}:`, error);
      }
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (window.confirm(`Czy na pewno chcesz usunąć ${ids.length} rekordów?`)) {
      try {
        await api.post(`/${endpoint}/bulk`, { action: 'delete', ids });
        fetchData();
      } catch (error) {
        console.error(`Failed to bulk delete ${endpoint}:`, error);
      }
    }
  };

  return (
    <DataTable
      data={data}
      columns={transformedColumns}
      loading={loading}
      pagination={pagination}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
      onSort={handleSort}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      title={title}
    />
  );
}
