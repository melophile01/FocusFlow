import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  CalendarDays,
  FileText,
  Mail,
  Target,
  Clock,
  CheckSquare,
  Plus,
  Trash2,
  RefreshCw,
  BarChart2,
  X,
  ChevronRight,
  ListTodo,
  CheckCircle2,
  ArrowUpRight,
  Edit3,
  Check,
  Quote,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { NavTab, FocusSession, SavedPlan, SavedGoalRoadmap, SavedSummary, ChatMessage } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenTimer: () => void;
  focusSessions: FocusSession[];
  savedPlans: SavedPlan[];
  savedRoadmaps: SavedGoalRoadmap[];
  savedSummaries?: SavedSummary[];
  userName: string;
}

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  category?: string;
}

const hourlyFocusData = [
  { time: '8 AM', focusMins: 20, energy: 85 },
  { time: '10 AM', focusMins: 45, energy: 95 },
  { time: '12 PM', focusMins: 25, energy: 70 },
  { time: '2 PM', focusMins: 35, energy: 80 },
  { time: '4 PM', focusMins: 40, energy: 88 },
  { time: '6 PM', focusMins: 15, energy: 60 },
];

const weeklyMomentumData = [
  { day: 'Mon', focusHours: 2.5 },
  { day: 'Tue', focusHours: 3.2 },
  { day: 'Wed', focusHours: 4.0 },
  { day: 'Thu', focusHours: 2.8 },
  { day: 'Fri', focusHours: 3.5 },
  { day: 'Sat', focusHours: 1.5 },
  { day: 'Sun', focusHours: 1.0 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenTimer,
  focusSessions,
  savedPlans,
  savedRoadmaps,
  savedSummaries = [],
  userName,
}) => {
  // AI Productivity Tip State (Max 2 lines)
  const [quickTip, setQuickTip] = useState<string>(
    'Protect your first 90 minutes for deep work before opening communication channels.'
  );
  const [loadingTip, setLoadingTip] = useState<boolean>(false);

  // Active Progress Chart View
  const [chartTab, setChartTab] = useState<'hourly' | 'weekly'>('hourly');

  // Modal State for Note Quick View
  const [selectedNote, setSelectedNote] = useState<SavedSummary | null>(null);

  // Today's Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('focusflow_quick_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: '1', text: 'Review quarterly goal roadmap milestones', completed: false, priority: 'High', category: 'Strategy' },
      { id: '2', text: 'Plan day with energy time-blocking', completed: true, priority: 'Medium', category: 'Planning' },
      { id: '3', text: 'Complete 25-minute deep focus block', completed: false, priority: 'High', category: 'Deep Work' },
      { id: '4', text: 'Draft executive update email', completed: false, priority: 'Medium', category: 'Email' },
    ];
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [taskFilter, setTaskFilter] = useState<'All' | 'Pending' | 'Completed' | 'High'>('All');

  // Recent AI Conversations
  const [recentConversations] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('focusflow_chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((m: ChatMessage) => m.role === 'assistant').slice(-3);
        }
      } catch (e) {}
    }
    return [
      {
        id: 'c1',
        role: 'assistant',
        persona: 'AI Coach',
        content: 'Protect your morning peak 90 minutes for primary goals before opening emails.',
        timestamp: '10:15 AM',
      },
      {
        id: 'c2',
        role: 'assistant',
        persona: 'AI Coach',
        content: 'Take 5-minute movement breaks between deep work sessions to reset focus.',
        timestamp: 'Yesterday',
      },
    ];
  });

  // Sync tasks to localStorage
  useEffect(() => {
    localStorage.setItem('focusflow_quick_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Fetch quick AI productivity tip
  const fetchQuickTip = async () => {
    setLoadingTip(true);
    try {
      const res = await fetch('/api/ai/quick-tip', { method: 'POST' });
      const data = await res.json();
      if (data.tip) {
        // Ensure concise tip (max 2 lines)
        setQuickTip(data.tip.slice(0, 140));
      }
    } catch (err) {
      setQuickTip('Focus on one non-negotiable priority during your morning peak window.');
    } finally {
      setLoadingTip(false);
    }
  };

  useEffect(() => {
    fetchQuickTip();
  }, []);

  // Task Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks((prev) => [
      {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        priority: newTaskPriority,
      },
      ...prev,
    ]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'Pending') return !t.completed;
    if (taskFilter === 'Completed') return t.completed;
    if (taskFilter === 'High') return t.priority === 'High';
    return true;
  });

  // Motivational Quotes list
  const MOTIVATIONAL_QUOTES = [
    { quote: "Focus is a muscle. The more you practice single-tasking, the easier deep work becomes.", author: "Cal Newport" },
    { quote: "Action is the foundational key to all success. Start small, finish strong.", author: "Pablo Picasso" },
    { quote: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
    { quote: "You don't need more time, you just need more focus.", author: "Tim Ferriss" },
    { quote: "The secret of getting ahead is getting started. Break complex tasks into small steps.", author: "Mark Twain" },
    { quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { quote: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { quote: "Deep work is the superpower of the 21st century.", author: "James Clear" },
  ];

  const [quoteIndex, setQuoteIndex] = useState<number>(() =>
    Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
  );

  // Calculations for Today's Progress
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const taskProgressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { emoji: '🌅', text: 'Good Morning' };
    } else if (hour >= 12 && hour < 17) {
      return { emoji: '🌞', text: 'Good Afternoon' };
    } else {
      return { emoji: '🌙', text: 'Good Evening' };
    }
  };

  const greeting = getGreetingData();

  const quickActions = [
    { id: 'coach', name: 'Coach', description: 'Strategy & guidance', icon: Bot, tab: 'coach' as NavTab },
    { id: 'planner', name: 'Planner', description: 'Schedule your day', icon: CalendarDays, tab: 'planner' as NavTab },
    { id: 'notes', name: 'Summarizer', description: 'Distill raw notes', icon: FileText, tab: 'notes' as NavTab },
    { id: 'email', name: 'Email', description: 'Draft messages', icon: Mail, tab: 'email' as NavTab },
    { id: 'goals', name: 'Goals', description: 'Action roadmaps', icon: Target, tab: 'goals' as NavTab },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8 text-slate-800 dark:text-slate-100">
      {/* 1. HERO SECTION: Dynamic Greeting + Focus Tip */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {greeting.emoji} {greeting.text}, {userName}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            Ready to make today productive?
          </p>
        </div>

        {/* Short Productivity Tip (Maximum 2 lines) */}
        <div className="bg-[#FFF8F5] dark:bg-slate-800/80 border border-orange-200/60 dark:border-slate-700/80 p-3 rounded-xl max-w-md shrink-0 flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-[#FFF0E8] dark:bg-orange-950/40 text-orange-500 shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-medium text-orange-600 dark:text-orange-400 mb-0.5">
              <span>Focus Tip</span>
              <button
                onClick={fetchQuickTip}
                disabled={loadingTip}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Refresh tip"
              >
                <RefreshCw className={`w-3 h-3 ${loadingTip ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-snug line-clamp-2">
              {quickTip}
            </p>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.tab)}
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 hover:bg-[#FFF8F5] dark:hover:bg-slate-800/60 transition-all text-left group shadow-2xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFF0E8] dark:bg-slate-800 text-orange-500 flex items-center justify-center shrink-0 border border-orange-200/40 dark:border-slate-700">
                <action.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-600 transition-colors">
                  {action.name}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-normal">
                  {action.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT: TODAY'S TASKS & TODAY'S PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* TODAY'S TASKS (Linear / Todoist style) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FFF0E8] text-orange-500 border border-orange-200/50 dark:bg-slate-800 dark:border-slate-700">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Today's Tasks
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    {completedTasksCount} of {tasks.length} completed
                  </p>
                </div>
              </div>

              {/* Task Filters */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                {(['All', 'Pending', 'Completed', 'High'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTaskFilter(filter)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      taskFilter === filter
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Task Add Input */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400 dark:focus:border-orange-500"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
              >
                <option value="High">High</option>
                <option value="Medium">Med</option>
                <option value="Low">Low</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>

            {/* Task Items List */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-normal">
                  No tasks found in this view.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      task.completed
                        ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 text-slate-400 line-through'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 mr-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 border-slate-300 dark:border-slate-600 cursor-pointer shrink-0"
                      />
                      <span className="text-xs font-normal truncate">{task.text}</span>
                    </label>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          task.priority === 'High'
                            ? 'bg-[#FFF0E8] text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/50'
                            : task.priority === 'Medium'
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-slate-50 text-slate-500 dark:bg-slate-800/50'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Task Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-normal">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mr-3">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>
            <span className="shrink-0 font-medium text-slate-700 dark:text-slate-300">
              {taskProgressPercent}% Complete
            </span>
          </div>
        </div>

        {/* MOTIVATIONAL QUOTE CARD (Replaces Today's Progress) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          {/* Ambient gradient decoration */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FFF0E8] text-orange-500 border border-orange-200/50 dark:bg-slate-800 dark:border-slate-700">
                  <Quote className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Motivational Quote
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Mindset fuel for deep work & focus
                  </p>
                </div>
              </div>

              <button
                onClick={() => setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1 text-xs font-medium"
                title="Next Motivational Quote"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Quote</span>
              </button>
            </div>

            {/* Quote Card Box */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFF8F5] to-[#FFF0E8]/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-orange-200/60 dark:border-slate-700/80 my-2 flex flex-col justify-between min-h-[170px] relative">
              <Quote className="w-8 h-8 text-orange-400/20 dark:text-orange-500/10 absolute top-3 right-3 pointer-events-none" />
              <p className="text-sm md:text-base font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed z-10">
                "{MOTIVATIONAL_QUOTES[quoteIndex].quote}"
              </p>
              <div className="mt-4 pt-3 border-t border-orange-200/40 dark:border-slate-700/50 flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400 z-10">
                <span>— {MOTIVATIONAL_QUOTES[quoteIndex].author}</span>
                <span className="text-[10px] font-normal text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-orange-200/50 dark:border-slate-700">
                  Quote #{quoteIndex + 1}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-normal">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Focus rule: Eliminate 1 distraction right now
            </span>
            <button
              onClick={onOpenTimer}
              className="text-orange-600 dark:text-orange-400 hover:underline font-medium cursor-pointer"
            >
              Start Focus →
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY GRID (Clean Notion / Linear Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* RECENT NOTES & BRIEF SUMMARIES */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>Recent Summaries</span>
              </h3>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium cursor-pointer flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {savedSummaries.length === 0 ? (
                <>
                  <div
                    onClick={() => onNavigate('notes')}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-orange-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-slate-900 dark:text-slate-100">
                      <span>Q3 Product Roadmap Sync</span>
                      <span className="text-[10px] text-slate-500">Brief</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-normal">
                      Reallocate team resources to core AI architecture and freeze legacy feature requests.
                    </p>
                  </div>

                  <div
                    onClick={() => onNavigate('notes')}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-orange-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-slate-900 dark:text-slate-100">
                      <span>Launch Brainstorm</span>
                      <span className="text-[10px] text-slate-500">Checklist</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-normal">
                      Finalize founder onboarding email sequence and update video preview.
                    </p>
                  </div>
                </>
              ) : (
                savedSummaries.slice(0, 2).map((summary) => (
                  <div
                    key={summary.id}
                    onClick={() => setSelectedNote(summary)}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-orange-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-slate-900 dark:text-slate-100">
                      <span className="truncate">{summary.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-1">{summary.format}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-normal">
                      {summary.summaryMarkdown.replace(/[*#`]/g, '')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('notes')}
            className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Summarize New Notes
          </button>
        </div>

        {/* ACTIVE GOALS & ROADMAPS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-500" />
                <span>Active Goals</span>
              </h3>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium cursor-pointer flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {savedRoadmaps.length === 0 ? (
                <>
                  <div
                    onClick={() => onNavigate('goals')}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-orange-300 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-slate-900 dark:text-slate-100">
                      <span>Build & Launch SaaS MVP</span>
                      <span className="text-[10px] text-orange-600 font-medium">30 Days</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full w-2/3 rounded-full" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Phase 2: Core authentication & AI API endpoints
                    </p>
                  </div>

                  <div
                    onClick={() => onNavigate('goals')}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-orange-300 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-slate-900 dark:text-slate-100">
                      <span>Deep Work Routine</span>
                      <span className="text-[10px] text-orange-600 font-medium">14 Days</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full w-1/2 rounded-full" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Phase 1: Log 4x 25-min focus blocks daily
                    </p>
                  </div>
                </>
              ) : (
                savedRoadmaps.slice(0, 2).map((roadmap) => (
                  <div
                    key={roadmap.id}
                    onClick={() => onNavigate('goals')}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-orange-300 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-slate-900 dark:text-slate-100">
                      <span className="truncate">{roadmap.goalTitle}</span>
                      <span className="text-[10px] text-orange-600 shrink-0 ml-1 font-medium">{roadmap.timeframe}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full w-3/5 rounded-full" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Created on {roadmap.date}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('goals')}
            className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create Goal Roadmap
          </button>
        </div>

        {/* COACH INSIGHTS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bot className="w-4 h-4 text-orange-500" />
                <span>Coach Insights</span>
              </h3>
              <button
                onClick={() => onNavigate('coach')}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium cursor-pointer flex items-center gap-0.5"
              >
                Chat <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {recentConversations.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  onClick={() => onNavigate('coach')}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-orange-300 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] font-medium text-orange-600 dark:text-orange-400 mb-1">
                    <span>{msg.persona || 'Coach'}</span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-normal">
                    "{msg.content.replace(/[*#`]/g, '')}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('coach')}
            className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-orange-600 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-orange-500" /> Open Coach
          </button>
        </div>
      </div>

      {/* QUICK NOTE PREVIEW MODAL */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl relative space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">{selectedNote.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedNote.date} • {selectedNote.format}</p>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-normal">
                {selectedNote.summaryMarkdown}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedNote(null);
                    onNavigate('notes');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500 text-white font-medium text-xs cursor-pointer hover:bg-orange-600 transition-colors"
                >
                  Open in Notes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
