import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Project } from '../../types/api.types';
import { FilterOptions } from '../common/AdvancedFilter';
import AdvancedFilter from '../common/AdvancedFilter';

interface TasksHeaderProps {
  currentView: string;
  advancedFilters: FilterOptions;
  setAdvancedFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  projects: Project[];
  newTask: string;
  setNewTask: React.Dispatch<React.SetStateAction<string>>;
  addTask: () => void;
  isAllView: boolean;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  currentView,
  advancedFilters,
  setAdvancedFilters,
  projects,
  newTask,
  setNewTask,
  addTask,
  isAllView,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary">{t(`todo.${currentView}`)}</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('todo.searchPlaceholder') || 'Search tasks...'}
              className="pl-10 pr-4 py-2 rounded-xl border-1.5 border-gray-400 bg-transparent focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none outline-none transition-all text-text-primary min-w-[180px]"
              value={advancedFilters.searchQuery}
              onChange={(e) =>
                setAdvancedFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
            />
          </div>
          <AdvancedFilter
            projects={projects}
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
          />
        </div>
      </div>

      {isAllView && (
        <div className="relative mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder={t('todo.addTaskPlaceholder') || 'Add a new task...'}
            className="w-full px-4 py-3 rounded-xl border-1.5 border-gray-400 bg-transparent focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none outline-none transition-all placeholder:text-text-tertiary text-text-primary"
          />
          <button
            onClick={addTask}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-bg-secondary transition-colors"
            aria-label={t('todo.addTask') || 'Add task'}
          >
            <svg
              className="w-5 h-5 text-text-secondary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default TasksHeader;
