import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Flame, Timer, User, Settings, RefreshCw, Trash2, ChevronDown, Check, Mail, Target, Menu } from 'lucide-react';
import { NavTab, UserProfile } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenTimer: () => void;
  streakCount: number;
  userProfile: UserProfile;
  onOpenEditProfile: () => void;
  onResetApp: () => void;
  onToggleSidebar?: () => void;
}

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your tasks, focus & progress' },
  coach: { title: 'Coach', subtitle: 'Interactive strategy, energy & habit advice' },
  planner: { title: 'Planner', subtitle: 'Schedule your day around peak focus hours' },
  notes: { title: 'Smart Notes', subtitle: 'Transform raw notes into clear summaries' },
  email: { title: 'Draft Email', subtitle: 'Write clear, professional messages' },
  goals: { title: 'Goal Planner', subtitle: "Let's break your goal into small achievable steps." },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  darkMode,
  onToggleDarkMode,
  onOpenTimer,
  streakCount,
  userProfile,
  onOpenEditProfile,
  onResetApp,
  onToggleSidebar,
}) => {
  const { title, subtitle } = tabTitles[activeTab] || tabTitles.dashboard;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials
  const initials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-6 py-3 transition-colors">
      <div className="flex flex-row items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Active Module Header */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white lg:hidden transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
              aria-label="Toggle navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{subtitle}</p>
          </div>
        </div>

        {/* Right Controls: Streak + Timer + Theme Toggle + User Profile Avatar Dropdown */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Streak Counter: 🔥 5 Day Streak */}
          <div
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[#FFF0E8] text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50 cursor-default"
            title={`${streakCount} Day Productivity Streak!`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="hidden xs:inline">{streakCount} Day Streak</span>
            <span className="xs:hidden">{streakCount}d</span>
          </div>

          {/* Open Focus Timer Modal */}
          <button
            id="open-focus-timer-button"
            onClick={onOpenTimer}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer shadow-2xs"
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus Timer</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            id="theme-toggle-button"
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
            aria-label="Toggle theme"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile Avatar with Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="User Account & Profile Settings"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-500 text-white font-medium text-xs flex items-center justify-center shadow-2xs">
                {initials}
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden md:inline max-w-[100px] truncate pl-0.5">
                {userProfile.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-medium text-xs flex items-center justify-center">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {userProfile.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {userProfile.email || 'No email provided'}
                      </p>
                    </div>
                  </div>
                  {userProfile.dailyGoal && (
                    <div className="pt-2 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Target className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="truncate">{userProfile.dailyGoal}</span>
                    </div>
                  )}
                </div>

                {/* Dropdown Options */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenEditProfile();
                    }}
                    className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onToggleDarkMode();
                    }}
                    className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {darkMode ? (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>Change Theme</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium capitalize">
                      {darkMode ? 'Dark' : 'Light'}
                    </span>
                  </button>
                </div>

                {/* Divider & Reset App */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (confirm('Are you sure you want to reset your workspace? This will clear all stored profile and session data.')) {
                        onResetApp();
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset App Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
