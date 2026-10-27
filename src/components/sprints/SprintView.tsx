'use client';

import React from 'react';
import { useTenant } from '@/lib/tenantStore';
import { WorkItemTypeIcon } from '../board/WorkItemTypeIcon';
import { PRIORITY_CONFIG, STATE_CONFIG } from '@/lib/constants';
import { Calendar, Target, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export function SprintView() {
  const { currentProject, setSelectedWorkItem, canEditWorkItem } = useTenant();

  if (!currentProject) return null;

  const activeSprint = currentProject.sprints.find((s) => s.isCurrent) || currentProject.sprints[0];
  const sprintItems = currentProject.workItems.filter((i) => i.sprintId === activeSprint?.id);

  const totalPoints = sprintItems.reduce((acc, i) => acc + (i.effort || 0), 0);
  const completedItems = sprintItems.filter((i) => i.state === 'CLOSED' || i.state === 'RESOLVED');
  const completedPoints = completedItems.reduce((acc, i) => acc + (i.effort || 0), 0);
  const activeItems = sprintItems.filter((i) => i.state === 'ACTIVE');
  const activePoints = activeItems.reduce((acc, i) => acc + (i.effort || 0), 0);
  const newItems = sprintItems.filter((i) => i.state === 'NEW');
  const newPoints = newItems.reduce((acc, i) => acc + (i.effort || 0), 0);

  const progressPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-[#FAF9F8] dark:bg-slate-950 space-y-4 sm:space-y-6">
      {/* Sprint Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              {activeSprint?.name || 'Current Sprint'}
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Active Iteration
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <Calendar size={14} />
            <span>
              {activeSprint ? `${new Date(activeSprint.startDate).toLocaleDateString()} - ${new Date(activeSprint.endDate).toLocaleDateString()}` : 'No date set'}
            </span>
            <span>•</span>
            <span>Project: <strong>{currentProject.name}</strong></span>
          </div>
        </div>

        {/* Progress gauge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right">
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">Completion</div>
            <div className="text-base sm:text-lg font-black text-[#0078D4]">{progressPercentage}%</div>
          </div>
          <div className="w-24 sm:w-32 bg-slate-100 dark:bg-slate-800 h-2.5 sm:h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div
              className="h-full bg-[#0078D4] rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">Committed</span>
            <Target size={16} className="text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{totalPoints} pts</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">{sprintItems.length} items</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">Closed</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedPoints} pts</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">{completedItems.length} completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">In Progress</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{activePoints} pts</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">{activeItems.length} active</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">Backlog</span>
            <AlertCircle size={16} className="text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300">{newPoints} pts</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">{newItems.length} unstarted</p>
        </div>
      </div>

      {/* Sprint Items List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Iteration Backlog ({sprintItems.length})
          </h3>
          <span className="text-[11px] text-slate-400 hidden xs:inline">Tap item to view details</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {sprintItems.map((item) => {
            const pConfig = PRIORITY_CONFIG[item.priority];
            const sConfig = STATE_CONFIG[item.state];
            return (
              <div
                key={item.id}
                onClick={() => setSelectedWorkItem(item)}
                className="px-3.5 sm:px-5 py-3 flex items-center justify-between gap-2.5 sm:gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <WorkItemTypeIcon type={item.type} size={15} />
                  <span className="font-mono font-semibold text-slate-400 shrink-0 text-[11px] sm:text-xs">
                    AB#{item.itemNumber}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate hover:text-[#0078D4] text-xs">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* State badge */}
                  <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <span className={`w-1.5 h-1.5 rounded-full ${sConfig.dotColor}`} />
                    {sConfig.label}
                  </span>

                  {/* Priority pill */}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${pConfig.badgeClass}`}>
                    {pConfig.shortLabel}
                  </span>

                  {/* Effort */}
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs">
                    {item.effort}p
                  </span>

                  {/* Assignee Avatar */}
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden shrink-0">
                    {item.assignee?.avatarUrl ? (
                      <img src={item.assignee.avatarUrl} alt={item.assignee.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0078D4] text-white flex items-center justify-center font-bold text-[9px] sm:text-[10px]">
                        {item.assignee?.initials || 'UN'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
