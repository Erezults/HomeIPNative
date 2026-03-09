CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  viewer_code_id uuid REFERENCES viewer_codes ON DELETE CASCADE,
  expo_push_token text NOT NULL UNIQUE,
  platform text NOT NULL DEFAULT 'ios',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can read all tokens"
  ON push_tokens FOR SELECT
  USING (true);
