import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Target,
  Sparkles,
  Bookmark,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { SavedGoalRoadmap } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CopyButton } from './CopyButton';

interface GoalPlannerViewProps {
  savedRoadmaps: SavedGoalRoadmap[];
  onSaveRoadmap: (roadmap: SavedGoalRoadmap) => void;
  onDeleteRoadmap: (id: string) => void;
  userName?: string;
}

export const GoalPlannerView: React.FC<GoalPlannerViewProps> = ({
  savedRoadmaps,
  onSaveRoadmap,
  onDeleteRoadmap,
  userName,
}) => {
  const [goalTitle, setGoalTitle] = useState('Launch FocusFlow AI Full-Stack Product v1.0');
  const [timeframe, setTimeframe] = useState('30 Days');
  const [currentStatus, setCurrentStatus] = useState('Frontend UI mockups completed, server setup in progress');
  const [obstacles, setObstacles] = useState('Limited daily dev hours (2 hrs/day), managing API rate limits');

  const [roadmapMarkdown, setRoadmapMarkdown] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRoadmap = async () => {
    if (!goalTitle.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/goal-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle,
          timeframe,
          currentStatus,
          obstacles,
        }),
      });

      const data = await response.json();
      if (data.roadmap) {
        setRoadmapMarkdown(data.roadmap);
      } else {
        throw new Error(data.error || 'Failed to generate goal roadmap');
      }
    } catch (err: any) {
      console.error('Goal Roadmap error:', err);
      setRoadmapMarkdown(`⚠️ **Error building roadmap**: ${err.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCurrentRoadmap = () => {
    if (!roadmapMarkdown) return;
    const newRoadmap: SavedGoalRoadmap = {
      id: Date.now().toString(),
      goalTitle,
      timeframe,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      roadmapMarkdown,
    };
    onSaveRoadmap(newRoadmap);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input: Goal Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm pb-3 border-b border-slate-100 dark:border-slate-800">
              <Target className="w-4 h-4 text-orange-500" />
              <span>{userName ? `Let's plan your goals, ${userName}.` : 'Your Goal'}</span>
            </div>

            {/* Goal Title */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Main Goal
              </label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Build and launch SaaS MVP in 30 days"
                className="w-full text-xs md:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Horizon / Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
              >
                <option value="14 Days">14 Days (Sprint)</option>
                <option value="30 Days">30 Days (1 Month)</option>
                <option value="60 Days">60 Days (2 Months)</option>
                <option value="90 Days / Q3">90 Days (Quarterly OKR)</option>
                <option value="6 Months">6 Months</option>
                <option value="1 Year">1 Year</option>
              </select>
            </div>

            {/* Starting Status */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Baseline / Starting Point
              </label>
              <input
                type="text"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                placeholder="e.g. Wireframes completed, zero backend code"
                className="w-full text-xs md:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Obstacles */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Expected Obstacles & Risk Factors
              </label>
              <textarea
                rows={3}
                value={obstacles}
                onChange={(e) => setObstacles(e.target.value)}
                placeholder="What potential roadblocks or friction might slow you down?"
                className="w-full text-xs md:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            <button
              onClick={handleGenerateRoadmap}
              disabled={isGenerating || !goalTitle.trim()}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium text-xs md:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Creating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Create Plan
                </>
              )}
            </button>
          </div>

          {/* Saved Roadmaps */}
          {savedRoadmaps.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
              <h4 className="font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-orange-500" /> Saved Goal Plans
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {savedRoadmaps.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs hover:border-orange-300 transition-colors"
                  >
                    <div
                      className="cursor-pointer flex-1 mr-2"
                      onClick={() => {
                        setGoalTitle(r.goalTitle);
                        setRoadmapMarkdown(r.roadmapMarkdown);
                      }}
                    >
                      <span className="font-medium text-slate-900 dark:text-slate-100 block">{r.goalTitle}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">{r.date} • {r.timeframe}</span>
                    </div>
                    <button
                      onClick={() => onDeleteRoadmap(r.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      title="Delete roadmap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Output: Roadmap Markdown */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs min-h-[560px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-orange-500" />
                  <span>Your Plan</span>
                </h3>

                {roadmapMarkdown && (
                  <div className="flex items-center gap-2">
                    <CopyButton textToCopy={roadmapMarkdown} />
                    <button
                      onClick={handleSaveCurrentRoadmap}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#FFF0E8] dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 hover:bg-orange-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Save Plan
                    </button>
                  </div>
                )}
              </div>

              {roadmapMarkdown ? (
                <MarkdownRenderer content={roadmapMarkdown} showCopyButton={false} />
              ) : (
                <div className="py-24 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0E8] dark:bg-slate-800 text-orange-500 border border-orange-200/50 dark:border-slate-700 flex items-center justify-center mx-auto">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Let's break your goal into small achievable steps.
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-normal">
                    Enter your goal details on the left to generate phase-by-phase roadmaps, 48-hour action steps, and key milestones.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

