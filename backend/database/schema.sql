-- ============================================================
-- AURA E-Commerce — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password        TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    profile_pic     TEXT DEFAULT '',
    is_verified     BOOLEAN DEFAULT FALSE,
    is_logged_in    BOOLEAN DEFAULT FALSE,
    token           TEXT DEFAULT NULL,
    otp             TEXT DEFAULT NULL,
    otp_expiry      TIMESTAMPTZ DEFAULT NULL,
    reset_password_token        TEXT DEFAULT NULL,
    reset_password_token_expiry TIMESTAMPTZ DEFAULT NULL,
    address         TEXT DEFAULT NULL,
    city            TEXT DEFAULT NULL,
    zip_code        TEXT DEFAULT NULL,
    phone_no        TEXT DEFAULT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    category    TEXT NOT NULL,
    image       TEXT NOT NULL,
    stock       INTEGER NOT NULL DEFAULT 0,
    rating      NUMERIC(3,2) DEFAULT 0,
    num_reviews INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (product_id, user_id)
);

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payment_method  TEXT NOT NULL DEFAULT 'Card' CHECK (payment_method IN ('Card', 'Cash on Delivery', 'COD', 'PayPal', 'Stripe')),
    items_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_price  NUMERIC(10,2) DEFAULT 0,
    coupon_code     TEXT DEFAULT '',
    tax_price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    shipping_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_paid         BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at         TIMESTAMPTZ DEFAULT NULL,
    is_delivered    BOOLEAN NOT NULL DEFAULT FALSE,
    delivered_at    TIMESTAMPTZ DEFAULT NULL,
    status          TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    -- Shipping address (flattened)
    shipping_address    TEXT NOT NULL,
    shipping_city       TEXT NOT NULL,
    shipping_zip_code   TEXT NOT NULL,
    shipping_phone_no   TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    name        TEXT NOT NULL,
    image       TEXT NOT NULL,
    price       NUMERIC(10,2) NOT NULL,
    qty         INTEGER NOT NULL
);

-- ─────────────────────────────────────────────
-- HELPER: auto-update updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- SEED: Default Categories
-- ─────────────────────────────────────────────
INSERT INTO categories (name, description) VALUES
    ('Laptops',      'High-performance portable computers and ultrabooks'),
    ('Smartphones',  'Next-gen flagship mobile devices and accessories'),
    ('Headphones',   'Studio monitors, wireless audio, and active noise-cancelling gear'),
    ('Smartwatches', 'Luxury connected timepieces and health wearables'),
    ('Accessories',  'Premium tech essentials, chargers, cables, and peripherals')
ON CONFLICT (name) DO NOTHING;
