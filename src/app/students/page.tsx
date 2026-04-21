"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/components/Toast";
import { differenceInMonths } from "date-fns";
import { Plus, Pencil, Trash2, X, Loader2, Upload, Keyboard, Mic, Users } from "lucide-react";
import type { Student, SpeakingLevel, PhotoCrop } from "@/types";
import { SPEAKING_LEVELS, SPEAKING_LEVEL_COLORS, DEFAULT_CROP } from "@/types";
import StudentAvatar from "@/components/StudentAvatar";
import ImageCropEditor from "@/components/ImageCropEditor";

export default function StudentsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [courseDuration, setCourseDuration] = useState<6 | 12>(12);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [speakingLevel, setSpeakingLevel] = useState<SpeakingLevel>("Beginner");
  const [speakingScore, setSpeakingScore] = useState(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoCrop, setPhotoCrop] = useState<PhotoCrop>(DEFAULT_CROP);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("students").select("*").order("name");
    if (data) setStudents(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // Check auth — redirect to login if not signed in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (!user) router.push("/login");
    });
    fetchStudents();
  }, [fetchStudents, supabase.auth, router]);

  const resetForm = () => {
    setName(""); setJoinDate(""); setCourseDuration(12);
    setCurrentWpm(0); setSpeakingLevel("Beginner"); setSpeakingScore(1);
    setPhotoFile(null); setPhotoPreview(null); setPhotoCrop(DEFAULT_CROP);
    setEditStudent(null);
  };

  const openAddModal = () => {
    resetForm();
    setJoinDate(new Date().toISOString().split("T")[0]);
    setModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditStudent(student);
    setName(student.name);
    setJoinDate(student.join_date);
    setCourseDuration(student.course_duration as 6 | 12);
    setCurrentWpm(student.current_wpm);
    setSpeakingLevel(student.speaking_level as SpeakingLevel);
    setSpeakingScore(student.speaking_score);
    setPhotoPreview(student.photo_url);
    setPhotoCrop(student.photo_crop ?? DEFAULT_CROP);
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoCrop(DEFAULT_CROP); // reset crop for new image
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoCrop(DEFAULT_CROP);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("student-photos").upload(fileName, file);
    if (error) { showToast("Photo upload failed", "error"); return null; }
    const { data: urlData } = supabase.storage.from("student-photos").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast("Name is required", "error"); return; }
    setSaving(true);

    let photoUrl = editStudent?.photo_url || null;
    if (photoFile) {
      const url = await uploadPhoto(photoFile);
      if (url) photoUrl = url;
    }

    const studentData = {
      name: name.trim(),
      join_date: joinDate,
      course_duration: courseDuration,
      current_wpm: currentWpm,
      speaking_level: speakingLevel,
      speaking_score: speakingScore,
      photo_url: photoUrl,
      photo_crop: photoCrop,
    };

    try {
      if (editStudent) {
        const { error } = await supabase.from("students").update(studentData).eq("id", editStudent.id);
        if (error) throw error;
        showToast("Student updated!", "success");
      } else {
        const { error } = await supabase.from("students").insert(studentData);
        if (error) throw error;
        showToast("Student added!", "success");
      }
      setModalOpen(false); resetForm(); fetchStudents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      showToast(msg, "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) { showToast("Failed to delete", "error"); }
    else { showToast("Student deleted", "success"); fetchStudents(); }
    setDeleteConfirm(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Student Management</h1>
          <p className="mt-1 text-mentrex-text-secondary">{students.length} students enrolled</p>
        </div>
        {user && (
          <button onClick={openAddModal} className="mentrex-btn-primary self-start sm:self-auto">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40" />)}
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-mentrex-primary/10">
            <Users className="h-10 w-10 text-mentrex-primary" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">No Students Yet</h2>
          <p className="mb-6 text-mentrex-text-secondary">Add your first student to get started.</p>
          {user && (
            <button onClick={openAddModal} className="mentrex-btn-primary"><Plus className="h-4 w-4" /> Add Student</button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => {
            const mElapsed = differenceInMonths(new Date(), new Date(student.join_date));
            const progress = Math.min((mElapsed / student.course_duration) * 100, 100);
            const spColor = SPEAKING_LEVEL_COLORS[student.speaking_level as SpeakingLevel] || "#94a3b8";
            return (
              <div key={student.id} className="group rounded-card border border-mentrex bg-mentrex-card p-5 transition-all hover:border-mentrex-primary/30 hover:shadow-mentrex">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StudentAvatar student={student} size={56} />
                    <div>
                      <h3 className="font-bold text-white">{student.name}</h3>
                      <p className="text-xs text-mentrex-text-secondary">Joined {student.join_date}</p>
                    </div>
                  </div>
                  {user && (
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(student)} className="rounded-lg p-2 text-mentrex-text-secondary hover:bg-mentrex-elevated hover:text-white"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteConfirm(student.id)} className="rounded-lg p-2 text-mentrex-text-secondary hover:bg-mentrex-danger/10 hover:text-mentrex-danger"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs text-mentrex-text-secondary">
                    <span>{student.course_duration}mo course</span><span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-mentrex-elevated">
                    <div className="h-full rounded-full bg-gradient-to-r from-mentrex-primary to-purple-400" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="mentrex-pill bg-mentrex-elevated text-mentrex-text-secondary"><Keyboard className="h-3 w-3" />{student.current_wpm} WPM</span>
                  <span className="mentrex-pill" style={{ backgroundColor: `${spColor}20`, color: spColor }}><Mic className="h-3 w-3" />{student.speaking_level}</span>
                </div>
                {/* Delete confirm */}
                {deleteConfirm === student.id && (
                  <div className="mt-3 rounded-input border border-mentrex-danger/30 bg-mentrex-danger/10 p-3 animate-fade-in">
                    <p className="mb-2 text-sm text-mentrex-danger">Delete {student.name}?</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(student.id)} className="rounded-input bg-mentrex-danger px-3 py-1.5 text-xs font-medium text-white">Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="rounded-input bg-mentrex-elevated px-3 py-1.5 text-xs font-medium text-mentrex-text-secondary">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────── */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="standup-modal-backdrop"
            onClick={() => { setModalOpen(false); resetForm(); }}
          />

          {/* Modal card */}
          <div
            className="standup-modal-card"
            style={{ transform: "translate(-50%, -50%) scale(1)", opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="standup-modal-header">
              <h2 className="text-lg font-bold text-white">
                {editStudent ? "Edit Student" : "Add Student"}
              </h2>
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="standup-modal-close-btn"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="standup-modal-body">
              <form onSubmit={handleSave} className="space-y-5">

                {/* ── Photo upload / Crop editor ───────────────── */}
                <div className="flex flex-col items-center gap-4">
                  {photoPreview ? (
                    /* Show crop editor once a photo is selected */
                    <div className="w-full rounded-card border border-mentrex bg-mentrex-elevated/40 p-5">
                      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-mentrex-text-secondary">
                        Adjust Photo
                      </p>
                      <div className="flex justify-center">
                        <ImageCropEditor
                          src={photoPreview}
                          crop={photoCrop}
                          onChange={setPhotoCrop}
                          size={200}
                        />
                      </div>
                      {/* Change photo button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 w-full rounded-input border border-mentrex bg-mentrex-card py-2 text-sm text-mentrex-text-secondary transition-colors hover:border-mentrex-primary/40 hover:text-white"
                      >
                        <Upload className="mr-1.5 inline h-3.5 w-3.5" />
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    /* Upload drop zone */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-mentrex hover:border-mentrex-primary transition-colors"
                    >
                      <Upload className="h-6 w-6 text-mentrex-text-secondary group-hover:text-mentrex-primary transition-colors" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mentrex-input" placeholder="Student name" required />
                </div>

                {/* Join Date + Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">Join Date</label>
                    <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className="mentrex-input" required />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">Course Duration</label>
                    <select value={courseDuration} onChange={(e) => setCourseDuration(parseInt(e.target.value) as 6 | 12)} className="mentrex-input">
                      <option value={6}>6 Months</option><option value={12}>12 Months</option>
                    </select>
                  </div>
                </div>

                {/* WPM + Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">Starting WPM</label>
                    <input type="number" value={currentWpm} onChange={(e) => setCurrentWpm(parseInt(e.target.value) || 0)} min={0} className="mentrex-input" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">Speaking Score (1-10)</label>
                    <input type="number" value={speakingScore} onChange={(e) => setSpeakingScore(parseInt(e.target.value) || 1)} min={1} max={10} className="mentrex-input" />
                  </div>
                </div>

                {/* Speaking Level */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-mentrex-text-secondary">Speaking Level</label>
                  <select value={speakingLevel} onChange={(e) => setSpeakingLevel(e.target.value as SpeakingLevel)} className="mentrex-input">
                    {SPEAKING_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Submit */}
                <button type="submit" disabled={saving} className="mentrex-btn-primary w-full">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : editStudent ? "Update Student" : "Add Student"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
