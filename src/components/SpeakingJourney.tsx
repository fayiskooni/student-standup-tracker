"use client";

import { useMemo, useState } from "react";
import type { Student, Standup, SpeakingLevel } from "@/types";
import { SPEAKING_LEVELS, SPEAKING_LEVEL_COLORS } from "@/types";
import StudentAvatar from "./StudentAvatar";
import { format, parseISO } from "date-fns";

interface SpeakingJourneyProps {
  students: Student[];
  standups: Standup[];
}

interface JourneyRowProps {
  student: Student;
  standups: Standup[];
}

function JourneyRow({ student, standups }: JourneyRowProps) {
  const [tooltip, setTooltip] = useState<{ level: SpeakingLevel; date: string } | null>(null);

  // Build a map: level → earliest date the student had that speaking_level
  const levelDates = useMemo(() => {
    const map = new Map<SpeakingLevel, string>();
    const studentStandups = standups
      .filter((s) => s.student_id === student.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    studentStandups.forEach((s) => {
      const lvl = s.speaking_level as SpeakingLevel;
      if (!map.has(lvl)) map.set(lvl, s.date);
    });
    return map;
  }, [standups, student.id]);

  const currentLevel = student.speaking_level as SpeakingLevel;
  const currentIdx = SPEAKING_LEVELS.indexOf(currentLevel);

  return (
    <div className="flex items-center gap-3 rounded-card border border-mentrex bg-mentrex-elevated/30 px-4 py-3 transition-all duration-200 hover:border-mentrex-primary/20">
      {/* Avatar + name */}
      <div className="flex w-36 flex-shrink-0 items-center gap-3 min-w-0">
        <StudentAvatar student={student} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{student.name}</p>
          <span
            className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-tight"
            style={{
              backgroundColor: `${SPEAKING_LEVEL_COLORS[currentLevel]}20`,
              color: SPEAKING_LEVEL_COLORS[currentLevel],
            }}
          >
            {currentLevel}
          </span>
        </div>
      </div>

      {/* Journey track */}
      <div className="relative flex flex-1 items-center justify-between overflow-x-auto">
        {SPEAKING_LEVELS.map((level, idx) => {
          const levelIdx = SPEAKING_LEVELS.indexOf(level);
          const reachedDate = levelDates.get(level);
          const isPast = levelIdx < currentIdx;
          const isCurrent = level === currentLevel;
          const isFuture = levelIdx > currentIdx;
          const color = SPEAKING_LEVEL_COLORS[level];

          return (
            <div key={level} className="flex flex-1 items-center">
              {/* Connector line before this node */}
              {idx > 0 && (
                <div
                  className="h-0.5 flex-1 transition-all duration-300"
                  style={{
                    backgroundColor:
                      levelIdx <= currentIdx ? color : "rgba(255,255,255,0.08)",
                  }}
                />
              )}

              {/* Node */}
              <div className="relative flex flex-shrink-0 items-center justify-center">
                <button
                  className="relative flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-125 focus:outline-none"
                  style={{
                    width: isCurrent ? 18 : 14,
                    height: isCurrent ? 18 : 14,
                    backgroundColor:
                      isFuture ? "transparent" : color,
                    border: isFuture
                      ? "2px solid rgba(255,255,255,0.15)"
                      : isCurrent
                      ? `3px solid ${color}`
                      : `2px solid ${color}`,
                    boxShadow: isCurrent
                      ? `0 0 0 4px ${color}30, 0 0 12px ${color}60`
                      : isPast
                      ? `0 0 6px ${color}40`
                      : "none",
                  }}
                  onMouseEnter={() =>
                    reachedDate
                      ? setTooltip({ level, date: reachedDate })
                      : null
                  }
                  onMouseLeave={() => setTooltip(null)}
                  aria-label={`${level}${reachedDate ? ` — ${reachedDate}` : ""}`}
                >
                  {/* Inner dot for current */}
                  {isCurrent && (
                    <div
                      className="rounded-full"
                      style={{ width: 7, height: 7, backgroundColor: color }}
                    />
                  )}
                </button>

                {/* Tooltip */}
                {tooltip?.level === level && reachedDate && (
                  <div
                    className="pointer-events-none absolute -top-10 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[10px] shadow-lg"
                    style={{
                      backgroundColor: "#13131f",
                      borderColor: `${color}40`,
                    }}
                  >
                    <p className="font-semibold" style={{ color }}>
                      {level}
                    </p>
                    <p className="text-mentrex-text-secondary">
                      {format(parseISO(reachedDate), "MMM d, yyyy")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SpeakingJourney({ students, standups }: SpeakingJourneyProps) {
  // Only show students who have at least one standup
  const activeStudents = useMemo(() => {
    const ids = new Set(standups.map((s) => s.student_id));
    return students.filter((s) => ids.has(s.id));
  }, [students, standups]);

  // Level label row above track
  const levelLabels = (
    <div className="mb-2 flex items-center gap-3 pl-[168px]">
      <div className="flex flex-1 items-center justify-between">
        {SPEAKING_LEVELS.map((level, idx) => (
          <div key={level} className="flex flex-1 items-center">
            {idx > 0 && <div className="flex-1" />}
            <span
              className="flex-shrink-0 text-center text-[9px] font-semibold uppercase tracking-wide"
              style={{ color: SPEAKING_LEVEL_COLORS[level], minWidth: 14 }}
            >
              {level.split("-")[0].substring(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  if (activeStudents.length === 0) {
    return (
      <div className="rounded-card border border-mentrex bg-mentrex-card p-5">
        <h3 className="mb-2 text-lg font-bold text-white">Speaking Level Journey</h3>
        <p className="text-sm text-mentrex-text-secondary">No standup data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-mentrex bg-mentrex-card p-5">
      <h3 className="mb-5 text-lg font-bold text-white">Speaking Level Journey</h3>
      {levelLabels}
      <div className="space-y-3">
        {activeStudents.map((student) => (
          <JourneyRow key={student.id} student={student} standups={standups} />
        ))}
      </div>
    </div>
  );
}
