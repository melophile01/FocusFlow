import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays,
  Sparkles,
  Clock,
  Bookmark,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Circle,
  Plus,
  Coffee,
  Briefcase,
  Users,
  Zap,
  ListFilter,
  CheckSquare,
  AlertCircle,
  LayoutList,
  Flame,
} from 'lucide-react';
import { SavedPlan, ScheduleBlock } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CopyButton } from './CopyButton';

interface DailyPlannerViewProps {
  savedPlans: SavedPlan[];
  onSavePlan: (plan: SavedPlan) => void;
  onDeletePlan: (id: string) => void;
  userName?: string;
}

const defaultBlocks: ScheduleBlock[] = [
  {
    id: '1',
    time: '09:00 AM - 10:30 AM',
    title: 'Finalize Q3 Product Proposal',
    durationMinutes: 90,
    type: 'Deep Work',
    priority: 'High',
    breakSuggestion: 'Take a 10-min hydration & light stretch break',
    completed: false,
  },
  {
    id: '2',
    time: '10:30 AM - 10:45 AM',
    title: 'Morning Recharge Break',
    durationMinutes: 15,
    type: 'Break',
    priority: 'Low',
    completed: false,
  },
  {
    id: '3',
    time: '10:45 AM - 11:15 AM',
    title: 'Code Review & PR Triage',
    durationMinutes: 30,
    type: 'Admin',
    priority: 'Medium',
    breakSuggestion: '5-min eye rest away from screens',
    completed: false,
  },
  {
    id: '4',
    time: '11:15 AM - 11:45 AM',
    title: 'Team Sync Meeting',
    durationMinutes: 30,
    type: 'Meeting',
    priority: 'High',
    completed: false,
  },
  {
    id: '5',
    time: '11:45 AM - 12:30 PM',
    title: 'Prepare Slides for Sprint Review',
    durationMinutes: 45,
    type: 'Deep Work',
    priority: 'High',
    breakSuggestion: '45-min nutritious lunch & outdoor walk',
    completed: false,
  },
  {
    id: '6',
    time: '12:30 PM - 01:15 PM',
    title: 'Lunch & Well-being Break',
    durationMinutes: 45,
    type: 'Break',
    priority: 'Medium',
    completed: false,
  },
];

