"use client";

import { Calendar, Presentation } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Student, Standup } from "@/types";
import StudentAvatar from "./StudentAvatar";

interface PresentationCardProps {
  student: Student;
  standup: Standup;
}

export default function PresentationCard({
  student,
  standup,
}: PresentationCardProps) {
  return (
    <div className="group flex items-center gap-4 rounded-card border border-mentrex bg-mentrex-card p-4 transition-all duration-200 hover:border-mentrex-primary/30 hover:shadow-mentrex">
      {/* Student photo */}
      <StudentAvatar student={student} size={48} />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {student.name}
        </p>
        <p className="truncate text-xs text-mentrex-text-secondary">
          <Presentation className="mr-1 inline h-3 w-3" />
          {standup.presentation_details || "Presentation"}
        </p>
      </div>

      {/* Date badge */}
      {standup.presentation_date && (
        <div className="flex flex-shrink-0 items-center gap-1.5 rounded-pill bg-mentrex-primary/10 px-3 py-1.5">
          <Calendar className="h-3 w-3 text-mentrex-primary" />
          <span className="text-xs font-medium text-mentrex-primary">
            {format(parseISO(standup.presentation_date), "MMM d")}
          </span>
        </div>
      )}
    </div>
  );
}
