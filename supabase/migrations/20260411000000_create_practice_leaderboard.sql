-- Practice leaderboard: stores best scores per user per rhythm per chorus
CREATE TABLE IF NOT EXISTS practice_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chorus_id UUID NOT NULL REFERENCES choruses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  rhythm_key TEXT NOT NULL,
  rhythm_name TEXT NOT NULL,
  best_accuracy INTEGER NOT NULL DEFAULT 0,
  best_bpm INTEGER NOT NULL DEFAULT 0,
  total_cycles INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chorus_id, user_id, rhythm_key)
);

-- Index for fast per-chorus leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_chorus_accuracy
  ON practice_leaderboard(chorus_id, best_accuracy DESC, best_bpm DESC);

-- RLS: members can read their chorus leaderboard, users can write their own rows
ALTER TABLE practice_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chorus members can view leaderboard"
  ON practice_leaderboard FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chorus_members
      WHERE chorus_members.chorus_id = practice_leaderboard.chorus_id
        AND chorus_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own scores"
  ON practice_leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores"
  ON practice_leaderboard FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
