# Database Setup Guide

## Overview
This project uses Supabase (PostgreSQL) for data persistence with Row Level Security for multi-restaurant data isolation.

## Quick Setup

### 1. Supabase Project Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing: `Restaurant Daily`
3. Note your project details:
   - Project URL: `https://hukaqbgfmerutzhtchiu.supabase.co`
   - Project ID: `hukaqbgfmerutzhtchiu`

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

### 4. Run Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/setup-database.sql`
3. Paste and run the SQL script
4. Verify tables are created: `restaurants`, `users`, `staff_invitations`

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