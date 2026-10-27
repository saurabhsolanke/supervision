'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/tenantStore';
import { PLAN_CONFIGS } from '@/lib/constants';
import {
  X,
  FolderGit2,
  Sparkles,
  Layers,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetOrgId?: string;
  onSuccess?: (projectId: string) => void;
}

const EMOJI_OPTIONS = ['🚀', '📱', '🌐', '⚡', '🛡️', '📦', '🤖', '💻', '⚙️', '📊', '🔥', '🎯'];

export function CreateProjectModal({
  isOpen,
  onClose,
  targetOrgId,
  onSuccess,
}: CreateProjectModalProps) {
  const {
    currentOrg,
    organizations,
    createProject,
    canCreateProject,
    projects,
  } = useTenant();

  const org = targetOrgId
    ? organizations.find((o) => o.id === targetOrgId) || currentOrg
    : currentOrg;

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [icon, setIcon] = useState('🚀');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !org) return null;

  const planTier = org.subscription?.planTier || 'STARTER';
  const planConfig = PLAN_CONFIGS[planTier];
  const orgProjectsCount = projects.filter((p) => p.organizationId === org.id).length;
  const isLimitReached =
    planConfig.maxProjects !== 'Unlimited' && orgProjectsCount >= planConfig.maxProjects;

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate 3-4 character uppercase key from words
    const words = val.trim().split(/\s+/).filter(Boolean);
    let autoKey = '';
    if (words.length === 1) {
      autoKey = words[0].slice(0, 4).toUpperCase();
    } else if (words.length > 1) {
      autoKey = words
        .map((w) => w[0])
        .join('')
        .slice(0, 4)
        .toUpperCase();
    }
    setKey(autoKey.replace(/[^A-Z0-9]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!canCreateProject) {
      setErrorMessage('Permission denied: Only Organization Admins and Owners can create projects.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Please enter a project or app name.');
      return;
    }

    if (!key.trim() || key.trim().length < 2) {
      setErrorMessage('Project key must be at least 2 characters (e.g. AZP, CORE).');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createProject({
        organizationId: org.id,
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
        icon,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create project.');
      } else {
        setName('');
        setKey('');
        setDescription('');
        if (onSuccess && res.project) {
          onSuccess(res.project.id);
        }
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#0078D4] flex items-center justify-center shrink-0">
              <FolderGit2 size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                Create New Project / App
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Tenant: {org.name} ({planConfig.name} Plan)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Plan Quota Info */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#0078D4]" />
              <span className="text-slate-600 dark:text-slate-300">
                Plan Limit:{' '}
                <strong>
                  {planConfig.maxProjects === 'Unlimited'
                    ? 'Unlimited Projects'
                    : `${orgProjectsCount} of ${planConfig.maxProjects} used`}
                </strong>
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#0078D4] dark:bg-blue-950 dark:text-blue-300">
              {planTier}
            </span>
          </div>

          {isLimitReached && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-200 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>
                <strong>Project limit reached:</strong> Your {planConfig.name} plan only allows up to{' '}
                {planConfig.maxProjects} projects. Please upgrade to Pro for unlimited apps.
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Name and Emoji Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project / App Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={isLimitReached}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Mobile App iOS or Customer Portal"
                  className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0078D4] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Icon
                </label>
                <div className="relative">
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    disabled={isLimitReached}
                    className="w-full px-3 py-2 text-base sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0078D4] cursor-pointer"
                  >
                    {EMOJI_OPTIONS.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Project Key Identifier */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Project Key *
                </label>
                <span className="text-[11px] text-slate-400">Used for Work Items (e.g. {key || 'APP'}#101)</span>
              </div>
              <input
                type="text"
                required
                maxLength={8}
                disabled={isLimitReached}
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="e.g. AZP, CORE, WEB"
                className="w-full px-3 py-2 text-base sm:text-xs font-mono font-bold uppercase rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0078D4] disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                disabled={isLimitReached}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of application purpose, repository, or architecture scope..."
                className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0078D4] disabled:opacity-50"
              />
            </div>

            {/* Auto-Provisioned Assets Notice */}
            <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <Layers size={13} className="text-[#0078D4]" />
                <span>Automatic Kanban Scaffold:</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Creating this project automatically provisions standard DevOps columns (<strong>New, Active, Resolved, Closed</strong>) and initializes <strong>Sprint 1</strong>.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLimitReached || !name.trim() || !key.trim()}
                className="px-5 py-2 bg-[#0078D4] hover:bg-[#106EBE] active:bg-[#005A9E] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Project...</span>
                  </>
                ) : (
                  <>
                    <span>Create Project</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
