'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/tenantStore';
import { PLAN_CONFIGS } from '@/lib/constants';
import {
  FolderGit2,
  Plus,
  Search,
  Kanban,
  Repeat,
  Layers,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Project } from '@/types';
import { EditProjectModal } from './EditProjectModal';

interface ProjectsViewProps {
  onOpenCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
  onOpenSprints: (projectId: string) => void;
}

export function ProjectsView({
  onOpenCreateProject,
  onSelectProject,
  onOpenSprints,
}: ProjectsViewProps) {
  const {
    currentOrg,
    projects,
    currentProject,
    canCreateProject,
    deleteProject,
  } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await deleteProject(deletingProject.id);
      if (!res.success) {
        setDeleteError(res.error || 'Failed to delete project');
        return;
      }
      setDeletingProject(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting project');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentOrg) return null;

  const planTier = currentOrg.subscription?.planTier || 'STARTER';
  const planConfig = PLAN_CONFIGS[planTier];
  const totalWorkItems = projects.reduce((acc, p) => acc + (p.workItems?.length || 0), 0);
  const totalSprints = projects.reduce((acc, p) => acc + (p.sprints?.length || 0), 0);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isLimitReached =
    planConfig.maxProjects !== 'Unlimited' && projects.length >= planConfig.maxProjects;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <FolderGit2 className="text-[#0078D4]" size={24} />
              <span>Projects & Applications</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-[#0078D4] dark:bg-blue-950 dark:text-blue-300">
              {projects.length} {projects.length === 1 ? 'App' : 'Apps'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your organization's software applications, microservices, and dedicated Kanban boards.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {canCreateProject ? (
            <button
              onClick={onOpenCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-[#0078D4] hover:bg-[#106EBE] active:bg-[#005A9E] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Create New Project</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Admin privileges required to provision new projects
            </div>
          )}
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Total Projects
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {projects.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across current organization</div>
          <FolderGit2 className="absolute right-3 bottom-3 text-slate-200 dark:text-slate-800" size={32} />
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Live Work Items
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0078D4] mt-1">
            {totalWorkItems}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Stories, Tasks, Bugs & Features</div>
          <Layers className="absolute right-3 bottom-3 text-slate-200 dark:text-slate-800" size={32} />
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Active Sprints
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalSprints}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">2-week release iterations</div>
          <Repeat className="absolute right-3 bottom-3 text-slate-200 dark:text-slate-800" size={32} />
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs relative overflow-hidden">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            SaaS Plan Quota
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {planConfig.maxProjects === 'Unlimited' ? (
              <span className="text-purple-600 dark:text-purple-400 font-black">Unlimited</span>
            ) : (
              <span>
                {projects.length} / {planConfig.maxProjects}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Tier: <strong>{planConfig.name}</strong>
          </div>
          <Sparkles className="absolute right-3 bottom-3 text-slate-200 dark:text-slate-800" size={32} />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, key, or scope..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0078D4] shadow-xs"
          />
        </div>

        {isLimitReached && (
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-3 py-1.5 rounded-lg">
            <AlertCircle size={14} className="shrink-0" />
            <span>Plan project limit reached ({planConfig.maxProjects} max). Upgrade for unlimited.</span>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const isActive = currentProject?.id === project.id;
          const itemsCount = project.workItems?.length || 0;
          const colsCount = project.columns?.length || 0;
          const sprintsCount = project.sprints?.length || 0;

          return (
            <div
              key={project.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all bg-white dark:bg-slate-900 shadow-xs hover:shadow-md ${
                isActive
                  ? 'border-[#0078D4] ring-2 ring-[#0078D4]/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      {(project as any).icon || '🚀'}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#0078D4] dark:bg-blue-950 dark:text-blue-300">
                          KEY: {project.key}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canCreateProject && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Edit Project Settings"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProject(project);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {project.description || 'No description configured for this application scope.'}
                </p>

                {/* Stats Pills */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {itemsCount}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Items
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {colsCount}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Columns
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {sprintsCount}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Sprints
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-[#0078D4] dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900'
                      : 'bg-[#0078D4] hover:bg-[#106EBE] text-white shadow-xs'
                  }`}
                >
                  <Kanban size={14} />
                  <span>{isActive ? 'Current Board' : 'Open Board'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSprints(project.id)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="View Sprints for this project"
                >
                  <Repeat size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <FolderGit2 className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? `No projects matched "${searchQuery}".`
              : 'Get started by creating your first project / app for this organization.'}
          </p>
          {canCreateProject && (
            <button
              onClick={onOpenCreateProject}
              className="mt-4 px-4 py-2 bg-[#0078D4] text-white text-xs font-semibold rounded-lg hover:bg-[#106EBE]"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={Boolean(editingProject)}
        project={editingProject}
        onClose={() => setEditingProject(null)}
      />

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Project</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action is permanent and irreversible</p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {projects.length <= 1 ? (
              <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
                <strong>Cannot delete the only project:</strong> &quot;{deletingProject.name}&quot; is the only project in this organization. You must have at least one active project to use the workspace and boards.
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">&quot;{deletingProject.name}&quot; ({deletingProject.key})</strong>? All Kanban columns, sprints, work items, and comments in this project will be deleted immediately.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDeletingProject(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {projects.length <= 1 ? 'Close' : 'Cancel'}
              </button>

              {projects.length > 1 && (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Delete Project</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
