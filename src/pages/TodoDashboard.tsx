// src/pages/TodoDashboard.tsx
import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Task, Project } from '../types/api.types';
import { useTasks } from '../hooks/queries/useTasks';
import { useProjects } from '../hooks/queries/useProjects';
import { useProfile } from '../hooks/queries/useProfile';
import { useCreateTask } from '../hooks/mutations/useCreateTask';
import { useUpdateTask } from '../hooks/mutations/useUpdateTask';
import { useDeleteTask } from '../hooks/mutations/useDeleteTask';
import { useCreateProject } from '../hooks/mutations/useCreateProject';
import { useRealtimeTasks } from '../hooks/useRealtimeTasks';
import { filterAndSortTasks } from '../lib/utils/taskFilters';
import { FilterOptions } from '../components/common/AdvancedFilter';
import { ErrorHandler } from '../lib/errors/ErrorHandler';
import { Logger } from '../lib/errors/logger';
import { toast } from 'sonner';

import UserMenu from '../components/dashboard/UserMenu';
import ProjectsList from '../components/dashboard/ProjectsList';
import TasksHeader from '../components/dashboard/TasksHeader';
import TasksList from '../components/dashboard/TasksList';
import SkeletonLoader from '../components/common/SkeletonLoader';
import Sidebar from '../components/dashboard/Sidebar';

const TaskDetailsPopup = lazy(() => import('../components/layout/TaskDetailsPopup'));
const ProjectCreationPopup = lazy(() => import('../components/layout/ProjectCreationPopup'));
const ProfileSettings = lazy(() => import('../components/layout/ProfileSettings'));

interface TodoDashboardProps {
  onSignOut: () => void;
  onProjectSelect?: (project: Project) => void;
}

const TodoDashboard: React.FC<TodoDashboardProps> = ({ onSignOut, onProjectSelect }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<'all' | 'upcoming' | 'important' | 'completed'>(
    'all'
  );
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    priority: null,
    project_id: null,
    status: 'all',
    dateRange: null,
    assignee: null,
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const { data: tasks = [], isLoading: tasksLoading } = useTasks(user?.id || '');
  const { data: projects = [], isLoading: projectsLoading } = useProjects(user?.id || '');
  const { data: userProfile, isLoading: profileLoading } = useProfile(user?.id || '');

  useRealtimeTasks(user?.id || '');

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const createProjectMutation = useCreateProject();

  const addTask = useCallback(() => {
    if (!user || !newTask.trim()) return;
    createTaskMutation.mutate(
      { user_id: user.id, title: newTask.trim(), completed: false, priority: 'medium' },
      {
        onSuccess: () => {
          setNewTask('');
          toast.success(t('todo.createSuccess'));
        },
        onError: (error) => {
          const appError = ErrorHandler.handle(error);
          Logger.error('Failed to create task:', appError);
          toast.error(t('todo.createError'));
        },
      }
    );
  }, [user, newTask, createTaskMutation, t]);

  const handleUpdateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      updateTaskMutation.mutate({ id, data: updates });
    },
    [updateTaskMutation]
  );

  const handleDeleteTask = useCallback(
    (id: string) => {
      deleteTaskMutation.mutate(id);
    },
    [deleteTaskMutation]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        handleUpdateTask(id, { completed: !task.completed });
      }
    },
    [tasks, handleUpdateTask]
  );

  // Combine currentView with advancedFilters
  const combinedFilters = useMemo(() => {
    // Check the Sidebar component - 'important' tab is actually for overdue tasks
    if (currentView === 'completed') {
      return { ...advancedFilters, status: 'completed' };
    } else if (currentView === 'important') {
      // This is for overdue tasks, but 'overdue' is not part of FilterOptions status type
      // So we'll use the default filters as the filtering will be handled differently
      return { ...advancedFilters };
    } else if (currentView === 'upcoming') {
      // For upcoming tasks (due within 3 days), we need to set date range
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      return {
        ...advancedFilters,
        status: 'pending', // Only show non-completed tasks for upcoming
        dateRange: {
          start: today.toISOString().split('T')[0],
          end: threeDaysFromNow.toISOString().split('T')[0],
        },
      };
    } else {
      return advancedFilters; // For 'all' view, use filters as they are
    }
  }, [currentView, advancedFilters]);

  const filteredTasks = useMemo(() => {
    // Ensure tasks and projects are arrays before filtering
    let result = filterAndSortTasks(tasks || [], projects || [], combinedFilters);

    // Special handling for different views
    if (currentView === 'important') {
      // For 'important' view, show overdue tasks - incomplete tasks with due date in the past
      result = result.filter((task) => {
        return !task.completed && task.due_date && new Date(task.due_date) < new Date();
      });
    } else if (currentView === 'upcoming') {
      // For 'upcoming' view, show tasks due within 3 days
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      result = result.filter((task) => {
        return (
          !task.completed &&
          task.due_date &&
          new Date(task.due_date) >= today &&
          new Date(task.due_date) <= threeDaysFromNow
        );
      });
    }

    return result;
  }, [tasks, projects, combinedFilters, currentView]);

  if (tasksLoading || projectsLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <SkeletonLoader count={8} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-animated flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gradient-animated bg-clip-text">
              Lumi
            </h1>
          </div>
          <UserMenu
            userProfile={userProfile || null}
            user={user}
            isUserMenuOpen={isUserMenuOpen}
            setIsUserMenuOpen={setIsUserMenuOpen}
            onSignOut={onSignOut}
            onOpenProfileSettings={() => setShowProfileSettings(true)}
          />
        </header>

        <main className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="mb-2.5">
              <Sidebar currentView={currentView} setCurrentView={setCurrentView} tasks={tasks} />
            </div>
            <ProjectsList
              projects={projects}
              onProjectSelect={onProjectSelect}
              setShowProjectCreation={setShowProjectCreation}
              handleDeleteTask={handleDeleteTask}
            />
          </div>

          <div className="md:col-span-3">
            <TasksHeader
              currentView={currentView}
              advancedFilters={advancedFilters}
              setAdvancedFilters={setAdvancedFilters}
              projects={projects}
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
              isAllView={currentView === 'all'}
            />
            <TasksList
              filteredTasks={filteredTasks}
              projects={projects}
              handleUpdateTask={handleUpdateTask}
              handleDeleteTask={handleDeleteTask}
              toggleComplete={toggleComplete}
              setSelectedTask={setSelectedTask}
              currentView={currentView}
              addTaskFocus={() =>
                (document.querySelector('input[placeholder*="Add"]') as HTMLElement)?.focus()
              }
            />
          </div>
        </main>
      </div>

      <Suspense fallback={null}>
        {showProfileSettings && (
          <ProfileSettings
            isOpen={showProfileSettings}
            onClose={() => setShowProfileSettings(false)}
          />
        )}
        {selectedTask && (
          <TaskDetailsPopup
            task={selectedTask}
            projects={projects}
            onClose={() => setSelectedTask(null)}
            onSave={(updatedTask) => {
              handleUpdateTask(updatedTask.id, updatedTask);
              setSelectedTask(null);
            }}
          />
        )}
        {showProjectCreation && (
          <ProjectCreationPopup
            isOpen={showProjectCreation}
            onClose={() => setShowProjectCreation(false)}
            onCreateProject={(project) => {
              if (user) {
                createProjectMutation.mutate({
                  user_id: user.id,
                  name: project.name,
                  description: project.description,
                });
              }
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export default TodoDashboard;
