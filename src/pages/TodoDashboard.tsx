import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check, Calendar, Flag, Search, Filter, User, LogOut, Sun, Moon, Globe, Trash2, Edit, MoreHorizontal, MoreVertical, List, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { tasksAPI } from '../lib/api/tasks.api';
import { projectsAPI } from '../lib/api/projects.api';
import { profileAPI } from '../lib/api/profile.api';
import ProfileSettings from '../components/layout/ProfileSettings';
import TaskDetailsPopup from '../components/layout/TaskDetailsPopup';
import ProjectCreationPopup from '../components/layout/ProjectCreationPopup';
import { Task, Project, UserProfile } from '../types/api.types';
import { useClickOutside } from '../hooks/useClickOutside';
import { twMerge } from 'tailwind-merge';

interface TodoDashboardProps {
  onSignOut: () => void;
  onProjectSelect?: (project: { id: string; name: string; description: string }) => void;
}

const TodoDashboard: React.FC<TodoDashboardProps> = ({ onSignOut, onProjectSelect }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<'all' | 'upcoming' | 'important' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{ priority: string | null; project_id: string | null }>({
    priority: null,
    project_id: null,
  });
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));
  useClickOutside(filterMenuRef, () => setShowFilters(false));

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [loadedTasks, loadedProjects, profile] = await Promise.all([
        tasksAPI.getAll(user.id),
        projectsAPI.getAll(user.id),
        profileAPI.getProfile(user.id)
      ]);
      setTasks(loadedTasks);
      setProjects(loadedProjects);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!user || !newTask.trim()) return;
    try {
      const createdTask = await tasksAPI.create({
        user_id: user.id,
        title: newTask.trim(),
        completed: false
      });
      setTasks(prev => [createdTask, ...prev]);
      setNewTask('');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await tasksAPI.update(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };
  
    const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await tasksAPI.update(id, { completed: !task.completed });
    } catch (error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    const originalTasks = tasks;
    setTasks(prev => prev.filter(task => task.id !== id));
    try {
      await tasksAPI.delete(id);
    } catch (error) {
      setTasks(originalTasks);
      toast.error('Failed to delete task');
    }
  };

  const hasOverdueTasks = tasks.some(task => task.due_date && new Date(task.due_date) < new Date() && !task.completed);

  const filteredTasks = tasks.filter(task => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    let isInView = true;
    if (currentView === 'upcoming') {
      if (!task.due_date) isInView = false;
      else {
        const dueDate = new Date(task.due_date);
        isInView = dueDate >= today && dueDate <= threeDaysFromNow;
      }
    } else if (currentView === 'important') {
      if (!task.due_date || task.completed) isInView = false;
      else {
        const dueDate = new Date(task.due_date);
        isInView = dueDate < today;
      }
    } else if (currentView === 'completed') {
      isInView = task.completed;
    }

    const priorityFilter = filters.priority ? task.priority === filters.priority : true;
    const projectFilter = filters.project_id ? task.project_id === filters.project_id : true;
    
    return isInView && priorityFilter && projectFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        <SkeletonLoader count={8} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-animated flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <h1 className="text-2xl font-bold text-gradient-animated bg-clip-text">
              Lumi
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 rounded-full bg-accent-gradient-1 flex items-center justify-center text-white font-medium overflow-hidden"
              >
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.email?.charAt(0).toUpperCase() || 'U'
                )}
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-60 bg-bg-primary rounded-xl shadow-xl border border-border py-2 z-50"
                  >
                    <button onClick={() => { setShowProfileSettings(true); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3">
                      <User className="w-4 h-4" /> {t('profile.settings')}
                    </button>
                    <button onClick={() => { document.documentElement.classList.toggle('dark'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3">
                      {document.documentElement.classList.contains('dark') ? <><Sun className="w-4 h-4" />{t('common.lightTheme')}</> : <><Moon className="w-4 h-4" />{t('common.darkTheme')}</>}
                    </button>
                    <button onClick={() => { i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3">
                      <Globe className="w-4 h-4" /> {i18n.language === 'en' ? 'Русский' : 'English'}
                    </button>
                    <hr className="my-2 border-border" />
                    <button onClick={onSignOut} className="w-full text-left px-4 py-2.5 hover:bg-error/10 text-error text-sm flex items-center gap-3">
                      <LogOut className="w-4 h-4" /> {t('common.logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
              <div className="space-y-1">
                <button className={twMerge(`w-full flex items-center gap-3 px-3 py-2 rounded-lg`, currentView === 'all' && 'bg-accent-primary/10 text-accent-primary font-medium')} onClick={() => setCurrentView('all')}>
                  <List className="w-5 h-5" /> <span>{t('todo.all')}</span>
                </button>
                <button className={twMerge(`w-full flex items-center gap-3 px-3 py-2 rounded-lg`, currentView === 'upcoming' && 'bg-accent-primary/10 text-accent-primary font-medium')} onClick={() => setCurrentView('upcoming')}>
                  <Calendar className="w-5 h-5" /> <span>{t('todo.deadline')}</span>
                </button>
                <button className={twMerge('w-full flex items-center gap-3 px-3 py-2 rounded-lg relative', currentView === 'important' && 'bg-accent-primary/10 text-accent-primary font-medium', hasOverdueTasks && currentView !== 'important' && 'animate-pulse glow-error')} onClick={() => setCurrentView('important')}>
                  <AlertCircle className={twMerge('w-5 h-5', hasOverdueTasks && currentView !== 'important' && 'text-error')} />
                  <span className={twMerge(hasOverdueTasks && currentView !== 'important' && 'text-error')}>{t('todo.overdue')}</span>
                </button>
                <button className={twMerge(`w-full flex items-center gap-3 px-3 py-2 rounded-lg`, currentView === 'completed' && 'bg-accent-primary/10 text-accent-primary font-medium')} onClick={() => setCurrentView('completed')}>
                  <CheckCircle className="w-5 h-5" /> <span>{t('todo.completed')}</span>
                </button>
              </div>
            </div>

            <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-text-primary">{t('todo.projects')}</h3>
                <button onClick={() => setShowProjectCreation(true)} className="text-accent-primary hover:underline text-sm">+ {t('common.add')}</button>
              </div>
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <button onClick={() => onProjectSelect && onProjectSelect(project)} className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-bg-tertiary/50 text-text-secondary flex justify-between items-center">
                      <div className="flex-1"><span>{project.name}</span><span className="block text-xs text-text-tertiary truncate">{project.description}</span></div>
                    </button>
                    <button onClick={() => deleteTask(project.id)} className="p-1.5 rounded-md hover:bg-error/10 text-error ml-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-text-primary">{t(`todo.${currentView}`)}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder={t('todo.searchPlaceholder') || 'Search tasks...'} className="pl-10 pr-4 py-2 rounded-xl border border-border bg-bg-tertiary/50 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary min-w-[180px]" />
                  </div>
                  <div className="relative" ref={filterMenuRef}>
                    <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-lg hover:bg-bg-tertiary/50 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-text-secondary" />
                    </button>
                    <AnimatePresence>
                      {showFilters && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-64 bg-bg-primary rounded-xl shadow-xl border border-border py-4 z-50">
                          <div className="px-4 mb-3 flex justify-between items-center">
                            <h4 className="font-semibold text-text-primary text-sm">{t('todo.filters')}</h4>
                            <button onClick={() => setFilters({ priority: null, project_id: null })} className="text-xs text-accent-primary hover:underline">{t('common.clear')}</button>
                          </div>
                          <div className="px-4 py-2">
                            <h5 className="text-xs font-semibold text-text-tertiary mb-2">{t('todo.priority.label')}</h5>
                            <div className="flex flex-col gap-1">
                              {(['high', 'medium', 'low'] as const).map(p => (
                                <button key={p} onClick={() => setFilters(f => ({ ...f, priority: p }))} className={twMerge("w-full text-left px-3 py-1.5 rounded-lg text-sm capitalize", filters.priority === p ? 'bg-accent-primary/10 text-accent-primary' : 'hover:bg-bg-secondary')}>
                                  {t(`todo.priority.${p}`)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="px-4 mt-4 py-2">
                            <h5 className="text-xs font-semibold text-text-tertiary mb-2">{t('todo.project')}</h5>
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                              {projects.map(p => (
                                <button key={p.id} onClick={() => setFilters(f => ({ ...f, project_id: p.id }))} className={twMerge("w-full text-left px-3 py-1.5 rounded-lg text-sm truncate", filters.project_id === p.id ? 'bg-accent-primary/10 text-accent-primary' : 'hover:bg-bg-secondary')}>
                                  {p.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {currentView === 'all' && (
                <div className="relative mb-6">
                  <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} placeholder={t('todo.addTaskPlaceholder') || 'Add a new task...'} className="w-full px-4 py-3 rounded-xl border border-border bg-bg-tertiary/50 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all placeholder:text-text-tertiary text-text-primary" />
                  <button onClick={addTask} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-bg-secondary transition-colors">
                    <Plus className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {filteredTasks.length === 0 ? <EmptyState /> : filteredTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} onToggleComplete={toggleComplete} onEditDetails={() => setSelectedTask(task)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProfileSettings && <ProfileSettings isOpen={showProfileSettings} onClose={() => setShowProfileSettings(false)} />}
      {selectedTask && <TaskDetailsPopup task={selectedTask} projects={projects} onClose={() => setSelectedTask(null)} onSave={async (updatedTask) => { await updateTask(updatedTask.id, updatedTask); setSelectedTask(null); }} />}
      {showProjectCreation && <ProjectCreationPopup isOpen={showProjectCreation} onClose={() => setShowProjectCreation(false)} onCreateProject={async (project) => { if (user) { try { const newProject = await projectsAPI.create({ user_id: user.id, name: project.name, description: project.description }); setProjects(prev => [...prev, newProject]); setShowProjectCreation(false); } catch (error) { console.error('Failed to create project:', error); } } }} />}
    </div>
  );
};

const TaskItem = ({ task, onUpdate, onDelete, onToggleComplete, onEditDetails }: {
  task: Task,
  onUpdate: (id: string, updates: Partial<Task>) => void,
  onDelete: (id: string) => void,
  onToggleComplete: (id: string) => void,
  onEditDetails: (task: Task) => void
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(task.title);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const handleSave = () => {
    if (editingTitle.trim() && editingTitle !== task.title) {
      onUpdate(task.id, { title: editingTitle });
    }
    setIsEditing(false);
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  return (
    <div className={twMerge('flex items-start gap-3 p-4 rounded-xl border transition-all', task.completed && 'border-border bg-bg-tertiary/30 opacity-60', !task.completed && 'border-border hover:border-border-hover hover:shadow-sm', isOverdue && 'glow-error')}>
      <button onClick={() => onToggleComplete(task.id)} className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 ${task.completed ? 'bg-accent-gradient-1 border-transparent' : 'border-border hover:border-accent-primary'}`}>
        {task.completed && <Check className="w-4 h-4 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSave()} onBlur={handleSave} className="w-full bg-transparent border-b border-accent-primary focus:outline-none" autoFocus />
        ) : (
          <p className={`cursor-pointer font-medium ${task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`} onClick={() => onEditDetails(task)}>
            {task.title}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
          {task.due_date && <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-bg-tertiary/50 text-text-secondary"><Calendar className="w-3 h-3" /><span>{task.due_date}</span></div>}
          {task.priority && <div className={twMerge('px-2 py-1 rounded-md flex items-center gap-1', task.priority === 'high' && 'bg-error/10 text-error border-error', task.priority === 'medium' && 'bg-warning/10 text-warning border-warning', task.priority === 'low' && 'bg-success/10 text-success border-success')}><Flag className="w-3 h-3" /><span className="capitalize">{t(`todo.priority.${task.priority}`)}</span></div>}
        </div>
      </div>
      <div className="relative">
        <button onClick={() => setShowMoreOptions(!showMoreOptions)} className="p-1.5 rounded-md hover:bg-bg-tertiary/50">
          <MoreHorizontal className="w-4 h-4 text-text-secondary" />
        </button>
        {showMoreOptions && (
          <div className="absolute right-0 mt-1 w-40 bg-bg-primary rounded-lg shadow-lg border border-border py-1 z-10">
            <button onClick={() => { onEditDetails(task); setShowMoreOptions(false); }} className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-text-secondary hover:bg-bg-secondary"><Edit className="w-4 h-4" /> {t('common.edit')}</button>
            <button onClick={() => onDelete(task.id)} className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-error hover:bg-error/10"><Trash2 className="w-4 h-4" /> {t('common.delete')}</button>
          </div>
        )}
      </div>
    </div>
  );
};

const SkeletonLoader = ({ count = 5 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="h-16 bg-bg-secondary animate-pulse rounded-xl" />
    ))}
  </div>
);

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-1">{t('todo.noTasksTitle')}</h3>
      <p className="text-text-secondary mb-4">{t('todo.noTasksDescription')}</p>
      <button onClick={() => document.querySelector('input[placeholder*="Add"]')?.focus()} className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium">
        {t('todo.createFirstTask')}
      </button>
    </div>
  );
};

export default TodoDashboard;