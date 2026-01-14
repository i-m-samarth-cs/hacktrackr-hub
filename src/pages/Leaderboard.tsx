import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Star, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { StatCard } from '@/components/ui/stat-card';
import { getEvents } from '@/lib/storage';
import { HackathonEvent, LeaderboardStats, ResultType } from '@/types';
import { cn } from '@/lib/utils';

const medalConfig: Record<ResultType, { icon: typeof Trophy; color: string; bgColor: string }> = {
  Winner: { icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  RunnerUp: { icon: Medal, color: 'text-slate-400', bgColor: 'bg-slate-400/10' },
  Finalist: { icon: Award, color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
  Participation: { icon: Star, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  NotSelected: { icon: Trophy, color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

export default function Leaderboard() {
  const [events, setEvents] = useState<HackathonEvent[]>([]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const completedEvents = events.filter(e => e.result);
  
  const stats: LeaderboardStats = {
    totalJoined: events.length,
    totalSubmitted: events.filter(e => e.status === 'Submitted' || e.status === 'Completed').length,
    wins: completedEvents.filter(e => e.result?.resultType === 'Winner').length,
    runnerUp: completedEvents.filter(e => e.result?.resultType === 'RunnerUp').length,
    finalist: completedEvents.filter(e => e.result?.resultType === 'Finalist').length,
    participation: completedEvents.filter(e => e.result?.resultType === 'Participation').length,
    totalPrize: completedEvents.reduce((sum, e) => sum + (e.result?.prizeAmount || 0), 0),
  };

  const sortedByResult = completedEvents.sort((a, b) => {
    const order: Record<ResultType, number> = {
      Winner: 0,
      RunnerUp: 1,
      Finalist: 2,
      Participation: 3,
      NotSelected: 4,
    };
    return order[a.result!.resultType] - order[b.result!.resultType];
  });

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Your achievements and statistics
          </p>
        </div>

        {/* Olympic Medal Board */}
        <div className="grid md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 text-center shadow-lg"
          >
            <Crown className="w-12 h-12 text-white mx-auto mb-3" />
            <p className="text-5xl font-display font-bold text-white">{stats.wins}</p>
            <p className="text-white/80 font-medium mt-1">Wins</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-300 to-slate-500 rounded-2xl p-6 text-center shadow-lg"
          >
            <Medal className="w-12 h-12 text-white mx-auto mb-3" />
            <p className="text-5xl font-display font-bold text-white">{stats.runnerUp}</p>
            <p className="text-white/80 font-medium mt-1">Runner-up</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-center shadow-lg"
          >
            <Award className="w-12 h-12 text-white mx-auto mb-3" />
            <p className="text-5xl font-display font-bold text-white">{stats.finalist}</p>
            <p className="text-white/80 font-medium mt-1">Finalist</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-center shadow-lg"
          >
            <Star className="w-12 h-12 text-white mx-auto mb-3" />
            <p className="text-5xl font-display font-bold text-white">{stats.participation}</p>
            <p className="text-white/80 font-medium mt-1">Participation</p>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            title="Total Hackathons"
            value={stats.totalJoined}
            icon={Trophy}
            description="Events joined"
          />
          <StatCard
            title="Submitted"
            value={stats.totalSubmitted}
            icon={TrendingUp}
            description="Projects completed"
          />
          <StatCard
            title="Total Prize Money"
            value={`$${stats.totalPrize.toLocaleString()}`}
            icon={Award}
            variant="accent"
          />
        </div>

        {/* Results Table */}
        <div>
          <h2 className="font-display font-semibold text-xl mb-4">Your Achievements</h2>
          
          {completedEvents.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No results yet"
              description="Complete hackathons and add your results to see them here"
            />
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Event</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Result</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Rank</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Prize</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedByResult.map((event, index) => {
                    const config = medalConfig[event.result!.resultType];
                    const Icon = config.icon;
                    return (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.organizer}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full', config.bgColor)}>
                            <Icon className={cn('w-4 h-4', config.color)} />
                            <span className={cn('text-sm font-medium', config.color)}>
                              {event.result!.resultType}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {event.result!.rank ? `#${event.result!.rank}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-foreground">
                          {event.result!.prizeAmount ? `$${event.result!.prizeAmount.toLocaleString()}` : '-'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
