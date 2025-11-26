import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProjectDashboardProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
  onBack: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ 
  projectId, 
  projectName, 
  projectDescription, 
  onBack 
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            ← {t('common.back')}
          </button>
          
          <div className="text-center flex-1 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-text-primary">{projectName}</h1>
            <p className="text-text-secondary mt-1">{projectDescription}</p>
          </div>
          
          <div className="w-10"></div> {/* Spacer for alignment */}
        </header>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
            <h3 className="text-text-secondary text-sm font-medium mb-1">{t('dashboard.totalTasks')}</h3>
            <p className="text-2xl font-bold text-text-primary">12</p>
          </div>
          <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
            <h3 className="text-text-secondary text-sm font-medium mb-1">{t('dashboard.completed')}</h3>
            <p className="text-2xl font-bold text-success">8</p>
          </div>
          <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
            <h3 className="text-text-secondary text-sm font-medium mb-1">{t('dashboard.pending')}</h3>
            <p className="text-2xl font-bold text-warning">4</p>
          </div>
        </div>

        {/* Project Tasks */}
        <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary">{t('todo.tasks')}</h2>
            <button className="px-4 py-2 bg-accent-gradient-1 text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
              + {t('common.add')}
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {[
              { id: '1', title: 'Research competitors', completed: true },
              { id: '2', title: 'Create wireframes', completed: true },
              { id: '3', title: 'Implement components', completed: false },
              { id: '4', title: 'Test with users', completed: false },
            ].map((task) => (
              <div 
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  task.completed 
                    ? 'border-border bg-bg-tertiary/30 opacity-60' 
                    : 'border-border hover:border-border-hover hover:shadow-sm'
                }`}
              >
                <button className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                  task.completed 
                    ? 'bg-accent-gradient-1 border-transparent' 
                    : 'border-border hover:border-accent-primary'
                }`}>
                  {task.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                
                <p className={`flex-1 font-medium ${
                  task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                }`}>
                  {task.title}
                </p>
                
                <button className="p-1.5 rounded-md hover:bg-bg-tertiary/50 text-text-secondary">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;