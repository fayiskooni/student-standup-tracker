"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Loader2, Presentation, Calendar } from "lucide-react";
import type { Student, Standup, SpeakingLevel } from "@/types";
import { SPEAKING_LEVELS } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./Toast";
import { format, parseISO } from "date-fns";
import StudentAvatar from "./StudentAvatar";

interface StandupModalProps {
  student: Student | null;
  existingStandup?: Standup | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function StandupModal({
  student,
  existingStandup,
  isOpen,
  onClose,
  onSaved,
}: StandupModalProps) {
  const { showToast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [previousStandup, setPreviousStandup] = useState<Standup | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [yesterdayWork, setYesterdayWork] = useState("");
  const [todayPlan, setTodayPlan] = useState("");
  const [keyboardWpm, setKeyboardWpm] = useState(0);
  const [speakingLevel, setSpeakingLevel] = useState<SpeakingLevel>("Beginner");
  const [speakingNotes, setSpeakingNotes] = useState("");
  const [hasPresentation, setHasPresentation] = useState(false);
  const [presentationDetails, setPresentationDetails] = useState("");
  const [presentationDate, setPresentationDate] = useState("");
  const [status, setStatus] = useState<"done" | "absent">("done");
  const [notes, setNotes] = useState("");

  // Fetch the most recent previous standup for context
  const fetchPreviousStandup = useCallback(
    async (studentId: string) => {
      setLoadingContext(true);
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("standups")
        .select("*")
        .eq("student_id", studentId)
        .lt("date", today)
        .order("date", { ascending: false })
        .limit(1)
        .single();
      setPreviousStandup(data || null);
      setLoadingContext(false);
      return data as Standup | null;
    },
    [supabase]
  );

  // Pre-fill with existing data or student defaults + fetch yesterday context
  useEffect(() => {
    if (!isOpen) return;
    // Reset scroll on open
    if (scrollRef.current) scrollRef.current.scrollTop = 0;

    if (existingStandup) {
      setYesterdayWork(existingStandup.yesterday_work || "");
      setTodayPlan(existingStandup.today_plan || "");
      setKeyboardWpm(existingStandup.keyboard_wpm || 0);
      setSpeakingLevel(existingStandup.speaking_level as SpeakingLevel);
      setSpeakingNotes(existingStandup.speaking_notes || "");
      setHasPresentation(existingStandup.has_presentation || false);
      setPresentationDetails(existingStandup.presentation_details || "");
      setPresentationDate(existingStandup.presentation_date || "");
      setStatus(existingStandup.status as "done" | "absent");
      setNotes(existingStandup.notes || "");
      if (student) fetchPreviousStandup(student.id);
    } else if (student) {
      setTodayPlan("");
      setKeyboardWpm(student.current_wpm || 0);
      setSpeakingLevel(student.speaking_level as SpeakingLevel);
      setSpeakingNotes("");
      setHasPresentation(false);
      setPresentationDetails("");
      setPresentationDate("");
      setStatus("done");
      setNotes("");
      fetchPreviousStandup(student.id).then((prev) => {
        setYesterdayWork(prev?.today_plan || "");
      });
    }
  }, [existingStandup, student, fetchPreviousStandup, isOpen]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const standupData = {
      student_id: student.id,
      date: today,
      yesterday_work: yesterdayWork,
      today_plan: todayPlan,
      keyboard_wpm: keyboardWpm,
      speaking_level: speakingLevel,
      speaking_notes: speakingNotes,
      has_presentation: hasPresentation,
      presentation_details: hasPresentation ? presentationDetails : null,
      presentation_date: hasPresentation && presentationDate ? presentationDate : null,
      status,
      notes: notes || null,
    };

    try {
      if (existingStandup) {
        const { error } = await supabase
          .from("standups")
          .update(standupData)
          .eq("id", existingStandup.id);
        if (error) throw error;
        showToast("Standup updated successfully!", "success");
      } else {
        const { error } = await supabase.from("standups").insert(standupData);
        if (error) throw error;

        // Also update student's current WPM and speaking level
        await supabase
          .from("students")
          .update({ current_wpm: keyboardWpm, speaking_level: speakingLevel })
          .eq("id", student.id);

        showToast("Standup submitted!", "success");
      }
      onSaved();
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save standup";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  const isAnimatingOut = closing;

  return (
    /* Portal-style overlay — fixed full-screen */
    <div
      className="standup-modal-backdrop"
      style={{ opacity: isAnimatingOut ? 0 : 1 }}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-label={`${existingStandup ? "Edit" : "New"} standup for ${student.name}`}
    >
      {/* Modal card — stops propagation so clicking inside doesn't close */}
      <div
        className="standup-modal-card"
        style={{
          transform: isAnimatingOut ? "translate(-50%, -50%) scale(0.95)" : "translate(-50%, -50%) scale(1)",
          opacity: isAnimatingOut ? 0 : 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="standup-modal-header">
          <div className="flex items-center gap-4">
            <StudentAvatar student={student} size={48} />

            {/* Name + label */}
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{student.name}</h2>
              <p className="text-sm text-mentrex-text-secondary">
                {existingStandup ? "Edit Standup" : "New Standup"}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            id="standup-modal-close"
            onClick={handleClose}
            className="standup-modal-close-btn"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────────────── */}
        <div className="standup-modal-body" ref={scrollRef}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Yesterday's Context Panel ─────────────────────── */}
            <div className="standup-context-panel">
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-mentrex-text-secondary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-mentrex-text-secondary">
                  📅 Yesterday&apos;s Context
                </span>
              </div>

              {loadingContext ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-mentrex-text-secondary" />
                  <span className="text-sm text-mentrex-text-secondary">Loading context...</span>
                </div>
              ) : previousStandup ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-mentrex-text-secondary">
                      {format(parseISO(previousStandup.date), "EEEE, MMM d, yyyy")}
                    </span>
                    <span
                      className={`mentrex-pill text-[10px] ${
                        previousStandup.status === "done"
                          ? "bg-mentrex-success/20 text-mentrex-success"
                          : previousStandup.status === "absent"
                          ? "bg-mentrex-danger/20 text-mentrex-danger"
                          : "bg-mentrex-text-secondary/20 text-mentrex-text-secondary"
                      }`}
                    >
                      {previousStandup.status === "done"
                        ? "✅ Done"
                        : previousStandup.status === "absent"
                        ? "🔴 Absent"
                        : "⏳ Pending"}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-mentrex-text-secondary">
                      Yesterday&apos;s Plan was:
                    </p>
                    <p className="text-sm leading-relaxed text-white/80">
                      {previousStandup.today_plan || (
                        <span className="italic text-mentrex-text-secondary">No plan recorded</span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm italic text-mentrex-text-secondary">
                  No previous standup yet
                </p>
              )}
            </div>

            {/* ── Yesterday's Work ─────────────────────────────── */}
            <div>
              <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">
                Yesterday&apos;s Work
                {previousStandup?.today_plan && !existingStandup && (
                  <span className="ml-2 text-[10px] font-normal text-mentrex-primary">
                    (auto-filled from yesterday&apos;s plan)
                  </span>
                )}
              </label>
              <textarea
                value={yesterdayWork}
                onChange={(e) => setYesterdayWork(e.target.value)}
                rows={3}
                className="mentrex-input resize-none"
                placeholder="What did you accomplish yesterday?"
              />
            </div>

            {/* ── Today's Plan ─────────────────────────────────── */}
            <div>
              <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">
                Today&apos;s Plan
              </label>
              <textarea
                value={todayPlan}
                onChange={(e) => setTodayPlan(e.target.value)}
                rows={3}
                className="mentrex-input resize-none"
                placeholder="What will you work on today?"
              />
            </div>

            {/* ── Keyboard WPM ─────────────────────────────────── */}
            <div>
              <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">
                Keyboard WPM
              </label>
              <input
                type="number"
                value={keyboardWpm}
                onChange={(e) => setKeyboardWpm(parseInt(e.target.value) || 0)}
                min={0}
                max={200}
                className="mentrex-input"
                placeholder="Words per minute"
              />
            </div>

            {/* ── Speaking Level ───────────────────────────────── */}
            <div>
              <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">
                Speaking Level
              </label>
              <select
                value={speakingLevel}
                onChange={(e) => setSpeakingLevel(e.target.value as SpeakingLevel)}
                className="mentrex-input appearance-none"
              >
                {SPEAKING_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Speaking Notes ───────────────────────────────── */}
            <div>
              <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">
                Speaking Notes
              </label>
              <textarea
                value={speakingNotes}
                onChange={(e) => setSpeakingNotes(e.target.value)}
                rows={2}
                className="mentrex-input resize-none"
                placeholder="Notes on speaking progress..."
              />
            </div>

            {/* ── Presentation Toggle ──────────────────────────── */}
            <div className="rounded-card border border-mentrex bg-mentrex-elevated/50 p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={hasPresentation}
                  onChange={(e) => setHasPresentation(e.target.checked)}
                  className="h-4 w-4 rounded border-mentrex-text-secondary bg-mentrex-card text-mentrex-primary focus:ring-mentrex-primary"
                />
                <Presentation className="h-4 w-4 text-mentrex-primary" />
                <span className="text-sm font-medium text-white">Has Presentation</span>
              </label>

              {hasPresentation && (
                <div className="mt-4 space-y-3 animate-fade-in">
                  <input
                    type="text"
                    value={presentationDetails}
                    onChange={(e) => setPresentationDetails(e.target.value)}
                    className="mentrex-input"
                    placeholder="Presentation topic / details"
                  />
                  <input
                    type="date"
                    value={presentationDate}
                    onChange={(e) => setPresentationDate(e.target.value)}
                    className="mentrex-input"
                  />
                </div>
              )}
            </div>

            {/* ── Status ──────────────────────────────────────── */}
            <div>
              <label className="mb-3 block text-sm font-medium text-mentrex-text-secondary">
                Status
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("done")}
                  className={`flex-1 rounded-input border px-4 py-3 text-sm font-medium transition-all ${
                    status === "done"
                      ? "border-mentrex-success bg-mentrex-success/10 text-mentrex-success"
                      : "border-mentrex bg-mentrex-card text-mentrex-text-secondary hover:border-mentrex-success/30"
                  }`}
                >
                  ✅ Done
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("absent")}
                  className={`flex-1 rounded-input border px-4 py-3 text-sm font-medium transition-all ${
                    status === "absent"
                      ? "border-mentrex-danger bg-mentrex-danger/10 text-mentrex-danger"
                      : "border-mentrex bg-mentrex-card text-mentrex-text-secondary hover:border-mentrex-danger/30"
                  }`}
                >
                  🔴 Absent
                </button>
              </div>
            </div>

            {/* ── Additional Notes ────────────────────────────── */}
            <div>
              <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mentrex-input resize-none"
                placeholder="Any extra notes..."
              />
            </div>

            {/* ── Submit ──────────────────────────────────────── */}
            <button
              id="standup-modal-submit"
              type="submit"
              disabled={loading}
              className="mentrex-btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : existingStandup ? (
                "Update Standup"
              ) : (
                "Submit Standup"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
