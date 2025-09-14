# Database Migration Guide

## Quick Migration (Recommended)

The automated migration scripts are ready! You have two options:

### Option 1: Automated Migration (When Vault is configured)
```bash
npm run db:migrate
```

### Option 2: Alternative Migration (Environment fallback)
```bash
npm run db:setup
```

## Manual Migration (Supabase Dashboard)

If the automated scripts don't work, follow these steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your "Restaurant Daily" project
   - Navigate to **SQL Editor**

2. **Run Migration Script**
   - Copy the entire contents of `scripts/setup-database.sql`
   - Paste into the SQL Editor
   - Click **"Run"** to execute

3. **Verify Tables Created**
   After successful execution, you should see these tables:
   - ✅ `restaurants` - Restaurant profiles and settings
   - ✅ `users` - User accounts with role-based access
   - ✅ `staff_invitations` - WhatsApp-based staff invitation system

## What the Migration Does

### Tables Created
- **restaurants**: Store restaurant information, settings, and admin contact
- **users**: Handle user authentication with phone numbers and roles
- **staff_invitations**: Manage WhatsApp-based staff invitation workflow

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** (admin/staff permissions)
- **Data isolation** between restaurants
- **Audit triggers** for updated_at timestamps

### Indexes & Performance
- Optimized indexes for phone number lookups
- Performance indexes for restaurant-user relationships
- Unique constraints for data integrity

## Verification

After migration, verify in Supabase Dashboard:

1. Go to **Database** → **Tables**
2. Check that all 3 tables exist
3. Click on each table to see the schema
4. Verify RLS policies are active (shield icons)

## Next Steps

Once migration is complete:
1. ✅ Database tables ready
2. ✅ Restaurant setup form will save to database
3. ✅ User authentication will use real data
4. ✅ Role-based access control active

## Troubleshooting

**Migration Fails**: Check Supabase service role key in `.env.local`
**Connection Error**: Verify SUPABASE_URL is correct
**Permission Error**: Ensure service role has admin permissions
**RLS Error**: Tables should have RLS policies for service_role

---

**Status**: Migration system ready - run `npm run db:migrate` or follow manual steps above!