-- Trade command spike: durable, idempotent per-user command log.
-- Consumed by Cloudflare Queue -> SessionDO -> D1.

CREATE TABLE IF NOT EXISTS trade_command_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  amount TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  processed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_trade_command_log_user_id ON trade_command_log(user_id);
