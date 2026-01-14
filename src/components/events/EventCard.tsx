import { motion } from 'framer-motion';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  MoreVertical,
  MapPin,
  Trophy,
  CheckCircle2,
  CheckCircle
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
  onUpdate?: (event: HackathonEvent) => void;
}

export function EventCard({ event, onView, onEdit, onUpdate }: EventCardProps) {
  const nextDeadline = event.deadlines
    .filter(d => !d.completed && new Date(d.datetime) > new Date())
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];

  const handleMarkDeadlineComplete = (deadlineId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedDeadlines = event.deadlines.map(d => 
      d.id === deadlineId ? { ...d, completed: true } : d
    );
    const updatedEvent = { ...event, deadlines: updatedDeadlines, updatedAt: new Date().toISOString() };
    onUpdate?.(updatedEvent);
  };

  const handleMarkSubmissionDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedEvent = { 
      ...event, 
      status: 'Submitted' as const,
      updatedAt: new Date().toISOString() 
    };
    onUpdate?.(updatedEvent);
  };

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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {format(new Date(nextDeadline.datetime), 'MMM dd, HH:mm')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => handleMarkDeadlineComplete(nextDeadline.id, e)}
                title="Mark deadline as completed"
              >
                <CheckCircle2 className="w-4 h-4 text-success" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {differenceInDays(new Date(nextDeadline.datetime), new Date())} days left
          </p>
        </div>
      )}

      {/* Completed Deadlines */}
      {event.deadlines.filter(d => d.completed).length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Completed Deadlines:</p>
          <div className="flex flex-wrap gap-2">
            {event.deadlines
              .filter(d => d.completed)
              .map(deadline => (
                <Badge key={deadline.id} variant="outline" className="text-xs gap-1">
                  <CheckCircle className="w-3 h-3 text-success" />
                  {deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Mark Submission Button */}
      {event.status !== 'Submitted' && event.status !== 'Completed' && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mb-4 gap-2"
          onClick={(e) => handleMarkSubmissionDone(e)}
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark Submission Done
        </Button>
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
