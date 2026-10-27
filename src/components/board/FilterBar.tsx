'use client';

import React from 'react';
import { useTenant } from '@/lib/tenantStore';
import { WorkItemType, Priority } from '@/types';
import { WORK_ITEM_TYPE_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { WorkItemTypeIcon } from './WorkItemTypeIcon';
import { Search, X, Plus, Filter, Users } from 'lucide-react';

interface FilterBarProps {
  onOpenNewItemModal: () => void;
}

export function FilterBar({ onOpenNewItemModal }: FilterBarProps) {
  const {
    filterState,
    setFilterState,
    resetFilters,
    tenantMembers,
    canEditWorkItem,
    currentProject,
    filteredWorkItems,
  } = useTenant();

  const activeFilterCount =
    (filterState.searchQuery ? 1 : 0) +
    filterState.selectedTypes.length +
    filterState.selectedAssignees.length +
    filterState.selectedPriorities.length +
    filterState.selectedStates.length;

  const toggleType = (type: WorkItemType) => {
    setFilterState((prev) => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter((t) => t !== type)
        : [...prev.selectedTypes, type],
    }));
  };

  const togglePriority = (priority: Priority) => {
    setFilterState((prev) => ({
      ...prev,
      selectedPriorities: prev.selectedPriorities.includes(priority)
        ? prev.selectedPriorities.filter((p) => p !== priority)
        : [...prev.selectedPriorities, priority],
    }));
  };

  const toggleAssignee = (userId: string) => {
    setFilterState((prev) => ({
      ...prev,
      selectedAssignees: prev.selectedAssignees.includes(userId)
        ? prev.selectedAssignees.filter((id) => id !== userId)
        : [...prev.selectedAssignees, userId],
    }));
  };

  const workItemTypes: WorkItemType[] = ['USER_STORY', 'BUG', 'FEATURE', 'EPIC', 'TASK'];
  const priorities: Priority[] = ['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col gap-2.5 sm:gap-3">
      {/* Top Row: Search Input + New Item CTA + Item Count */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[180px]">
          {/* Live Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filter by keyword, title, tag, or AB#ID..."
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-[#0078D4] hover:text-[#106EBE] font-medium whitespace-nowrap px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors shrink-0"
            >
              <X size={12} />
              <span className="hidden xs:inline">Clear filters</span> ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Right CTA: Blue New Work Item Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline">
            Showing <strong className="text-slate-800 dark:text-slate-100">{filteredWorkItems.length}</strong> of{' '}
            {currentProject?.workItems.length || 0} items
          </span>

          {canEditWorkItem && (
            <button
              onClick={onOpenNewItemModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-md bg-[#0078D4] hover:bg-[#106EBE] active:bg-[#005A9E] text-white text-xs font-semibold shadow-xs hover:shadow transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus size={15} />
              <span>New Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Work Item Type Filters + Assignee Avatars + Priority Pills */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs pt-1.5 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto pb-1 touch-pan-x no-scrollbar shrink-0">
        {/* Work Item Types */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Filter size={11} /> Types:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {workItemTypes.map((type) => {
              const config = WORK_ITEM_TYPE_CONFIG[type];
              const isSelected = filterState.selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'border-current shadow-xs ring-1 ring-current font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                  style={isSelected ? { color: config.color, backgroundColor: `${config.color}15` } : {}}
                >
                  <WorkItemTypeIcon type={type} size={12} />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Priority:</span>
          <div className="flex items-center gap-1">
            {priorities.map((p) => {
              const pConfig = PRIORITY_CONFIG[p];
              const isSelected = filterState.selectedPriorities.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  className={`px-2 py-0.5 rounded text-xs font-bold border transition-all ${
                    isSelected
                      ? `${pConfig.badgeClass} ring-2 ring-offset-1 ring-current shadow-xs`
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {pConfig.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Assignee Avatars Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Users size={11} /> Assignee:
          </span>
          <div className="flex items-center -space-x-1 hover:space-x-1 transition-all">
            {tenantMembers.map(({ user }) => {
              const isSelected = filterState.selectedAssignees.includes(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleAssignee(user.id)}
                  className={`relative rounded-full transition-transform ${
                    isSelected ? 'scale-115 ring-2 ring-[#0078D4] z-10' : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={`${user.name} (${user.email})`}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-slate-900">
                      {user.initials}
                    </div>
                  )}
                  {isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0078D4] ring-1 ring-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
