# Database Setup & Configuration

## Overview

This directory contains all database-related setup, migrations, and documentation for the Restaurant Daily application.

**Database Type**: Supabase (PostgreSQL)
**Project**: Restaurant Daily
**Project ID**: hukaqbgfmerutzhtchiu
**Project URL**: https://hukaqbgfmerutzhtchiu.supabase.co

---

## Quick Start

### Environment Setup

```bash
# 1. Set Vault environment variables
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[YOUR_VAULT_TOKEN]'

# 2. Get Supabase credentials from Vault
vault kv get secret/supabase

# 3. The following will be available:
# - url: Supabase project URL
# - anon_key: Anonymous key for client-side queries
# - service_role_key: Service role key for server-side operations
# - database_url: Direct PostgreSQL connection string
```

### Configuration

Store all Supabase credentials securely in Vault:

```bash
vault kv put secret/supabase \
  url="https://hukaqbgfmerutzhtchiu.supabase.co" \
  anon_key="[YOUR_ANON_KEY]" \
  service_role_key="[YOUR_SERVICE_ROLE_KEY]" \
  database_url="[YOUR_DATABASE_URL]"
```

---

## Database Schema

### Tables Overview

#### 1. **users**
Phone-based authentication with role management

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(50), -- 'admin' | 'team_member'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **cash_sessions**
Daily cash opening/closing balance tracking

```sql
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  opening_balance DECIMAL(10, 2) NOT NULL,
  closing_balance DECIMAL(10, 2),
  session_date DATE NOT NULL,
  status VARCHAR(20), -- 'open' | 'closed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 3. **petty_vouchers**
Expense tracking with categories

```sql
CREATE TABLE petty_vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  voucher_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 4. **electricity_payments**
Payment monitoring and history

```sql
CREATE TABLE electricity_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  bill_reference VARCHAR(100),
  status VARCHAR(20), -- 'paid' | 'pending'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 5. **audit_logs**
Full activity tracking for compliance

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Row-Level Security (RLS)

All tables have RLS enabled for security. Users can only access their own data:

### Enable RLS on tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petty_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can view their own cash sessions
CREATE POLICY "Users view own cash sessions" ON cash_sessions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own vouchers
CREATE POLICY "Users view own vouchers" ON petty_vouchers
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own payments
CREATE POLICY "Users view own payments" ON electricity_payments
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own audit logs
CREATE POLICY "Users view own logs" ON audit_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own records
CREATE POLICY "Users insert own records" ON cash_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
```

---

## Migrations

Place SQL migration files in `/migrations` directory with naming convention:
```
migrations/
├── 001_create_users_table.sql
├── 002_create_cash_sessions_table.sql
├── 003_create_petty_vouchers_table.sql
├── 004_create_electricity_payments_table.sql
├── 005_create_audit_logs_table.sql
├── 006_enable_rls_policies.sql
└── ...
```

### Running Migrations

```bash
# Using Supabase CLI
supabase migration up

# Or manually via SQL editor in Supabase dashboard
# 1. Go to SQL Editor
# 2. Paste migration content
# 3. Execute
```

---

## Development Workflow

### 1. Local Development Setup

```bash
# Start Vault
vault server -dev

# Set environment variables
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[YOUR_TOKEN]'

# Access database in app
# The app automatically reads SUPABASE_URL and SUPABASE_ANON_KEY from Vault
```

### 2. Making Schema Changes

```bash
# 1. Create migration file
touch migrations/NNN_description.sql

# 2. Write SQL changes
# 3. Test in Supabase SQL editor
# 4. Run migration: supabase migration up
# 5. Update schema documentation here
```

### 3. Testing Database Changes

```bash
# Use Supabase CLI for testing
supabase db reset  # Reset to initial state (development only)

# Or test directly in SQL Editor
# Test RLS policies with service role and user context
```

---

## Supabase CLI Commands

```bash
# Check Supabase CLI installation
supabase --version

# List migrations
supabase migration list

# View migrations status
supabase migration up --dry-run

# Create new migration
supabase migration new create_table_name

# Reset database (development only)
supabase db reset

# View schema
supabase db pull

# Push changes to remote
supabase db push
```

