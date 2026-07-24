import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, User, Mail, Target, Clock, Sun, Moon, Laptop, ShieldCheck, Flame } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

const goalSuggestions = [
  'Complete 4 deep work sessions',
  'Master time-blocking schedule',
  'Publish weekly project goals',
  'Reduce afternoon distractions',
];

const workingHourOptions = [
  '09:00 AM - 05:00 PM',
  '08:00 AM - 04:00 PM',
  '10:00 AM - 06:00 PM',
  'Flexible / Freelance',
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dailyGoal, setDailyGoal] = useState('');
  const [workingHours, setWorkingHours] = useState('09:00 AM - 05:00 PM');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim() || undefined,
      dailyGoal: dailyGoal.trim() || undefined,
      workingHours: workingHours || undefined,
      theme,
      onboarded: true,
      createdAt: new Date().toISOString(),
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors font-sans">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80 text-xs font-semibold shadow-2xs">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>FocusFlow Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome to FocusFlow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-md mx-auto">
            Let's personalize your daily planning, AI coaching, and deep work assistant in 30 seconds.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  Full Name <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400">Required</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-500" />
                Email Address <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            {/* Daily Goal */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-orange-500" />
                Daily Focus Goal <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                placeholder="What is your primary focus routine?"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400 transition-colors mb-2"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-medium text-slate-400">Suggestions:</span>
                {goalSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setDailyGoal(suggestion)}
                    className="text-[10px] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-orange-300 transition-colors cursor-pointer"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Working Hours */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                Preferred Working Hours <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400 transition-colors"
              >
                {workingHourOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Preference */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                Theme Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-orange-400 bg-orange-50/60 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-medium shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-orange-400 bg-orange-50/60 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-medium shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'border-orange-400 bg-orange-50/60 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-medium shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Laptop className="w-4 h-4 text-slate-500" />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* Get Started Button */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full mt-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Stored locally in browser • No account required</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
