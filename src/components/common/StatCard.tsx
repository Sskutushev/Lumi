import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'accent';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color = 'default' }) => {
  const colorClasses = {
    default: 'text-text-primary',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
    accent: 'text-accent-primary'
  };

  return (
    <div className="bg-bg-secondary/50 rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-1">{label}</h3>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-bg-tertiary/50`}>
          <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;