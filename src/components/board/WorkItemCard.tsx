'use client';

import React from 'react';
import { WorkItem } from '@/types';
import { useTenant } from '@/lib/tenantStore';
import { WorkItemTypeIcon } from './WorkItemTypeIcon';
import { WORK_ITEM_TYPE_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { MessageSquare } from 'lucide-react';

interface WorkItemCardProps {
  item: WorkItem;
  isDragging?: boolean;
}

export function WorkItemCard({ item, isDragging = false }: WorkItemCardProps) {
  const { setSelectedWorkItem, canEditWorkItem } = useTenant();
  const typeConfig = WORK_ITEM_TYPE_CONFIG[item.type];
  const priorityConfig = PRIORITY_CONFIG[item.priority];

  return (
    <div
      onClick={() => setSelectedWorkItem(item)}
      className={`group relative bg-white dark:bg-slate-900 rounded-md border text-left transition-all duration-150 select-none cursor-pointer ${
        isDragging
          ? 'shadow-2xl ring-2 ring-[#0078D4] border-transparent scale-102 rotate-1 z-50'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
      }`}
    >
      {/* Left Type Color Accent Indicator (   DevOps style) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
        style={{ backgroundColor: typeConfig.indicatorColor }}
      />

      <div className="pl-3.5 pr-3 py-2.5 flex flex-col gap-2">
        {/* Header Row: Type Icon + ID + Effort & Priority Badges */}
        <div className="flex items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <WorkItemTypeIcon type={item.type} size={15} />
            <span className="text-slate-500 dark:text-slate-400 font-mono tracking-tight group-hover:text-[#0078D4] transition-colors">
              AB#{item.itemNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Story Points / Effort */}
            {typeof item.effort === 'number' && (
              <span
                className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                title={`${item.effort} Story Points / Effort`}
              >
                {item.effort} pts
              </span>
            )}

            {/* Priority Indicator */}
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${priorityConfig.badgeClass}`}
              title={priorityConfig.label}
            >
              {priorityConfig.shortLabel}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-[#0078D4] transition-colors">
          {item.title}
        </h4>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: Comments Count & Assignee Avatar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            {item.comments && item.comments.length > 0 && (
              <span
                className="flex items-center gap-1 text-[11px] hover:text-slate-600 dark:hover:text-slate-300"
                title={`${item.comments.length} comments`}
              >
                <MessageSquare size={12} />
                <span>{item.comments.length}</span>
              </span>
            )}
            <span className="text-[10px] text-slate-400 capitalize">
              {typeConfig.label}
            </span>
          </div>

          {/* Assignee Avatar */}
          <div>
            {item.assignee ? (
              <div
                className="relative group/avatar cursor-pointer"
                title={`Assigned to: ${item.assignee.name} (${item.assignee.jobTitle})`}
              >
                {item.assignee.avatarUrl ? (
                  <img
                    src={item.assignee.avatarUrl}
                    alt={item.assignee.name}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-[9px] font-bold">
                    {item.assignee.initials}
                  </div>
                )}
              </div>
            ) : (
              <span
                className="text-[11px] text-slate-400 italic px-1 hover:text-slate-600"
                title="Unassigned"
              >
                Unassigned
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
