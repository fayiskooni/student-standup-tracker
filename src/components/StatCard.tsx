"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendValue,
  color = "#7c3aed",
}: StatCardProps) {
  const TrendIcon =
    trend === "up"
      ? TrendingUp
      : trend === "down"
      ? TrendingDown
      : Minus;

  const trendColor =
    trend === "up"
      ? "text-mentrex-success"
      : trend === "down"
      ? "text-mentrex-danger"
      : "text-mentrex-text-secondary";

  return (
    <div className="group relative overflow-hidden rounded-card border border-mentrex bg-mentrex-card p-5 transition-all duration-300 hover:border-mentrex-primary/30 hover:shadow-mentrex">
      {/* Accent glow */}
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              {trendValue}
            </div>
          )}
        </div>

        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="mt-1 text-sm text-mentrex-text-secondary">{label}</p>
      </div>
    </div>
  );
}
