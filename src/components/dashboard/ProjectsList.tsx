import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Project } from '../../types/api.types';

interface ProjectsListProps {
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
  setShowProjectCreation: (show: boolean) => void;
  handleDeleteTask: (id: string) => void; // NOTE: This should be handleDeleteProject in a proper implementation
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  onProjectSelect,
  setShowProjectCreation,
  handleDeleteTask,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-bg-secondary/50 rounded-2xl p-4 sm:p-6 border border-border">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h3 className="font-semibold text-text-primary text-lg">{t('todo.projects')}</h3>
        <button
          onClick={() => setShowProjectCreation(true)}
          className="text-accent-primary hover:underline text-sm whitespace-nowrap"
        >
          + {t('common.add')}
        </button>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg border border-border bg-transparent hover:bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none"
          >
            <button
              onClick={() => onProjectSelect && onProjectSelect(project)}
              className="flex-1 text-left text-text-secondary w-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1">
                <span className="font-medium truncate">{project.name}</span>
                <span className="block text-xs text-text-tertiary truncate sm:hidden">
                  {project.description}
                </span>
              </div>
              <span className="hidden sm:block text-xs text-text-tertiary truncate">
                {project.description}
              </span>
            </button>
            <div className="flex justify-end sm:justify-start">
              <button
                onClick={() => handleDeleteTask(project.id)}
                className="p-1.5 rounded-md hover:bg-error/10 text-error"
                aria-label={t('common.delete') || 'Delete project'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsList;
