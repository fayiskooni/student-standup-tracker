"use client";

import { Keyboard, Mic } from "lucide-react";
import { differenceInMonths } from "date-fns";
import type { StudentWithStandup, StandupStatus } from "@/types";
import { SPEAKING_LEVEL_COLORS, SpeakingLevel } from "@/types";
import StudentAvatar from "./StudentAvatar";

interface StudentCardProps {
  student: StudentWithStandup;
  onClick?: () => void;
  clickable?: boolean;
}

function getStatusBadge(status?: StandupStatus | null) {
  switch (status) {
    case "done":
      return {
        label: "Done",
        emoji: "✅",
        className: "bg-mentrex-success/20 text-mentrex-success",
      };
    case "absent":
      return {
        label: "Absent",
        emoji: "🔴",
        className: "bg-mentrex-danger/20 text-mentrex-danger",
      };
    default:
      return {
        label: "Pending",
        emoji: "⏳",
        className: "bg-mentrex-text-secondary/20 text-mentrex-text-secondary",
      };
  }
}

export default function StudentCard({
  student,
  onClick,
  clickable = false,
}: StudentCardProps) {
  const status = student.todayStandup?.status as StandupStatus | undefined;
  const statusBadge = getStatusBadge(status);

  // Course progress calculation
  const monthsElapsed = differenceInMonths(
    new Date(),
    new Date(student.join_date)
  );
  const progress = Math.min(
    (monthsElapsed / student.course_duration) * 100,
    100
  );
  const currentMonth = Math.min(monthsElapsed + 1, student.course_duration);

  const isDone = status === "done";
  const isAbsent = status === "absent";
  const isDimmed = isDone || isAbsent;

  const speakingColor =
    SPEAKING_LEVEL_COLORS[student.speaking_level as SpeakingLevel] || "#94a3b8";

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`group relative rounded-card border border-mentrex bg-mentrex-card p-5 transition-all duration-300 ${
        clickable
          ? "cursor-pointer hover:border-mentrex-primary/30 hover:shadow-mentrex-lg hover:-translate-y-1"
          : ""
      } ${isDimmed ? "opacity-45" : ""}`}
    >
      {/* Status overlay for done/absent */}
      {isDone && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-card">
          <span className="text-4xl drop-shadow-lg">✅</span>
        </div>
      )}
      {isAbsent && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-card bg-mentrex-danger/5">
          <span className="text-4xl drop-shadow-lg">🔴</span>
        </div>
      )}

      {/* Status badge — top right */}
      <div className="absolute right-4 top-4">
        <span
          className={`mentrex-pill ${statusBadge.className}`}
        >
          {statusBadge.emoji} {statusBadge.label}
        </span>
      </div>

      {/* Student photo + name */}
      <div className="mb-4 flex items-center gap-4">
        <StudentAvatar student={student} size={72} />
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-white">
            {student.name}
          </h3>
        </div>
      </div>

      {/* Course progress */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-mentrex-text-secondary">
            Month {currentMonth} of {student.course_duration}
          </span>
          <span className="text-xs font-medium text-mentrex-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-mentrex-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mentrex-primary to-purple-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* WPM + Speaking Level */}
      <div className="flex items-center gap-2">
        <span className="mentrex-pill bg-mentrex-elevated text-mentrex-text-secondary">
          <Keyboard className="h-3 w-3" />
          {student.current_wpm} WPM
        </span>
        <span
          className="mentrex-pill"
          style={{
            backgroundColor: `${speakingColor}20`,
            color: speakingColor,
          }}
        >
          <Mic className="h-3 w-3" />
          {student.speaking_level}
        </span>
      </div>
    </div>
  );
}
