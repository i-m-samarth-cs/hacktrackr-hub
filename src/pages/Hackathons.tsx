import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Grid, List, Trophy } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { EventCard } from '@/components/events/EventCard';
import { AddEventDialog } from '@/components/events/AddEventDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getEvents, addEvent, updateEvent, saveEvents } from '@/lib/storage';
import { HackathonEvent, Platform, EventStatus } from '@/types';
import { cn } from '@/lib/utils';

const platforms: Platform[] = [
  'HackQuest', 'WhereUElevate', 'Unstop', 'DoraHacks', 
  'Devpost', 'Devfolio', 'Naukri', 'Devnovate', 'LabLabAI', 'Other'
];

const statuses: EventStatus[] = [
  'Planning', 'Registered', 'Working', 'Submitted', 'ResultAwaited', 'Completed'
];

export default function Hackathons() {
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editEvent, setEditEvent] = useState<HackathonEvent | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || event.sourcePlatform === platformFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const handleAddEvent = (event: HackathonEvent) => {
    addEvent(event);
    setEvents(getEvents());
  };

  const handleEditEvent = (event: HackathonEvent) => {
    updateEvent(event);
    setEvents(getEvents());
    setEditEvent(null);
  };

  const handleUpdateEvent = (event: HackathonEvent) => {
    updateEvent(event);
    setEvents(getEvents());
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Hackathons</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your hackathon participations
            </p>
          </div>
          <Button onClick={() => setShowAddEvent(true)} className="gradient-primary gap-2">
            <Plus className="w-4 h-4" />
            Add Hackathon
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {events.length} hackathons
        </p>

        {/* Events Grid/List */}
        {filteredEvents.length === 0 ? (
          events.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No hackathons yet"
              description="Start tracking your hackathon journey by adding your first event"
              actionLabel="Add Hackathon"
              onAction={() => setShowAddEvent(true)}
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No results found"
              description="Try adjusting your filters or search query"
            />
          )
        ) : (
          <motion.div
            layout
            className={cn(
              viewMode === 'grid' 
                ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-4'
            )}
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EventCard
                  event={event}
                  onView={() => {}}
                  onEdit={() => setEditEvent(event)}
                  onUpdate={handleUpdateEvent}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AddEventDialog
        open={showAddEvent}
        onOpenChange={setShowAddEvent}
        onSubmit={handleAddEvent}
      />

      {editEvent && (
        <AddEventDialog
          open={!!editEvent}
          onOpenChange={() => setEditEvent(null)}
          onSubmit={handleEditEvent}
          initialData={editEvent}
        />
      )}
    </MainLayout>
  );
}
