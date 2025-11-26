import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface ProjectCreationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: { name: string; description: string }) => void;
}

const ProjectCreationPopup: React.FC<ProjectCreationPopupProps> = ({ 
  isOpen, 
  onClose, 
  onCreateProject 
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateProject({ name, description });
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-bg-primary rounded-2xl shadow-2xl border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-bg-secondary flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            {t('projects.createProject') || 'Create Project'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('projects.projectName') || 'Project Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary"
                placeholder={t('projects.projectNamePlaceholder') || 'Enter project name...'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('projects.projectDescription') || 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-bg-secondary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-text-primary min-h-[100px]"
                placeholder={t('projects.descriptionPlaceholder') || 'Enter project description...'}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-bg-secondary text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium hover:shadow-lg transition-shadow"
              >
                {t('common.create') || 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationPopup;