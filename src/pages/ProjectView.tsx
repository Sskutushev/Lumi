// src/pages/ProjectView.tsx
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, FolderOpen } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { projectsAPI } from '../lib/api/projects.api';
import { Task, Project, ProjectStats } from '../types/api.types';
import { useTasks } from '../hooks/queries/useTasks';
import { useCreateTask } from '../hooks/mutations/useCreateTask';
import { useUpdateTask } from '../hooks/mutations/useUpdateTask';
import { useDeleteTask } from '../hooks/mutations/useDeleteTask';
import TaskDetailsPopup from '../components/layout/TaskDetailsPopup';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import TaskItem from '../components/TaskItem';

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data: allTasks = [], isLoading: tasksLoading } = useTasks(user?.id || '');
  const projectTasks = allTasks.filter((task) => task.project_id === project.id);
  const { data: projectStats, isLoading: statsLoading } = useQuery<ProjectStats>({
    queryKey: ['projectStats', project.id],
    queryFn: () => projectsAPI.getStats(project.id),
    enabled: !!project.id,
  });

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

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

  const deleteTask = useCallback(
    (id: string) => {
      deleteTaskMutation.mutate(id);
    },
    [deleteTaskMutation]
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
              <EmptyState
                icon={<FolderOpen className="w-8 h-8 text-text-tertiary" />}
                title={t('todo.emptyProject')}
                description={t('todo.emptyProjectDescription')}
                actions={[
                  <button
                    key="create"
                    onClick={() => setShowTaskCreation(true)}
                    className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium"
                  >
                    {t('todo.createFirstTask')}
                  </button>,
                  <button
                    key="back"
                    onClick={onBack}
                    className="px-4 py-2 rounded-lg border border-border text-text-primary"
                  >
                    {t('common.back')}
                  </button>,
                ]}
              />
            ) : (
              <div className="max-h-[600px] overflow-y-auto space-y-2.5">
                {' '}
                {/* 10px space between items (2.5 * 4px = 10px) */}
                {projectTasks.map((task, index) => (
                  <TaskItem
                    key={task.id || `task-${index}`} // Use task id or fallback to index-based key
                    task={task}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    onToggleComplete={() => toggleTaskCompletion(task)}
                    onEditDetails={() => setSelectedTask(task)}
                  />
                ))}
              </div>
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

export default ProjectView;
