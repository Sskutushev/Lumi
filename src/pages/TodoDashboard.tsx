import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check, Calendar, Flag, MoreHorizontal, Search, Filter, Settings } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

const TodoDashboard = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Setup project structure', completed: true, priority: 'high' },
    { id: '2', title: 'Design landing page', completed: false, priority: 'medium' },
    { id: '3', title: 'Implement auth system', completed: false, priority: 'high' },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObj: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Lumi</h1>
            <p className="text-text-secondary">{t('todo.inbox')}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-bg-secondary transition-colors">
              <Settings className="w-5 h-5 text-text-secondary" />
            </button>
            <button className="w-10 h-10 rounded-full bg-accent-gradient-1 flex items-center justify-center text-white font-medium">
              U
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-accent-primary/10 text-accent-primary font-medium">
                  <Check className="w-5 h-5" />
                  <span>{t('todo.inbox')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-tertiary/50 text-text-secondary">
                  <Calendar className="w-5 h-5" />
                  <span>{t('todo.today')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-tertiary/50 text-text-secondary">
                  <Calendar className="w-5 h-5" />
                  <span>{t('todo.upcoming')}</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-tertiary/50 text-text-secondary">
                  <Flag className="w-5 h-5" />
                  <span>{t('todo.important')}</span>
                </button>
              </div>
            </div>

            <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
              <h3 className="font-semibold text-text-primary mb-4">{t('todo.projects')}</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-tertiary/50 text-text-secondary">
                  Personal
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-tertiary/50 text-text-secondary">
                  Work
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-tertiary/50 text-text-secondary">
                  Shopping
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text-primary">{t('todo.inbox')}</h2>
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-lg hover:bg-bg-tertiary/50">
                    <Search className="w-5 h-5 text-text-secondary" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-bg-tertiary/50">
                    <Filter className="w-5 h-5 text-text-secondary" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-bg-tertiary/50">
                    <Settings className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
              </div>

              {/* Quick Add */}
              <div className="relative mb-6">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder={t('todo.quickAdd')}
                  className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-accent-primary focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 bg-bg-tertiary/30 outline-none transition-all placeholder:text-text-tertiary"
                />
                <button 
                  onClick={addTask}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  <Plus className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      task.completed 
                        ? 'border-border bg-bg-tertiary/30 opacity-60' 
                        : 'border-border hover:border-border-hover hover:shadow-sm transition-all'
                    }`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                        task.completed 
                          ? 'bg-accent-gradient-1 border-transparent' 
                          : 'border-border hover:border-accent-primary'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4 text-white" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${
                        task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                      }`}>
                        {task.title}
                      </p>
                    </div>
                    
                    {task.priority && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-error/10 text-error' :
                        task.priority === 'medium' ? 'bg-warning/10 text-warning' :
                        'bg-success/10 text-success'
                      }`}>
                        {task.priority}
                      </div>
                    )}
                    
                    <button className="p-1.5 rounded-md hover:bg-bg-tertiary/50">
                      <MoreHorizontal className="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoDashboard;