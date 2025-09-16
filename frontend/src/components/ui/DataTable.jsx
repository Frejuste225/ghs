import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  className = '',
  emptyMessage = 'Aucune donnée disponible',
  emptyIcon: EmptyIcon,
  onRowClick,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrage
  const filteredData = searchable && searchTerm
    ? data.filter(item =>
        columns.some(column => {
          const value = column.accessor ? item[column.accessor] : '';
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : data;

  // Tri
  const sortedData = sortable && sortConfig.key
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      })
    : filteredData;

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination
    ? sortedData.slice(startIndex, startIndex + pageSize)
    : sortedData;

  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="p-8">
          <LoadingSpinner size="lg" text="Chargement des données..." />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('table-container', className)} {...props}>
      {/* Barre de recherche et filtres */}
      {searchable && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="input pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'table-header',
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-100 transition-colors'
                  )}
                  onClick={() => column.sortable !== false && handleSort(column.accessor)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {sortable && column.sortable !== false && getSortIcon(column.accessor)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr 
                key={item.id || index} 
                className={clsx(
                  'table-row',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {column.render 
                      ? column.render(item[column.accessor], item, index)
                      : item[column.accessor]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Message vide */}
        {paginatedData.length === 0 && (
          <div className="empty-state">
            {EmptyIcon && <EmptyIcon className="empty-state-icon" />}
            <h3 className="empty-state-title">Aucune donnée</h3>
            <p className="empty-state-description">{emptyMessage}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
            <span className="font-medium">{Math.min(startIndex + pageSize, sortedData.length)}</span> sur{' '}
            <span className="font-medium">{sortedData.length}</span> résultats
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;