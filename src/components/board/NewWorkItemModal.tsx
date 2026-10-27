'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/tenantStore';
import { WorkItemType, Priority } from '@/types';
import { WORK_ITEM_TYPE_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { WorkItemTypeIcon } from './WorkItemTypeIcon';
import { X, Sparkles } from 'lucide-react';

interface NewWorkItemModalProps {
  initialColumnId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NewWorkItemModal({ initialColumnId, isOpen, onClose }: NewWorkItemModalProps) {
  const { currentProject, currentOrg, tenantMembers, createWorkItem } = useTenant();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<WorkItemType>('USER_STORY');
  const [priority, setPriority] = useState<Priority>('P3_MEDIUM');
  const [columnId, setColumnId] = useState<string>(initialColumnId || currentProject?.columns[0]?.id || '');
  const [effort, setEffort] = useState<number>(3);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('cloud, api');
  const [description, setDescription] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentProject || !currentOrg) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a title for the work item.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await createWorkItem({
      title: title.trim(),
      type,
      priority,
      columnId: columnId || currentProject.columns[0]?.id,
      effort: Number(effort) || 0,
      assigneeId: assigneeId || undefined,
      tags,
      description: description.trim() || 'No detailed description provided.',
      acceptanceCriteria: acceptanceCriteria.trim(),
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create work item');
    }
  };

  const workItemTypes: WorkItemType[] = ['USER_STORY', 'TASK', 'BUG', 'FEATURE', 'EPIC'];
  const priorities: Priority[] = ['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0078D4]" />
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>New Work Item</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-[#0078D4] dark:bg-blue-950 dark:text-blue-300 font-mono">
                {currentProject.name}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md">
              {errorMsg}
            </div>
          )}

          {/* Tenant Isolation Info Badge */}
          <div className="px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <span>Tenant Isolation:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {currentOrg.name} ({currentOrg.id})
            </span>
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Work Item Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {workItemTypes.map((t) => {
                const config = WORK_ITEM_TYPE_CONFIG[t];
                const isSelected = type === t;
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex items-center gap-1.5 p-2 rounded-md text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'border-current ring-2 ring-current font-bold bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                    style={isSelected ? { color: config.color } : {}}
                  >
                    <WorkItemTypeIcon type={t} size={15} />
                    <span className="truncate">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement    Key Vault automated secret rotation pipeline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              autoFocus
            />
          </div>

          {/* Row: Column State + Priority + Story Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Column / State
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              >
                {currentProject.columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Story Points (Effort)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={effort}
                onChange={(e) => setEffort(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              />
            </div>
          </div>

          {/* Row: Assignee + Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              >
                <option value="">Unassigned</option>
                {tenantMembers.map(({ user, role }) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({role} - {user.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="auth, redis, api"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (Markdown supported)
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description, architecture context, or steps to reproduce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
            />
          </div>

          {/* Acceptance Criteria */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Acceptance Criteria
            </label>
            <textarea
              rows={2}
              placeholder="- Test passing criteria&#10;- Latency under 50ms"
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0078D4] hover:bg-[#106EBE] active:bg-[#005A9E] rounded-md shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles size={14} />
              <span>Create Work Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
