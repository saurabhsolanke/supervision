import React from 'react';
import { Skeleton } from './skeleton';

export function BoardSkeleton() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FAF9F8] dark:bg-slate-950 font-sans select-none">
      {/* Top Navbar Skeleton */}
      <header className="h-12 bg-[#0078D4] text-white flex items-center justify-between px-4 shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-white/30 animate-pulse" />
          <Skeleton className="h-4 w-28 bg-white/25 rounded" />
          <span className="text-white/40">/</span>
          <Skeleton className="h-6 w-36 bg-white/25 rounded-md" />
          <span className="text-white/40">/</span>
          <Skeleton className="h-6 w-44 bg-white/25 rounded-md" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-48 bg-white/20 rounded-md hidden md:block" />
          <Skeleton className="h-6 w-20 bg-white/20 rounded-full" />
          <Skeleton className="h-7 w-7 bg-white/30 rounded-full" />
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Rail Skeleton */}
        <aside className="w-48 bg-[#F3F2F1] dark:bg-slate-900 border-r border-[#EDEBE9] dark:border-slate-800 p-2 space-y-2 shrink-0 hidden sm:block">
          <div className="px-2 py-2">
            <Skeleton className="h-3 w-16 mb-2 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-8 w-full rounded-md mb-1 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-8 w-full rounded-md bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="px-2 py-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <Skeleton className="h-3 w-20 mb-2 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-8 w-full rounded-md bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-8 w-full rounded-md bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-8 w-full rounded-md bg-slate-300 dark:bg-slate-700" />
          </div>
        </aside>

        {/* Dynamic Center Stage: Board Header & Columns */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF9F8] dark:bg-slate-950 p-4 sm:p-6 space-y-5">
          {/* Board Title & Toolbar Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-48 bg-slate-300 dark:bg-slate-700" />
                <Skeleton className="h-5 w-16 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
              <Skeleton className="h-3 w-72 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-28 rounded-md bg-slate-300 dark:bg-slate-700" />
              <Skeleton className="h-8 w-32 rounded-md bg-[#0078D4]/30" />
            </div>
          </div>

          {/* Filter Pills Skeleton */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Skeleton className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-7 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-7 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-7 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Kanban Columns Grid Skeleton (4 Columns) */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
            {[
              { name: 'New', count: 2 },
              { name: 'Active', count: 3 },
              { name: 'Resolved', count: 2 },
              { name: 'Closed', count: 1 },
            ].map((col, idx) => (
              <div
                key={idx}
                className="flex flex-col bg-[#F3F2F1] dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 overflow-hidden"
              >
                {/* Column Header Skeleton */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16 bg-slate-300 dark:bg-slate-700 font-bold" />
                    <Skeleton className="h-4 w-6 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>
                  <Skeleton className="h-5 w-5 rounded bg-slate-300 dark:bg-slate-700" />
                </div>

                {/* Cards Inside Column */}
                <div className="space-y-3 flex-1 overflow-hidden">
                  {Array.from({ length: col.count }).map((_, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                    >
                      {/* Top Tag & ID */}
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20 rounded bg-blue-100 dark:bg-blue-950/60" />
                        <Skeleton className="h-3 w-12 bg-slate-200 dark:bg-slate-800" />
                      </div>

                      {/* Card Title Lines */}
                      <Skeleton className="h-4 w-full bg-slate-300 dark:bg-slate-700" />
                      <Skeleton className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800" />

                      {/* Footer: Priority & Assignee Avatar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900">
                        <Skeleton className="h-4 w-14 rounded bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
