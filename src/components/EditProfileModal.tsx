import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Target, Clock, Sun, Moon, Laptop, Trash2, Check, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onResetApp: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onResetApp,
}) => {
  const [name, setName] = useState(userProfile.name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [dailyGoal, setDailyGoal] = useState(userProfile.dailyGoal || '');
  const [workingHours, setWorkingHours] = useState(userProfile.workingHours || '09:00 AM - 05:00 PM');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(userProfile.theme || 'system');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      email: email.trim() || undefined,
      dailyGoal: dailyGoal.trim() || undefined,
      workingHours: workingHours || undefined,
      theme,
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Edit Profile Settings
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Daily Goal */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Daily Focus Goal
              </label>
              <input
                type="text"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                placeholder="e.g. Complete 4 focus sessions"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Preferred Working Hours */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Preferred Working Hours
              </label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g. 09:00 AM - 05:00 PM"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-normal focus:outline-none focus:border-orange-400"
              />
            </div>

            {/* Theme */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Theme Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'border-orange-400 bg-orange-50/60 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-medium'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'border-orange-400 bg-orange-50/60 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-medium'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    theme === 'system'
                      ? 'border-orange-400 bg-orange-50/60 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-medium'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-slate-500" />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              {!showConfirmReset ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset App</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-rose-600 dark:text-rose-400 font-medium">Clear all?</span>
                  <button
                    type="button"
                    onClick={onResetApp}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-medium transition-colors cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
