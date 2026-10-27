'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/tenantStore';
import { WorkItemType, Priority, WorkItemState } from '@/types';
import { WORK_ITEM_TYPE_CONFIG, PRIORITY_CONFIG, STATE_CONFIG } from '@/lib/constants';
import { WorkItemTypeIcon } from './WorkItemTypeIcon';
import {
  X,
  Trash2,
  Send,
  MessageSquare,
  Lock,
  Tag,
  CheckCircle2,
  Eye,
  Edit3,
} from 'lucide-react';

export function WorkItemDetailDrawer() {
  const {
    selectedWorkItem,
    setSelectedWorkItem,
    currentProject,
    currentOrg,
    tenantMembers,
    updateWorkItem,
    deleteWorkItem,
    addComment,
    canEditWorkItem,
    canDeleteWorkItem,
    currentUser,
  } = useTenant();

  const [activeTab, setActiveTab] = useState<'details' | 'discussion'>('details');
  const [commentText, setCommentText] = useState('');
  const [isPreviewDesc, setIsPreviewDesc] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedWorkItem || !currentProject) return null;

  const item = selectedWorkItem;
  const typeConfig = WORK_ITEM_TYPE_CONFIG[item.type];
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const stateConfig = STATE_CONFIG[item.state];

  const handleUpdate = (field: string, value: any) => {
    if (!canEditWorkItem) return;
    updateWorkItem(item.id, { [field]: value });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(item.id, commentText);
    setCommentText('');
  };

  const handleDelete = () => {
    if (!canDeleteWorkItem) return;
    if (confirm(`Are you sure you want to permanently delete AB#${item.itemNumber}: "${item.title}"?`)) {
      deleteWorkItem(item.id);
    }
  };

  const workItemTypes: WorkItemType[] = ['USER_STORY', 'TASK', 'BUG', 'FEATURE', 'EPIC'];
  const priorities: Priority[] = ['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'];
  const states: WorkItemState[] = ['NEW', 'ACTIVE', 'RESOLVED', 'CLOSED'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full md:max-w-2xl lg:max-w-3xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Work Item Type Selector */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <WorkItemTypeIcon type={item.type} size={16} />
              <select
                disabled={!canEditWorkItem}
                value={item.type}
                onChange={(e) => handleUpdate('type', e.target.value as WorkItemType)}
                className="text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none"
              >
                {workItemTypes.map((t) => (
                  <option key={t} value={t}>
                    {WORK_ITEM_TYPE_CONFIG[t].label}
                  </option>
                ))}
              </select>
            </div>

            {/* ID Badge */}
            <span className="font-mono text-sm font-bold text-[#0078D4] dark:text-blue-400">
              AB#{item.itemNumber}
            </span>

            {/* State Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className={`w-2 h-2 rounded-full ${stateConfig.dotColor}`} />
              <select
                disabled={!canEditWorkItem}
                value={item.state}
                onChange={(e) => {
                  const targetCol = currentProject.columns.find((c) => c.state === e.target.value);
                  handleUpdate('state', e.target.value as WorkItemState);
                  if (targetCol) {
                    handleUpdate('columnId', targetCol.id);
                  }
                }}
                className="text-xs font-semibold bg-transparent text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
              >
                {states.map((s) => (
                  <option key={s} value={s}>
                    {STATE_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons: Delete + Close */}
          <div className="flex items-center gap-2">
            {canDeleteWorkItem && (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Delete Work Item (Admins & Owners)"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              onClick={() => setSelectedWorkItem(null)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Close Drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tenant Isolation Banner */}
        <div className="px-4 sm:px-6 py-2 bg-blue-50/60 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-1 text-[11px] text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-1.5 truncate">
            <Lock size={12} className="shrink-0" />
            <span className="truncate">Strict Tenant Isolation: <strong>{currentOrg?.name || 'Organization'}</strong></span>
          </div>
          <span className="font-mono text-[10px] text-blue-600/70 dark:text-blue-400/70 shrink-0">Project: {currentProject.key}</span>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Title input (in-place editable) */}
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <input
              type="text"
              disabled={!canEditWorkItem}
              value={item.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              className="w-full text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#0078D4] focus:outline-none transition-colors py-1"
              placeholder="Work item title..."
            />
          </div>

          {/* Two-Column DevOps Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-full">
            {/* Left Main Section (2 Cols): Description, Criteria, Activity */}
            <div className="md:col-span-2 p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 size={13} /> Description
                  </label>
                  <button
                    onClick={() => setIsPreviewDesc(!isPreviewDesc)}
                    className="text-[11px] font-semibold text-[#0078D4] hover:underline flex items-center gap-1"
                  >
                    <Eye size={12} />
                    {isPreviewDesc ? 'Edit Raw' : 'Preview Formatted'}
                  </button>
                </div>

                {isPreviewDesc ? (
                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed min-h-[100px]">
                    {item.description || 'No description provided.'}
                  </div>
                ) : (
                  <textarea
                    disabled={!canEditWorkItem}
                    rows={6}
                    value={item.description}
                    onChange={(e) => handleUpdate('description', e.target.value)}
                    placeholder="Enter description, user scenario, requirements..."
                    className="w-full p-3 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                  />
                )}
              </div>

              {/* Acceptance Criteria */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={13} /> Acceptance Criteria
                </label>
                <textarea
                  disabled={!canEditWorkItem}
                  rows={4}
                  value={item.acceptanceCriteria || ''}
                  onChange={(e) => handleUpdate('acceptanceCriteria', e.target.value)}
                  placeholder="- Verified API responses return 200 OK&#10;- Passes load test under 10k concurrent streams"
                  className="w-full p-3 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                />
              </div>

              {/* Discussion & Comments Stream */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={14} className="text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Discussion & Activity ({item.comments?.length || 0})
                  </h4>
                </div>

                {/* Comment Input */}
                {canEditWorkItem ? (
                  <form onSubmit={handleAddComment} className="mb-4">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {currentUser?.initials || 'U'}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <textarea
                          rows={2}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment... (Type an update or feedback)"
                          className="w-full p-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0078D4]"
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim()}
                          className="self-end px-3 py-2 bg-[#0078D4] disabled:opacity-40 text-white rounded-md text-xs font-semibold hover:bg-[#106EBE] transition-colors flex items-center gap-1"
                        >
                          <Send size={13} />
                          <span>Post</span>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-slate-400 italic mb-4">Viewers cannot post comments.</p>
                )}

                {/* Comment History List */}
                <div className="space-y-3">
                  {item.comments && item.comments.length > 0 ? (
                    item.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs"
                      >
                        {comment.author?.avatarUrl ? (
                          <img
                            src={comment.author.avatarUrl}
                            alt={comment.author.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {comment.author?.initials || 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {comment.author?.name || 'Team Member'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No comments yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Meta Column (1 Col): Assignee, Priority, Effort, Tags */}
            <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-4 sm:gap-5 text-xs">
              {/* Assigned To */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Assigned To
                </label>
                <select
                  disabled={!canEditWorkItem}
                  value={item.assigneeId || ''}
                  onChange={(e) => handleUpdate('assigneeId', e.target.value || undefined)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-[#0078D4]"
                >
                  <option value="">Unassigned</option>
                  {tenantMembers.map(({ user, role }) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <select
                  disabled={!canEditWorkItem}
                  value={item.priority}
                  onChange={(e) => handleUpdate('priority', e.target.value as Priority)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-[#0078D4]"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_CONFIG[p].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Story Points (Effort) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Effort (Story Points)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={!canEditWorkItem}
                  value={item.effort || 0}
                  onChange={(e) => handleUpdate('effort', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-[#0078D4]"
                />
              </div>

              {/* Sprint / Iteration */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Iteration / Sprint
                </label>
                <select
                  disabled={!canEditWorkItem}
                  value={item.sprintId || ''}
                  onChange={(e) => handleUpdate('sprintId', e.target.value || undefined)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-[#0078D4]"
                >
                  <option value="">Backlog (No Sprint)</option>
                  {currentProject.sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag size={12} /> Tags
                </label>
                <input
                  type="text"
                  disabled={!canEditWorkItem}
                  value={item.tags.join(', ')}
                  onChange={(e) => {
                    const newTags = e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);
                    handleUpdate('tags', newTags);
                  }}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-[#0078D4]"
                />
              </div>

              {/* Reporter & Timestamps */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>
                  Reported by: <span className="text-slate-600 dark:text-slate-300">{item.reporter?.name || 'System'}</span>
                </div>
                <div>
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <div>
                  Updated: {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
