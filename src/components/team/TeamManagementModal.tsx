'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/tenantStore';
import { Role } from '@/types';
import { Users, Mail, UserPlus, AlertCircle, CheckCircle, Shield, Sparkles, X, KeyRound, Copy, Check } from 'lucide-react';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBilling: () => void;
}

export function TeamManagementModal({ isOpen, onClose, onOpenBilling }: TeamManagementModalProps) {
  const { currentOrg, tenantMembers, inviteMember, canInviteMembers } = useTenant();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !currentOrg) return null;

  const sub = currentOrg.subscription;
  const currentSeats = currentOrg.memberships?.length || 0;
  const maxSeats = sub?.maxSeats || 3;
  const seatPercentage = Math.min(100, Math.round((currentSeats / maxSeats) * 100));
  const isSeatLimitReached = currentSeats >= maxSeats;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const res = await inviteMember(email.trim(), role);
    if (res.success) {
      setSuccessMessage(`Invitation sent to ${email} as ${role}! Initial login password: Supervision2026! (User can change it in Account Settings).`);
      setEmail('');
    } else {
      setErrorMessage(res.error || 'Failed to send invitation');
    }
  };

  const roles: { role: Role; label: string; desc: string }[] = [
    { role: 'OWNER', label: 'Owner', desc: 'Full tenant control, billing, subscriptions & workspace settings' },
    { role: 'ADMIN', label: 'Admin', desc: 'Manage team members, project boards, and column WIP policies' },
    { role: 'MEMBER', label: 'Member', desc: 'Create, update, and comment on work items' },
    { role: 'VIEWER', label: 'Viewer', desc: 'Read-only access to boards and backlogs' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#0078D4]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                Team Members & Seat Management
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Tenant: {currentOrg.name} ({sub.planTier} Plan)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Seat Capacity Progress Card */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Subscription Seat Utilization
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {currentSeats} of {maxSeats} seats used ({seatPercentage}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isSeatLimitReached
                    ? 'bg-red-500'
                    : seatPercentage > 75
                    ? 'bg-amber-500'
                    : 'bg-[#0078D4]'
                }`}
                style={{ width: `${seatPercentage}%` }}
              />
            </div>

            {isSeatLimitReached ? (
              <div className="flex items-center justify-between mt-3 p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-600" />
                  <span>
                    <strong>Seat limit reached:</strong> You have reached the maximum allowed seats on the{' '}
                    <strong>{sub.planTier}</strong> plan.
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenBilling();
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700 shrink-0 shadow-xs"
                >
                  Upgrade Plan
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                You have {maxSeats - currentSeats} available seats remaining on your subscription.
              </p>
            )}
          </div>

          {/* Invitation Form */}
          {canInviteMembers && (
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus size={14} className="text-[#0078D4]" />
                Invite New Team Member
              </h3>

              {errorMessage && (
                <div className="p-2.5 text-xs rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 text-xs rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle size={14} />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleInvite} className="space-y-3">
                {/* Default Password Notice with 1-Click Copy */}
                <div className="p-2.5 rounded bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={14} className="text-[#0078D4] shrink-0" />
                    <span>
                      Initial Password: <strong className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.2 rounded font-bold">Supervision2026!</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('Supervision2026!');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        disabled={isSeatLimitReached}
                        placeholder="colleague@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0078D4] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Role Assignment
                    </label>
                    <select
                      value={role}
                      disabled={isSeatLimitReached}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0078D4] disabled:opacity-50"
                    >
                      {roles.map((r) => (
                        <option key={r.role} value={r.role}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSeatLimitReached || !email.trim()}
                    className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#0078D4] text-white hover:bg-[#106EBE] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <UserPlus size={13} />
                    <span>Send Invitation</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield size={14} className="text-slate-500" />
              Active Organization Members ({tenantMembers.length})
            </h3>

            <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">User</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5">Title</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tenantMembers.map(({ user, role: memberRole }) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#0078D4] text-white flex items-center justify-center font-bold text-[10px]">
                              {user.initials}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            memberRole === 'OWNER'
                              ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                              : memberRole === 'ADMIN'
                              ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                              : memberRole === 'MEMBER'
                              ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {memberRole}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        {user.jobTitle}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs text-slate-500">
          <span>Enterprise Role-Based Access Control (RBAC) enforced</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
