"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import StudentCard from "@/components/StudentCard";
import StandupModal from "@/components/StandupModal";
import { format } from "date-fns";
import { Calendar, CheckCircle } from "lucide-react";
import type { Student, StudentWithStandup, Standup } from "@/types";

export default function StandupPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<StudentWithStandup[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStandup, setSelectedStandup] = useState<Standup | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayDisplay = format(new Date(), "EEEE, MMMM d, yyyy");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: studentsData } = await supabase.from("students").select("*").order("name");
    const { data: standupsData } = await supabase.from("standups").select("*").eq("date", today);
    if (studentsData) {
      const withStandups: StudentWithStandup[] = studentsData.map((s) => ({
        ...s,
        todayStandup: standupsData?.find((st) => st.student_id === s.id) || null,
      }));
      setStudents(withStandups);
    }
    setLoading(false);
  }, [supabase, today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const doneCount = students.filter(
    (s) => s.todayStandup?.status === "done" || s.todayStandup?.status === "absent"
  ).length;

  const handleCardClick = (student: StudentWithStandup) => {
    setSelectedStudent(student);
    setSelectedStandup(student.todayStandup || null);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-mentrex-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Daily Standup</h1>
            </div>
            <p className="text-mentrex-text-secondary text-sm sm:text-base">{todayDisplay}</p>
          </div>
          <div className="flex items-center gap-3 rounded-card border border-mentrex bg-mentrex-card px-4 py-3 self-start sm:self-auto">
            <CheckCircle className="h-5 w-5 text-mentrex-success flex-shrink-0" />
            <div>
              <p className="text-base sm:text-lg font-bold text-white">
                {doneCount} <span className="text-xs sm:text-sm font-normal text-mentrex-text-secondary">/ {students.length} complete</span>
              </p>
            </div>
            <div className="h-2 w-16 sm:w-24 overflow-hidden rounded-full bg-mentrex-elevated">
              <div className="h-full rounded-full bg-gradient-to-r from-mentrex-primary to-mentrex-success transition-all duration-500" style={{ width: `${students.length ? (doneCount / students.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
        <div className="mb-6 rounded-card border border-mentrex-primary/20 bg-mentrex-primary/5 px-4 py-3">
          <p className="text-xs sm:text-sm text-mentrex-text-secondary">💡 Click on a student card to fill in their standup. Done cards appear dimmed.</p>
        </div>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="skeleton h-52 w-full" />))}
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-mentrex-primary/10">
              <Calendar className="h-10 w-10 text-mentrex-primary" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">No Students</h2>
            <p className="text-center text-mentrex-text-secondary">Add students first before running standups.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} clickable onClick={() => handleCardClick(student)} />
            ))}
          </div>
        )}
      </div>
      <StandupModal student={selectedStudent} existingStandup={selectedStandup} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSaved={fetchData} />
    </>
  );
}
