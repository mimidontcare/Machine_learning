import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'cyan' | 'default';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sublabel,
  icon,
  variant = 'default',
}) => {
  const getGlowColor = () => {
    switch (variant) {
      case 'emerald':
        return 'rgba(16, 185, 129, 0.15)';
      case 'amber':
        return 'rgba(245, 158, 11, 0.15)';
      case 'cyan':
        return 'rgba(6, 182, 212, 0.15)';
      default:
        return 'rgba(255, 255, 255, 0.05)';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'emerald':
        return 'var(--emerald-400)';
      case 'amber':
        return 'var(--amber-400)';
      case 'cyan':
        return 'var(--cyan-500)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <div className="stat-card">
      {icon && (
        <div
          className="stat-icon"
          style={{ background: getGlowColor(), color: getIconColor() }}
        >
          {icon}
        </div>
      )}
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sublabel && (
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};
