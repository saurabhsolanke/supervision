'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/tenantStore';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { SprintView } from '@/components/sprints/SprintView';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { WorkItemDetailDrawer } from '@/components/board/WorkItemDetailDrawer';
import { TeamManagementModal } from '@/components/team/TeamManagementModal';
import { BillingModal } from '@/components/billing/BillingModal';
import { AccountSettingsModal } from '@/components/settings/AccountSettingsModal';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { BoardSkeleton } from '@/components/ui/BoardSkeleton';
import { KeyRound, X } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { currentUser, isLoading, switchProject } = useTenant();
  const [currentView, setCurrentView] = useState<'boards' | 'sprints' | 'projects'>('boards');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showPasswordBanner, setShowPasswordBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = sessionStorage.getItem('dismiss_default_pwd_banner');
      if (!isDismissed) {
        setShowPasswordBanner(true);
      }
    }
  }, []);

  // 1. Detect if restored from browser bfcache (Back/Forward cache) after logout
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // 2. Authentication guard: unauthorized visitors must immediately be kicked out to login
  useEffect(() => {
    const hasStoredUser = typeof window !== 'undefined' && localStorage.getItem('supervision_user_id');
    const hasTokenCookie = typeof document !== 'undefined' && document.cookie.includes('supervision_token');

    // If session credentials were removed (e.g. on logout), immediately replace history to login
    if (!hasStoredUser && !hasTokenCookie) {
      window.location.replace('/login');
      return;
    }

    if (!isLoading && !currentUser) {
      window.location.replace('/login');
    }
  }, [isLoading, currentUser]);

  // 3. Popstate listener: trigger if user hits back button into this page without session
  useEffect(() => {
    const handlePopState = () => {
      const hasStoredUser = typeof window !== 'undefined' && localStorage.getItem('supervision_user_id');
      if (!hasStoredUser) {
        window.location.replace('/login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isLoading || !currentUser) {
    return <BoardSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FAF9F8] dark:bg-slate-950 font-sans">
      {/* DevOps Top Brand Navbar */}
      <Navbar
        onOpenTeam={() => setIsTeamModalOpen(true)}
        onOpenBilling={() => setIsBillingModalOpen(true)}
        onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
        onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
        onOpenProjectsView={() => setCurrentView('projects')}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />

      {/* Optional First-Time / Default Password Alert Banner */}
      {showPasswordBanner && (
        <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-amber-500/10 border-b border-amber-300 dark:border-amber-800/60 px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-amber-950 dark:text-amber-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <KeyRound size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Account Security:</strong> New user logging in with default password (<code className="font-mono font-bold bg-amber-100 dark:bg-amber-950 px-1 py-0.2 rounded border border-amber-300 dark:border-amber-800">Supervision2026!</code>)? Please change your password.
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
            <button
              onClick={() => setIsAccountSettingsOpen(true)}
              className="px-2.5 py-1 rounded bg-[#0078D4] hover:bg-[#106EBE] text-white font-semibold text-[11px] sm:text-xs transition-colors shadow-xs"
            >
              Change Password
            </button>
            <button
              onClick={() => {
                setShowPasswordBanner(false);
                sessionStorage.setItem('dismiss_default_pwd_banner', 'true');
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Dismiss reminder"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Rail & Mobile Off-canvas Drawer */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenTeam={() => setIsTeamModalOpen(true)}
          onOpenBilling={() => setIsBillingModalOpen(true)}
          onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
          onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Dynamic Center Stage: Kanban Board, Sprints, or Projects View */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {currentView === 'boards' && <KanbanBoard />}
          {currentView === 'sprints' && <SprintView />}
          {currentView === 'projects' && (
            <ProjectsView
              onOpenCreateProject={() => setIsCreateProjectModalOpen(true)}
              onSelectProject={(projId) => {
                switchProject(projId);
                setCurrentView('boards');
              }}
              onOpenSprints={(projId) => {
                switchProject(projId);
                setCurrentView('sprints');
              }}
            />
          )}
        </main>
      </div>

      {/* Work Item Detail Drawer (Slide-Over) */}
      <WorkItemDetailDrawer />

      {/* Team Member Management & Seat Invites Modal */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onOpenBilling={() => {
          setIsTeamModalOpen(false);
          setIsBillingModalOpen(true);
        }}
      />

      {/* Commercial SaaS Billing & Subscription Plans Modal */}
      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
      />

      {/* User Account Settings & Password Management Modal */}
      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
      />

      {/* Create New Project / App Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSuccess={(newId) => {
          switchProject(newId);
          setCurrentView('boards');
        }}
      />
    </div>
  );
}
