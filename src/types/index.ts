// HackTrackr Types

export type Platform = 
  | 'HackQuest' 
  | 'WhereUElevate' 
  | 'Unstop' 
  | 'DoraHacks' 
  | 'Devpost' 
  | 'Devfolio' 
  | 'Naukri' 
  | 'Devnovate' 
  | 'LabLabAI'
  | 'Other';

export type EventMode = 'Online' | 'Offline' | 'Hybrid';

export type EventStatus = 
  | 'Planning' 
  | 'Registered' 
  | 'Working' 
  | 'Submitted' 
  | 'ResultAwaited' 
  | 'Completed';

export type DeadlineType = 
  | 'registration' 
  | 'idea' 
  | 'ppt' 
  | 'code' 
  | 'demo' 
  | 'final' 
  | 'result';

export type ResultType = 
  | 'Winner' 
  | 'RunnerUp' 
  | 'Finalist' 
  | 'Participation' 
  | 'NotSelected';

export interface Deadline {
  id: string;
  type: DeadlineType;
  datetime: string;
  reminderEnabled: boolean;
  reminderOffsets: number[]; // hours before deadline
  notes?: string;
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  isDone: boolean;
  updatedAt: string;
}

export interface EventResult {
  resultType: ResultType;
  rank?: number;
  prizeAmount?: number;
  certificateFileUrl?: string;
  notes?: string;
  teamMembers?: string[];
}

export interface HackathonEvent {
  id: string;
  title: string;
  sourcePlatform: Platform;
  organizer: string;
  mode: EventMode;
  teamSizeMin: number;
  teamSizeMax: number;
  tags: string[];
  registrationLink?: string;
  submissionLink?: string;
  description?: string;
  prizePool?: string;
  status: EventStatus;
  deadlines: Deadline[];
  checklist: ChecklistItem[];
  result?: EventResult;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  quizName: string;
  platform: string;
  datetime: string;
  topic: string;
  notes?: string;
  reminderEnabled: boolean;
  score?: string;
  rank?: number;
  certificateFileUrl?: string;
  completed: boolean;
  createdAt: string;
}

export interface LeaderboardStats {
  totalJoined: number;
  totalSubmitted: number;
  wins: number;
  runnerUp: number;
  finalist: number;
  participation: number;
  totalPrize: number;
}
