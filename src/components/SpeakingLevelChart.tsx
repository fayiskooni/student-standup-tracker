"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { Student } from "@/types";
import { SPEAKING_LEVELS, SPEAKING_LEVEL_COLORS, SpeakingLevel } from "@/types";

interface SpeakingLevelChartProps {
  students: Student[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { level, count } = payload[0].payload;
  const color = SPEAKING_LEVEL_COLORS[level as SpeakingLevel];
  return (
    <div
      style={{
        backgroundColor: "#13131f",
        border: `1px solid ${color}40`,
        borderRadius: 10,
        padding: "8px 14px",
        fontSize: 12,
      }}
    >
      <span style={{ color, fontWeight: 700 }}>{level}</span>
      <span style={{ color: "#fff", marginLeft: 8 }}>
        {count} student{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

export default function SpeakingLevelChart({ students }: SpeakingLevelChartProps) {
  const data = useMemo(() =>
    SPEAKING_LEVELS.map((level) => ({
      level,
      count: students.filter((s) => s.speaking_level === level).length,
    })),
    [students]
  );

  return (
    <div className="rounded-card border border-mentrex bg-mentrex-card p-5">
      <h3 className="mb-5 text-lg font-bold text-white">Cohort Speaking Overview</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 8, bottom: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="level"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={128}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map(({ level }) => (
              <Cell
                key={level}
                fill={SPEAKING_LEVEL_COLORS[level as SpeakingLevel]}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
