import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  alert?: boolean;
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon, iconBg, alert, className }: Props) {
  return (
    <div className={cn('bg-card border rounded-l p-5 flex flex-col gap-3', alert ? 'border-error/40' : 'border-border', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={cn('w-9 h-9 rounded-m flex items-center justify-center', iconBg ?? 'bg-muted')}>
          {icon}
        </div>
      </div>
      <div>
        <div className={cn('text-2xl font-bold', alert ? 'text-error' : 'text-foreground')}>{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
