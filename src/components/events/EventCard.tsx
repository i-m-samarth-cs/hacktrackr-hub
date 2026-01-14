import { motion } from 'framer-motion';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  MoreVertical,
  MapPin,
  Trophy
} from 'lucide-react';
import { HackathonEvent } from '@/types';
import { PlatformBadge } from '@/components/ui/platform-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: HackathonEvent;
  onView?: (event: HackathonEvent) => void;
  onEdit?: (event: HackathonEvent) => void;
}

export function EventCard({ event, onView, onEdit }: EventCardProps) {
  const nextDeadline = event.deadlines
    .filter(d => !d.completed && new Date(d.datetime) > new Date())
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];

  const getUrgencyClass = () => {
    if (!nextDeadline) return '';
    const hoursLeft = differenceInHours(new Date(nextDeadline.datetime), new Date());
    if (hoursLeft < 24) return 'border-l-4 border-l-destructive';
    if (hoursLeft < 72) return 'border-l-4 border-l-warning';
    return '';
  };

  const completedChecklist = event.checklist.filter(c => c.isDone).length;
  const totalChecklist = event.checklist.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer',
        getUrgencyClass()
      )}
      onClick={() => onView?.(event)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <PlatformBadge platform={event.sourcePlatform} />
            <StatusBadge status={event.status} />
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground line-clamp-1">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{event.organizer}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
          e.stopPropagation();
          onEdit?.(event);
        }}>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Tags */}
      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {event.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {event.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{event.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{event.mode}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{event.teamSizeMin}-{event.teamSizeMax} members</span>
        </div>
      </div>

      {/* Next Deadline */}
      {nextDeadline && (
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium capitalize">
                {nextDeadline.type} Deadline
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {format(new Date(nextDeadline.datetime), 'MMM dd, HH:mm')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {differenceInDays(new Date(nextDeadline.datetime), new Date())} days left
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {totalChecklist > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completedChecklist}/{totalChecklist}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-300"
              style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Prize Pool */}
      {event.prizePool && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <Trophy className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-accent">{event.prizePool}</span>
        </div>
      )}
    </motion.div>
  );
}
