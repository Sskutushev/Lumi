import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  actions?: React.ReactNode[];
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action,
  actions
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
        {icon || <FolderOpen className="w-8 h-8 text-text-tertiary" />}
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-text-secondary mb-4">
        {description}
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        {action && action}
        {actions && actions.map((act, idx) => (
          <React.Fragment key={idx}>{act}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;