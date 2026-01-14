import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents, getQuizzes } from '@/lib/storage';
import { HackathonEvent, Quiz, Deadline } from '@/types';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'deadline' | 'quiz';
  datetime: string;
  deadlineType?: string;
  color: string;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setEvents(getEvents());
    setQuizzes(getQuizzes());
  }, []);

  // Generate calendar events from hackathon deadlines and quizzes
  // Filter out completed deadlines
  const calendarEvents: CalendarEvent[] = [
    ...events.flatMap(event => 
      event.deadlines
        .filter(deadline => !deadline.completed) // Only show incomplete deadlines
        .map(deadline => ({
          id: `${event.id}-${deadline.id}`,
          title: `${event.title} - ${deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)}`,
          type: 'deadline' as const,
          datetime: deadline.datetime,
          deadlineType: deadline.type,
          color: 'bg-primary',
        }))
    ),
    ...quizzes
      .filter(quiz => !quiz.completed) // Only show incomplete quizzes
      .map(quiz => ({
        id: quiz.id,
        title: quiz.quizName,
        type: 'quiz' as const,
        datetime: quiz.datetime,
        color: 'bg-accent',
      })),
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return calendarEvents.filter(event => {
      try {
        const eventDate = new Date(event.datetime);
        return isSameDay(eventDate, day);
      } catch {
        return false;
      }
    });
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground mt-1">
              View all your deadlines and events
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-xl">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <motion.button
                    key={day.toString()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'aspect-square p-1 rounded-lg transition-colors relative',
                      isCurrentMonth ? 'hover:bg-muted' : 'opacity-40',
                      isToday(day) && 'bg-primary/10',
                      isSelected && 'ring-2 ring-primary'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isToday(day) && 'text-primary'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={cn('w-1.5 h-1.5 rounded-full', event.color)}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Events */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-display font-semibold text-lg mb-4">
              {selectedDate 
                ? format(selectedDate, 'EEEE, MMMM d')
                : 'Select a date'
              }
            </h3>

            {selectedDate ? (
              selectedDayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No events on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'p-3 rounded-lg border-l-4',
                        event.type === 'deadline' ? 'border-l-primary bg-primary/5' : 'border-l-accent bg-accent/5'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground text-sm">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(event.datetime), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {event.type === 'deadline' 
                            ? event.deadlineType?.charAt(0).toUpperCase() + event.deadlineType?.slice(1) 
                            : 'Quiz'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Click on a date to see events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
