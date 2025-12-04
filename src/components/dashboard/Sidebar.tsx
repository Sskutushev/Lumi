import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { List, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Task } from '../../types/api.types';

interface SidebarProps {
  currentView: 'all' | 'upcoming' | 'important' | 'completed';
  setCurrentView: (view: 'all' | 'upcoming' | 'important' | 'completed') => void;
  tasks: Task[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, tasks }) => {
  const { t } = useTranslation();

  const hasOverdueTasks = useMemo(
    () =>
      tasks.some(
        (task) => task.due_date && new Date(task.due_date) < new Date() && !task.completed
      ),
    [tasks]
  );

  return (
    <div className="space-y-6">
      <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
        <div className="space-y-1">
          <button
            className={twMerge(
              `w-full flex items-center gap-3 px-3 py-2 rounded-lg`,
              currentView === 'all' && 'bg-accent-primary/10 text-accent-primary font-medium'
            )}
            onClick={() => setCurrentView('all')}
          >
            <List className="w-5 h-5" /> <span>{t('todo.all')}</span>
          </button>
          <button
            className={twMerge(
              `w-full flex items-center gap-3 px-3 py-2 rounded-lg`,
              currentView === 'upcoming' && 'bg-accent-primary/10 text-accent-primary font-medium'
            )}
            onClick={() => setCurrentView('upcoming')}
          >
            <Calendar className="w-5 h-5" /> <span>{t('todo.deadline')}</span>
          </button>
          <button
            className={twMerge(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg relative',
              currentView === 'important' && 'bg-accent-primary/10 text-accent-primary font-medium',
              hasOverdueTasks && currentView !== 'important' && 'animate-pulse glow-error'
            )}
            onClick={() => setCurrentView('important')}
          >
            <AlertCircle
              className={twMerge(
                'w-5 h-5',
                hasOverdueTasks && currentView !== 'important' && 'text-error'
              )}
            />
            <span
              className={twMerge(hasOverdueTasks && currentView !== 'important' && 'text-error')}
            >
              {t('todo.overdue')}
            </span>
          </button>
          <button
            className={twMerge(
              `w-full flex items-center gap-3 px-3 py-2 rounded-lg`,
              currentView === 'completed' && 'bg-accent-primary/10 text-accent-primary font-medium'
            )}
            onClick={() => setCurrentView('completed')}
          >
            <CheckCircle className="w-5 h-5" /> <span>{t('todo.completed')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
