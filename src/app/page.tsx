"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import StudentCard from "@/components/StudentCard";
import StatusBanner from "@/components/StatusBanner";
import StandupModal from "@/components/StandupModal";
import { format } from "date-fns";
import { Plus, Users, ClipboardList } from "lucide-react";
import type { Student, StudentWithStandup, Standup } from "@/types";
import type { User } from "@supabase/supabase-js";

export default function StandupBoardPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<StudentWithStandup[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStandup, setSelectedStandup] = useState<Standup | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayDisplay = format(new Date(), "EEEE, MMMM d, yyyy");

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: studentsData } = await supabase
      .from("students")
      .select("*")
      .order("name");

    const { data: standupsData } = await supabase
      .from("standups")
      .select("*")
      .eq("date", today);

    if (studentsData) {
      const withStandups: StudentWithStandup[] = studentsData.map((s) => ({
        ...s,
        todayStandup:
          standupsData?.find((st) => st.student_id === s.id) || null,
      }));
      setStudents(withStandups);
    }

    setLoading(false);
  }, [supabase, today]);

  useEffect(() => {
    fetchData();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [fetchData, supabase.auth]);

  const isAdmin = !!user;

  const doneCount = students.filter(
    (s) => s.todayStandup?.status === "done" || s.todayStandup?.status === "absent"
  ).length;

  const handleCardClick = (student: StudentWithStandup) => {
    if (!isAdmin) return;
    setSelectedStudent(student);
    setSelectedStandup(student.todayStandup || null);
    setDrawerOpen(true);
  };

  return (
    <>
      <StatusBanner
        doneCount={doneCount}
        totalCount={students.length}
        date={todayDisplay}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Standup Board</h1>
          <p className="mt-1 text-mentrex-text-secondary">
            {isAdmin
              ? "Click a student card to record their standup."
              : "Today's standup overview for all students."}
          </p>
        </div>

        {loading ? (
          /* Skeleton loading grid */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-52 w-full" />
            ))}
          </div>
        ) : students.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-mentrex-primary/10">
              <Users className="h-10 w-10 text-mentrex-primary" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">
              No Students Yet
            </h2>
            <p className="mb-6 text-center text-mentrex-text-secondary">
              Get started by adding your first student to the roster.
            </p>
            {isAdmin && (
              <a href="/students" className="mentrex-btn-primary">
                <Plus className="h-4 w-4" />
                Add Students
              </a>
            )}
          </div>
        ) : (
          /* Student grid */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                clickable={isAdmin}
                onClick={() => handleCardClick(student)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB — Admin only */}
      {isAdmin && (
        <a
          href="/students"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-mentrex-primary shadow-mentrex-glow transition-all duration-200 hover:bg-mentrex-primary-hover hover:scale-110"
          title="Manage Students"
        >
          <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </a>
      )}

      {/* Standup Modal — Admin only */}
      {isAdmin && (
        <StandupModal
          student={selectedStudent}
          existingStandup={selectedStandup}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSaved={fetchData}
        />
      )}
    </>
  );
}
