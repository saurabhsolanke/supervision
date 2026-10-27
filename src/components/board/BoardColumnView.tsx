'use client';

import React, { useState } from 'react';
import { BoardColumn, WorkItem } from '@/types';
import { useTenant } from '@/lib/tenantStore';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { WorkItemCard } from './WorkItemCard';
import { STATE_CONFIG } from '@/lib/constants';
import { Plus, AlertTriangle, Settings2, Check, X } from 'lucide-react';

interface BoardColumnViewProps {
  column: BoardColumn;
  items: WorkItem[];
  onQuickAdd: (columnId: string) => void;
}

export function BoardColumnView({ column, items, onQuickAdd }: BoardColumnViewProps) {
  const { canEditWorkItem, canCustomizeWip, updateColumnWipLimit } = useTenant();
  const [isEditingWip, setIsEditingWip] = useState(false);
  const [wipInput, setWipInput] = useState<string>(column.wipLimit ? String(column.wipLimit) : '');

  const stateConfig = STATE_CONFIG[column.state];
  const isWipExceeded = column.wipLimit !== null && items.length > column.wipLimit;
  const isWipAtLimit = column.wipLimit !== null && items.length === column.wipLimit;

  // Calculate total story points in column
  const totalPoints = items.reduce((sum, item) => sum + (item.effort || 0), 0);

  const handleSaveWip = () => {
    const parsed = wipInput.trim() === '' ? null : parseInt(wipInput, 10);
    if (parsed === null || (!isNaN(parsed) && parsed >= 0)) {
      updateColumnWipLimit(column.id, parsed);
      setIsEditingWip(false);
    }
  };

  return (
    <div className="flex flex-col w-[84vw] xs:w-[78vw] sm:w-72 md:w-80 shrink-0 bg-[#F3F2F1] dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs max-h-full">
      {/* Column Header */}
      <div className={`p-3 border-t-4 rounded-t-lg bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 ${stateConfig.headerColor}`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${stateConfig.dotColor}`} />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              {column.name}
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {items.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Add item button */}
            {canEditWorkItem && (
              <button
                onClick={() => onQuickAdd(column.id)}
                className="p-1 rounded text-slate-400 hover:text-[#0078D4] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Add new work item to ${column.name}`}
              >
                <Plus size={16} />
              </button>
            )}

            {/* WIP edit toggle */}
            {canCustomizeWip && (
              <button
                onClick={() => {
                  setWipInput(column.wipLimit ? String(column.wipLimit) : '');
                  setIsEditingWip(!isEditingWip);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Configure Column WIP Limit (Pro/Enterprise)"
              >
                <Settings2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* WIP Limit Indicator Banner */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            {column.wipLimit !== null ? (
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                  isWipExceeded
                    ? 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 animate-pulse'
                    : isWipAtLimit
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
                title={isWipExceeded ? `WIP Limit Exceeded! Max limit is ${column.wipLimit}` : `WIP Limit: ${column.wipLimit}`}
              >
                {isWipExceeded && <AlertTriangle size={12} className="text-red-600 dark:text-red-400" />}
                <span>
                  WIP: {items.length} / {column.wipLimit}
                </span>
                {isWipExceeded && <span className="text-[10px] uppercase font-bold tracking-tight">OVER LIMIT</span>}
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">No WIP Limit</span>
            )}
          </div>

          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {totalPoints} pts
          </span>
        </div>

        {/* Inline WIP Limit Config Editor */}
        {isEditingWip && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Set WIP Limit:</span>
            <input
              type="number"
              min="1"
              max="99"
              placeholder="None"
              value={wipInput}
              onChange={(e) => setWipInput(e.target.value)}
              className="w-16 px-1.5 py-0.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0078D4]"
              autoFocus
            />
            <button
              onClick={handleSaveWip}
              className="p-1 rounded bg-[#0078D4] text-white hover:bg-[#106EBE]"
              title="Save"
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => setIsEditingWip(false)}
              className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
              title="Cancel"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Droppable Work Item Cards List */}
      <Droppable droppableId={column.id} isDropDisabled={!canEditWorkItem}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2.5 overflow-y-auto min-h-[450px] flex flex-col gap-2.5 transition-colors duration-150 ${
              snapshot.isDraggingOver
                ? 'bg-blue-50/70 dark:bg-blue-950/20 ring-2 ring-blue-400/50 rounded-b-lg'
                : ''
            }`}
          >
            {items.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={item.id}
                index={index}
                isDragDisabled={!canEditWorkItem}
              >
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    style={{
                      ...dragProvided.draggableProps.style,
                    }}
                  >
                    <WorkItemCard item={item} isDragging={dragSnapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {items.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-md">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No work items in {column.name}</p>
                {canEditWorkItem && (
                  <button
                    onClick={() => onQuickAdd(column.id)}
                    className="mt-2 text-xs text-[#0078D4] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus size={12} /> Add an item
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
