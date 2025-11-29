# Database Setup - Getting Started

Complete step-by-step guide to get your Supabase database up and running.

## Step 1: Start Vault & Get Token

```bash
vault server -dev
```

Look for output like:
```
Root Token: hvs.XXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Save this token!** You'll need it for the next steps.

## Step 2: Set Environment Variables

In a new terminal:

```bash
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='hvs.XXXXXXXXXXXXXXXXXXXXXXXXXX'  # Use YOUR token from Step 1
```

## Step 3: Store Supabase Credentials in Vault

Get your credentials from Supabase dashboard, then run:

```bash
vault kv put secret/supabase \
  url="https://hukaqbgfmerutzhtchiu.supabase.co" \
  anon_key="[PASTE_YOUR_ANON_KEY_HERE]" \
  service_role_key="[PASTE_YOUR_SERVICE_ROLE_KEY_HERE]"
```

To find your keys:
1. Go to https://app.supabase.com
2. Open "Restaurant Daily" project
3. Click Settings → API
4. Copy the `anon (public)` and `service_role (secret)` keys

## Step 4: Create Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. Go to https://app.supabase.com
2. Open "Restaurant Daily" project
3. Click "SQL Editor" on the left
4. Click "New Query"
5. Copy-paste content from: `database/migrations/001_init_schema.sql`
6. Click "RUN" button (bottom right)

### Option B: Using Script (if exec_raw_sql RPC exists)

```bash
cd /Users/grao/Projects/MindWeave/restaurant-daily
node database/init-schema.mjs
```

## Step 5: Verify Connection

```bash
cd /Users/grao/Projects/MindWeave/restaurant-daily
node database/test-supabase-connection.mjs
```

Expected output:
```
🔍 Testing Supabase Connection...
📦 Fetching credentials from Vault...
✅ Credentials retrieved
   URL: https://hukaqbgfmerutzhtchiu.supabase.co
   Key: eyJhbGciOi...

🚀 Creating Supabase client...
✅ Client created

🔗 Testing connection to users table...
✅ Connection successful!
   Users table accessible
   Total users in database: 0

==================================================
✅ ALL TESTS PASSED!
==================================================
```

## What's Next?

After successful connection:

1. **Create test user**
   ```sql
   INSERT INTO users (phone_number, role)
   VALUES ('+918826175074', 'admin');
   ```

2. **Test other tables**
   - Create cash sessions
   - Add vouchers
   - Record payments

3. **Run your app**
   ```bash
   npm run dev
   ```

4. **Configure app environment**
   - App reads SUPABASE_URL and SUPABASE_ANON_KEY from Vault automatically
   - Check `/src/lib/supabase/client.ts` to confirm

## Troubleshooting

### "Connection refused" at Vault
```bash
# Check if Vault is running
vault status

# If not, start it:
vault server -dev
```

### "VAULT_TOKEN not set"
```bash
# Set in current terminal
export VAULT_TOKEN='hvs.XXXXXXXXX'
# Or add to ~/.zshrc for persistence
```

### "Missing credentials in Vault"
```bash
# Verify credentials were stored
vault kv get secret/supabase

# If not there, run Step 3 again
```

### "Table not found" error
```bash
# Schema wasn't created
# Go to Supabase SQL Editor and run:
-- migrations/001_init_schema.sql
```

### "Permission denied" for curl
```bash
# Use vault CLI instead (already done in scripts)
vault kv get secret/supabase
```

## Quick Commands Reference

```bash
# Check Vault status
vault status

# View stored credentials
vault kv get secret/supabase

# Update a credential
vault kv patch secret/supabase url="https://new-url.supabase.co"

# Test connection
node database/test-supabase-connection.mjs

# View Supabase project
# https://app.supabase.com -> Restaurant Daily project -> SQL Editor
```

## File Locations

```
database/
├── README.md                        # Full documentation
├── CLAUDE.md                        # Claude Code config
├── GETTING_STARTED.md              # This file
├── test-supabase-connection.mjs    # Connection test
├── init-schema.mjs                 # Schema initialization
└── migrations/
    └── 001_init_schema.sql         # Database schema
```

## Important Notes

⚠️ **Vault Token Generation**
- Vault generates a new token each time you run `vault server -dev`
- Save the token from the startup output
- Token expires when Vault server stops
- For production, use Vault auth methods instead

✅ **Credentials Storage**
- Never commit credentials to git
- Always store in Vault (development) or AWS Secrets Manager (production)
- Use environment variables, never hardcode keys

🔒 **Security**
- RLS (Row-Level Security) is enabled on all tables
- Users can only access their own data
- All connections use HTTPS
- Backups are automatic (7-day retention)

## Need Help?

1. Check `database/README.md` for detailed documentation
2. Check `database/CLAUDE.md` for configuration details
3. Visit https://supabase.com/docs for Supabase docs
4. Visit https://www.vaultproject.io/docs for Vault docs

---

**Status**: Ready to use after completing steps 1-5 above ✅
