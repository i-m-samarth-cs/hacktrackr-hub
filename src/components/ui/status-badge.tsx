import { cn } from '@/lib/utils';
import { EventStatus } from '@/types';

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  Planning: { 
    label: 'Planning', 
    className: 'bg-slate-100 text-slate-700 border-slate-200' 
  },
  Registered: { 
    label: 'Registered', 
    className: 'bg-blue-100 text-blue-700 border-blue-200' 
  },
  Working: { 
    label: 'In Progress', 
    className: 'bg-amber-100 text-amber-700 border-amber-200' 
  },
  Submitted: { 
    label: 'Submitted', 
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200' 
  },
  ResultAwaited: { 
    label: 'Awaiting Result', 
    className: 'bg-purple-100 text-purple-700 border-purple-200' 
  },
  Completed: { 
    label: 'Completed', 
    className: 'bg-green-100 text-green-700 border-green-200' 
  },
};

interface StatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
