/*
  # Create notes table and security policies

  1. New Tables
    - `notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `notes` table
    - Add policies for:
      - Users can CRUD their own notes
      - Anyone can read public notes
*/

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own notes and public notes
CREATE POLICY "Users can read own notes and public notes"
  ON notes
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_public = true
  );

-- Allow users to insert their own notes
CREATE POLICY "Users can create their own notes"
  ON notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own notes
CREATE POLICY "Users can update their own notes"
  ON notes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON notes
  FOR DELETE
  USING (auth.uid() = user_id);