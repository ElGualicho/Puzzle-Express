CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  client_entry_id TEXT NOT NULL UNIQUE,
  game TEXT NOT NULL DEFAULT 'puzzle-express',
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  level TEXT NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
  moves INTEGER NOT NULL CHECK (moves >= 0),
  hints INTEGER NOT NULL CHECK (hints >= 0),
  time_seconds INTEGER NOT NULL CHECK (time_seconds >= 0),
  image_id TEXT,
  site_id TEXT NOT NULL DEFAULT 'default',
  device_id TEXT NOT NULL DEFAULT 'unknown',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_global_top
ON scores (game, score DESC, time_seconds ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_scores_site_top
ON scores (game, site_id, score DESC, time_seconds ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_scores_device
ON scores (device_id, created_at DESC);
