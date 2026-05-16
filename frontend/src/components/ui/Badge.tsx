import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variant === 'success' && 'bg-green-100 text-green-800',
      variant === 'warning' && 'bg-amber-100 text-amber-800',
      variant === 'error'   && 'bg-red-100 text-red-800',
      variant === 'info'    && 'bg-blue-100 text-blue-800',
      variant === 'neutral' && 'bg-gray-100 text-gray-700',
      className
    )}>
      {children}
    </span>
  );
}
