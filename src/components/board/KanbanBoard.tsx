'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/tenantStore';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { BoardColumnView } from './BoardColumnView';
import { FilterBar } from './FilterBar';
import { NewWorkItemModal } from './NewWorkItemModal';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';

export function KanbanBoard() {
  const {
    currentProject,
    filteredWorkItems,
    moveWorkItem,
    canEditWorkItem,
    currentRole,
  } = useTenant();

  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [targetColumnIdForNewItem, setTargetColumnIdForNewItem] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!canEditWorkItem) {
      showToast('Viewers have read-only permissions. Role prevents moving cards.');
      return;
    }

    const res = await moveWorkItem(draggableId, destination.droppableId, destination.index);
    if (!res.success && res.error) {
      showToast(res.error);
    }
  };

  const handleQuickAdd = (columnId: string) => {
    if (!canEditWorkItem) {
      showToast('Viewers have read-only permissions.');
      return;
    }
    setTargetColumnIdForNewItem(columnId);
    setIsNewItemModalOpen(true);
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-500">
        <Info size={32} className="mb-2 text-slate-400" />
        <p>No project selected. Select or create a project to view the board.</p>
      </div>
    );
  }

  const columns = currentProject.columns || [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9F8] dark:bg-slate-950">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md transition-all animate-bounce">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Viewer Warning Notice if user is in Viewer role */}
      {!canEditWorkItem && (
        <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-6 py-2 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs leading-tight">
              <strong>Read-Only Mode:</strong> Logged in as <strong>{currentRole}</strong>. Editing & dragging disabled.
            </span>
          </div>
        </div>
      )}

      {/* Filter Bar with search, type tags, assignee avatars, priority pills */}
      <FilterBar
        onOpenNewItemModal={() => {
          setTargetColumnIdForNewItem(undefined);
          setIsNewItemModalOpen(true);
        }}
      />

      {/* Interactive Kanban Board Surface */}
      <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-auto overflow-y-hidden touch-pan-x">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 sm:gap-4 h-full items-start">
            {columns.map((column) => {
              const columnItems = filteredWorkItems
                .filter((item) => item.columnId === column.id)
                .sort((a, b) => a.order - b.order);

              return (
                <BoardColumnView
                  key={column.id}
                  column={column}
                  items={columnItems}
                  onQuickAdd={handleQuickAdd}
                />
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* New Work Item Modal */}
      {isNewItemModalOpen && (
        <NewWorkItemModal
          initialColumnId={targetColumnIdForNewItem}
          isOpen={isNewItemModalOpen}
          onClose={() => setIsNewItemModalOpen(false)}
        />
      )}
    </div>
  );
}
