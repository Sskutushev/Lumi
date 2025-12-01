import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Calendar, Flag, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Task } from '../types/api.types';

const TaskItem = React.memo(
  ({
    task,
    onUpdate,
    onDelete,
    onToggleComplete,
    onEditDetails,
  }: {
    task: Task;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onEditDetails: (task: Task) => void;
  }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [editingTitle, setEditingTitle] = useState(task.title);
    const [showMoreOptions, setShowMoreOptions] = useState(false);

    const handleSave = useCallback(() => {
      if (editingTitle.trim() && editingTitle !== task.title) {
        onUpdate(task.id, { title: editingTitle });
      }
      setIsEditing(false);
    }, [editingTitle, task.title, task.id, onUpdate]);

    const isOverdue = useMemo(
      () => task.due_date && new Date(task.due_date) < new Date() && !task.completed,
      [task.due_date, task.completed]
    );

    const handleToggleComplete = useCallback(() => {
      onToggleComplete(task.id);
    }, [task.id, onToggleComplete]);

    const handleEditDetails = useCallback(() => {
      onEditDetails(task);
      setShowMoreOptions(false);
    }, [task, onEditDetails]);

    const handleDelete = useCallback(() => {
      onDelete(task.id);
    }, [task.id, onDelete]);

    const toggleMoreOptions = useCallback(() => {
      setShowMoreOptions((prev) => !prev);
    }, []);

    // Улучшения доступности
    const taskItemRef = useRef<HTMLDivElement>(null);

    // Обработка клавиатурных событий для доступности
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleComplete();
        }
      },
      [handleToggleComplete]
    );

    return (
      <div
        ref={taskItemRef}
        className={twMerge(
          'flex items-start gap-3 p-4 rounded-xl border transition-all',
          task.completed && 'border-border bg-bg-tertiary/30 opacity-60',
          !task.completed && 'border-border hover:border-border-hover hover:shadow-sm',
          isOverdue && 'glow-error'
        )}
        role="listitem"
      >
        <button
          onClick={handleToggleComplete}
          onKeyDown={handleKeyDown}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 ${task.completed ? 'bg-accent-gradient-1 border-transparent' : 'border-border hover:border-accent-primary'}`}
          aria-label={task.completed ? t('todo.markAsIncomplete') : t('todo.markAsComplete')}
          aria-checked={task.completed}
          role="checkbox"
        >
          {task.completed && <Check className="w-4 h-4 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              onBlur={handleSave}
              className="w-full bg-transparent border-b border-accent-primary focus:outline-none"
              autoFocus
              aria-label={t('todo.editTaskName')}
            />
          ) : (
            <p
              className={`cursor-pointer font-medium ${task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}
              onClick={() => onEditDetails(task)}
              onKeyDown={(e) => e.key === 'Enter' && onEditDetails(task)}
              tabIndex={0}
              aria-label={`${task.title} ${task.completed ? t('todo.completed') : t('todo.pending')}`}
            >
              {task.title}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {task.due_date && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-bg-tertiary/50 text-text-secondary"
                aria-label={`${t('todo.dueDate')}: ${task.due_date}`}
              >
                <Calendar className="w-3 h-3" aria-hidden="true" />
                <span>{task.due_date}</span>
              </div>
            )}
            {task.priority && (
              <div
                className={twMerge(
                  'px-2 py-1 rounded-md flex items-center gap-1',
                  task.priority === 'high' && 'bg-error/10 text-error border-error',
                  task.priority === 'medium' && 'bg-warning/10 text-warning border-warning',
                  task.priority === 'low' && 'bg-success/10 text-success border-success'
                )}
                aria-label={`${t('todo.priority.label')}: ${t(`todo.priority.${task.priority}`)}`}
              >
                <Flag className="w-3 h-3" aria-hidden="true" />
                <span className="capitalize">{t(`todo.priority.${task.priority}`)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={toggleMoreOptions}
            className="p-1.5 rounded-md hover:bg-bg-tertiary/50"
            aria-label={t('todo.moreOptions')}
            aria-expanded={showMoreOptions}
            aria-haspopup="true"
          >
            <MoreHorizontal className="w-4 h-4 text-text-secondary" aria-hidden="true" />
          </button>
          {showMoreOptions && (
            <div
              className="absolute right-0 mt-1 w-40 bg-bg-primary rounded-lg shadow-lg border border-border py-1 z-10"
              role="menu"
            >
              <button
                onClick={handleEditDetails}
                className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-text-secondary hover:bg-bg-secondary"
                role="menuitem"
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
                {t('common.edit')}
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-error hover:bg-error/10"
                role="menuitem"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                {t('common.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default TaskItem;
