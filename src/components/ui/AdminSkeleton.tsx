import React from 'react';
import { Skeleton } from './skeleton';

export function AdminSkeleton() {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#0B1120] text-slate-100 font-sans select-none">
      {/* Top Header Skeleton */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl bg-slate-800" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48 bg-slate-700" />
            <Skeleton className="h-3 w-64 bg-slate-800" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-32 rounded-lg bg-slate-800" />
          <Skeleton className="h-8 w-8 rounded-lg bg-slate-800" />
        </div>
      </header>

      {/* Main Content Body Skeleton */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Metric Cards Ribbon (4 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3"
            >
              <Skeleton className="h-3 w-28 bg-slate-800" />
              <Skeleton className="h-8 w-20 bg-slate-700" />
              <Skeleton className="h-3 w-36 bg-slate-800" />
            </div>
          ))}
        </div>

        {/* Tenant Table Section Skeleton */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
          {/* Action Bar Header */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-56 bg-slate-700" />
              <Skeleton className="h-3 w-80 bg-slate-800" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-44 rounded-lg bg-slate-950" />
              <Skeleton className="h-8 w-32 rounded-lg bg-[#0078D4]/50" />
            </div>
          </div>

          {/* Table Header & Rows */}
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg bg-slate-800" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36 bg-slate-700" />
                    <Skeleton className="h-3 w-24 bg-slate-800" />
                  </div>
                </div>

                <div className="hidden sm:block space-y-1.5">
                  <Skeleton className="h-4 w-20 rounded bg-slate-800" />
                  <Skeleton className="h-2 w-28 rounded-full bg-slate-800" />
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <Skeleton className="w-7 h-7 rounded-full bg-slate-800" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24 bg-slate-700" />
                    <Skeleton className="h-2 w-32 bg-slate-800" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-20 rounded-lg bg-slate-800" />
                  <Skeleton className="h-7 w-16 rounded-lg bg-[#0078D4]/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
