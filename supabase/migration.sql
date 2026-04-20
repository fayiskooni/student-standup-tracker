-- Mentrex Standup — Database Migration
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  photo_url TEXT,
  course_duration INT NOT NULL CHECK (course_duration IN (6, 12)),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_wpm INT NOT NULL DEFAULT 0,
  speaking_level TEXT NOT NULL DEFAULT 'Beginner' CHECK (
    speaking_level IN ('Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Fluent')
  ),
  speaking_score INT NOT NULL DEFAULT 1 CHECK (speaking_score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Standups table
CREATE TABLE IF NOT EXISTS standups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  yesterday_work TEXT NOT NULL DEFAULT '',
  today_plan TEXT NOT NULL DEFAULT '',
  keyboard_wpm INT NOT NULL DEFAULT 0,
  speaking_level TEXT NOT NULL DEFAULT 'Beginner' CHECK (
    speaking_level IN ('Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Fluent')
  ),
  speaking_notes TEXT DEFAULT '',
  has_presentation BOOLEAN NOT NULL DEFAULT FALSE,
  presentation_details TEXT,
  presentation_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('done', 'absent', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_standups_date ON standups(date);
CREATE INDEX IF NOT EXISTS idx_standups_student_date ON standups(student_id, date);
CREATE INDEX IF NOT EXISTS idx_standups_status ON standups(status);

-- Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE standups ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies
CREATE POLICY "Anyone can view students"
  ON students FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view standups"
  ON standups FOR SELECT
  USING (true);

-- Admin INSERT/UPDATE/DELETE policies
CREATE POLICY "Authenticated users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert standups"
  ON standups FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update standups"
  ON standups FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete standups"
  ON standups FOR DELETE
  TO authenticated
  USING (true);

-- Storage bucket for student photos
-- Note: Create the bucket "student-photos" manually in Supabase Dashboard > Storage
-- Set it as a PUBLIC bucket so photos can be accessed without auth
-- Or run:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('student-photos', 'student-photos', true);
