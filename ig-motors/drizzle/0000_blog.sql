CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  cover TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','rejected')),
  created_at TEXT NOT NULL,
  published_at TEXT,
  moderated_at TEXT,
  moderated_by TEXT,
  submission_key TEXT NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE INDEX blog_posts_status_created ON blog_posts(status,created_at);
--> statement-breakpoint
CREATE TABLE blog_rate_limits (
  rate_key TEXT PRIMARY KEY NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  day TEXT NOT NULL
);
