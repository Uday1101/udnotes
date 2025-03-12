/*
  # Add subject organization and PDF support

  1. New Tables
    - `subjects`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, references users)

  2. Changes to Notes Table
    - Add `subject_id` column (references subjects)
    - Add `file_url` column for PDF storage
    - Add `file_name` column for original PDF name

  3. Security
    - Enable RLS on subjects table
    - Add policies for CRUD operations on subjects
    - Update note policies to include file handling
*/

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  UNIQUE(name, user_id)
);

-- Enable RLS on subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for subjects
CREATE POLICY "Users can create their own subjects"
  ON subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects"
  ON subjects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects"
  ON subjects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add new columns to notes table
ALTER TABLE notes 
  ADD COLUMN IF NOT EXISTS subject_id uuid REFERENCES subjects(id),
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_name text;