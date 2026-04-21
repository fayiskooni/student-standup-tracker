"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Standup, Student } from "@/types";
import { format, parseISO } from "date-fns";

interface WPMChartProps {
  standups: Standup[];
  students: Student[];
}

const CHART_COLORS = [
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
  "#06b6d4",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, studentMap, colorMap }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: "#13131f",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: "12px",
        padding: "10px 14px",
        fontSize: 12,
        minWidth: 140,
      }}
    >
      <p style={{ color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
        {label}
      </p>
      {payload.map((entry: { dataKey: string; value: number | null }) => {
        if (entry.value == null) return null;
        const student = studentMap.get(entry.dataKey);
        const color = colorMap.get(entry.dataKey) ?? "#94a3b8";
        return (
          <div
            key={entry.dataKey}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 3,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#fff" }}>{student?.name ?? entry.dataKey}</span>
            <span style={{ color, fontWeight: 700, marginLeft: "auto", paddingLeft: 8 }}>
              {entry.value} WPM
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function WPMChart({ standups, students }: WPMChartProps) {
  // null = all selected; Set = the isolated/selected subset
  const [selected, setSelected] = useState<Set<string> | null>(null);

  const allIds = useMemo(() => students.map((s) => s.id), [students]);

  const colorMap = useMemo(
    () => new Map(students.map((s, i) => [s.id, CHART_COLORS[i % CHART_COLORS.length]])),
    [students]
  );

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students]
  );

  // Which IDs are currently visible
  const visibleIds: Set<string> = selected ?? new Set(allIds);

  const handlePillClick = (id: string) => {
    const allSelected = selected === null;

    if (allSelected) {
      // Enter solo mode — only this student
      setSelected(new Set([id]));
      return;
    }

    const next = new Set(selected);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    // If nothing left, reset to all
    if (next.size === 0 || next.size === allIds.length) {
      setSelected(null);
    } else {
      setSelected(next);
    }
  };

  const showAll = () => setSelected(null);

  // Build chart data: every date has a key for every student (null if no entry)
  const chartData = useMemo(() => {
    const wpmStandups = standups.filter((s) => s.keyboard_wpm != null);
    const allDates = Array.from(new Set(wpmStandups.map((s) => s.date))).sort();

    return allDates.map((date) => {
      const row: Record<string, string | number | null> = {
        date: format(parseISO(date), "MMM d"),
        rawDate: date,
      };
      students.forEach((student) => {
        const entry = wpmStandups.find(
          (s) => s.date === date && s.student_id === student.id
        );
        row[student.id] = entry?.keyboard_wpm ?? null;
      });
      return row;
    });
  }, [standups, students]);

  if (standups.filter((s) => s.keyboard_wpm != null).length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-card border border-mentrex bg-mentrex-card">
        <p className="text-mentrex-text-secondary">No WPM data available yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-mentrex bg-mentrex-card p-5">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold text-white">WPM Progress</h3>
        {selected !== null && (
          <button
            onClick={showAll}
            className="text-xs font-medium text-mentrex-text-secondary hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
          >
            Show All
          </button>
        )}
      </div>

      {/* Student pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {students.map((student) => {
          const color = colorMap.get(student.id)!;
          const isActive = visibleIds.has(student.id);
          return (
            <button
              key={student.id}
              onClick={() => handlePillClick(student.id)}
              className="mentrex-pill cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: isActive ? `${color}20` : "rgba(255,255,255,0.04)",
                color: isActive ? color : "#64748b",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: isActive ? color : "transparent",
                boxShadow: isActive ? `0 0 8px ${color}30` : "none",
                opacity: isActive ? 1 : 0.5,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: isActive ? color : "#64748b",
                  marginRight: 5,
                  verticalAlign: "middle",
                  flexShrink: 0,
                }}
              />
              {student.name}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            label={{
              value: "WPM",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
              fontSize: 11,
              dx: 10,
            }}
          />
          <Tooltip
            content={
              <CustomTooltip studentMap={studentMap} colorMap={colorMap} />
            }
          />
          {students.map((student) => {
            const color = colorMap.get(student.id)!;
            const isActive = visibleIds.has(student.id);
            return (
              <Line
                key={student.id}
                type="monotone"
                dataKey={student.id}
                stroke={color}
                strokeWidth={isActive ? 2.5 : 0}
                dot={isActive ? { r: 3.5, fill: color, strokeWidth: 0 } : false}
                activeDot={isActive ? { r: 5.5, fill: color, strokeWidth: 0 } : false}
                connectNulls
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
