# Database Setup Guide

## ✅ Current Status (2025-09-14)
**Database is DEPLOYED and WORKING** with all tables created and RLS configured.

## Overview
This project uses Supabase (PostgreSQL) for data persistence with Row Level Security for multi-restaurant data isolation.

**Active Database**:
- Project URL: `https://hukaqbgfmerutzhtchiu.supabase.co`
- Project ID: `hukaqbgfmerutzhtchiu`
- Status: ✅ Live with all migrations applied

For detailed schema information, see `DATABASE_SCHEMA.md`

## Quick Setup (Already Completed)

### 2. Get API Keys
1. In Supabase Dashboard → Settings → API
2. Copy the following keys:
   - `anon` (public) key
   - `service_role` (secret) key

### 3. Configure Secrets Management
The project uses hybrid secrets management (Vault-first with environment fallback):

**Option A: HashiCorp Vault (Recommended for Production)**
```bash
# Store secrets in Vault (credentials already configured)
vault kv get secret/supabase
# Contains: url, anon_key, service_role_key, database_url
```

**Option B: Environment Variables (Development Fallback)**
```bash
# Add to .env.local for development when Vault unavailable
SUPABASE_URL=https://hukaqbgfmerutzhtchiu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Database Migration ✅ COMPLETED

**Production Method: Supabase CLI (Already Applied)**
```bash
# Authentication with saved token in Vault
export SUPABASE_ACCESS_TOKEN=sbp_...

# Link project (already done)
supabase link --project-ref hukaqbgfmerutzhtchiu

# Create migration file (already done)
mkdir -p supabase/migrations
cp scripts/setup-database.sql supabase/migrations/20250914120000_initial_schema.sql

# Apply migration to cloud database (✅ COMPLETED)
supabase db push
```

**Status:** ✅ **Database migration completed successfully**
- Migration applied: `20250914120000_initial_schema.sql`
- Tables created: `restaurants`, `users`, `staff_invitations`
- RLS policies, indexes, and constraints active
- Supabase auth token saved in Vault as `supabase_auth_token`

## Database Schema

### Core Tables
- **restaurants**: Restaurant profiles and settings
- **users**: User accounts with role-based access
- **staff_invitations**: WhatsApp-based staff invitation system

### Features
- ✅ Multi-restaurant data isolation (RLS)
- ✅ Role-based access control (admin/staff)
- ✅ Automatic timestamps and UUIDs
- ✅ Data validation and constraints
- ✅ Performance indexes

## API Integration

### Restaurant Creation
The restaurant setup form now saves to database:
- Creates restaurant record in `restaurants` table
- Creates/updates admin user in `users` table
- Updates JWT token with restaurant context
- Proper error handling and validation

### User Management
- Phone-based authentication
- Role assignment (admin/staff)
- Restaurant association
- Login tracking

## Testing Database Connection

```bash
# Test the restaurant creation API
curl -X POST http://localhost:3000/api/restaurant/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "name": "Test Restaurant",
    "address": "123 Test Street, Test City"
  }'
```

## Security Features

### Row Level Security (RLS)
- Users can only access their restaurant's data
- Admins can manage their restaurant
- Staff can view restaurant users
- Service role has full access for API operations

### Data Isolation
- Restaurant data is completely isolated
- Users cannot see other restaurants' data
- JWT tokens include restaurant context
- API endpoints validate restaurant access

## Next Steps

1. **Set up Supabase credentials** in `.env.local`
2. **Run the database migration** script
3. **Test restaurant creation** flow
4. **Implement staff invitation system**
5. **Add business logic tables** (cash sessions, vouchers)

## Troubleshooting

### Common Issues

**Connection Error**: Verify SUPABASE_URL and keys in `.env.local`
**RLS Errors**: Ensure service role key has proper permissions
**Migration Failures**: Check Supabase logs for detailed error messages

### Development Tips
- Use Supabase Dashboard for database inspection
- Check API logs for database errors
- Test with curl/Postman before frontend integration
- Use Supabase's real-time features for live updates