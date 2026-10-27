'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/tenantStore';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { SprintView } from '@/components/sprints/SprintView';
import { WorkItemDetailDrawer } from '@/components/board/WorkItemDetailDrawer';
import { TeamManagementModal } from '@/components/team/TeamManagementModal';
import { BillingModal } from '@/components/billing/BillingModal';
import { BoardSkeleton } from '@/components/ui/BoardSkeleton';

export default function Home() {
  const router = useRouter();
  const { currentUser, isLoading } = useTenant();
  const [currentView, setCurrentView] = useState<'boards' | 'sprints'>('boards');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
      {/*    DevOps Top Brand Navbar */}
      <Navbar
        onOpenTeam={() => setIsTeamModalOpen(true)}
        onOpenBilling={() => setIsBillingModalOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Rail & Mobile Off-canvas Drawer */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenTeam={() => setIsTeamModalOpen(true)}
          onOpenBilling={() => setIsBillingModalOpen(true)}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Dynamic Center Stage: Kanban Board or Sprints */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {currentView === 'boards' ? <KanbanBoard /> : <SprintView />}
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
    </div>
  );
}
