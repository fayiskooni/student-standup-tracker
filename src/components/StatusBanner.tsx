"use client";

import { Calendar, CheckCircle2 } from "lucide-react";

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
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: Heading & Date */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-mentrex-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Daily Standup
            </h1>
          </div>
          <p className="text-sm text-mentrex-text-secondary">
            {date}
          </p>
        </div>

        {/* Right side: Progress Box */}
        <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-mentrex bg-mentrex-card/50 px-4 py-3 sm:px-5">
          <CheckCircle2 className="h-5 w-5 text-mentrex-success" />
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-white">{doneCount}</span>
            <span className="text-mentrex-text-secondary">/ {totalCount} complete</span>
          </div>
          <div className="ml-2 h-2 w-24 sm:w-32 overflow-hidden rounded-full bg-mentrex-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mentrex-primary to-mentrex-success transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
