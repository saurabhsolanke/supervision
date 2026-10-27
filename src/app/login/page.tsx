'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/tenantStore';
import {
  Layers,
  Lock,
  Shield,
  ArrowRight,
  Check,
  Mail,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  Users,
  AlertCircle,
  KeyRound,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { Role } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsUser, allUsers, organizations, isLoading } = useTenant();

  const [activeTab, setActiveTab] = useState<'credentials' | 'personas'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Secure sign in via Email & Password
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const res = await login(email.trim(), password);
      if (res.success) {
        if (res.user?.isSuperAdmin || email.trim().toLowerCase().includes('superadmin')) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick 1-click persona sign-in
  const handlePersonaSelect = (userId: string, orgId?: string, isSuper?: boolean) => {
    loginAsUser(userId, orgId);
    if (isSuper) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const superadminUser = allUsers.find(
    (u) => u.isSuperAdmin || u.email.includes('superadmin')
  );

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A192F] text-slate-100 font-sans select-none relative overflow-x-hidden">
      {/* Background Decorative Mesh & Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0078D4]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="h-14 px-3 sm:px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <div className="w-7 h-7 rounded bg-[#0078D4] flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Layers size={17} />
            </div>
            <span className="tracking-tight text-base font-semibold">Supervision</span>
            <span className="hidden sm:inline text-slate-500 text-xs font-normal">|</span>
            <span className="hidden md:inline text-xs text-slate-400 font-medium">Enterprise Multi-Tenant Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => {
              if (superadminUser) {
                handlePersonaSelect(superadminUser.id, undefined, true);
              } else {
                router.push('/admin');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 hover:bg-amber-900/50 transition-colors cursor-pointer text-xs"
          >
            <Crown size={13} className="text-amber-400" />
            <span className="font-semibold">SuperAdmin</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Supabase Connected</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Stage */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 z-10 my-4 sm:my-6">
        <div className="w-full max-w-md sm:max-w-xl bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Brand Header */}
          <div className="p-4 sm:p-6 sm:p-8 border-b border-slate-800 bg-gradient-to-b from-slate-800/50 to-transparent">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Sign in to Supervision DevOps
            </h1>
          </div>

          {/* Tab 1: Direct Work Email & Password */}
          {activeTab === 'credentials' && (
            <div className="p-4 sm:p-6 sm:p-8 space-y-4 sm:space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enterprise Work Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah.connor@contoso.com or superadmin@supervision.io"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password..."
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-[#0078D4] focus:ring-0"
                    />
                    <span className="text-xs text-slate-300">Keep me signed in</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Encrypted with TLS 1.3</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full py-2.5 bg-[#0078D4] hover:bg-[#106EBE] active:bg-[#005A9E] text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating with Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Supervision</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: 1-Click Fast Demo Personas */}
          {activeTab === 'personas' && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2.5">
                <Sparkles size={16} className="text-[#0078D4] shrink-0 mt-0.5" />
                <div>
                  <strong>Tenant Admins & User Personas:</strong> Click any tenant Admin below to simulate their full administrative authority, or choose a member/viewer to evaluate strict RBAC isolation.
                </div>
              </div>

              {/* Tenant Groups */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {isLoading || organizations.length === 0 ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-5 h-5 rounded bg-slate-800" />
                            <Skeleton className="h-4 w-32 bg-slate-800" />
                          </div>
                          <Skeleton className="h-4 w-16 rounded bg-slate-800" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Skeleton className="h-12 w-full rounded-lg bg-slate-900 border border-slate-800" />
                          <Skeleton className="h-12 w-full rounded-lg bg-slate-900 border border-slate-800" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  organizations.map((org) => {
                  const orgUsers = allUsers.filter((u) =>
                    org.memberships?.some((m) => m.userId === u.id)
                  );

                  return (
                    <div key={org.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{org.logo}</span>
                          <span className="text-xs font-bold text-slate-200">{org.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900">
                          {org.subscription?.planTier}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {orgUsers.map((user) => {
                          const member = org.memberships?.find((m) => m.userId === user.id);
                          const role: Role = member?.role || 'MEMBER';
                          const isOrgAdmin = role === 'OWNER' || role === 'ADMIN';

                          return (
                            <button
                              key={`${org.id}-${user.id}`}
                              type="button"
                              onClick={() => handlePersonaSelect(user.id, org.id, user.isSuperAdmin)}
                              className={`p-2.5 rounded-lg border flex items-center justify-between text-left transition-all group cursor-pointer ${
                                isOrgAdmin
                                  ? 'border-blue-800/60 bg-blue-950/20 hover:border-[#0078D4] hover:bg-blue-950/40'
                                  : 'border-slate-800/90 bg-slate-900/90 hover:bg-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#0078D4] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    {user.initials}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-100 group-hover:text-blue-400 truncate flex items-center gap-1">
                                    <span>{user.name}</span>
                                    {isOrgAdmin && <span className="text-[9px] text-amber-400">★</span>}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {user.jobTitle}
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 border ml-2 ${
                                  role === 'OWNER'
                                    ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                                    : role === 'ADMIN'
                                    ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                                    : role === 'MEMBER'
                                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                                    : 'bg-amber-950/80 text-amber-300 border-amber-800'
                                }`}
                              >
                                {role}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          )}

          {/* Security & Multi-Tenancy Guarantee Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Lock size={12} className="text-slate-400 shrink-0" />
              <span>Multi-Tenant Row-Level Security</span>
            </div>
            <span>SOC2 Type II • ISO 27001</span>
          </div>
        </div>
      </main>

      {/* Corporate Legal Footer */}
      <footer className="h-auto sm:h-12 py-3 sm:py-0 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-800/60 bg-slate-950/60 z-10 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <span>&copy; 2026 Supervision Platform</span>
          <a href="#terms" className="hover:underline">Terms of Use</a>
          <a href="#privacy" className="hover:underline">Privacy & Cookies</a>
        </div>
        <div className="flex items-center gap-2">
          <span>DevOps Enterprise Platform</span>
        </div>
      </footer>
    </div>
  );
}
