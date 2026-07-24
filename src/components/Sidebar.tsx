import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Bot,
  CalendarDays,
  FileText,
  Mail,
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'coach', label: 'AI Coach', icon: Bot, badge: 'Gemini' },
  { id: 'planner', label: 'Daily Planner', icon: CalendarDays },
  { id: 'notes', label: 'Notes Summarizer', icon: FileText },
  { id: 'email', label: 'Email Generator', icon: Mail },
  { id: 'goals', label: 'Goal Planner', icon: Target },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {!collapsed && (
        <div
          onClick={onToggleCollapse}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between shadow-lg lg:shadow-none ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-60 translate-x-0'
        }`}
      >
      {/* Brand & Logo */}
      <div>
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shrink-0 cursor-pointer">
              <Sparkles className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
                  FocusFlow
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Workspace</span>
              </div>
            )}
          </div>

          <button
            id="sidebar-toggle-button"
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-2 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
        {!collapsed ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span>AI Connected</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="AI Connected">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
    </>
  );
};

