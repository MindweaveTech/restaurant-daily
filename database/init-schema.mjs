#!/usr/bin/env node

/**
 * Initialize Supabase Database Schema
 *
 * Creates all required tables for Restaurant Daily app
 * Requires Vault to be running with SUPABASE_* credentials configured
 */

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper function to get secrets from Vault
async function getVaultSecret(secretPath) {
  try {
    const vaultAddr = process.env.VAULT_ADDR || 'http://127.0.0.1:8200';
    const vaultToken = process.env.VAULT_TOKEN;

    if (!vaultToken) {
      throw new Error('VAULT_TOKEN environment variable not set');
    }

    const { stdout } = await execAsync(
      `VAULT_ADDR=${vaultAddr} VAULT_TOKEN=${vaultToken} vault kv get -format=json ${secretPath}`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const response = JSON.parse(stdout);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error(`❌ Failed to get Vault secret: ${error.message}`);
    throw error;
  }
}

// SQL schema creation
const schemaSQL = `
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'team_member', -- 'admin' | 'team_member'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT role_check CHECK (role IN ('admin', 'team_member'))
);

-- Cash Sessions table
CREATE TABLE IF NOT EXISTS cash_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opening_balance DECIMAL(10, 2) NOT NULL,
  closing_balance DECIMAL(10, 2),
  session_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- 'open' | 'closed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  CONSTRAINT status_check CHECK (status IN ('open', 'closed'))
);

-- Petty Vouchers table
CREATE TABLE IF NOT EXISTS petty_vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  voucher_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Electricity Payments table
CREATE TABLE IF NOT EXISTS electricity_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  bill_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- 'paid' | 'pending'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payment_status_check CHECK (status IN ('paid', 'pending'))
);

-- Audit Logs table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cash_sessions_user_id ON cash_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_date ON cash_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_user_date ON cash_sessions(user_id, session_date DESC);

CREATE INDEX IF NOT EXISTS idx_petty_vouchers_user_id ON petty_vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_petty_vouchers_date ON petty_vouchers(voucher_date);
CREATE INDEX IF NOT EXISTS idx_petty_vouchers_user_date ON petty_vouchers(user_id, voucher_date DESC);

CREATE INDEX IF NOT EXISTS idx_electricity_payments_user_id ON electricity_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_electricity_payments_date ON electricity_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own profile" ON users
  FOR SELECT USING (true); -- Public view for now

CREATE POLICY "Users view own cash sessions" ON cash_sessions
  FOR SELECT USING (true); -- Public view for now

CREATE POLICY "Users view own vouchers" ON petty_vouchers
  FOR SELECT USING (true); -- Public view for now

CREATE POLICY "Users view own payments" ON electricity_payments
  FOR SELECT USING (true); -- Public view for now

CREATE POLICY "Users view own logs" ON audit_logs
  FOR SELECT USING (true); -- Public view for now
`;

async function initializeSchema() {
  console.log('🔧 Initializing Supabase Database Schema...\n');

  try {
    // Step 1: Get credentials from Vault
    console.log('📦 Fetching credentials from Vault...');
    const supabaseSecrets = await getVaultSecret('secret/supabase');

    if (!supabaseSecrets || !supabaseSecrets.url || !supabaseSecrets.service_role_key) {
      throw new Error('Missing required Supabase credentials (url, service_role_key)');
    }

    const supabaseUrl = supabaseSecrets.url;
    const serviceRoleKey = supabaseSecrets.service_role_key;

    console.log(`✅ Credentials retrieved: ${supabaseUrl}`);

    // Step 2: Create Supabase admin client (with service role)
    console.log('\n🚀 Creating admin Supabase client...');
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log('✅ Admin client created');

    // Step 3: Execute schema SQL
    console.log('\n📝 Creating database schema...');
    const { error } = await supabase.rpc('exec_raw_sql', {
      sql: schemaSQL
    }).catch(() => {
      // If RPC doesn't exist, we need to execute via Supabase API differently
      console.log('⚠️  RPC exec_raw_sql not available. Schema must be created manually.');
      return { error: 'RPC_NOT_AVAILABLE' };
    });

    if (error && error !== 'RPC_NOT_AVAILABLE') {
      throw new Error(`Failed to create schema: ${error}`);
    }

    // Step 4: Verify tables were created
    console.log('\n✅ Checking created tables...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (!tableError && tables) {
      const tableNames = tables.map(t => t.table_name).filter(
        t => ['users', 'cash_sessions', 'petty_vouchers', 'electricity_payments', 'audit_logs'].includes(t)
      );

      console.log(`Found ${tableNames.length} tables:`);
      tableNames.forEach(name => console.log(`   ✅ ${name}`));
    }

    console.log('\n' + '='.repeat(50));
    console.log('⚠️  MANUAL STEP REQUIRED');
    console.log('='.repeat(50));
    console.log('\nTo complete schema initialization, you must:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Open your project (Restaurant Daily)');
    console.log('3. Go to SQL Editor');
    console.log('4. Paste the schema SQL from database/migrations/001_init_schema.sql');
    console.log('5. Execute the SQL');
    console.log('\nThen run test-supabase-connection.mjs to verify!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ SCHEMA INITIALIZATION FAILED');
    console.error('='.repeat(50));
    console.error(`\nError: ${error.message}\n`);

    console.error('Note: You can manually create the schema via Supabase dashboard:');
    console.error('1. Go to https://app.supabase.com');
    console.error('2. Open SQL Editor');
    console.error('3. Copy content from database/migrations/001_init_schema.sql');
    console.error('4. Execute in the editor\n');

    process.exit(1);
  }
}

// Run initialization
initializeSchema();
