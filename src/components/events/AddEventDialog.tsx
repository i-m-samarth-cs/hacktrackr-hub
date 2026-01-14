import { useState } from 'react';
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
import { HackathonEvent, Platform, EventMode, EventStatus } from '@/types';
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
});

type FormData = z.infer<typeof formSchema>;

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: HackathonEvent) => void;
  initialData?: HackathonEvent;
}

export function AddEventDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData 
}: AddEventDialogProps) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

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

  const handleSubmit = (data: FormData) => {
    const event: HackathonEvent = {
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
      deadlines: initialData?.deadlines || [],
      checklist: initialData?.checklist || [],
      result: initialData?.result,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(event);
    onOpenChange(false);
    form.reset();
    setTags([]);
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
