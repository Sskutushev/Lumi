// src/pages/ProjectView.tsx
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MoreHorizontal, CheckCircle, Plus, FolderOpen, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { projectsAPI } from '../lib/api/projects.api';
import { Task, Project, ProjectStats } from '../types/api.types';
import { useTasks } from '../hooks/queries/useTasks';
import { useCreateTask } from '../hooks/mutations/useCreateTask';
import { useUpdateTask } from '../hooks/mutations/useUpdateTask';
import TaskDetailsPopup from '../components/layout/TaskDetailsPopup';

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // --- РЕФАКТОРИНГ: Используем хуки React Query ---
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks(user?.id || '');
  const projectTasks = allTasks.filter((task) => task.project_id === project.id);
  const { data: projectStats, isLoading: statsLoading } = useQuery<ProjectStats>({
    queryKey: ['projectStats', project.id],
    queryFn: () => projectsAPI.getStats(project.id),
    enabled: !!project.id,
  });

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const [showTaskCreation, setShowTaskCreation] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const loading = tasksLoading || statsLoading;

  const createTask = useCallback(async () => {
    if (!user || !newTaskTitle.trim()) return;
    createTaskMutation.mutate(
      {
        user_id: user.id,
        project_id: project.id,
        title: newTaskTitle.trim(),
        completed: false,
        priority: 'medium',
      },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setShowTaskCreation(false);
        },
      }
    );
  }, [user, newTaskTitle, project.id, createTaskMutation]);

  const toggleTaskCompletion = useCallback(
    (task: Task) => {
      updateTaskMutation.mutate({
        id: task.id,
        data: { completed: !task.completed },
      });
    },
    [updateTaskMutation]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      updateTaskMutation.mutate({ id, data: updates });
    },
    [updateTaskMutation]
  );

  // Компонент пустого состояния
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
        <FolderOpen className="w-8 h-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-1">{t('todo.emptyProject')}</h3>
      <p className="text-text-secondary mb-4">{t('todo.emptyProjectDescription')}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setShowTaskCreation(true)}
          className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium"
        >
          {t('todo.createFirstTask')}
        </button>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-border text-text-primary"
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  );

  // Компонент загрузки
  const SkeletonLoader = ({ count = 5 }) => (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-16 bg-bg-secondary animate-pulse rounded-xl" />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> {t('common.back')}
            </button>
            <div className="text-center flex-1 max-w-lg mx-auto">
              <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
              <p className="text-text-secondary mt-1">{project.description}</p>
            </div>
            <div className="w-10"></div>
          </header>
          <SkeletonLoader count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> {t('common.back')}
          </button>
          <div className="text-center flex-1 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
            <p className="text-text-secondary mt-1">{project.description}</p>
          </div>
          <div className="w-10"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
            <h3 className="text-text-secondary text-sm font-medium mb-1">
              {t('dashboard.totalTasks')}
            </h3>
            <p className="text-2xl font-bold text-text-primary">{projectStats?.total ?? 0}</p>
          </div>
          <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
            <h3 className="text-text-secondary text-sm font-medium mb-1">
              {t('dashboard.completed')}
            </h3>
            <p className="text-2xl font-bold text-success">{projectStats?.completed ?? 0}</p>
          </div>
          <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
            <h3 className="text-text-secondary text-sm font-medium mb-1">
              {t('dashboard.overdue')}
            </h3>
            <p className="text-2xl font-bold text-error">{projectStats?.overdue ?? 0}</p>
          </div>
        </div>

        <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary">{t('todo.tasks')}</h2>
            <button
              onClick={() => setShowTaskCreation(!showTaskCreation)}
              className="px-4 py-2 bg-accent-gradient-1 text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('common.add')}
            </button>
          </div>

          {showTaskCreation && (
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTask()}
                placeholder={t('todo.addTaskPlaceholder')}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-bg-tertiary/50 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
              />
              <button
                onClick={createTask}
                className="px-4 py-2 bg-accent-gradient-1 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                {t('common.add')}
              </button>
              <button
                onClick={() => {
                  setShowTaskCreation(false);
                  setNewTaskTitle('');
                }}
                className="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-bg-secondary"
              >
                {t('common.cancel')}
              </button>
            </div>
          )}

          <div className="space-y-3">
            {projectTasks.length === 0 ? (
              <EmptyState />
            ) : (
              projectTasks.map((task) => (
                <MemoizedTaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={() => toggleTaskCompletion(task)}
                  onEditDetails={() => setSelectedTask(task)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsPopup
          task={selectedTask}
          projects={[]}
          onClose={() => setSelectedTask(null)}
          onSave={(updatedTask) => {
            updateTask(updatedTask.id, updatedTask);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

const MemoizedTaskItem = React.memo(
  ({
    task,
    onToggleComplete,
    onEditDetails,
  }: {
    task: Task;
    onToggleComplete: () => void;
    onEditDetails: () => void;
  }) => {
    const { t } = useTranslation();
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

    return (
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer ${task.completed ? 'border-border bg-bg-tertiary/30 opacity-60' : 'border-border hover:border-border-hover hover:shadow-sm'} ${isOverdue ? 'glow-error' : ''}`}
        onClick={onEditDetails}
      >
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent opening popup when completing task
            onToggleComplete();
          }}
          role="checkbox"
          aria-checked={task.completed}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
            task.completed
              ? 'bg-accent-gradient-1 border-transparent'
              : 'border-border hover:border-accent-primary'
          }`}
        >
          {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
        </button>
        <p
          className={`flex-1 font-medium ${task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}
        >
          {task.title}
        </p>
        {task.due_date && (
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}
        <button
          className="p-1.5 rounded-md hover:bg-bg-tertiary/50"
          onClick={(e) => {
            e.stopPropagation();
            onEditDetails();
          }}
        >
          <MoreHorizontal className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    );
  }
);

export default ProjectView;
