export interface PhotoCrop {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_CROP: PhotoCrop = { zoom: 1, offsetX: 0, offsetY: 0 };

export interface Student {
  id: string;
  name: string;
  photo_url: string | null;
  photo_crop?: PhotoCrop | null;
  course_duration: 6 | 12;
  join_date: string;
  current_wpm: number;
  speaking_level: SpeakingLevel;
  speaking_score: number;
  created_at: string;
}

export type SpeakingLevel =
  | "Beginner"
  | "Elementary"
  | "Intermediate"
  | "Upper-Intermediate"
  | "Advanced"
  | "Fluent";

export const SPEAKING_LEVELS: SpeakingLevel[] = [
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper-Intermediate",
  "Advanced",
  "Fluent",
];

export const SPEAKING_LEVEL_COLORS: Record<SpeakingLevel, string> = {
  Beginner: "#ef4444",
  Elementary: "#f59e0b",
  Intermediate: "#3b82f6",
  "Upper-Intermediate": "#8b5cf6",
  Advanced: "#10b981",
  Fluent: "#06d6a0",
};

export const SPEAKING_SCORE_TO_LEVEL: Record<number, SpeakingLevel> = {
  1: "Beginner",
  2: "Beginner",
  3: "Elementary",
  4: "Elementary",
  5: "Intermediate",
  6: "Intermediate",
  7: "Upper-Intermediate",
  8: "Advanced",
  9: "Advanced",
  10: "Fluent",
};

export type StandupStatus = "done" | "absent" | "pending";

export interface Standup {
  id: string;
  student_id: string;
  date: string;
  yesterday_work: string;
  today_plan: string;
  keyboard_wpm: number;
  speaking_level: SpeakingLevel;
  speaking_notes: string;
  has_presentation: boolean;
  presentation_details: string | null;
  presentation_date: string | null;
  status: StandupStatus;
  notes: string | null;
  created_at: string;
}

export interface StudentWithStandup extends Student {
  todayStandup?: Standup | null;
}
