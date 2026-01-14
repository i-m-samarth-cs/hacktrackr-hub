import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getQuizzes, addQuiz, updateQuiz, deleteQuiz, generateId } from '@/lib/storage';
import { Quiz } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const quizFormSchema = z.object({
  quizName: z.string().min(1, 'Name is required'),
  platform: z.string().min(1, 'Platform is required'),
  datetime: z.string().min(1, 'Date/time is required'),
  topic: z.string().min(1, 'Topic is required'),
  notes: z.string().optional(),
  reminderEnabled: z.boolean(),
  score: z.string().optional(),
});

type QuizFormData = z.infer<typeof quizFormSchema>;

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setQuizzes(getQuizzes());
  }, []);

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      quizName: '',
      platform: '',
      datetime: '',
      topic: '',
      notes: '',
      reminderEnabled: true,
      score: '',
    },
  });

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.quizName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (data: QuizFormData) => {
    const quiz: Quiz = {
      id: editQuiz?.id || generateId(),
      quizName: data.quizName,
      platform: data.platform,
      datetime: data.datetime,
      topic: data.topic,
      notes: data.notes || undefined,
      reminderEnabled: data.reminderEnabled,
      score: data.score || undefined,
      completed: editQuiz?.completed || false,
      createdAt: editQuiz?.createdAt || new Date().toISOString(),
    };

    if (editQuiz) {
      updateQuiz(quiz);
    } else {
      addQuiz(quiz);
    }

    setQuizzes(getQuizzes());
    setShowAddQuiz(false);
    setEditQuiz(null);
    form.reset();
  };

  const handleToggleComplete = (quiz: Quiz) => {
    updateQuiz({ ...quiz, completed: !quiz.completed });
    setQuizzes(getQuizzes());
  };

  const handleDelete = (quizId: string) => {
    deleteQuiz(quizId);
    setQuizzes(getQuizzes());
  };

  const openEditDialog = (quiz: Quiz) => {
    form.reset({
      quizName: quiz.quizName,
      platform: quiz.platform,
      datetime: quiz.datetime,
      topic: quiz.topic,
      notes: quiz.notes || '',
      reminderEnabled: quiz.reminderEnabled,
      score: quiz.score || '',
    });
    setEditQuiz(quiz);
    setShowAddQuiz(true);
  };

  const openAddDialog = () => {
    form.reset();
    setEditQuiz(null);
    setShowAddQuiz(true);
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Quiz Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Track your quizzes, tests, and assessments
            </p>
          </div>
          <Button onClick={openAddDialog} className="gradient-accent gap-2">
            <Plus className="w-4 h-4" />
            Add Quiz
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quizzes List */}
        {filteredQuizzes.length === 0 ? (
          quizzes.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No quizzes added yet"
              description="Start tracking your quizzes by adding your first one"
              actionLabel="Add Quiz"
              onAction={openAddDialog}
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No results found"
              description="Try adjusting your search query"
            />
          )
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer',
                  quiz.completed && 'opacity-70'
                )}
                onClick={() => openEditDialog(quiz)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant="secondary" className="mb-2">{quiz.topic}</Badge>
                    <h3 className={cn(
                      'font-display font-semibold text-lg text-foreground',
                      quiz.completed && 'line-through'
                    )}>
                      {quiz.quizName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{quiz.platform}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(quiz);
                    }}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      quiz.completed ? 'text-success bg-success/10' : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(quiz.datetime), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(quiz.datetime), 'HH:mm')}</span>
                  </div>
                </div>

                {quiz.score && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-sm font-medium text-foreground">Score: {quiz.score}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddQuiz} onOpenChange={(open) => {
        if (!open) {
          setShowAddQuiz(false);
          setEditQuiz(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editQuiz ? 'Edit Quiz' : 'Add New Quiz'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="quizName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Python Assessment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., College, HackerRank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Python, AI, Aptitude" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 85/100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any notes about the quiz..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminderEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Enable Reminder</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddQuiz(false);
                  setEditQuiz(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-accent">
                  {editQuiz ? 'Save Changes' : 'Add Quiz'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
