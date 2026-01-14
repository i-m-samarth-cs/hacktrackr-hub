import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  variant?: 'default' | 'primary' | 'accent' | 'success';
  className?: string;
}

const variants = {
  default: 'bg-card border-border',
  primary: 'gradient-primary border-primary/20',
  accent: 'gradient-accent border-accent/20',
  success: 'gradient-success border-success/20',
};

const iconVariants = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-white/20 text-white',
  accent: 'bg-white/20 text-white',
  success: 'bg-white/20 text-white',
};

const textVariants = {
  default: 'text-foreground',
  primary: 'text-white',
  accent: 'text-white',
  success: 'text-white',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-xl border p-5 shadow-sm',
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'text-sm font-medium',
            variant === 'default' ? 'text-muted-foreground' : 'text-white/80'
          )}>
            {title}
          </p>
          <p className={cn(
            'text-3xl font-display font-bold mt-1',
            textVariants[variant]
          )}>
            {value}
          </p>
          {description && (
            <p className={cn(
              'text-sm mt-1',
              variant === 'default' ? 'text-muted-foreground' : 'text-white/70'
            )}>
              {description}
            </p>
          )}
          {trend && (
            <p className={cn(
              'text-sm mt-2 font-medium',
              trend.positive ? 'text-emerald-500' : 'text-red-500'
            )}>
              {trend.positive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl',
          iconVariants[variant]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