export const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({
  savedPlans,
  onSavePlan,
  onDeletePlan,
  userName,
}) => {
  const [priorities, setPriorities] = useState(
    '1. Finalize Q3 product proposal\n2. Prepare slides for team sync\n3. Code review & bug fixes'
  );
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [peakEnergyTime, setPeakEnergyTime] = useState('Morning (9 AM - 12 PM)');
  const [fixedEvents, setFixedEvents] = useState('11:15 AM - Team Sync Meeting (30 mins)');
  const [breakPreference, setBreakPreference] = useState('50-min deep focus / 10-min rest');

  const [viewMode, setViewMode] = useState<'timeline' | 'markdown'>('timeline');
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(defaultBlocks);
  const [scheduleMarkdown, setScheduleMarkdown] = useState<string>('');
  const [planSummary, setPlanSummary] = useState<string>('Focused execution on Q3 proposals during peak morning hours.');
  const [isGenerating, setIsGenerating] = useState(false);

  // New Block Form Modal state
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newTime, setNewTime] = useState('02:00 PM - 03:00 PM');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Deep Work' | 'Meeting' | 'Admin' | 'Break'>('Deep Work');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newDuration, setNewDuration] = useState(60);
  const [newBreak, setNewBreak] = useState('10-min rest');

  // Generate day plan
  const handleGeneratePlan = async () => {
    if (!priorities.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/plan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priorities,
          startTime,
          endTime,
          peakEnergyTime,
          fixedEvents,
          breakPreference,
        }),
      });

      const data = await response.json();
      if (data.schedule || data.blocks) {
        setScheduleMarkdown(data.schedule || '');
        setPlanSummary(data.summary || 'Optimized energy-matched schedule.');
        if (Array.isArray(data.blocks) && data.blocks.length > 0) {
          const formattedBlocks = data.blocks.map((b: any, idx: number) => ({
            id: b.id || String(idx + 1),
            time: b.time || '10:00 AM',
            title: b.title || 'Focus Task',
            durationMinutes: Number(b.durationMinutes) || 45,
            type: (['Deep Work', 'Meeting', 'Admin', 'Break'].includes(b.type) ? b.type : 'Deep Work') as any,
            priority: (['High', 'Medium', 'Low'].includes(b.priority) ? b.priority : 'Medium') as any,
            breakSuggestion: b.breakSuggestion || undefined,
            completed: false,
          }));
          setBlocks(formattedBlocks);
        }
      } else {
        throw new Error(data.error || 'Failed to generate plan');
      }
    } catch (err: any) {
      console.error('Plan error:', err);
      setScheduleMarkdown(`⚠️ **Error generating schedule**: ${err.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleComplete = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  const handleAddCustomBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const block: ScheduleBlock = {
      id: Date.now().toString(),
      time: newTime,
      title: newTitle,
      durationMinutes: Number(newDuration) || 30,
      type: newType,
      priority: newPriority,
      breakSuggestion: newBreak.trim() ? newBreak : undefined,
      completed: false,
    };
    setBlocks((prev) => [...prev, block]);
    setNewTitle('');
    setShowAddBlock(false);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveCurrentPlan = () => {
    const markdownContent = scheduleMarkdown || blocks.map((b) => `- **${b.time}**: ${b.title} (${b.type} - ${b.priority} Priority)`).join('\n');
    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      priorities: priorities.slice(0, 80) + '...',
      scheduleMarkdown: markdownContent,
      blocks,
    };
    onSavePlan(newPlan);
  };

  // Type styling map
  const getTypeBadge = (type: ScheduleBlock['type']) => {
    switch (type) {
      case 'Deep Work':
        return {
          bg: 'bg-[#FFF0E8] text-[#E86A33] border-[#F5D7C6] dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30',
          bar: 'bg-[#F97316]',
          icon: <Flame className="w-3.5 h-3.5 text-[#F97316]" />,
        };
      case 'Meeting':
        return {
          bg: 'bg-[#FFF0E8] text-[#E86A33] border-[#F5D7C6] dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
          bar: 'bg-[#FFB38A]',
          icon: <Users className="w-3.5 h-3.5 text-[#F97316]" />,
        };
      case 'Admin':
        return {
          bg: 'bg-[#FFF0E8] text-[#2D2D2D] border-[#F5D7C6] dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
          bar: 'bg-[#FFD8C2]',
          icon: <Briefcase className="w-3.5 h-3.5 text-[#8C7A70]" />,
        };
      case 'Break':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          bar: 'bg-emerald-500',
          icon: <Coffee className="w-3.5 h-3.5" />,
        };
    }
  };

  // Priority styling
  const getPriorityBadge = (priority: ScheduleBlock['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-[#FFF0E8] text-[#E86A33] border-[#F5D7C6]';
      case 'Low':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const completedCount = blocks.filter((b) => b.completed).length;
  const progressPercentage = blocks.length > 0 ? Math.round((completedCount / blocks.length) * 100) : 0;
  const totalMinutes = blocks.reduce((acc, b) => acc + b.durationMinutes, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-[#F5D7C6] dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#2D2D2D] dark:text-slate-100 font-extrabold text-base pb-3 border-b border-[#F5D7C6] dark:border-slate-800/80">
              <CalendarDays className="w-5 h-5 text-[#F97316]" />
              <span>Time-Blocking Parameters</span>
            </div>

            {/* Priorities */}
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] dark:text-slate-300 mb-1.5">
                Top Priorities & Tasks
              </label>
              <textarea
                rows={3}
                value={priorities}
                onChange={(e) => setPriorities(e.target.value)}
                placeholder="List 2-4 key tasks you must get done today..."
                className="w-full text-xs p-3 rounded-xl border border-[#F5D7C6] dark:border-slate-700/80 bg-white dark:bg-slate-800/50 text-[#2D2D2D] dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFB38A]"
              />
            </div>

            {/* Hours */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#2D2D2D] dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#F5D7C6] dark:border-slate-700/80 bg-white dark:bg-slate-800/50 text-[#2D2D2D] dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFB38A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2D2D2D] dark:text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#F5D7C6] dark:border-slate-700/80 bg-white dark:bg-slate-800/50 text-[#2D2D2D] dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFB38A]"
                />
              </div>
            </div>

            {/* Peak Energy */}
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] dark:text-slate-300 mb-1">
                Peak Energy Window
              </label>
              <select
                value={peakEnergyTime}
                onChange={(e) => setPeakEnergyTime(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-[#F5D7C6] dark:border-slate-700/80 bg-white dark:bg-slate-800/50 text-[#2D2D2D] dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFB38A]"
              >
                <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                <option value="Early Afternoon (1 PM - 3 PM)">Early Afternoon (1 PM - 3 PM)</option>
                <option value="Late Afternoon (3 PM - 6 PM)">Late Afternoon (3 PM - 6 PM)</option>
                <option value="Evening / Night (7 PM - 10 PM)">Evening / Night (7 PM - 10 PM)</option>
              </select>
            </div>

            {/* Fixed Events */}
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] dark:text-slate-300 mb-1">
                Fixed Meetings / Commitments
              </label>
              <input
                type="text"
                value={fixedEvents}
                onChange={(e) => setFixedEvents(e.target.value)}
                placeholder="e.g. 11:15 AM Team Sync"
                className="w-full text-xs p-2 rounded-xl border border-[#F5D7C6] dark:border-slate-700/80 bg-white dark:bg-slate-800/50 text-[#2D2D2D] dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFB38A]"
              />
            </div>

            {/* Break Cadence */}
            <div>
              <label className="block text-xs font-bold text-[#2D2D2D] dark:text-slate-300 mb-1">
                Cadence & Break Preference
              </label>
              <select
                value={breakPreference}
                onChange={(e) => setBreakPreference(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-[#F5D7C6] dark:border-slate-700/80 bg-white dark:bg-slate-800/50 text-[#2D2D2D] dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFB38A]"
              >
                <option value="50-min deep focus / 10-min rest">50-min deep focus / 10-min rest</option>
                <option value="25-min Pomodoro cycles">25-min Pomodoro cycles</option>
                <option value="90-min Ultradian deep work sprints">90-min Ultradian deep work sprints</option>
              </select>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGeneratePlan}
              disabled={isGenerating || !priorities.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FFB38A] to-[#F97316] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Generating Timeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Time-Blocked Plan
                </>
              )}
            </motion.button>
          </div>

          {/* Saved Plans Sidebar */}
          {savedPlans.length > 0 && (
            <div className="glass-panel rounded-2xl p-4 border border-[#F5D7C6] dark:border-slate-800/80 shadow-sm space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#8C7A70] dark:text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#F97316]" /> Saved Schedules
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-2.5 rounded-xl bg-[#FFF0E8]/60 dark:bg-slate-800/60 border border-[#F5D7C6] dark:border-slate-700/80 flex items-center justify-between text-xs hover:border-[#FFB38A] transition-colors"
                  >
                    <div
                      className="cursor-pointer flex-1 mr-2"
                      onClick={() => {
                        setScheduleMarkdown(plan.scheduleMarkdown);
                        if (plan.blocks && plan.blocks.length > 0) {
                          setBlocks(plan.blocks);
                        }
                      }}
                    >
                      <span className="font-bold text-[#2D2D2D] dark:text-slate-100 block">{plan.date}</span>
                      <span className="text-[#8C7A70] dark:text-slate-400 line-clamp-1 text-[11px] font-medium">{plan.priorities}</span>
                    </div>
                    <button
                      onClick={() => onDeletePlan(plan.id)}
                      className="text-[#8C7A70] hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      title="Delete saved plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Output: Interactive Animated Timeline View */}
        <div className="lg:col-span-8">
          <div className="glass-panel rounded-2xl p-6 border border-[#F5D7C6] dark:border-slate-800/80 shadow-sm min-h-[600px] flex flex-col justify-between">
            <div>
              {/* Header Controls & Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F5D7C6] dark:border-slate-800/80 mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] text-[#E86A33] border border-[#F5D7C6] flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#2D2D2D] dark:text-slate-100 flex items-center gap-2">
                      {userName ? `${userName}'s Schedule` : 'Interactive Day Schedule'}
                    </h3>
                    <p className="text-xs text-[#8C7A70] dark:text-slate-400 font-medium">
                      {totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m planned` : 'Daily focus flow'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-[#FFF0E8] dark:bg-slate-800 p-1 rounded-xl border border-[#F5D7C6] dark:border-slate-700/80">
                    <button
                      onClick={() => setViewMode('timeline')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'timeline'
                          ? 'bg-white dark:bg-slate-900 text-[#E86A33] dark:text-indigo-400 shadow-2xs border border-[#F5D7C6] dark:border-transparent'
                          : 'text-[#8C7A70] dark:text-slate-400 hover:text-[#2D2D2D] dark:hover:text-slate-200'
                      }`}
                    >
                      <LayoutList className="w-3.5 h-3.5" /> Timeline
                    </button>
                    <button
                      onClick={() => setViewMode('markdown')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'markdown'
                          ? 'bg-white dark:bg-slate-900 text-[#E86A33] dark:text-indigo-400 shadow-2xs border border-[#F5D7C6] dark:border-transparent'
                          : 'text-[#8C7A70] dark:text-slate-400 hover:text-[#2D2D2D] dark:hover:text-slate-200'
                      }`}
                    >
                      <ListFilter className="w-3.5 h-3.5" /> Text / Markdown
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSaveCurrentPlan}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#FFF0E8] text-[#E86A33] dark:bg-indigo-950/60 dark:text-indigo-400 border border-[#F5D7C6] dark:border-indigo-800 hover:bg-[#FFD8C2] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[#F97316]" /> Save
                  </motion.button>
                </div>
              </div>

              {/* Progress Summary Bar */}
              {blocks.length > 0 && (
                <div className="mb-6 bg-[#FFF0E8]/80 dark:bg-slate-800/50 p-4 rounded-xl border border-[#F5D7C6] dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#2D2D2D] dark:text-slate-300 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-[#F97316]" /> Tasks Progress ({completedCount}/{blocks.length} Completed)
                    </span>
                    <span className="text-[#E86A33] dark:text-indigo-400">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-white dark:bg-slate-700 h-2 rounded-full overflow-hidden border border-[#F5D7C6] dark:border-transparent">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-[#FFB38A] to-[#F97316] h-full rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* View 1: Animated Interactive Timeline View */}
              {viewMode === 'timeline' ? (
                <div className="space-y-4 relative">
                  {/* Vertical Timeline Guide Line */}
                  <div className="absolute left-[23px] sm:left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#FFB38A] via-[#FFD8C2] to-transparent z-0" />

                  {/* Schedule Blocks */}
                  <AnimatePresence>
                    {blocks.map((block, index) => {
                      const typeConfig = getTypeBadge(block.type);
                      const priorityStyle = getPriorityBadge(block.priority);

                      return (
                        <motion.div
                          key={block.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`relative pl-12 sm:pl-14 transition-all group ${
                            block.completed ? 'opacity-65' : ''
                          }`}
                        >
                          {/* Animated Node Circle */}
                          <button
                            onClick={() => handleToggleComplete(block.id)}
                            className={`absolute left-3 sm:left-4 top-4 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer z-10 ${
                              block.completed
                                ? 'bg-[#F97316] border-[#F97316] text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900 border-[#FFB38A] dark:border-indigo-500 text-transparent hover:scale-110'
                            }`}
                            title={block.completed ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            <CheckCircle2 className={`w-4 h-4 ${block.completed ? 'opacity-100' : 'opacity-0'}`} />
                          </button>

                          {/* Beautiful Schedule Card */}
                          <div
                            className={`p-4 rounded-2xl border transition-all shadow-2xs hover:shadow-md ${
                              block.completed
                                ? 'bg-[#FFF0E8]/50 dark:bg-slate-900/40 border-[#F5D7C6] dark:border-slate-800 line-through'
                                : 'bg-white dark:bg-slate-800/80 border-[#F5D7C6] dark:border-slate-700/80 hover:border-[#FFB38A]'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                              {/* Time & Title */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-extrabold text-[#E86A33] dark:text-indigo-400 bg-[#FFF0E8] dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-[#F5D7C6] dark:border-indigo-800">
                                  {block.time}
                                </span>
                                <h4 className="font-extrabold text-sm text-[#2D2D2D] dark:text-slate-100">
                                  {block.title}
                                </h4>
                              </div>

                              {/* Badges: Category Type + Duration + Priority */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Type Badge */}
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${typeConfig.bg}`}>
                                  {typeConfig.icon}
                                  {block.type}
                                </span>

                                {/* Duration Badge */}
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#F5D7C6] dark:border-slate-700 text-[#8C7A70] dark:text-slate-300 bg-[#FFF0E8] dark:bg-slate-800 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#F97316]" />
                                  {block.durationMinutes}m
                                </span>

                                {/* Priority Badge */}
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle}`}>
                                  {block.priority} Priority
                                </span>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteBlock(block.id)}
                                  className="text-[#8C7A70] hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer opacity-0 group-hover:opacity-100"
                                  title="Remove block"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Break Suggestions */}
                            {block.breakSuggestion && (
                              <div className="mt-2 pt-2 border-t border-[#F5D7C6] dark:border-slate-700/50 text-xs text-[#E86A33] dark:text-amber-400 font-medium flex items-center gap-1.5 bg-[#FFF0E8]/50 p-2 rounded-xl">
                                <Coffee className="w-3.5 h-3.5 shrink-0 text-[#F97316]" />
                                <span><strong>Break Suggestion:</strong> {block.breakSuggestion}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Add Custom Schedule Block Button */}
                  <div className="pl-12 sm:pl-14 pt-2">
                    {!showAddBlock ? (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setShowAddBlock(true)}
                        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Custom Time-Blocked Event
                      </motion.button>
                    ) : (
                      <form onSubmit={handleAddCustomBlock} className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                        <h5 className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">New Timeline Event</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                            <input
                              type="text"
                              value={newTime}
                              onChange={(e) => setNewTime(e.target.value)}
                              placeholder="e.g. 02:00 PM - 03:00 PM"
                              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="e.g. Architecture Design Review"
                              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                            <select
                              value={newType}
                              onChange={(e) => setNewType(e.target.value as any)}
                              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                            >
                              <option value="Deep Work">Deep Work</option>
                              <option value="Meeting">Meeting</option>
                              <option value="Admin">Admin</option>
                              <option value="Break">Break</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                            <select
                              value={newPriority}
                              onChange={(e) => setNewPriority(e.target.value as any)}
                              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Mins)</label>
                            <input
                              type="number"
                              value={newDuration}
                              onChange={(e) => setNewDuration(Number(e.target.value))}
                              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Break Suggestion (Optional)</label>
                          <input
                            type="text"
                            value={newBreak}
                            onChange={(e) => setNewBreak(e.target.value)}
                            placeholder="e.g. 10-min hydration break"
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddBlock(false)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 cursor-pointer shadow-xs"
                          >
                            Add Event
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                /* View 2: Raw Markdown View */
                <div className="space-y-4">
                  {scheduleMarkdown ? (
                    <MarkdownRenderer content={scheduleMarkdown} showCopyButton={false} />
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No markdown schedule available yet. Click "Generate Time-Blocked Plan" above to create one.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer metadata */}
            <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Energy-optimized schedule active
              </span>
              <span className="font-medium">Gemini AI Engine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

