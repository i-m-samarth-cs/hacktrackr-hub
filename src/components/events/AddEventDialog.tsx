import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HackathonEvent, Platform, EventMode, EventStatus, Deadline, DeadlineType } from '@/types';
import { generateId } from '@/lib/storage';

const platforms: Platform[] = [
  'HackQuest', 'WhereUElevate', 'Unstop', 'DoraHacks', 
  'Devpost', 'Devfolio', 'Naukri', 'Devnovate', 'LabLabAI', 'Other'
];

const modes: EventMode[] = ['Online', 'Offline', 'Hybrid'];

const statuses: EventStatus[] = [
  'Planning', 'Registered', 'Working', 'Submitted', 'ResultAwaited', 'Completed'
];

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  sourcePlatform: z.enum(['HackQuest', 'WhereUElevate', 'Unstop', 'DoraHacks', 
    'Devpost', 'Devfolio', 'Naukri', 'Devnovate', 'LabLabAI', 'Other']),
  organizer: z.string().min(1, 'Organizer is required'),
  mode: z.enum(['Online', 'Offline', 'Hybrid']),
  teamSizeMin: z.coerce.number().min(1),
  teamSizeMax: z.coerce.number().min(1),
  registrationLink: z.string().url().optional().or(z.literal('')),
  submissionLink: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  prizePool: z.string().optional(),
  status: z.enum(['Planning', 'Registered', 'Working', 'Submitted', 'ResultAwaited', 'Completed']),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: HackathonEvent) => void;
  initialData?: HackathonEvent;
}

const deadlineTypes: DeadlineType[] = [
  'registration', 'idea', 'ppt', 'code', 'demo', 'final', 'result'
];

export function AddEventDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData 
}: AddEventDialogProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  // Reset state when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      setTags(initialData?.tags || []);
      setDeadlines(initialData?.deadlines || []);
    } else {
      setTags([]);
      setDeadlines([]);
      setTagInput('');
    }
  }, [open, initialData]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      sourcePlatform: initialData.sourcePlatform,
      organizer: initialData.organizer,
      mode: initialData.mode,
      teamSizeMin: initialData.teamSizeMin,
      teamSizeMax: initialData.teamSizeMax,
      registrationLink: initialData.registrationLink || '',
      submissionLink: initialData.submissionLink || '',
      description: initialData.description || '',
      prizePool: initialData.prizePool || '',
      status: initialData.status,
      email: (initialData as any).email || '',
    } : {
      title: '',
      sourcePlatform: 'Unstop',
      organizer: '',
      mode: 'Online',
      teamSizeMin: 1,
      teamSizeMax: 4,
      registrationLink: '',
      submissionLink: '',
      description: '',
      prizePool: '',
      status: 'Planning',
      email: '',
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddDeadline = () => {
    const newDeadline: Deadline = {
      id: generateId(),
      type: 'registration',
      datetime: new Date().toISOString(),
      reminderEnabled: true,
      reminderOffsets: [24, 6, 1],
      completed: false,
    };
    setDeadlines([...deadlines, newDeadline]);
  };

  const handleRemoveDeadline = (deadlineId: string) => {
    setDeadlines(deadlines.filter(d => d.id !== deadlineId));
  };

  const handleUpdateDeadline = (deadlineId: string, updates: Partial<Deadline>) => {
    setDeadlines(deadlines.map(d => 
      d.id === deadlineId ? { ...d, ...updates } : d
    ));
  };

  const handleSubmit = (data: FormData) => {
    const event: HackathonEvent & { email?: string } = {
      id: initialData?.id || generateId(),
      title: data.title,
      sourcePlatform: data.sourcePlatform,
      organizer: data.organizer,
      mode: data.mode,
      teamSizeMin: data.teamSizeMin,
      teamSizeMax: data.teamSizeMax,
      registrationLink: data.registrationLink || undefined,
      submissionLink: data.submissionLink || undefined,
      description: data.description || undefined,
      prizePool: data.prizePool || undefined,
      status: data.status,
      tags,
      deadlines,
      checklist: initialData?.checklist || [],
      result: initialData?.result,
      email: data.email || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(event);
    onOpenChange(false);
    form.reset();
    setTags([]);
    setDeadlines([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {initialData ? 'Edit Event' : 'Add New Hackathon'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Hackathon name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourcePlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer</FormLabel>
                    <FormControl>
                      <Input placeholder="Organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamSizeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Team Size</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamSizeMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Team Size</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prizePool"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Prize Pool (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $10,000 USD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Email for Reminders</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your-email@example.com" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Email address to receive deadline reminders (3 days before)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="submissionLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <div className="col-span-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag (e.g., AI, Web3)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Deadlines Section */}
              <div className="col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Deadlines</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddDeadline}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Deadline
                  </Button>
                </div>
                {deadlines.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border border-dashed border-border rounded-lg text-center">
                    No deadlines added. Click "Add Deadline" to add registration, submission, or other important dates.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deadlines.map((deadline) => (
                      <div 
                        key={deadline.id} 
                        className="p-4 border border-border rounded-lg space-y-3 bg-muted/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Deadline Type</label>
                              <Select
                                value={deadline.type}
                                onValueChange={(value: DeadlineType) => 
                                  handleUpdateDeadline(deadline.id, { type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {deadlineTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Date & Time</label>
                              <Input
                                type="datetime-local"
                                value={deadline.datetime ? new Date(deadline.datetime).toISOString().slice(0, 16) : ''}
                                onChange={(e) => {
                                  const dateValue = e.target.value;
                                  if (dateValue) {
                                    const isoString = new Date(dateValue).toISOString();
                                    handleUpdateDeadline(deadline.id, { datetime: isoString });
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDeadline(deadline.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={deadline.reminderEnabled}
                            onChange={(e) => 
                              handleUpdateDeadline(deadline.id, { reminderEnabled: e.target.checked })
                            }
                            className="rounded"
                          />
                          <label className="text-sm text-muted-foreground">
                            Enable email reminders for this deadline
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the hackathon..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                {initialData ? 'Save Changes' : 'Add Hackathon'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
