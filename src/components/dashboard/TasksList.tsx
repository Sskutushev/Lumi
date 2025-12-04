import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Task, Project } from '../../types/api.types';
import TaskItem from '../TaskItem';
import EmptyState from '../common/EmptyState';
import { CheckCircle } from 'lucide-react';

interface TasksListProps {
  filteredTasks?: Task[];
  projects: Project[];
  handleUpdateTask: (id: string, updates: Partial<Task>) => void;
  handleDeleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  setSelectedTask: (task: Task) => void;
  currentView: string;
  addTaskFocus?: () => void;
}

const TasksList: React.FC<TasksListProps> = React.memo(
  ({
    filteredTasks,
    projects,
    handleUpdateTask,
    handleDeleteTask,
    toggleComplete,
    setSelectedTask,
    currentView,
    addTaskFocus,
  }) => {
    const { t } = useTranslation();

    // Most defensive approach - ensure filteredTasks is always a valid array
    const safeFilteredTasks = React.useMemo(() => {
      if (!filteredTasks) return [];
      if (Array.isArray(filteredTasks)) return filteredTasks.filter((task) => task != null);
      return [];
    }, [filteredTasks]);

    // Render tasks with regular scrolling instead of react-window to avoid the error
    if (safeFilteredTasks.length === 0) {
      return (
        <EmptyState
          icon={<CheckCircle className="w-8 h-8 text-text-tertiary" />}
          title={t('todo.noTasksTitle')}
          description={t('todo.noTasksDescription')}
          actionText={t('todo.createFirstTask')}
          onAction={addTaskFocus}
        />
      );
    }

    // Render the task list with regular scroll
    return (
      <div className="max-h-[600px] overflow-y-auto space-y-2.5">
        {' '}
        {/* 10px space between items (2.5 * 4px = 10px) */}
        {safeFilteredTasks.map((task, index) => (
          <TaskItem
            key={task.id || `task-${index}`} // Use task id or fallback to index-based key
            task={task}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onToggleComplete={toggleComplete}
            onEditDetails={() => setSelectedTask(task)}
          />
        ))}
      </div>
    );
  }
);

export default TasksList;
