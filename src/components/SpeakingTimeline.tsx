"use client";

import { useMemo } from "react";
import { SPEAKING_LEVEL_COLORS, SPEAKING_LEVELS, SpeakingLevel } from "@/types";
import type { Standup, Student } from "@/types";
import { format, parseISO } from "date-fns";

interface SpeakingTimelineProps {
  standups: Standup[];
  students: Student[];
}

interface LevelTransition {
  date: string;
  level: SpeakingLevel;
}

export default function SpeakingTimeline({
  standups,
  students,
}: SpeakingTimelineProps) {
  const timelines = useMemo(() => {
    const result: { student: Student; transitions: LevelTransition[] }[] = [];

    students.forEach((student) => {
      const studentStandups = standups
        .filter((s) => s.student_id === student.id && s.status === "done")
        .sort((a, b) => a.date.localeCompare(b.date));

      const transitions: LevelTransition[] = [];
      let lastLevel: string | null = null;

      studentStandups.forEach((s) => {
        if (s.speaking_level !== lastLevel) {
          transitions.push({
            date: s.date,
            level: s.speaking_level as SpeakingLevel,
          });
          lastLevel = s.speaking_level;
        }
      });

      if (transitions.length > 0) {
        result.push({ student, transitions });
      }
    });

    return result;
  }, [standups, students]);

  if (timelines.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-card border border-mentrex bg-mentrex-card">
        <p className="text-mentrex-text-secondary">
          No speaking level data yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-mentrex bg-mentrex-card p-5">
      <h3 className="mb-4 text-lg font-bold text-white">
        Speaking Level Progress
      </h3>

      {/* Level legend */}
      <div className="mb-5 flex flex-wrap gap-2">
        {SPEAKING_LEVELS.map((level) => (
          <span
            key={level}
            className="mentrex-pill text-[10px]"
            style={{
              backgroundColor: `${SPEAKING_LEVEL_COLORS[level]}20`,
              color: SPEAKING_LEVEL_COLORS[level],
            }}
          >
            {level}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        {timelines.map(({ student, transitions }) => (
          <div
            key={student.id}
            className="flex items-center gap-4 rounded-input border border-mentrex bg-mentrex-elevated/30 p-3"
          >
            {/* Student name */}
            <span className="w-28 flex-shrink-0 truncate text-sm font-medium text-white">
              {student.name}
            </span>

            {/* Timeline */}
            <div className="flex flex-1 items-center gap-1 overflow-x-auto">
              {transitions.map((t, i) => {
                const color = SPEAKING_LEVEL_COLORS[t.level];
                return (
                  <div key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <div className="h-0.5 w-4 sm:w-8 bg-mentrex-text-secondary/20" />
                    )}
                    <div className="group relative flex flex-col items-center">
                      <div
                        className="h-3 w-3 rounded-full border-2 transition-transform hover:scale-150"
                        style={{
                          borderColor: color,
                          backgroundColor: `${color}40`,
                        }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                        <div className="rounded-lg bg-mentrex-bg border border-mentrex px-3 py-1.5 text-[10px] whitespace-nowrap shadow-mentrex-lg">
                          <p className="font-medium" style={{ color }}>
                            {t.level}
                          </p>
                          <p className="text-mentrex-text-secondary">
                            {format(parseISO(t.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current level */}
            <span
              className="mentrex-pill flex-shrink-0 text-[10px]"
              style={{
                backgroundColor: `${
                  SPEAKING_LEVEL_COLORS[
                    transitions[transitions.length - 1].level
                  ]
                }20`,
                color:
                  SPEAKING_LEVEL_COLORS[
                    transitions[transitions.length - 1].level
                  ],
              }}
            >
              {transitions[transitions.length - 1].level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
