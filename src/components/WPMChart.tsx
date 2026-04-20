"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06d6a0",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
  "#e11d48",
  "#0ea5e9",
  "#a855f7",
];

export default function WPMChart({ standups, students }: WPMChartProps) {
  const [visibleStudents, setVisibleStudents] = useState<Set<string>>(
    new Set(students.map((s) => s.id))
  );

  const toggleStudent = (id: string) => {
    setVisibleStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const chartData = useMemo(() => {
    // Group standups by date
    const dateMap = new Map<string, Record<string, number>>();

    standups.forEach((s) => {
      if (!dateMap.has(s.date)) {
        dateMap.set(s.date, {});
      }
      const dayData = dateMap.get(s.date)!;
      dayData[s.student_id] = s.keyboard_wpm;
    });

    // Sort by date and format
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: format(parseISO(date), "MMM d"),
        rawDate: date,
        ...data,
      }));
  }, [standups]);

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students]
  );

  if (standups.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-card border border-mentrex bg-mentrex-card">
        <p className="text-mentrex-text-secondary">No WPM data available yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-mentrex bg-mentrex-card p-5">
      <h3 className="mb-4 text-lg font-bold text-white">WPM Progress</h3>

      {/* Student toggles */}
      <div className="mb-4 flex flex-wrap gap-2">
        {students.map((student, i) => (
          <button
            key={student.id}
            onClick={() => toggleStudent(student.id)}
            className={`mentrex-pill transition-all ${
              visibleStudents.has(student.id)
                ? "opacity-100"
                : "opacity-40"
            }`}
            style={{
              backgroundColor: visibleStudents.has(student.id)
                ? `${CHART_COLORS[i % CHART_COLORS.length]}20`
                : "#1a1a2e",
              color: CHART_COLORS[i % CHART_COLORS.length],
              borderWidth: 1,
              borderColor: visibleStudents.has(student.id)
                ? `${CHART_COLORS[i % CHART_COLORS.length]}40`
                : "transparent",
            }}
          >
            {student.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            label={{
              value: "WPM",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#13131f",
              border: "1px solid rgba(124, 58, 237, 0.15)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: 12,
            }}
            labelStyle={{ color: "#94a3b8" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              const student = studentMap.get(name as string);
              return [value, student?.name || name];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const student = studentMap.get(value);
              return student?.name || value;
            }}
            wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
          />
          {students.map((student, i) =>
            visibleStudents.has(student.id) ? (
              <Line
                key={student.id}
                type="monotone"
                dataKey={student.id}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                name={student.id}
                connectNulls
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
