import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check, Calendar, Flag, Search, Filter, User, LogOut, Sun, Moon, Globe, Trash2, Edit, MoreHorizontal, MoreVertical, List, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileSettings from '../components/layout/ProfileSettings';
import TaskDetailsPopup from '../components/layout/TaskDetailsPopup';
import ProjectCreationPopup from '../components/layout/ProjectCreationPopup';

// Define Task interface
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

interface TodoDashboardProps {
  onSignOut: () => void;
  onProjectSelect?: (project: { id: string; name: string; description: string }) => void;
}

const TodoDashboard: React.FC<TodoDashboardProps> = ({ onSignOut, onProjectSelect }) => {
  const { t, i18n } = useTranslation();

  // States
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Setup project structure', completed: true, priority: 'high' },
    { id: '2', title: 'Design landing page', completed: false, priority: 'medium' },
    { id: '3', title: 'Implement auth system', completed: false, priority: 'high' },
  ]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<'all' | 'upcoming' | 'important' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState([
    { id: '1', name: 'Personal', description: 'My personal tasks', createdAt: '2025-01-01' },
    { id: '2', name: 'Work', description: 'Professional tasks', createdAt: '2025-01-01' },
    { id: '3', name: 'Shopping', description: 'Shopping lists', createdAt: '2025-01-01' },
  ]);
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Add new task
  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObj: Task = {
        id: Date.now().toString(),
        title: newTask.trim(),
        completed: false,
      };
      setTasks([newTaskObj, ...tasks]);
      setNewTask('');
    }
  };

  // Toggle task completion
  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Update task
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  // Delete task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Check for overdue tasks
  const today = new Date();
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  });

  // Check if there are any overdue tasks
  const hasOverdueTasks = overdueTasks.length > 0;

  // Filter tasks based on current view
  const filteredTasks = tasks.filter(task => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    if (currentView === 'all') {
      return true;
    } else if (currentView === 'upcoming') {
      // Tasks with due date in next 3 days (deadline view)
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= threeDaysFromNow;
    } else if (currentView === 'important') {
      // Overdue tasks (past due date but not completed)
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today;
    } else if (currentView === 'completed') {
      return task.completed;
    }
    return true;
  });

  // Create new project
  const createNewProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now().toString(),
        name: newProjectName,
        description: newProjectDescription,
        createdAt: new Date().toISOString(),
      };
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowProjectCreation(false);
    }
  };

  // Delete project
  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(project => project.id !== projectId));
    // Also remove project reference from tasks
    setTasks(tasks.map(task => 
      task.projectId === projectId ? { ...task, projectId: undefined, projectName: undefined } : task
    ));
  };

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
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 rounded-full bg-accent-gradient-1 flex items-center justify-center text-white font-medium"
              >
                U
              </button>
              
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-60 bg-bg-primary rounded-xl shadow-xl border border-border py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => {
                        setShowProfileSettings(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3"
                    >
                      <User className="w-4 h-4" />
                      {t('profile.settings')}
                    </button>
                    
                    <button 
                      onClick={() => {
                        // Toggle theme
                        document.documentElement.classList.toggle('dark');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3"
                    >
                      {document.documentElement.classList.contains('dark') ? (
                        <>
                          <Sun className="w-4 h-4" />
                          {t('common.lightTheme')}
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4" />
                          {t('common.darkTheme')}
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => {
                        // Toggle language
                        i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary text-text-primary text-sm flex items-center gap-3"
                    >
                      <Globe className="w-4 h-4" />
                      {i18n.language === 'en' ? 'Русский' : 'English'}
                    </button>
                    
                    <hr className="my-2 border-border" />
                    
                    <button 
                      onClick={onSignOut}
                      className="w-full text-left px-4 py-2.5 hover:bg-error/10 text-error text-sm flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('common.logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
              <div className="space-y-1">
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
                    currentView === 'all'
                      ? 'bg-accent-primary/10 text-accent-primary font-medium'
                      : 'hover:bg-bg-tertiary/50 text-text-secondary'
                  }`}
                  onClick={() => setCurrentView('all')}
                >
                  <List className="w-5 h-5" />
                  <span>{t('todo.all')}</span>
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
                    currentView === 'upcoming'
                      ? 'bg-accent-primary/10 text-accent-primary font-medium'
                      : 'hover:bg-bg-tertiary/50 text-text-secondary'
                  }`}
                  onClick={() => setCurrentView('upcoming')}
                >
                  <Calendar className="w-5 h-5" />
                  <span>{t('todo.deadline')}</span>
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg relative ${
                    currentView === 'important'
                      ? 'bg-accent-primary/10 text-accent-primary font-medium'
                      : 'hover:bg-bg-tertiary/50 text-text-secondary'
                  } ${
                    hasOverdueTasks && currentView !== 'important'
                      ? 'animate-pulse'
                      : ''
                  }`}
                  onClick={() => setCurrentView('important')}
                >
                  <AlertCircle className={`w-5 h-5 ${
                    hasOverdueTasks && currentView !== 'important' ? 'text-error' : ''
                  }`} />
                  <span className={`${hasOverdueTasks && currentView !== 'important' ? 'text-error' : ''}`}>{t('todo.overdue')}</span>
                  {hasOverdueTasks && currentView !== 'important' && (
                    <div className="absolute inset-0 rounded-lg border border-error animate-ping opacity-75 pointer-events-none"></div>
                  )}
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
                    currentView === 'completed'
                      ? 'bg-accent-primary/10 text-accent-primary font-medium'
                      : 'hover:bg-bg-tertiary/50 text-text-secondary'
                  }`}
                  onClick={() => setCurrentView('completed')}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{t('todo.completed')}</span>
                </button>
              </div>
            </div>

            <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-text-primary">{t('todo.projects')}</h3>
                <button 
                  onClick={() => setShowProjectCreation(true)}
                  className="text-accent-primary hover:underline text-sm"
                >
                  + {t('common.add')}
                </button>
              </div>
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <button 
                      onClick={() => onProjectSelect && onProjectSelect({ id: project.id, name: project.name, description: project.description })}
                      className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-bg-tertiary/50 text-text-secondary flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <span>{project.name}</span>
                        <span className="block text-xs text-text-tertiary truncate">{project.description}</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => deleteProject(project.id)}
                      className="p-1.5 rounded-md hover:bg-error/10 text-error ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-text-primary">
                  {currentView === 'all' ? t('todo.all') :
                   currentView === 'upcoming' ? t('todo.deadline') :
                   currentView === 'important' ? t('todo.overdue') :
                   t('todo.completed')}
                </h2>
                
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-5 h-5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('todo.searchPlaceholder') || 'Search tasks...'}
                      className="pl-10 pr-4 py-2 rounded-xl border border-border bg-bg-tertiary/50 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary min-w-[180px]"
                    />
                  </div>

                  {/* Filter and Sort Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="p-2 rounded-lg hover:bg-bg-tertiary/50 flex items-center gap-2"
                    >
                      <Filter className="w-5 h-5 text-text-secondary" />
                    </button>
                    
                    {showFilters && (
                      <div className="absolute right-0 mt-2 w-64 bg-bg-primary rounded-xl shadow-xl border border-border py-4 z-50">
                        <div className="px-4 mb-3">
                          <h4 className="font-semibold text-text-primary text-sm">{t('todo.filters')}</h4>
                        </div>
                        
                        <div className="px-4 py-2">
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-secondary text-text-primary text-sm mb-1">
                            {t('todo.filterByPriority')}
                          </button>
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-secondary text-text-primary text-sm mb-1">
                            {t('todo.filterByDate')}
                          </button>
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-secondary text-text-primary text-sm">
                            {t('todo.filterByProject')}
                          </button>
                        </div>
                        
                        <div className="px-4 mt-4 mb-2">
                          <h4 className="font-semibold text-text-primary text-sm">{t('todo.sorting')}</h4>
                        </div>
                        
                        <div className="px-4 py-2">
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-secondary text-text-primary text-sm mb-1">
                            {t('todo.sortByDate')}
                          </button>
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-secondary text-text-primary text-sm mb-1">
                            {t('todo.sortByPriority')}
                          </button>
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-secondary text-text-primary text-sm">
                            {t('todo.sortByName')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Add - only show on 'all' view */}
              {currentView === 'all' && (
                <div className="relative mb-6">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder={t('todo.addTaskPlaceholder') || 'Add a new task...'}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-tertiary/50 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all placeholder:text-text-tertiary text-text-primary"
                  />
                  <button
                    onClick={addTask}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <Plus className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
              )}

              {/* Task List */}
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    onToggleComplete={toggleComplete}
                    onEditDetails={(task) => setSelectedTask(task)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettings 
        isOpen={showProfileSettings} 
        onClose={() => setShowProfileSettings(false)} 
      />

      {/* Task Details Popup */}
      {selectedTask && (
        <TaskDetailsPopup 
          task={selectedTask}
          projects={projects}
          onClose={() => setSelectedTask(null)} 
          onSave={(updatedTask) => {
            updateTask(updatedTask.id, updatedTask);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Project Creation Popup */}
      <ProjectCreationPopup
        isOpen={showProjectCreation}
        onClose={() => setShowProjectCreation(false)}
        onCreateProject={(project) => {
          setProjects([...projects, {
            ...project,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
          }]);
          setShowProjectCreation(false);
        }}
      />
    </div>
  );
};

// TaskItem component definition
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
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleSave = () => {
    if (editingTitle.trim()) {
      onUpdate(task.id, { title: editingTitle });
      setIsEditing(false);
    }
  };

  const handlePriorityClick = (priority: 'low' | 'medium' | 'high') => {
    onUpdate(task.id, { priority });
    setShowPriorityOptions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingTitle(task.title);
      setIsEditing(false);
    }
  };

  const priorityColors = {
    low: 'bg-success/10 text-success border-success',
    medium: 'bg-warning/10 text-warning border-warning',
    high: 'bg-error/10 text-error border-error'
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${
      task.completed 
        ? 'border-border bg-bg-tertiary/30 opacity-60' 
        : 'border-border hover:border-border-hover hover:shadow-sm transition-all'
    }`}>
      <button 
        onClick={() => onToggleComplete(task.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 ${
          task.completed 
            ? 'bg-accent-gradient-1 border-transparent' 
            : 'border-border hover:border-accent-primary'
        }`}
      >
        {task.completed && <Check className="w-4 h-4 text-white" />}
      </button>
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-full bg-transparent border-b border-accent-primary focus:outline-none focus:pb-0 pb-0"
            autoFocus
          />
        ) : (
          <p 
            className={`cursor-pointer font-medium ${
              task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
            }`}
            onClick={() => onEditDetails(task)}
          >
            {task.title}
          </p>
        )}
        
        {/* Task Metadata */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
          {task.dueDate && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-bg-tertiary/50 text-text-secondary">
              <Calendar className="w-3 h-3" />
              <span>{task.dueDate}</span>
            </div>
          )}
          
          {task.priority && (
            <div className={`px-2 py-1 rounded-md ${priorityColors[task.priority]} flex items-center gap-1`}>
              <Flag className="w-3 h-3" />
              <span className="capitalize">{t(`todo.priority.${task.priority}`)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Task Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEditDetails(task)}
          className="p-1.5 rounded-md hover:bg-bg-tertiary/50"
        >
          <Edit className="w-4 h-4 text-text-secondary" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowPriorityOptions(!showPriorityOptions)}
            className="p-1.5 rounded-md hover:bg-bg-tertiary/50"
          >
            <Flag className="w-4 h-4 text-text-secondary" />
          </button>

          {showPriorityOptions && (
            <div className="absolute right-0 mt-1 w-32 bg-bg-primary rounded-lg shadow-lg border border-border py-1 z-10">
              {(['low', 'medium', 'high'] as const).map(priority => (
                <button
                  key={priority}
                  onClick={() => handlePriorityClick(priority)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${
                    task.priority === priority
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <Flag className={`w-3 h-3 ${priority === 'high' ? 'text-error' : priority === 'medium' ? 'text-warning' : 'text-success'}`} />
                  <span className="capitalize">{t(`todo.priority.${priority}`)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="p-1.5 rounded-md hover:bg-bg-tertiary/50"
          >
            <MoreHorizontal className="w-4 h-4 text-text-secondary" />
          </button>

          {showMoreOptions && (
            <div className="absolute right-0 mt-1 w-40 bg-bg-primary rounded-lg shadow-lg border border-border py-1 z-10">
              <button
                onClick={() => {
                  setShowMoreOptions(false);
                  onEditDetails(task);
                }}
                className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-text-secondary hover:bg-bg-secondary"
              >
                <Edit className="w-4 h-4" /> {t('common.edit')}
              </button>
              <button
                onClick={() => {
                  setShowMoreOptions(false);
                  onDelete(task.id);
                }}
                className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-error hover:bg-error/10"
              >
                <Trash2 className="w-4 h-4" /> {t('common.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoDashboard;