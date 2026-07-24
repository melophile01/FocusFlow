export interface UserProfile {
  name: string;
  email?: string;
  dailyGoal?: string;
  workingHours?: string;
  theme: 'light' | 'dark' | 'system';
  onboarded: boolean;
  createdAt: string;
}

export type NavTab = 'dashboard' | 'coach' | 'planner' | 'notes' | 'email' | 'goals';

export type CoachPersona =
  | 'Focus'
  | 'Calm'
  | 'Challenge Me'
  | 'Brainstorm'
  | 'High-Performance Strategist'
  | 'Mindful Guide'
  | 'Strict Mentor'
  | 'Friendly Partner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  persona?: CoachPersona;
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  completedAt: string;
  type: 'Pomodoro' | 'Short Break' | 'Long Break';
  label: string;
}

export interface ScheduleBlock {
  id: string;
  time: string;
  title: string;
  durationMinutes: number;
  type: 'Deep Work' | 'Meeting' | 'Admin' | 'Break';
  priority: 'High' | 'Medium' | 'Low';
  breakSuggestion?: string;
  completed?: boolean;
}

export interface SavedPlan {
  id: string;
  date: string;
  priorities: string;
  scheduleMarkdown: string;
  blocks?: ScheduleBlock[];
}

export interface ActionItem {
  task: string;
  assignee?: string;
  priority?: 'High' | 'Medium' | 'Low';
  completed?: boolean;
}

export interface StructuredNotes {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  deadlines: string[];
  importantDates: string[];
  questionsToReview: string[];
  markdown?: string;
}

export interface SavedSummary {
  id: string;
  title: string;
  date: string;
  rawNotes: string;
  format: string;
  summaryMarkdown: string;
  structured?: StructuredNotes;
}

export interface SavedEmailDraft {
  id: string;
  title: string;
  date: string;
  goal: string;
  recipient: string;
  tone: string;
  emailMarkdown: string;
}

export interface SavedGoalRoadmap {
  id: string;
  goalTitle: string;
  timeframe: string;
  date: string;
  roadmapMarkdown: string;
  completedMilestones?: string[];
}
