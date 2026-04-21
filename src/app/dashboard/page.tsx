"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import StatCard from "@/components/StatCard";
import WPMChart from "@/components/WPMChart";
import SpeakingTimeline from "@/components/SpeakingTimeline";
import PresentationCard from "@/components/PresentationCard";
import { format, subDays, parseISO, isAfter, startOfWeek, eachDayOfInterval, isWeekend } from "date-fns";
import { Keyboard, Presentation, UserX, ClipboardList, ArrowUpDown, TrendingUp } from "lucide-react";
import type { Student, Standup } from "@/types";
import StudentAvatar from "@/components/StudentAvatar";

type DateRange = "7" | "30" | "all";
type SortKey = "name" | "keyboard_wpm" | "speaking_level" | "status";

export default function DashboardPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [standups, setStandups] = useState<Standup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("7");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: s } = await supabase.from("students").select("*").order("name");
    const { data: st } = await supabase.from("standups").select("*").order("date", { ascending: false });
    if (s) setStudents(s);
    if (st) setStandups(st);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredStandups = useMemo(() => {
    if (dateRange === "all") return standups;
    const cutoff = subDays(new Date(), parseInt(dateRange));
    return standups.filter((s) => isAfter(parseISO(s.date), cutoff));
  }, [standups, dateRange]);

  const todayStandups = useMemo(() => standups.filter((s) => s.date === today), [standups, today]);
  const weekStandups = useMemo(() => {
    const cutoff = subDays(new Date(), 7);
    return standups.filter((s) => isAfter(parseISO(s.date), cutoff));
  }, [standups]);

  const mostImproved = useMemo(() => {
    let maxImprovement = -Infinity;
    let improvedStudent: Student | null = null;

    students.forEach((student) => {
      const studentStandups = standups
        .filter((s) => s.student_id === student.id && s.keyboard_wpm != null)
        .sort((a, b) => a.date.localeCompare(b.date));

      if (studentStandups.length >= 2) {
        const firstWPM = studentStandups[0].keyboard_wpm;
        const latestWPM = studentStandups[studentStandups.length - 1].keyboard_wpm;
        const improvement = latestWPM - firstWPM;

        if (improvement > maxImprovement) {
          maxImprovement = improvement;
          improvedStudent = student;
        }
      }
    });

    return { student: improvedStudent as Student | null, improvement: maxImprovement };
  }, [students, standups]);

  const upcomingPresentations = useMemo(() => {
    return standups
      .filter((s) => s.has_presentation && s.presentation_date && isAfter(parseISO(s.presentation_date), new Date()))
      .sort((a, b) => (a.presentation_date || "").localeCompare(b.presentation_date || ""));
  }, [standups]);

  const { workingDaysThisWeek, standupsCompleted } = useMemo(() => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const intervalDays = eachDayOfInterval({ start: currentWeekStart, end: new Date() });
    
    const workingDays = Math.min(
      intervalDays.filter(day => !isWeekend(day)).length,
      5
    );

    const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const standupDatesThisWeek = standups
      .filter(s => s.date >= weekStartStr && s.date <= todayStr)
      .map(s => s.date);

    const distinctDates = new Set(standupDatesThisWeek).size;

    return {
      workingDaysThisWeek: workingDays,
      standupsCompleted: distinctDates,
    };
  }, [standups]);

  const absentToday = useMemo(() => {
    return todayStandups.filter((s) => s.status === "absent").map((s) => ({
      standup: s,
      student: students.find((st) => st.id === s.student_id),
    })).filter((x) => x.student);
  }, [todayStandups, students]);

  const sortedTodayStandups = useMemo(() => {
    const mapped = todayStandups.map((s) => ({
      ...s,
      studentName: students.find((st) => st.id === s.student_id)?.name || "",
    }));
    return mapped.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.studentName.localeCompare(b.studentName); break;
        case "keyboard_wpm": cmp = a.keyboard_wpm - b.keyboard_wpm; break;
        case "speaking_level": cmp = a.speaking_level.localeCompare(b.speaking_level); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [todayStandups, students, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8"><div className="skeleton h-10 w-48 sm:w-64" /></div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="skeleton h-24 sm:h-28" />))}
        </div>
        <div className="skeleton h-72 sm:h-96 mb-6 sm:mb-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Progress Dashboard</h1>
          <p className="mt-1 text-mentrex-text-secondary">Track student performance and progress</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["7", "30", "all"] as DateRange[]).map((range) => (
            <button key={range} onClick={() => setDateRange(range)}
              className={`rounded-pill px-3 sm:px-4 py-2 text-sm font-medium transition-all ${dateRange === range ? "bg-mentrex-primary text-white" : "bg-mentrex-elevated text-mentrex-text-secondary hover:text-white"}`}>
              {range === "all" ? "All Time" : `${range} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col">
          <StatCard icon={<ClipboardList className="h-5 w-5" />} label="Standups This Week" value={`${standupsCompleted} / ${workingDaysThisWeek}`} color="#7c3aed" />
          <span className="mt-1 ml-1 text-xs text-mentrex-text-secondary">Mon – Fri only</span>
        </div>
        <div className="flex flex-col">
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Most Improved"
            value={mostImproved.student ? `+${mostImproved.improvement} WPM` : "Not enough data"}
            color="#10b981"
          />
          {mostImproved.student && (
            <span className="mt-1 ml-1 text-xs text-mentrex-text-secondary truncate">
              {mostImproved.student.name}
            </span>
          )}
        </div>
        <StatCard 
          icon={<Presentation className="h-5 w-5" />} 
          label="Upcoming Presentations" 
          value={upcomingPresentations.length} 
          color="#f59e0b" 
          onClick={() => document.getElementById('upcoming-presentations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />
        <StatCard 
          icon={<UserX className="h-5 w-5" />} 
          label="Absent Today" 
          value={absentToday.length} 
          color="#ef4444" 
          onClick={() => document.getElementById('absent-today')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />
      </div>

      {/* WPM Chart */}
      <div className="mb-8">
        <WPMChart standups={filteredStandups} students={students} />
      </div>

      {/* Speaking Timeline */}
      <div className="mb-8">
        <SpeakingTimeline standups={standups} students={students} />
      </div>

      {/* Upcoming Presentations */}
      {upcomingPresentations.length > 0 && (
        <div className="mb-8 scroll-mt-24" id="upcoming-presentations">
          <h3 className="mb-4 text-lg font-bold text-white">Upcoming Presentations</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingPresentations.slice(0, 6).map((s) => {
              const student = studentMap.get(s.student_id);
              return student ? <PresentationCard key={s.id} student={student} standup={s} /> : null;
            })}
          </div>
        </div>
      )}

      {/* Absent Today */}
      {absentToday.length > 0 && (
        <div className="mb-8 scroll-mt-24" id="absent-today">
          <h3 className="mb-4 text-lg font-bold text-white">Absent Today</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {absentToday.map(({ student }) => student && (
              <div 
                key={student.id} 
                className="group flex items-center gap-4 rounded-card border border-mentrex-danger/20 bg-gradient-to-r from-mentrex-danger/10 to-mentrex-danger/5 px-4 py-3 transition-all duration-300 hover:border-mentrex-danger/40 hover:shadow-[0_8px_30px_rgb(239,68,68,0.15)] hover:-translate-y-1"
              >
                <div className="relative flex-shrink-0">
                  <StudentAvatar student={student} size={44} />
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-mentrex-card bg-mentrex-danger shadow-sm">
                    <span className="text-[9px] text-white">🔴</span>
                  </div>
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold text-white transition-colors group-hover:text-red-400">{student.name}</span>
                  <span className="text-[11px] font-medium text-mentrex-danger/70">Marked Absent</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Standup Summary Table */}
      <div className="rounded-card border border-mentrex bg-mentrex-card overflow-hidden">
        <div className="border-b border-mentrex px-4 sm:px-5 py-4">
          <h3 className="text-lg font-bold text-white">Today&apos;s Standup Summary</h3>
        </div>
        {sortedTodayStandups.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-mentrex-text-secondary">No standups recorded today</p>
          </div>
        ) : (
          <>
            {/* Mobile card list — shown only on small screens */}
            <div className="md:hidden divide-y divide-mentrex/50">
              {sortedTodayStandups.map((s) => {
                const student = studentMap.get(s.student_id);
                return (
                  <div key={s.id} className="px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white text-sm">{student?.name || "Unknown"}</span>
                      <span className={`mentrex-pill ${s.status === "done" ? "bg-mentrex-success/20 text-mentrex-success" : "bg-mentrex-danger/20 text-mentrex-danger"}`}>
                        {s.status === "done" ? "✅ Done" : "🔴 Absent"}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-mentrex-text-secondary">
                      <span>{s.keyboard_wpm} WPM</span>
                      <span>·</span>
                      <span>{s.speaking_level}</span>
                    </div>
                    {s.yesterday_work && <p className="text-xs text-mentrex-text-secondary line-clamp-2"><span className="font-medium text-white/60">Yesterday:</span> {s.yesterday_work}</p>}
                    {s.today_plan && <p className="text-xs text-mentrex-text-secondary line-clamp-2"><span className="font-medium text-white/60">Today:</span> {s.today_plan}</p>}
                  </div>
                );
              })}
            </div>

            {/* Desktop table — hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-mentrex text-left">
                    {([["name", "Student"], ["keyboard_wpm", "WPM"], ["speaking_level", "Speaking"], ["status", "Status"]] as [SortKey, string][]).map(([key, label]) => (
                      <th key={key} className="cursor-pointer px-5 py-3 text-xs font-medium uppercase text-mentrex-text-secondary hover:text-white transition-colors" onClick={() => handleSort(key)}>
                        <span className="flex items-center gap-1">{label}<ArrowUpDown className="h-3 w-3" /></span>
                      </th>
                    ))}
                    <th className="px-5 py-3 text-xs font-medium uppercase text-mentrex-text-secondary">Yesterday</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase text-mentrex-text-secondary">Today</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTodayStandups.map((s) => {
                    const student = studentMap.get(s.student_id);
                    return (
                      <tr key={s.id} className="border-b border-mentrex/50 hover:bg-mentrex-elevated/30 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-white">{student?.name || "Unknown"}</td>
                        <td className="px-5 py-3 text-sm text-mentrex-text-secondary">{s.keyboard_wpm}</td>
                        <td className="px-5 py-3 text-sm text-mentrex-text-secondary">{s.speaking_level}</td>
                        <td className="px-5 py-3">
                          <span className={`mentrex-pill ${s.status === "done" ? "bg-mentrex-success/20 text-mentrex-success" : "bg-mentrex-danger/20 text-mentrex-danger"}`}>
                            {s.status === "done" ? "✅ Done" : "🔴 Absent"}
                          </span>
                        </td>
                        <td className="max-w-[200px] truncate px-5 py-3 text-sm text-mentrex-text-secondary">{s.yesterday_work || "—"}</td>
                        <td className="max-w-[200px] truncate px-5 py-3 text-sm text-mentrex-text-secondary">{s.today_plan || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
