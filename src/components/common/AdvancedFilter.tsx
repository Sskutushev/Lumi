// src/components/common/AdvancedFilter.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter as FilterIcon, Search, X, Flag, Save, RotateCcw } from 'lucide-react';
import { Project } from '../../types/api.types';
import { useClickOutside } from '../../hooks/useClickOutside';

// Определяем тип для фильтров
export interface FilterOptions {
  priority: string | null;
  project_id: string | null;
  status: 'all' | 'pending' | 'completed' | 'overdue';
  dateRange: { start: string | null; end: string | null } | null;
  assignee: string | null;
  searchQuery: string;
  sortBy: 'priority' | 'date' | 'name' | 'project';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFilterProps {
  projects: Project[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  projects = [],
  filters,
  onFiltersChange,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<
    { id: string; name: string; filters: FilterOptions }[]
  >([]);
  const [newFilterName, setNewFilterName] = useState('');

  // Загружаем сохраненные фильтры из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lumi_saved_filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
  }, []);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      priority: null,
      project_id: null,
      status: 'all',
      dateRange: null,
      assignee: null,
      searchQuery: '',
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const saveCurrentFilter = () => {
    if (!newFilterName.trim()) return;

    const newSavedFilter = {
      id: Date.now().toString(),
      name: newFilterName,
      filters: { ...filters },
    };

    const updatedFilters = [...savedFilters, newSavedFilter];
    setSavedFilters(updatedFilters);
    localStorage.setItem('lumi_saved_filters', JSON.stringify(updatedFilters));
    setNewFilterName('');
  };

  const loadSavedFilter = (savedFilter: { filters: FilterOptions }) => {
    onFiltersChange(savedFilter.filters);
    setIsOpen(false);
  };

  const deleteSavedFilter = (id: string) => {
    const updatedFilters = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updatedFilters);
    localStorage.setItem('lumi_saved_filters', JSON.stringify(updatedFilters));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-bg-tertiary/50 flex items-center gap-2 relative"
        aria-label={t('todo.advancedFilters') || 'Advanced filters'}
      >
        <FilterIcon className="w-5 h-5 text-text-secondary" />
        {filters.priority ||
        filters.project_id ||
        filters.searchQuery ||
        (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) ? (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-primary text-xs text-white flex items-center justify-center">
            1
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-bg-primary rounded-xl shadow-xl border border-border py-4 z-50"
          >
            <div className="px-4 mb-4 flex justify-between items-center">
              <h4 className="font-semibold text-text-primary text-sm">
                {t('todo.advancedFilters') || 'Advanced filters'}
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary"
                aria-label={t('common.close') || 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Search */}
              <div>
                <label className="text-xs font-semibold text-text-tertiary mb-1 block">
                  {t('common.search') || 'Search'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    placeholder={t('todo.searchPlaceholder') || 'Search tasks...'}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg-tertiary/50 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs font-semibold text-text-tertiary mb-1 block">
                  {t('todo.status') || 'Status'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['all', 'pending', 'completed', 'overdue'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange('status', status)}
                      className={`px-3 py-1.5 rounded-lg text-xs capitalize ${
                        filters.status === status
                          ? 'bg-accent-primary text-white'
                          : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                      }`}
                    >
                      {t(`todo.${status}`) || status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-xs font-semibold text-text-tertiary mb-1 block">
                  {t('todo.priority.label') || 'Priority'}
                </label>
                <div className="flex flex-wrap gap-1">
                  {(['high', 'medium', 'low'] as const).map((priority) => (
                    <button
                      key={priority}
                      onClick={() =>
                        handleFilterChange(
                          'priority',
                          filters.priority === priority ? null : priority
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs capitalize flex items-center gap-1 ${
                        filters.priority === priority
                          ? 'bg-accent-primary text-white'
                          : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                      }`}
                    >
                      <Flag className="w-3 h-3" />
                      {t(`todo.priority.${priority}`) || priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Filter */}
              <div>
                <label className="text-xs font-semibold text-text-tertiary mb-1 block">
                  {t('todo.project') || 'Project'}
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  <button
                    onClick={() => handleFilterChange('project_id', null)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                      !filters.project_id
                        ? 'bg-accent-primary/10 text-accent-primary font-medium'
                        : 'hover:bg-bg-secondary'
                    }`}
                  >
                    {t('todo.allProjects') || 'All Projects'}
                  </button>
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleFilterChange('project_id', project.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm truncate ${
                        filters.project_id === project.id
                          ? 'bg-accent-primary/10 text-accent-primary font-medium'
                          : 'hover:bg-bg-secondary'
                      }`}
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="text-xs font-semibold text-text-tertiary mb-1 block">
                  {t('todo.sortBy') || 'Sort by'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['priority', 'date', 'name', 'project'] as const).map((sortBy) => (
                    <button
                      key={sortBy}
                      onClick={() => handleFilterChange('sortBy', sortBy)}
                      className={`px-3 py-1.5 rounded-lg text-xs capitalize ${
                        filters.sortBy === sortBy
                          ? 'bg-accent-primary text-white'
                          : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                      }`}
                    >
                      {sortBy === 'date'
                        ? t('todo.dueDate') || 'Due Date'
                        : sortBy === 'name'
                          ? t('common.name') || 'Name'
                          : sortBy}
                    </button>
                  ))}
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleFilterChange('sortOrder', 'asc')}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      filters.sortOrder === 'asc'
                        ? 'bg-accent-primary text-white'
                        : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    {t('todo.ascending') || 'A-Z'}
                  </button>
                  <button
                    onClick={() => handleFilterChange('sortOrder', 'desc')}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      filters.sortOrder === 'desc'
                        ? 'bg-accent-primary text-white'
                        : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                    }`}
                  >
                    {t('todo.descending') || 'Z-A'}
                  </button>
                </div>
              </div>

              {/* Save Current Filter */}
              <div className="pt-2 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                    placeholder={t('todo.saveFilterPlaceholder') || 'Save filter as...'}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-bg-tertiary/50 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary text-sm"
                  />
                  <button
                    onClick={saveCurrentFilter}
                    disabled={!newFilterName.trim()}
                    className="p-1.5 rounded-lg bg-accent-primary text-white disabled:opacity-50"
                    title={t('todo.saveFilter') || 'Save filter'}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Saved Filters */}
              {savedFilters.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <h5 className="text-xs font-semibold text-text-tertiary mb-2">
                    {t('todo.savedFilters') || 'Saved filters'}
                  </h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {savedFilters.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex justify-between items-center px-2 py-1.5 rounded-lg hover:bg-bg-secondary"
                      >
                        <button
                          onClick={() => loadSavedFilter(filter)}
                          className="flex-1 text-left text-xs text-text-secondary truncate"
                        >
                          {filter.name}
                        </button>
                        <button
                          onClick={() => deleteSavedFilter(filter.id)}
                          className="p-1 text-error hover:bg-error/10 rounded"
                          title={t('common.delete') || 'Delete'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pt-4 border-t border-border flex justify-between">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg bg-bg-secondary text-text-primary text-sm flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                {t('common.clear') || 'Clear'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-accent-gradient-1 text-white text-sm"
              >
                {t('common.apply') || 'Apply'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedFilter;
