import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavTab, FocusSession, SavedPlan, SavedSummary, SavedEmailDraft, SavedGoalRoadmap, UserProfile } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AICoachView } from './components/AICoachView';
import { DailyPlannerView } from './components/DailyPlannerView';
import { NotesSummarizerView } from './components/NotesSummarizerView';
import { EmailGeneratorView } from './components/EmailGeneratorView';
import { GoalPlannerView } from './components/GoalPlannerView';
import { FocusTimerModal } from './components/FocusTimerModal';
import { OnboardingScreen } from './components/OnboardingScreen';
import { EditProfileModal } from './components/EditProfileModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('focusflow_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.onboarded && parsed.name) return parsed;
      } catch (e) {}
    }
    // Fallback check for legacy user name
    const legacyName = localStorage.getItem('focusflow_user_name');
    if (legacyName) {
      return {
        name: legacyName,
        theme: 'system',
        onboarded: true,
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  });

  // Dark Mode state with html class toggle
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (userProfile?.theme === 'dark') return true;
    if (userProfile?.theme === 'light') return false;
    const saved = localStorage.getItem('focusflow_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Keep dark mode in sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('focusflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('focusflow_theme', 'light');
    }
  }, [darkMode]);

  // Sync theme changes when userProfile updates
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('focusflow_user_profile', JSON.stringify(userProfile));
      localStorage.setItem('focusflow_user_name', userProfile.name);

      if (userProfile.theme === 'dark') {
        setDarkMode(true);
      } else if (userProfile.theme === 'light') {
        setDarkMode(false);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
      }
    }
  }, [userProfile]);

  // Persistent States
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('focusflow_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 's1', durationMinutes: 25, completedAt: '09:30 AM', type: 'Pomodoro', label: 'Q3 Strategy Review' },
      { id: 's2', durationMinutes: 25, completedAt: '10:45 AM', type: 'Pomodoro', label: 'Time Blocking' },
    ];
  });

  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    const saved = localStorage.getItem('focusflow_saved_plans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>(() => {
    const saved = localStorage.getItem('focusflow_saved_summaries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [savedEmails, setSavedEmails] = useState<SavedEmailDraft[]>(() => {
    const saved = localStorage.getItem('focusflow_saved_emails');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedGoalRoadmap[]>(() => {
    const saved = localStorage.getItem('focusflow_saved_roadmaps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Streak counter tracking
  const [streakCount, setStreakCount] = useState<number>(() => {
    const saved = localStorage.getItem('focusflow_streak');
    return saved ? parseInt(saved, 10) : 5;
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('focusflow_sessions', JSON.stringify(focusSessions));
  }, [focusSessions]);

  useEffect(() => {
    localStorage.setItem('focusflow_saved_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  useEffect(() => {
    localStorage.setItem('focusflow_saved_summaries', JSON.stringify(savedSummaries));
  }, [savedSummaries]);

  useEffect(() => {
    localStorage.setItem('focusflow_saved_emails', JSON.stringify(savedEmails));
  }, [savedEmails]);

  useEffect(() => {
    localStorage.setItem('focusflow_saved_roadmaps', JSON.stringify(savedRoadmaps));
  }, [savedRoadmaps]);

  useEffect(() => {
    localStorage.setItem('focusflow_streak', streakCount.toString());
  }, [streakCount]);

  // Add focus session
  const handleAddSession = (session: FocusSession) => {
    setFocusSessions((prev) => [session, ...prev]);
  };

  // Complete Onboarding
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('focusflow_user_profile', JSON.stringify(profile));
    localStorage.setItem('focusflow_user_name', profile.name);
    setActiveTab('dashboard');
  };

  // Update Profile
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  // Reset App Data
  const handleResetApp = () => {
    localStorage.clear();
    setUserProfile(null);
    setFocusSessions([]);
    setSavedPlans([]);
    setSavedSummaries([]);
    setSavedEmails([]);
    setSavedRoadmaps([]);
    setStreakCount(1);
    setIsEditProfileOpen(false);
    setActiveTab('dashboard');
  };

  // If user is not onboarded, show OnboardingScreen
  if (!userProfile) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const currentUserName = userProfile.name || 'User';

  return (
    <div className="min-h-screen bg-[#FFF8F5] dark:bg-slate-950 text-[#2D2D2D] dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-200 ambient-mesh relative overflow-x-hidden">
      {/* Subtle Background Glow Spheres */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FFB38A]/15 dark:bg-[#FFB38A]/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FFD8C2]/20 dark:bg-[#FFD8C2]/5 blur-[120px] pointer-events-none z-0" />

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 z-10 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-0' : ''}`}>
        <Header
          activeTab={activeTab}
          darkMode={darkMode}
          onToggleDarkMode={() => {
            const nextDark = !darkMode;
            setDarkMode(nextDark);
            setUserProfile((prev) => (prev ? { ...prev, theme: nextDark ? 'dark' : 'light' } : prev));
          }}
          onOpenTimer={() => setIsTimerOpen(true)}
          streakCount={streakCount}
          userProfile={userProfile}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onResetApp={handleResetApp}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenTimer={() => setIsTimerOpen(true)}
                  focusSessions={focusSessions}
                  savedPlans={savedPlans}
                  savedRoadmaps={savedRoadmaps}
                  savedSummaries={savedSummaries}
                  userName={currentUserName}
                />
              )}

              {activeTab === 'coach' && <AICoachView userName={currentUserName} />}

              {activeTab === 'planner' && (
                <DailyPlannerView
                  savedPlans={savedPlans}
                  onSavePlan={(p) => setSavedPlans([p, ...savedPlans])}
                  onDeletePlan={(id) => setSavedPlans(savedPlans.filter((p) => p.id !== id))}
                  userName={currentUserName}
                />
              )}

              {activeTab === 'notes' && (
                <NotesSummarizerView
                  savedSummaries={savedSummaries}
                  onSaveSummary={(s) => setSavedSummaries([s, ...savedSummaries])}
                  onDeleteSummary={(id) => setSavedSummaries(savedSummaries.filter((s) => s.id !== id))}
                  userName={currentUserName}
                />
              )}

              {activeTab === 'email' && (
                <EmailGeneratorView
                  savedEmails={savedEmails}
                  onSaveEmail={(e) => setSavedEmails([e, ...savedEmails])}
                  onDeleteEmail={(id) => setSavedEmails(savedEmails.filter((e) => e.id !== id))}
                  userName={currentUserName}
                />
              )}

              {activeTab === 'goals' && (
                <GoalPlannerView
                  savedRoadmaps={savedRoadmaps}
                  onSaveRoadmap={(r) => setSavedRoadmaps([r, ...savedRoadmaps])}
                  onDeleteRoadmap={(id) => setSavedRoadmaps(savedRoadmaps.filter((r) => r.id !== id))}
                  userName={currentUserName}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Pomodoro Timer Modal */}
      <FocusTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onAddSession={handleAddSession}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onResetApp={handleResetApp}
      />
    </div>
  );
}
