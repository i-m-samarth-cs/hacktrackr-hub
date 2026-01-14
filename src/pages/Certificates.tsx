import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Upload, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEvents } from '@/lib/storage';
import { HackathonEvent, ResultType } from '@/types';
import { cn } from '@/lib/utils';

const resultColors: Record<ResultType, string> = {
  Winner: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RunnerUp: 'bg-slate-100 text-slate-800 border-slate-200',
  Finalist: 'bg-amber-100 text-amber-800 border-amber-200',
  Participation: 'bg-blue-100 text-blue-800 border-blue-200',
  NotSelected: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function Certificates() {
  const [events, setEvents] = useState<HackathonEvent[]>([]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const eventsWithCertificates = events.filter(e => e.result?.certificateFileUrl);
  const eventsWithResults = events.filter(e => e.result);

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Certificates Vault</h1>
            <p className="text-muted-foreground mt-1">
              Store and manage your certificates and achievements
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {eventsWithResults.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Results</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {eventsWithCertificates.length}
                </p>
                <p className="text-sm text-muted-foreground">Certificates Uploaded</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {eventsWithResults.length - eventsWithCertificates.length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Upload</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {eventsWithResults.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description="Complete hackathons and add your results to store certificates here"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsWithResults.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all"
              >
                {/* Certificate Preview Area */}
                <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center relative">
                  {event.result?.certificateFileUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                      <FileText className="w-16 h-16 text-primary/30" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                        <Button variant="secondary" size="sm" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No certificate uploaded</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <Badge 
                    variant="outline" 
                    className={cn('mb-2', resultColors[event.result!.resultType])}
                  >
                    {event.result!.resultType}
                  </Badge>
                  <h3 className="font-display font-semibold text-foreground line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{event.organizer}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(event.createdAt), 'MMM yyyy')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