---

## Secrets Management

All database credentials are stored in Vault under `secret/supabase`:

```bash
# View current secrets
vault kv get secret/supabase

# Update Supabase URL
vault kv patch secret/supabase url="https://new-project.supabase.co"

# Update keys
vault kv patch secret/supabase anon_key="[NEW_KEY]"
vault kv patch secret/supabase service_role_key="[NEW_KEY]"
```

### Environment Variables

The app reads from Vault automatically:

```javascript
// In Next.js API routes and components
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
```

---

## Backup & Recovery

### Automated Backups

Supabase provides automatic daily backups. Access them in the Supabase dashboard:
- Dashboard → Settings → Backups
- Automatic backups retained for 7 days
- Point-in-time recovery available

### Manual Backup

```bash
# Export database dump
pg_dump --no-owner --no-acl -h [HOST] -U [USER] -d [DB] > backup.sql

# Import backup
psql -h [HOST] -U [USER] -d [DB] < backup.sql
```

---

## Performance & Indexes

### Create Indexes for Common Queries

```sql
-- Index on user_id for faster lookups
CREATE INDEX idx_cash_sessions_user_id ON cash_sessions(user_id);
CREATE INDEX idx_petty_vouchers_user_id ON petty_vouchers(user_id);
CREATE INDEX idx_electricity_payments_user_id ON electricity_payments(user_id);

-- Index on dates for range queries
CREATE INDEX idx_cash_sessions_date ON cash_sessions(session_date);
CREATE INDEX idx_petty_vouchers_date ON petty_vouchers(voucher_date);
CREATE INDEX idx_electricity_payments_date ON electricity_payments(payment_date);

-- Composite indexes for common filters
CREATE INDEX idx_cash_sessions_user_date ON cash_sessions(user_id, session_date DESC);
```

---

## Real-Time Features

### Supabase Realtime Subscriptions

Monitor changes to tables in real-time:

```javascript
// Subscribe to cash sessions changes
const subscription = supabase
  .channel('cash_sessions')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'cash_sessions' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe();

// Unsubscribe when done
supabase.removeChannel(subscription);
```

---

## Troubleshooting

### Connection Issues

```bash
# Test database connection
VAULT_TOKEN='[YOUR_TOKEN]' VAULT_ADDR='http://127.0.0.1:8200' node test-db-connection.mjs

# Check Vault status
vault status

# Check if credentials are set
vault kv get secret/supabase
```

### RLS Policy Issues

- Ensure `auth.uid()` matches the UUID format in user_id column
- Test policies with different user contexts in SQL editor
- Check policy creation syntax in Supabase dashboard

### Migration Issues

```bash
# View migration history
supabase migration list

# Rollback last migration
supabase migration down

# Manual rollback (careful!)
-- Execute rollback SQL in Supabase SQL Editor
```

---

## Documentation Files

- **SCHEMA.md** - Detailed schema documentation
- **MIGRATIONS.md** - Migration history and instructions
- **RLS_POLICIES.md** - Row-level security policy documentation
- **BACKUP_RECOVERY.md** - Backup and recovery procedures
- **PERFORMANCE.md** - Performance tuning and optimization

---

## Related Configuration

- **Main Project**: `/Users/grao/Projects/MindWeave/restaurant-daily/CLAUDE.md`
- **Vault Setup**: Secrets stored at `secret/supabase`
- **Twilio Integration**: `secret/sms` (separate from database)
- **JWT Configuration**: `secret/jwt` (separate from database)

---

## Quick Reference

| Item | Value |
|------|-------|
| Database Type | Supabase (PostgreSQL) |
| Project URL | https://hukaqbgfmerutzhtchiu.supabase.co |
| Secrets Location | `secret/supabase` in Vault |
| Primary Auth | Phone-based OTP via Twilio |
| RLS Enabled | Yes - all tables secured |
| Real-time | Enabled via Supabase Realtime |
| Backups | Automatic daily (7-day retention) |
| Environment | Production + Development |

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase CLI**: https://supabase.com/docs/guides/cli
- **Project CLAUDE.md**: Main project configuration guide
