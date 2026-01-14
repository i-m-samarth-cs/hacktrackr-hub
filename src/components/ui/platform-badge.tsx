import { cn } from '@/lib/utils';
import { Platform } from '@/types';

const platformColors: Record<Platform, { bg: string; text: string; border: string }> = {
  HackQuest: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  WhereUElevate: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Unstop: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  DoraHacks: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Devpost: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  Devfolio: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  Naukri: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Devnovate: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  LabLabAI: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  Other: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const colors = platformColors[platform];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {platform}
    </span>
  );
}
