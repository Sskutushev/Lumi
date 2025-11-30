import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MoreHorizontal, CheckCircle, Plus, FolderOpen, AlertCircle, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { tasksAPI } from '../lib/api/tasks.api';
import { projectsAPI } from '../lib/api/projects.api';
import { Task, ProjectStats, UserProfile } from '../types/api.types';
import TaskDetailsPopup from '../components/layout/TaskDetailsPopup';

interface ProjectViewProps {
  project: {
    id: string;
    name: string;
    description: string;
  };
  onBack: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskCreation, setShowTaskCreation] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user && project.id) {
      loadProjectData();
    }
  }, [user, project.id]);

  const loadProjectData = async () => {
    if (!user || !project.id) return;
    
    setLoading(true);
    try {
      // Загружаем задачи проекта и статистику в параллель
      const [tasks, stats] = await Promise.all([
        tasksAPI.getAll(user.id, project.id),
        projectsAPI.getStats(project.id)
      ]);
      
      setProjectTasks(tasks);
      setProjectStats(stats);
    } catch (error) {
      console.error('Error loading project data:', error);
      // Возможно, добавить уведомление пользователю
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await tasksAPI.update(id, updates);
      setProjectTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const currentTask = projectTasks.find(task => task.id === taskId);
      if (!currentTask) return;

      // Оптимистичное обновление
      setProjectTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));

      // Обновление через API
      const updatedTask = await tasksAPI.update(taskId, {
        completed: !currentTask.completed
      });

      // Обновляем в состоянии с ответом API
      setProjectTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      // Обновляем статистику
      if (projectStats) {
        setProjectStats({
          total: projectStats.total,
          completed: currentTask.completed 
            ? projectStats.completed - 1 
            : projectStats.completed + 1,
          overdue: projectStats.overdue
        });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Откат оптимистичного обновления при ошибке
      setProjectTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    }
  };

  const createTask = async () => {
    if (!user || !newTaskTitle.trim()) return;

    try {
      const newTask = await tasksAPI.create({
        user_id: user.id,
        project_id: project.id,
        title: newTaskTitle.trim()
      });

      setProjectTasks(prev => [newTask, ...prev]);
      setNewTaskTitle('');
      setShowTaskCreation(false);

      // Обновляем статистику
      if (projectStats) {
        setProjectStats({
          total: projectStats.total + 1,
          completed: projectStats.completed,
          overdue: projectStats.overdue
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      // Возможно, добавить уведомление пользователю
    }
  };

  // Компонент пустого состояния
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
        <FolderOpen className="w-8 h-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-1">
        {t('todo.emptyProject') || 'No tasks in this project'}
      </h3>
      <p className="text-text-secondary mb-4">
        {t('todo.emptyProjectDescription') || 'Create a new task or add existing ones from all tasks'}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setShowTaskCreation(true)}
          className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium"
        >
          {t('todo.createFirstTask') || 'Create Task'}
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
        {/* Header with back button */}
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

          <div className="w-10"></div> {/* Spacer for alignment */}
        </header>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
            <h3 className="text-text-secondary text-sm font-medium mb-1">{t('dashboard.totalTasks')}</h3>
            <p className="text-2xl font-bold text-text-primary">
              {projectStats ? projectStats.total : projectTasks.length}
            </p>
          </div>
          <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
            <h3 className="text-text-secondary text-sm font-medium mb-1">{t('dashboard.completed')}</h3>
            <p className="text-2xl font-bold text-success">
              {projectStats ? projectStats.completed : projectTasks.filter(t => t.completed).length}
            </p>
          </div>
          <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
            <h3 className="text-text-secondary text-sm font-medium mb-1">{t('dashboard.overdue')}</h3>
            <p className="text-2xl font-bold text-error">
              {projectStats ? projectStats.overdue : 0}
            </p>
          </div>
        </div>

        {/* Project Tasks */}
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

          {/* Форма создания задачи */}
          {showTaskCreation && (
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTask()}
                placeholder={t('todo.addTaskPlaceholder') || 'Add a new task...'}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-bg-tertiary/50 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all placeholder:text-text-tertiary text-text-primary"
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
                className="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-bg-secondary transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3">
            {projectTasks.length === 0 ? (
              <EmptyState />
            ) : (
              projectTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTaskCompletion}
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
          projects={[]} // Pass projects if needed for cross-project moves
          onClose={() => setSelectedTask(null)}
          onSave={async (updatedTask) => {
            await updateTask(updatedTask.id, updatedTask);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

const TaskItem = ({ task, onToggleComplete, onEditDetails }: {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEditDetails: () => void;
}) => {
  const { t } = useTranslation();
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer ${
        task.completed
          ? 'border-border bg-bg-tertiary/30 opacity-60'
          : 'border-border hover:border-border-hover hover:shadow-sm'
      } ${isOverdue ? 'glow-error' : ''}`}
      onClick={onEditDetails}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent opening popup when completing task
          onToggleComplete(task.id);
        }}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
          task.completed
            ? 'bg-accent-gradient-1 border-transparent'
            : 'border-border hover:border-accent-primary'
        }`}
      >
        {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
      </button>

      <p className={`flex-1 font-medium ${
        task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
      }`}>
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
};


export default ProjectView;