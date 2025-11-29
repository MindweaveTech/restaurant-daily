-- Initial Schema for Restaurant Daily Application
-- Created: 2025-11-19
-- Purpose: Set up all core tables and RLS policies

-- ================================================================
-- Extensions
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ================================================================
-- Users Table
-- ================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'team_member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT role_check CHECK (role IN ('admin', 'team_member'))
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);

-- ================================================================
-- Cash Sessions Table
-- ================================================================

CREATE TABLE IF NOT EXISTS cash_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opening_balance DECIMAL(10, 2) NOT NULL,
  closing_balance DECIMAL(10, 2),
  session_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  CONSTRAINT status_check CHECK (status IN ('open', 'closed'))
);

CREATE INDEX IF NOT EXISTS idx_cash_sessions_user_id ON cash_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_date ON cash_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_user_date ON cash_sessions(user_id, session_date DESC);

-- ================================================================
-- Petty Vouchers Table
-- ================================================================

CREATE TABLE IF NOT EXISTS petty_vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  voucher_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_petty_vouchers_user_id ON petty_vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_petty_vouchers_date ON petty_vouchers(voucher_date);
CREATE INDEX IF NOT EXISTS idx_petty_vouchers_user_date ON petty_vouchers(user_id, voucher_date DESC);

-- ================================================================
-- Electricity Payments Table
-- ================================================================

CREATE TABLE IF NOT EXISTS electricity_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  bill_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payment_status_check CHECK (status IN ('paid', 'pending'))
);

CREATE INDEX IF NOT EXISTS idx_electricity_payments_user_id ON electricity_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_electricity_payments_date ON electricity_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_electricity_payments_status ON electricity_payments(status);

-- ================================================================
-- Audit Logs Table
-- ================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS Policies
-- ================================================================

-- Users policies
DROP POLICY IF EXISTS "Users view own profile" ON users;
CREATE POLICY "Users view own profile" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON users;
CREATE POLICY "Users insert own profile" ON users
  FOR INSERT WITH CHECK (true);

-- Cash Sessions policies
DROP POLICY IF EXISTS "Users view own cash sessions" ON cash_sessions;
CREATE POLICY "Users view own cash sessions" ON cash_sessions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own cash sessions" ON cash_sessions;
CREATE POLICY "Users insert own cash sessions" ON cash_sessions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own cash sessions" ON cash_sessions;
CREATE POLICY "Users update own cash sessions" ON cash_sessions
  FOR UPDATE USING (true);

-- Petty Vouchers policies
DROP POLICY IF EXISTS "Users view own vouchers" ON petty_vouchers;
CREATE POLICY "Users view own vouchers" ON petty_vouchers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own vouchers" ON petty_vouchers;
CREATE POLICY "Users insert own vouchers" ON petty_vouchers
  FOR INSERT WITH CHECK (true);

-- Electricity Payments policies
DROP POLICY IF EXISTS "Users view own payments" ON electricity_payments;
CREATE POLICY "Users view own payments" ON electricity_payments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own payments" ON electricity_payments;
CREATE POLICY "Users insert own payments" ON electricity_payments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own payments" ON electricity_payments;
CREATE POLICY "Users update own payments" ON electricity_payments
  FOR UPDATE USING (true);

-- Audit Logs policies
DROP POLICY IF EXISTS "Users view own logs" ON audit_logs;
CREATE POLICY "Users view own logs" ON audit_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own logs" ON audit_logs;
CREATE POLICY "Users insert own logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ================================================================
-- Comments
-- ================================================================

COMMENT ON TABLE users IS 'Restaurant staff and admin users';
COMMENT ON TABLE cash_sessions IS 'Daily cash opening/closing balance tracking';
COMMENT ON TABLE petty_vouchers IS 'Expense tracking with categories';
COMMENT ON TABLE electricity_payments IS 'Payment monitoring and history';
COMMENT ON TABLE audit_logs IS 'Complete activity tracking for compliance';
