-- Optional manual schema for Neon Console → SQL Editor.
-- The application creates the same tables automatically on first connection.

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE admin_users DROP COLUMN IF EXISTS last_totp_counter;

CREATE TABLE IF NOT EXISTS auth_login_attempts (
  key_hash TEXT PRIMARY KEY,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at TEXT NOT NULL,
  blocked_until TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_login_attempts_updated ON auth_login_attempts(updated_at);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  compare_at_price INTEGER,
  currency TEXT NOT NULL DEFAULT 'RUB',
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  is_new INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  is_on_sale INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status, created_at);

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_images ON product_images(product_id, sort_order);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL,
  cta_label TEXT NOT NULL DEFAULT 'Смотреть коллекцию',
  cta_href TEXT NOT NULL DEFAULT '/catalog',
  theme TEXT NOT NULL DEFAULT 'dark',
  position INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  is_approved INTEGER NOT NULL DEFAULT 0,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved, created_at);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  announcement TEXT NOT NULL,
  telegram_username TEXT NOT NULL,
  channel_username TEXT NOT NULL,
  hero_eyebrow TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_text TEXT NOT NULL,
  founder_title TEXT NOT NULL,
  founder_text TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  footer_text TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
