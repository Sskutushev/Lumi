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

    const taskItemRef = useRef<HTMLDivElement>(null);

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
          'flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all bg-transparent focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none',
          task.completed
            ? 'border-border opacity-60'
            : 'border-border hover:border-border-hover hover:shadow-sm',
          isOverdue && 'glow-error'
        )}
        role="listitem"
      >
        <div className="flex items-start gap-3 flex-1 w-full">
          <button
            onClick={handleToggleComplete}
            onKeyDown={handleKeyDown}
            className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 ${task.completed ? 'bg-gradient-animated' : 'bg-transparent [border:1.5px_solid_#A1A1AA!important]'}`}
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
                className="w-full px-2 py-1 rounded bg-transparent focus:outline-none focus:border-accent-primary"
                autoFocus
                aria-label={t('todo.editTaskName')}
              />
            ) : (
              <p
                className={`cursor-pointer font-medium px-2 py-1 rounded ${task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}
                onClick={() => onEditDetails(task)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onEditDetails(task);
                  } else if (e.key === ' ') {
                    e.preventDefault();
                    onEditDetails(task);
                  }
                }}
                tabIndex={0}
                aria-label={`${task.title} ${task.completed ? t('todo.completed') : t('todo.pending')}`}
              >
                {task.title}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 mt-1 text-xs">
              {task.due_date && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-transparent text-text-secondary min-w-min"
                  aria-label={`${t('todo.dueDate')}: ${task.due_date}`}
                >
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{task.due_date}</span>
                </div>
              )}
              {task.priority && (
                <div
                  className={twMerge(
                    'px-2 py-1 rounded-md flex items-center gap-1 border border-border bg-transparent',
                    task.priority === 'high' && 'text-error',
                    task.priority === 'medium' && 'text-warning',
                    task.priority === 'low' && 'text-success'
                  )}
                  aria-label={`${t('todo.priority.label')}: ${t(`todo.priority.${task.priority}`)}`}
                >
                  <Flag className="w-3 h-3" aria-hidden="true" />
                  <span className="capitalize">{t(`todo.priority.${task.priority}`)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end pt-2 sm:pt-0 w-full sm:w-auto">
          <div className="relative">
            <button
              onClick={toggleMoreOptions}
              className="p-1.5 rounded-md border border-border bg-transparent hover:border-border"
              aria-label={t('todo.moreOptions')}
              aria-expanded={showMoreOptions}
              aria-haspopup="true"
            >
              <MoreHorizontal className="w-4 h-4 text-text-secondary" aria-hidden="true" />
            </button>
            {showMoreOptions && (
              <div
                className="absolute right-0 mt-1 w-40 bg-transparent rounded-lg shadow-lg border border-border py-1 z-10"
                role="menu"
              >
                <button
                  onClick={handleEditDetails}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-text-secondary border border-border hover:border-border"
                  role="menuitem"
                >
                  <Edit className="w-4 h-4" aria-hidden="true" />
                  {t('common.edit')}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-error border border-border hover:border-border"
                  role="menuitem"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  {t('common.delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default TaskItem;
