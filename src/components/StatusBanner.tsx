"use client";

import { ClipboardList } from "lucide-react";

interface StatusBannerProps {
  doneCount: number;
  totalCount: number;
  date: string;
}

export default function StatusBanner({
  doneCount,
  totalCount,
  date,
}: StatusBannerProps) {
  const percentage = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="relative overflow-hidden border-b border-mentrex bg-mentrex-card">
      {/* Purple gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-mentrex-primary/5 via-transparent to-mentrex-primary/5" />
      
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mentrex-primary/20">
            <ClipboardList className="h-4 w-4 text-mentrex-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              📋 Today&apos;s Standup — {date}
            </p>
            <p className="text-xs text-mentrex-text-secondary">
              {doneCount} of {totalCount} done
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="hidden items-center gap-3 sm:flex">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-mentrex-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mentrex-primary to-purple-400 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-mentrex-primary">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}
