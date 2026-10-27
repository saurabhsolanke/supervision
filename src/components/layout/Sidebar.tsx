'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/tenantStore';
import {
  Kanban,
  Repeat,
  Users,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentView: 'boards' | 'sprints';
  setCurrentView: (view: 'boards' | 'sprints') => void;
  onOpenTeam: () => void;
  onOpenBilling: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentView,
  setCurrentView,
  onOpenTeam,
  onOpenBilling,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const {
    currentOrg,
    organizations,
    switchOrganization,
    currentProject,
    projects,
    switchProject,
    currentRole,
  } = useTenant();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const sub = currentOrg?.subscription;
  const currentSeats = currentOrg?.memberships?.length || 0;
  const maxSeats = sub?.maxSeats || 10;
  const planTier = sub?.planTier || 'STARTER';

  const handleNavClick = (action: () => void) => {
    action();
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (iPhone & iPad) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-200 select-none ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200 flex'
            : 'hidden md:flex shrink-0 z-20'
        } ${isCollapsed ? 'md:w-14' : 'md:w-64'}`}
      >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Organization & Project Header */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          {(!isCollapsed || isMobileOpen) && currentOrg && (
            <div className="flex items-center gap-2.5 overflow-hidden flex-1">
              <span className="text-xl shrink-0">{currentOrg.logo || '☁️'}</span>
              <div className="min-w-0 flex-1">
                <select
                  value={currentOrg.id}
                  onChange={(e) => {
                    switchOrganization(e.target.value);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent cursor-pointer focus:outline-none truncate hover:text-[#0078D4]"
                  title="Switch Organization Tenant"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id} className="text-slate-900 dark:text-slate-100">
                      {org.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-semibold text-[#0078D4]">{planTier} Plan</span>
                  <span>•</span>
                  <span>{currentSeats}/{maxSeats} seats</span>
                </div>
              </div>
            </div>
          )}

          {/* Controls: Close on Mobile / Collapse on Desktop */}
          <div className="flex items-center gap-1 shrink-0 ml-1">
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
                title="Close sidebar"
              >
                <X size={18} />
              </button>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>

        {/* Project Picker (if not collapsed or in mobile drawer) */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FolderTree size={11} /> Project / App
            </label>
            <select
              value={currentProject?.id || ''}
              onChange={(e) => {
                switchProject(e.target.value);
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0078D4]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Main Navigation Items */}
        <nav className="p-2 space-y-1">
          {/* Boards Navigation */}
          <button
            onClick={() => handleNavClick(() => setCurrentView('boards'))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'boards'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0078D4] dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
            title="Kanban Boards"
          >
            <Kanban size={17} className={currentView === 'boards' ? 'text-[#0078D4]' : 'text-slate-400'} />
            {(!isCollapsed || isMobileOpen) && <span>Kanban Boards</span>}
          </button>

          {/* Sprints Navigation */}
          <button
            onClick={() => handleNavClick(() => setCurrentView('sprints'))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              currentView === 'sprints'
                ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0078D4] dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900'
            }`}
            title="Sprints & Iterations"
          >
            <Repeat size={17} className={currentView === 'sprints' ? 'text-[#0078D4]' : 'text-slate-400'} />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 flex items-center justify-between">
                <span>Sprints</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                  Sprint 34
                </span>
              </div>
            )}
          </button>

          {/* Team Members & Seats */}
          <button
            onClick={() => handleNavClick(onOpenTeam)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 transition-colors cursor-pointer"
            title="Team & Access Management"
          >
            <Users size={17} className="text-slate-400" />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 flex items-center justify-between">
                <span>Team & Access</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {currentSeats}/{maxSeats}
                </span>
              </div>
            )}
          </button>

          {/* Billing & Subscription */}
          <button
            onClick={() => handleNavClick(onOpenBilling)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 transition-colors cursor-pointer"
            title="Billing & Plan Commercials"
          >
            <CreditCard size={17} className="text-slate-400" />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 flex items-center justify-between">
                <span>Billing & Plans</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold uppercase">
                  {planTier}
                </span>
              </div>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Subscription Banner */}
      {!isCollapsed || isMobileOpen ? (
        <div className="p-3 m-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-blue-950/30 dark:to-slate-800/60 border border-blue-100 dark:border-blue-900/40 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
            <Sparkles size={14} className="text-[#0078D4]" />
            <span>DevOps Boards SaaS</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2 leading-tight">
            Multi-Tenant data isolation with role permissions & WIP limits.
          </p>
          <button
            onClick={() => handleNavClick(onOpenBilling)}
            className="w-full py-1.5 rounded-md bg-[#0078D4] text-white text-[11px] font-bold hover:bg-[#106EBE] transition-colors shadow-xs cursor-pointer"
          >
            Manage Subscription
          </button>
        </div>
      ) : (
        <div className="p-2 flex justify-center">
          <button
            onClick={() => handleNavClick(onOpenBilling)}
            className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0078D4] hover:bg-blue-100 cursor-pointer"
            title="Manage Subscription"
          >
            <Sparkles size={16} />
          </button>
        </div>
      )}
    </aside>
    </>
  );
}
