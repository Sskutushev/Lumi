import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Flag, Minus, Plus } from 'lucide-react';
import CalendarDropdown from './CalendarDropdown';

// Define interface for the task
interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  detailedDescription?: string;
  startDate?: string;
  projectId?: string;
  projectName?: string;
  tags?: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface TaskDetailsPopupProps {
  task: Task;
  projects: Project[];
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const TaskDetailsPopup: React.FC<TaskDetailsPopupProps> = ({ 
  task, 
  projects = [],
  onClose, 
  onSave 
}) => {
  const { t } = useTranslation();
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [descriptionHeight, setDescriptionHeight] = useState<number>(120); // начальная высота описания
  const [detailedDescriptionHeight, setDetailedDescriptionHeight] = useState<number>(150); // начальная высота подробного описания

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedTask);
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    setEditedTask(prev => ({ ...prev, priority }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl bg-bg-primary rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-primary">{t('todo.taskDetails')}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
            className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-text-primary"
            placeholder={t('todo.taskTitle') || 'Task title...'}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Priority Selector */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('todo.priority.label') || 'Priority'}
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handlePriorityChange(priority)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                      editedTask.priority === priority
                        ? priority === 'high'
                          ? 'bg-error/10 text-error border border-error'
                          : priority === 'medium'
                            ? 'bg-warning/10 text-warning border border-warning'
                            : 'bg-success/10 text-success border border-success'
                        : 'bg-bg-secondary text-text-secondary border border-border'
                    }`}
                  >
                    {t(`todo.priority.${priority}`) || priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CalendarDropdown
                value={editedTask.startDate || ''}
                onChange={(date) => setEditedTask(prev => ({ ...prev, startDate: date }))}
                label={t('todo.startDate') || 'Start Date'}
                placeholder={t('todo.startDatePlaceholder') || 'Select start date...'}
              />

              <CalendarDropdown
                value={editedTask.dueDate || ''}
                onChange={(date) => setEditedTask(prev => ({ ...prev, dueDate: date }))}
                label={t('todo.dueDate') || 'Due Date'}
                placeholder={t('todo.dueDatePlaceholder') || 'Select due date...'}
              />
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('todo.project') || 'Project'}
              </label>
              <div className="relative">
                <select
                  value={editedTask.projectId || ''}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary appearance-none"
                >
                  <option value="">{t('todo.noProject') || 'No project'}</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-tertiary">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('todo.description') || 'Description'}
              </label>
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary min-h-[120px]"
                style={{ height: `${descriptionHeight}px` }}
                placeholder={t('todo.descriptionPlaceholder') || 'Brief description...'}
              />
              <div className="flex justify-end mt-2">
                <div
                  className="resize-handle w-4 h-4 cursor-se-resize relative"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startY = e.clientY;
                    const startHeight = descriptionHeight;

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const newHeight = Math.max(60, startHeight + (moveEvent.clientY - startY));
                      setDescriptionHeight(newHeight);
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="text-text-tertiary absolute -top-1 -right-1 text-xs">◢</div>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('todo.detailedDescription') || 'Detailed Description'}
              </label>
              <textarea
                value={editedTask.detailedDescription || ''}
                onChange={(e) => setEditedTask(prev => ({ ...prev, detailedDescription: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary min-h-[150px]"
                style={{ height: `${detailedDescriptionHeight}px` }}
                placeholder={t('todo.detailedDescriptionPlaceholder') || 'Detailed description (up to 5000 characters)...'}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-text-tertiary">
                  {`${editedTask.detailedDescription ? editedTask.detailedDescription.length : 0} / 5000`}
                </div>
                <div
                  className="resize-handle w-4 h-4 cursor-se-resize relative"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startY = e.clientY;
                    const startHeight = detailedDescriptionHeight;

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const newHeight = Math.max(60, startHeight + (moveEvent.clientY - startY));
                      setDetailedDescriptionHeight(newHeight);
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="text-text-tertiary absolute -top-1 -right-1 text-xs">◢</div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-bg-secondary text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium hover:shadow-lg transition-all"
          >
            {t('common.save') || 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPopup;