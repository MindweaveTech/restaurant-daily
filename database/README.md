# Database Setup & Management

Complete guide for setting up and managing the Supabase PostgreSQL database for Restaurant Daily.

## Quick Start

### 1. Prerequisites

```bash
# Ensure you have:
- Vault running (vault server -dev)
- Node.js installed
- @supabase/supabase-js package (already in project)
- Network access to Supabase
```

### 2. Initialize Vault with Supabase Credentials

```bash
# Start Vault
vault server -dev

# Get the Root Token from the output and save it
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='hvs.XXXXXXXXX'

# Store your Supabase credentials
vault kv put secret/supabase \
  url="https://hukaqbgfmerutzhtchiu.supabase.co" \
  anon_key="[YOUR_ANON_KEY]" \
  service_role_key="[YOUR_SERVICE_ROLE_KEY]"
```

### 3. Create Database Schema

**Option A: Manual via Supabase Dashboard (Easiest)**

1. Go to https://app.supabase.com
2. Open your "Restaurant Daily" project
3. Navigate to SQL Editor
4. Copy-paste the content of `migrations/001_init_schema.sql`
5. Click "Execute"

**Option B: Automated (if exec_raw_sql RPC exists)**

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='hvs.XXXXXXXXX'
node init-schema.mjs
```

### 4. Verify Connection

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='hvs.XXXXXXXXX'
node test-supabase-connection.mjs
```

Expected output:
```
🔍 Testing Supabase Connection...
📦 Fetching credentials from Vault...
✅ Credentials retrieved
🚀 Creating Supabase client...
✅ Client created
🔗 Testing connection to users table...
✅ Connection successful!
==================================================
✅ ALL TESTS PASSED!
==================================================
```

## File Structure

```
database/
├── CLAUDE.md                           # Claude Code configuration
├── README.md                           # This file
├── test-supabase-connection.mjs        # Connection test script
├── init-schema.mjs                     # Schema initialization script
├── migrations/
│   └── 001_init_schema.sql             # Initial schema (create tables + RLS)
└── docs/
    └── SCHEMA.md                       # Detailed schema documentation
```

## Supabase Project Details

| Item | Value |
|------|-------|
| **Project Name** | Restaurant Daily |
| **Project ID** | hukaqbgfmerutzhtchiu |
| **Project URL** | https://hukaqbgfmerutzhtchiu.supabase.co |
| **Region** | [Check in Supabase dashboard] |
| **Database** | PostgreSQL |

## Database Tables

### 1. **users**
Phone-based authentication with roles

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE,
  role VARCHAR(50) -- 'admin' | 'team_member'
)
```

### 2. **cash_sessions**
Daily cash balance tracking

```sql
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  opening_balance DECIMAL(10,2),
  closing_balance DECIMAL(10,2),
  session_date DATE,
  status VARCHAR(20) -- 'open' | 'closed'
)
```

### 3. **petty_vouchers**
Expense tracking

```sql
CREATE TABLE petty_vouchers (
  id UUID PRIMARY KEY,
  user_id UUID,
  category VARCHAR(100),
  amount DECIMAL(10,2),
  voucher_date DATE
)
```

### 4. **electricity_payments**
Payment monitoring

```sql
CREATE TABLE electricity_payments (
  id UUID PRIMARY KEY,
  user_id UUID,
  amount DECIMAL(10,2),
  payment_date DATE,
  status VARCHAR(20) -- 'paid' | 'pending'
)
```

### 5. **audit_logs**
Activity tracking

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB
)
```

## Row-Level Security (RLS)

All tables have RLS enabled. Current policies allow users to:
- View their own data
- Insert their own records
- Update their own records

RLS policies are defined in `migrations/001_init_schema.sql`.

## Scripts

### test-supabase-connection.mjs

Tests connection to Supabase and validates credentials.

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='hvs.XXXXXXXXX'
node test-supabase-connection.mjs
```

**What it does:**
1. Retrieves credentials from Vault
2. Creates Supabase client
3. Tests connection to users table
4. Validates service role key (if available)
5. Reports connection status

### init-schema.mjs

Initializes database schema (if RPC is available).

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='hvs.XXXXXXXXX'
node init-schema.mjs
```

**Note:** Most Supabase projects don't have `exec_raw_sql` RPC. Use the manual SQL method instead.

## Vault Integration

All database credentials are stored securely in Vault:

```bash
# View credentials
vault kv get secret/supabase

# Update URL
vault kv patch secret/supabase url="https://new-url.supabase.co"

# Update keys
vault kv patch secret/supabase anon_key="[NEW_KEY]"
vault kv patch secret/supabase service_role_key="[NEW_KEY]"
```

## Development Workflow

### Making Schema Changes

1. **Create migration file** with naming: `NNN_description.sql`
   ```bash
   touch migrations/002_add_new_table.sql
   ```

2. **Write SQL changes** in the migration file

3. **Test in Supabase SQL Editor**
   - Go to https://app.supabase.com
   - Open SQL Editor
   - Paste and execute migration

4. **Apply changes**
   - Update this README if needed
   - Update CLAUDE.md if needed
   - Commit migration to git

5. **Verify with test script**
   ```bash
   node test-supabase-connection.mjs
   ```

## Backup & Recovery

### Automated Backups
Supabase provides automatic daily backups (7-day retention). Access via:
- Supabase Dashboard → Settings → Backups

### Manual Backup
```bash
# Export database
pg_dump --no-owner --no-acl \
  -h [HOST] -U [USER] -d [DB] > backup.sql

# Restore database
psql -h [HOST] -U [USER] -d [DB] < backup.sql
```

## Performance Optimization

### Indexes
All important columns have indexes:
- User lookups: `idx_cash_sessions_user_id`
- Date filters: `idx_cash_sessions_date`
- Combined: `idx_cash_sessions_user_date`

### Queries
For best performance:
1. Always filter by user_id when possible
2. Use date ranges for historical queries
3. Paginate large result sets
4. Use Supabase client's built-in caching

## Troubleshooting

### Connection Fails
```bash
# 1. Check Vault is running
vault status

# 2. Verify credentials in Vault
vault kv get secret/supabase

# 3. Check internet connection to Supabase
curl https://hukaqbgfmerutzhtchiu.supabase.co

# 4. Verify project is active
# Visit: https://app.supabase.com
```

### Table Not Found Error
```bash
# Tables might not be created yet
# Go to Supabase SQL Editor and run:
-- migrations/001_init_schema.sql

# Then verify with:
node test-supabase-connection.mjs
```

### RLS Policy Errors
1. Check policy syntax in `migrations/001_init_schema.sql`
2. Verify policy names don't have duplicates
3. Test in Supabase SQL Editor with different user contexts

### Slow Queries
1. Check if indexes are created: `\d+ table_name` in psql
2. Add missing indexes
3. Check for N+1 queries in application code
4. Use EXPLAIN to analyze query plans

## Security Considerations

### Credentials Management
- ✅ Never commit `.env` files with credentials
- ✅ Always use Vault for production secrets
- ✅ Rotate API keys periodically
- ✅ Use service_role_key only on server-side

### RLS Policies
- ✅ All tables have RLS enabled
- ✅ Users can only access their own data
- ✅ Audit logs track all changes

### Data Protection
- ✅ PostgreSQL encryption at rest
- ✅ HTTPS for all connections
- ✅ Regular automated backups

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Project CLAUDE.md**: Main project configuration
- **Vault Docs**: https://www.vaultproject.io/docs

## Next Steps

After setup:
1. ✅ Verify connection with `test-supabase-connection.mjs`
2. ✅ Create test user records
3. ✅ Test RLS policies
4. ✅ Set up application environment variables
5. ✅ Start developing application features

---

**Last Updated**: 2025-11-19
**Schema Version**: 1.0
**Database**: PostgreSQL via Supabase
