'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/tenantStore';
import {
  Layers,
  ChevronDown,
  Shield,
  HelpCircle,
  RotateCcw,
  Search,
  Check,
  Building2,
  FolderGit2,
  Lock,
  LogOut,
  CreditCard,
  Users,
  Crown,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onOpenTeam: () => void;
  onOpenBilling: () => void;
  onToggleMobileNav?: () => void;
}

export function Navbar({ onOpenTeam, onOpenBilling, onToggleMobileNav }: NavbarProps) {
  const router = useRouter();
  const {
    currentOrg,
    organizations,
    switchOrganization,
    currentProject,
    projects,
    switchProject,
    currentUser,
    currentRole,
    filterState,
    setFilterState,
    refreshData,
    isLoading,
    logout,
    isSuperAdmin,
  } = useTenant();

  const isAdmin = isSuperAdmin || currentRole === 'OWNER' || currentRole === 'ADMIN' || Boolean(currentUser?.isSuperAdmin);

  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <header className="h-12 bg-[#0078D4] text-white flex items-center justify-between px-2.5 sm:px-4 select-none shrink-0 shadow-xs z-30 relative">
      {/* Left: Mobile Nav Toggle + DevOps Logo & Breadcrumbs */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Drawer Toggle (iPhone & iPad portrait) */}
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="p-1.5 rounded hover:bg-white/15 text-white md:hidden transition-colors shrink-0"
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>
        )}

        {/* DevOps Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-sm tracking-tight shrink-0">
          <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-black text-xs text-white">
            <Layers size={14} />
          </div>
          <span className="hidden sm:inline font-bold">DevOps</span>
        </div>

        <span className="text-white/40 hidden sm:inline">/</span>

        {/* Tenant (Organization) Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsTenantMenuOpen(!isTenantMenuOpen);
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded hover:bg-white/10 transition-colors text-xs font-semibold"
          >
            <span className="text-sm sm:text-base shrink-0">{currentOrg?.logo || '☁️'}</span>
            <span className="max-w-[75px] sm:max-w-[140px] truncate">{currentOrg?.name || 'Loading...'}</span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1 sm:px-1.5 py-0.2 rounded bg-white/20 text-white shrink-0 hidden sm:inline">
              {currentOrg?.subscription?.planTier || 'STARTER'}
            </span>
            <ChevronDown size={12} className="text-white/70 shrink-0" />
          </button>

          {/* Tenant Dropdown Menu */}
          {isTenantMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsTenantMenuOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  <Building2 size={12} /> Switch Organization (Strict Isolation)
                </div>
                {organizations.map((org) => {
                  const isSelected = org.id === currentOrg?.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        switchOrganization(org.id);
                        setIsTenantMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center justify-between text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0078D4] font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{org.logo}</span>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{org.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {org.subscription.planTier} • {org.memberships.length} members
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-[#0078D4]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <span className="text-white/40 hidden md:inline">/</span>

        {/* Project Switcher */}
        {currentProject && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <FolderGit2 size={14} className="text-white/70" />
            <select
              value={currentProject.id}
              onChange={(e) => switchProject(e.target.value)}
              className="bg-white/10 hover:bg-white/20 text-white rounded px-2 py-0.5 text-xs font-semibold cursor-pointer focus:outline-none transition-colors"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="text-slate-900 dark:text-slate-100">
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Center: Quick Search Bar */}
      <div className="hidden lg:flex items-center w-80 relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60" />
        <input
          type="text"
          placeholder="Search items or AB# in tenant..."
          value={filterState.searchQuery}
          onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
          className="w-full bg-white/15 hover:bg-white/20 focus:bg-white focus:text-slate-900 placeholder:text-white/60 text-xs pl-8 pr-3 py-1 rounded text-white focus:outline-none transition-all shadow-inner"
        />
      </div>

      {/* Right: User Role Badge + Admin Panel + DB Refresh + User Persona */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Active User & Role Badge (Informational indicator, no switcher) */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/15 text-xs font-semibold shadow-xs select-none shrink-0"
          title={`Signed in as ${currentUser?.name || 'User'} (${currentUser?.email || ''}) — Role: ${currentRole}`}
        >
          <Shield size={12} className="text-amber-300 shrink-0" />
          <span className="font-bold text-amber-200 text-[11px] sm:text-xs">{currentRole}</span>
          <span className="text-white/40 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
              {currentUser?.initials || currentUser?.name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            <span className="text-white font-semibold truncate max-w-[100px] lg:max-w-[150px]">
              {currentUser?.name || 'User'}
            </span>
          </div>
        </div>

        {/* Admin Panel Link - Visible only to admin / super admin */}
        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
            title="Open Control Plane"
          >
            <Crown size={12} className="text-slate-950 shrink-0" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Refresh Live DB Data Button */}
        <button
          onClick={() => refreshData()}
          className="p-1 sm:p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors shrink-0"
          title="Refresh live data from Supabase"
        >
          <RotateCcw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>

        {/* Help & Architecture Dialog */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="hidden sm:flex p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors shrink-0"
          title="Architecture & SaaS Multi-Tenancy Info"
        >
          <HelpCircle size={15} />
        </button>

        {/* Active User Avatar & Profile Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsTenantMenuOpen(false);
            }}
            className="flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-2 border-l border-white/20 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            title={currentUser ? `Logged in as ${currentUser.name} (${currentUser.email})` : 'User profile'}
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/50"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white text-[#0078D4] flex items-center justify-center font-bold text-xs">
                {currentUser?.initials || 'U'}
              </div>
            )}
            <ChevronDown size={12} className="text-white/70" />
          </button>

          {/* User Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0078D4] text-white flex items-center justify-center font-bold text-sm">
                      {currentUser?.initials || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {currentUser?.name || 'Enterprise User'}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {currentUser?.email}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#0078D4] dark:bg-blue-950 dark:text-blue-300">
                        {currentRole}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {currentOrg?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenTeam();
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Users size={14} className="text-slate-400" />
                    <span>Manage Team Members & Seats</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenBilling();
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <CreditCard size={14} className="text-slate-400" />
                    <span>SaaS Billing & Subscription</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push('/admin');
                      }}
                      className="w-full px-4 py-2 flex items-center gap-2.5 text-left text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors font-medium cursor-pointer"
                    >
                      <Crown size={14} />
                      <span>Admin Control Plane</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      router.push('/login');
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Building2 size={14} className="text-[#0078D4]" />
                    <span>Switch Tenant / Persona Login</span>
                  </button>
                </div>

                {/* Sign Out */}
                <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsProfileMenuOpen(false);
                      await logout();
                      window.location.replace('/login');
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors font-medium cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-slate-800 dark:text-slate-100">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Lock size={16} className="text-[#0078D4]" />
                   DevOps Multi-Tenant Architecture
              </h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>1. Data Isolation:</strong> Every core entity (WorkItem, Project, BoardColumn, Tag) is indexed by <code>organization_id</code>. Switching tenants guarantees no data leak between organizations.
              </p>
              <p>
                <strong>2. Role-Based Access Control:</strong>
                <br />• <strong>Owner:</strong> Full access including Billing & Plans.
                <br />• <strong>Admin:</strong> Can invite members & configure column WIP limits.
                <br />• <strong>Member:</strong> Create, edit, and comment on work items.
                <br />• <strong>Viewer:</strong> Read-only inspection (card drag & edits disabled).
              </p>
              <p>
                <strong>3. Commercial Tier Features:</strong> Starter (3 seats), Pro (10 seats, custom WIP limits, sprints), Enterprise (50 seats, SOC2 audit logs).
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-1.5 bg-[#0078D4] text-white rounded text-xs font-semibold hover:bg-[#106EBE]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
