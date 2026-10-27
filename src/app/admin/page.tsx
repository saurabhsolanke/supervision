'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/tenantStore';
import {
  Shield,
  Building2,
  Users,
  Plus,
  Layers,
  ArrowRight,
  ExternalLink,
  Trash2,
  Check,
  AlertCircle,
  Search,
  Sparkles,
  KeyRound,
  UserCheck,
  ArrowLeft,
  Crown,
  Database,
  BarChart3,
  RefreshCw,
  X,
  Mail,
  UserPlus,
  Edit2,
} from 'lucide-react';
import { PlanTier, Role } from '@/types';
import { AdminSkeleton } from '@/components/ui/AdminSkeleton';

interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  createdAt: string;
  subscription?: {
    id: string;
    planTier: PlanTier;
    status: string;
    seatCount: number;
    maxSeats: number;
    billingCycle: string;
  };
  memberships: {
    id: string;
    role: Role;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
      jobTitle?: string;
      isSuperAdmin?: boolean;
    };
  }[];
  _count?: {
    workItems: number;
    projects: number;
    workspaces: number;
    memberships: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { isSuperAdmin, currentUser, loginAsUser, switchOrganization, refreshData: refreshTenantStore } = useTenant();

  const [tenants, setTenants] = useState<OrganizationRecord[]>([]);
  const [metrics, setMetrics] = useState<{
    totalTenants: number;
    totalUsers: number;
    totalWorkItems: number;
    enterpriseTenants: number;
    proTenants: number;
    starterTenants: number;
  }>({
    totalTenants: 0,
    totalUsers: 0,
    totalWorkItems: 0,
    enterpriseTenants: 0,
    proTenants: 0,
    starterTenants: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTenantForUsers, setSelectedTenantForUsers] = useState<OrganizationRecord | null>(null);

  // New Tenant Form State
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantLogo, setTenantLogo] = useState('🏢');
  const [tenantTier, setTenantTier] = useState<PlanTier>('PRO');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminJobTitle, setAdminJobTitle] = useState('Tenant Administrator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New User for Tenant Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserJobTitle, setNewUserJobTitle] = useState('Software Engineer');
  const [newUserRole, setNewUserRole] = useState<Role>('MEMBER');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // 1. Fetch Tenants & Metrics from Admin API
  const fetchAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/tenants');
      const data = await res.json();
      if (data.organizations) {
        setTenants(data.organizations);
      }
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch admin tenants:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Handle auto slug creation
  const handleNameChange = (val: string) => {
    setTenantName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setTenantSlug(generatedSlug);
  };

  // Create New Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantSlug.trim() || !adminEmail.trim()) {
      setFormError('Organization name, slug, and Admin email are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tenantName.trim(),
          slug: tenantSlug.trim(),
          logoUrl: tenantLogo,
          planTier: tenantTier,
          adminName: adminName.trim(),
          adminEmail: adminEmail.trim(),
          adminJobTitle: adminJobTitle.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to create organization');
        return;
      }

      // Reset and close
      setTenantName('');
      setTenantSlug('');
      setAdminName('');
      setAdminEmail('');
      setIsCreateModalOpen(false);
      await fetchAdminData();
      await refreshTenantStore();
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add User to existing Tenant
  const handleAddUserToTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForUsers || !newUserEmail.trim()) {
      setUserFormError('User email is required');
      return;
    }

    try {
      setIsAddingUser(true);
      setUserFormError(null);
      const res = await fetch(`/api/admin/tenants/${selectedTenantForUsers.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          jobTitle: newUserJobTitle.trim(),
          role: newUserRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setUserFormError(data.error || 'Failed to add user to tenant');
        return;
      }

      setNewUserName('');
      setNewUserEmail('');
      setNewUserJobTitle('Software Engineer');
      setNewUserRole('MEMBER');
      await fetchAdminData();
      await refreshTenantStore();

      // Refresh selected tenant in modal
      const updatedTenant = tenants.find((t) => t.id === selectedTenantForUsers.id);
      if (updatedTenant) {
        setSelectedTenantForUsers(updatedTenant);
      }
    } catch (err: any) {
      setUserFormError(err.message || 'An error occurred adding user');
    } finally {
      setIsAddingUser(false);
    }
  };

  // Delete Tenant
  const handleDeleteTenant = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${orgName}" and all its isolated workspaces, boards, and work items? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tenants/${orgId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAdminData();
        await refreshTenantStore();
      }
    } catch (err) {
      console.error('Failed to delete tenant:', err);
    }
  };

  // Jump into Tenant as Admin
  const handleJumpToTenant = (org: OrganizationRecord) => {
    switchOrganization(org.id);
    router.push('/');
  };

  // Filtered tenants
  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. Detect if restored from browser bfcache after logout
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // 2. Authorization Guard: Admin or SuperAdmin privileges required
  useEffect(() => {
    const hasStoredUser = typeof window !== 'undefined' && localStorage.getItem('supervision_user_id');
    const hasTokenCookie = typeof document !== 'undefined' && document.cookie.includes('supervision_token');

    if (!hasStoredUser && !hasTokenCookie) {
      window.location.replace('/login');
      return;
    }

    if (!isLoading && (!currentUser || !isSuperAdmin)) {
      window.location.replace('/login');
    }
  }, [isLoading, currentUser, isSuperAdmin]);

  // 3. Popstate listener for back button
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

  if (isLoading || !currentUser || !isSuperAdmin) {
    return <AdminSkeleton />;
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#0B1120] text-slate-100 font-sans select-none overflow-x-hidden">
      {/* Top SuperAdmin Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#0078D4] to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Crown size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="font-bold text-sm sm:text-base text-white tracking-tight truncate">Supervision Admin</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-blue-950 text-blue-300 border border-blue-800 shrink-0">
                SUPERADMIN CONTROL
              </span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">Multi-Tenant Management & Provisioning</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Return to Boards</span>
            <span className="sm:hidden">Boards</span>
          </button>

          <button
            onClick={() => fetchAdminData()}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh Tenant Metrics"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-3 sm:p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-8">
        {/* Metric Cards Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md relative overflow-hidden">
            <div className="text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate">Active Orgs</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1 sm:mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
              <span>{metrics.totalTenants}</span>
              <span className="text-[10px] sm:text-xs font-normal text-emerald-400 truncate hidden xs:inline">Tenants</span>
            </div>
            <Building2 className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 text-slate-800/60" size={32} />
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md relative overflow-hidden">
            <div className="text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate">Platform Users</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1 sm:mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
              <span>{metrics.totalUsers}</span>
              <span className="text-[10px] sm:text-xs font-normal text-blue-400 truncate hidden xs:inline">All orgs</span>
            </div>
            <Users className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 text-slate-800/60" size={32} />
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md relative overflow-hidden">
            <div className="text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate">Work Items</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1 sm:mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
              <span>{metrics.totalWorkItems}</span>
              <span className="text-[10px] sm:text-xs font-normal text-purple-400 truncate hidden xs:inline">PostgreSQL</span>
            </div>
            <Layers className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 text-slate-800/60" size={32} />
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md relative overflow-hidden">
            <div className="text-slate-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate">SaaS Mix</div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                {metrics.enterpriseTenants} Ent
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                {metrics.proTenants} Pro
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {metrics.starterTenants} Start
              </span>
            </div>
            <BarChart3 className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 text-slate-800/60" size={32} />
          </div>
        </div>

        {/* Tenant Table Section */}
        <div className="rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md overflow-hidden">
          {/* Action Bar Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-[#0078D4]" />
                <span>Tenants & Organization Control</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Isolated database workspace, board columns, users, and seat quotas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter organizations..."
                  className="w-full sm:w-auto pl-8 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0078D4]"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-3.5 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Add New Tenant</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto touch-pan-x">
            <table className="w-full min-w-[650px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-3 px-4 sm:px-5">Organization</th>
                  <th className="py-3 px-3 sm:px-4">Plan & Seats</th>
                  <th className="py-3 px-3 sm:px-4">Tenant Admin</th>
                  <th className="py-3 px-3 sm:px-4">Workspaces & Items</th>
                  <th className="py-3 px-3 sm:px-4">Created Date</th>
                  <th className="py-3 px-4 sm:px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTenants.map((org) => {
                  const adminMember = org.memberships.find(
                    (m) => m.role === 'OWNER' || m.role === 'ADMIN'
                  ) || org.memberships[0];

                  const sub = org.subscription;
                  const seatUsagePercent = sub ? Math.round((sub.seatCount / sub.maxSeats) * 100) : 0;

                  return (
                    <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Organization Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                            {org.logoUrl || '🏢'}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white">{org.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">/{org.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* Plan & Seats */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              sub?.planTier === 'ENTERPRISE'
                                ? 'bg-purple-950 text-purple-300 border-purple-800'
                                : sub?.planTier === 'PRO'
                                ? 'bg-blue-950 text-blue-300 border-blue-800'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {sub?.planTier || 'PRO'}
                          </span>
                          <div className="text-[11px] text-slate-400">
                            {org.memberships.length} of {sub?.maxSeats || 10} seats utilized
                          </div>
                          <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0078D4]"
                              style={{ width: `${Math.min(seatUsagePercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Tenant Admin */}
                      <td className="py-4 px-4">
                        {adminMember ? (
                          <div className="flex items-center gap-2.5">
                            {adminMember.user.avatarUrl ? (
                              <img
                                src={adminMember.user.avatarUrl}
                                alt={adminMember.user.name}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#0078D4] text-white flex items-center justify-center font-bold text-[10px]">
                                {adminMember.user.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-200">{adminMember.user.name}</div>
                              <div className="text-[10px] text-slate-400">{adminMember.user.email}</div>
                              <span className="text-[9px] font-mono font-bold text-amber-400 uppercase">
                                {adminMember.role}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No admin assigned</span>
                        )}
                      </td>

                      {/* Workspaces & Items */}
                      <td className="py-4 px-4">
                        <div className="text-slate-300 font-medium">
                          {org._count?.workItems ?? 0} Work Items
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {org._count?.projects ?? 1} Projects • {org._count?.workspaces ?? 1} Workspaces
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTenantForUsers(org)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Manage Tenant Users & Admins"
                          >
                            <Users size={13} />
                            <span>Users ({org.memberships.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleJumpToTenant(org)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0078D4] hover:bg-[#106EBE] text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Open Tenant Kanban Boards"
                          >
                            <span>Open</span>
                            <ArrowRight size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTenant(org.id, org.name)}
                            className="p-1.5 rounded-lg hover:bg-red-950/60 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete Tenant"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1: Create New Tenant & Assign Admin */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-4 sm:p-7 space-y-4 sm:space-y-5 animate-in zoom-in-95 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <Building2 size={18} className="text-[#0078D4] shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white truncate">Provision New Organization Tenant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 shrink-0 ml-2"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4">
              {/* Organization Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Acme Robotics"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0078D4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Logo / Emoji
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['🏢', '🚀', '⚡', '🛡️', '🧬', '🔬'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setTenantLogo(emoji)}
                        className={`text-base p-1.5 rounded-md border ${
                          tenantLogo === emoji
                            ? 'bg-blue-950 border-[#0078D4]'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tenant Subdomain / Slug *
                </label>
                <div className="flex items-center">
                  <span className="px-2 sm:px-3 py-2 bg-slate-950 border border-r-0 border-slate-800 rounded-l-lg text-[11px] sm:text-xs text-slate-500 font-mono shrink-0">
                    supervision.io/
                  </span>
                  <input
                    type="text"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    placeholder="acme-robotics"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-r-lg text-base sm:text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#0078D4]"
                    required
                  />
                </div>
              </div>

              {/* Subscription Tier */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subscription Plan Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['STARTER', 'PRO', 'ENTERPRISE'] as PlanTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setTenantTier(tier)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        tenantTier === tier
                          ? 'bg-blue-950/60 border-[#0078D4] text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{tier}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {tier === 'STARTER' ? '3 Seats' : tier === 'PRO' ? '10 Seats' : '50 Seats'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Tenant Administrator */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-[#0078D4]" />
                  <span>Assign Primary Tenant Admin (Owner)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Admin Full Name
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Elena Smith"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0078D4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Admin Work Email *
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="elena@acmerobotics.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0078D4]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Provisioning Database...</span>
                    </>
                  ) : (
                    <>
                      <span>Provision Tenant</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage Tenant Users & Admins */}
      {selectedTenantForUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-7 space-y-4 sm:space-y-5 animate-in zoom-in-95 max-h-[92vh] sm:max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0">{selectedTenantForUsers.logoUrl || '🏢'}</span>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate">
                    <span className="truncate">{selectedTenantForUsers.name}</span>
                    <span className="text-[11px] sm:text-xs font-mono text-slate-400 shrink-0">Directory</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                    Add new users, promote administrators, and configure RBAC roles.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTenantForUsers(null)}
                className="text-slate-400 hover:text-white p-1 shrink-0 ml-2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Add User Form */}
            <form onSubmit={handleAddUserToTenant} className="p-3 sm:p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <UserPlus size={14} className="text-[#0078D4]" />
                <span>Add User / Admin to {selectedTenantForUsers.name}</span>
              </div>

              {userFormError && (
                <div className="p-2.5 rounded bg-red-950/80 border border-red-800 text-red-200 text-xs">
                  {userFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Full Name"
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-base sm:text-xs text-white placeholder-slate-500"
                />

                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@company.com *"
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-base sm:text-xs text-white placeholder-slate-500"
                  required
                />

                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-base sm:text-xs text-white"
                >
                  <option value="OWNER">OWNER (Full Admin & Billing)</option>
                  <option value="ADMIN">ADMIN (Team & WIP Control)</option>
                  <option value="MEMBER">MEMBER (Board Work Items)</option>
                  <option value="VIEWER">VIEWER (Read-Only)</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-semibold rounded shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAddingUser ? 'Adding...' : 'Add User to Tenant'}
                </button>
              </div>
            </form>

            {/* Existing User Directory */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Current Members ({selectedTenantForUsers.memberships.length})
              </div>

              {selectedTenantForUsers.memberships.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-0"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {m.user.avatarUrl ? (
                      <img
                        src={m.user.avatarUrl}
                        alt={m.user.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#0078D4] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {m.user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-white flex items-center gap-2 truncate">
                        <span className="truncate">{m.user.name}</span>
                        {m.user.isSuperAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                            SUPERADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{m.user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        m.role === 'OWNER'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : m.role === 'ADMIN'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : m.role === 'MEMBER'
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {m.role}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        loginAsUser(m.user.id, selectedTenantForUsers.id);
                        router.push('/');
                      }}
                      className="px-2 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 transition-colors cursor-pointer"
                      title="Simulate signing in as this user"
                    >
                      Sign In As
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
