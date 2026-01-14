import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  Target,
  BookOpen,
  Zap,
  ArrowRight
} from 'lucide-react';
import { format, differenceInDays, differenceInHours, isAfter } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { EventCard } from '@/components/events/EventCard';
import { AddEventDialog } from '@/components/events/AddEventDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents, addEvent, updateEvent, getQuizzes } from '@/lib/storage';
import { HackathonEvent, Quiz, Deadline, LeaderboardStats } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);

  useEffect(() => {
    setEvents(getEvents());
    setQuizzes(getQuizzes());
  }, []);

  // Refresh data when window gains focus (user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      setEvents(getEvents());
      setQuizzes(getQuizzes());
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const upcomingDeadlines = events
    .flatMap(event => 
      (event.deadlines || [])
        .filter(d => {
          if (d.completed) return false;
          try {
            const deadlineDate = new Date(d.datetime);
            return !isNaN(deadlineDate.getTime()) && isAfter(deadlineDate, new Date());
          } catch {
            return false;
          }
        })
        .map(d => ({ ...d, eventTitle: event.title, eventId: event.id }))
    )
    .sort((a, b) => {
      try {
        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
      } catch {
        return 0;
      }
    })
    .slice(0, 10);

  const stats: LeaderboardStats = {
    totalJoined: events.length,
    totalSubmitted: events.filter(e => e.status === 'Submitted' || e.status === 'Completed').length,
    wins: events.filter(e => e.result?.resultType === 'Winner').length,
    runnerUp: events.filter(e => e.result?.resultType === 'RunnerUp').length,
    finalist: events.filter(e => e.result?.resultType === 'Finalist').length,
    participation: events.filter(e => e.result?.resultType === 'Participation').length,
    totalPrize: events.reduce((sum, e) => sum + (e.result?.prizeAmount || 0), 0),
  };

  const recentEvents = events
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const handleAddEvent = (event: HackathonEvent) => {
    addEvent(event);
    setEvents(getEvents());
  };

  const handleUpdateEvent = (event: HackathonEvent) => {
    updateEvent(event);
    setEvents(getEvents());
  };

  const getUrgencyColor = (datetime: string) => {
    const hours = differenceInHours(new Date(datetime), new Date());
    if (hours < 24) return 'destructive';
    if (hours < 72) return 'warning';
    return 'secondary';
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your hackathons and quizzes
            </p>
          </div>
          <Button onClick={() => setShowAddEvent(true)} className="gradient-primary gap-2">
            <Plus className="w-4 h-4" />
            Add Hackathon
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Hackathons"
            value={stats.totalJoined}
            icon={Trophy}
            variant="primary"
          />
          <StatCard
            title="Submitted"
            value={stats.totalSubmitted}
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Wins"
            value={stats.wins}
            icon={Zap}
            variant="accent"
          />
          <StatCard
            title="Quizzes"
            value={quizzes.length}
            icon={BookOpen}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Deadlines */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl">Upcoming Deadlines</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')} className="gap-1">
                View Calendar <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6">
                <EmptyState
                  icon={CalendarIcon}
                  title="No upcoming deadlines"
                  description="Add a hackathon and set deadlines to see them here"
                />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {upcomingDeadlines.map((deadline) => (
                  <motion.div
                    key={deadline.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{deadline.eventTitle}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {deadline.type} Deadline
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getUrgencyColor(deadline.datetime) as any}>
                        {differenceInDays(new Date(deadline.datetime), new Date())} days left
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(deadline.datetime), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-display font-semibold text-xl mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddEvent(true)}
                className="w-full p-4 bg-card border border-border rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Add Hackathon</p>
                  <p className="text-sm text-muted-foreground">Track a new event</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/quizzes')}
                className="w-full p-4 bg-card border border-border rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Add Quiz</p>
                  <p className="text-sm text-muted-foreground">Track a quiz or test</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/leaderboard')}
                className="w-full p-4 bg-card border border-border rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">View Leaderboard</p>
                  <p className="text-sm text-muted-foreground">See your achievements</p>
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl">Recent Events</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/hackathons')} className="gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {recentEvents.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No hackathons yet"
              description="Start tracking your hackathon journey by adding your first event"
              actionLabel="Add Hackathon"
              onAction={() => setShowAddEvent(true)}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={() => navigate(`/hackathons/${event.id}`)}
                  onUpdate={handleUpdateEvent}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddEventDialog
        open={showAddEvent}
        onOpenChange={setShowAddEvent}
        onSubmit={handleAddEvent}
      />
    </MainLayout>
  );
}
