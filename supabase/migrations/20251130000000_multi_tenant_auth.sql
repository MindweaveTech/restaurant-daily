-- Multi-Tenant Authentication Schema Migration
-- Date: 2025-11-30
-- Purpose: Add superadmin, business admin, and employee role hierarchy

-- ================================================================
-- 1. Create system_admins table for platform superadmins
-- ================================================================

CREATE TABLE IF NOT EXISTS system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,  -- Optional phone for OTP login
  name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_admin_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Insert the initial superadmin
INSERT INTO system_admins (email, name, status)
VALUES ('gaurav18115@gmail.com', 'Gaurav Rao', 'active')
ON CONFLICT (email) DO NOTHING;

-- ================================================================
-- 2. Alter users table to support new role hierarchy
-- ================================================================

-- Add new columns to users table if they don't exist
DO $$
BEGIN
  -- Add email column for superadmins who may have both email and phone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
    ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;
  END IF;

  -- Add name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
    ALTER TABLE users ADD COLUMN name VARCHAR(255);
  END IF;
END $$;

-- Drop old constraint if it exists and recreate with new roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_role;
ALTER TABLE users DROP CONSTRAINT IF EXISTS role_check;
ALTER TABLE users ADD CONSTRAINT valid_role CHECK (role IN ('superadmin', 'business_admin', 'employee'));

-- Update existing 'admin' role to 'business_admin' and 'staff'/'team_member' to 'employee'
UPDATE users SET role = 'business_admin' WHERE role = 'admin';
UPDATE users SET role = 'employee' WHERE role IN ('staff', 'team_member');

-- ================================================================
-- 3. Create business_invitations table for superadmin inviting business admins
-- ================================================================

CREATE TABLE IF NOT EXISTS business_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invited_by UUID REFERENCES system_admins(id) ON DELETE SET NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,  -- Phone is required for OTP auth
  restaurant_name VARCHAR(255) NOT NULL,  -- Pre-fill restaurant name
  role VARCHAR(20) DEFAULT 'business_admin',
  status VARCHAR(20) DEFAULT 'pending',
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_business_invitation_role CHECK (role = 'business_admin'),
  CONSTRAINT valid_business_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_business_invitations_phone ON business_invitations(phone);
CREATE INDEX IF NOT EXISTS idx_business_invitations_status ON business_invitations(status);
CREATE INDEX IF NOT EXISTS idx_business_invitations_token ON business_invitations(invitation_token);

-- ================================================================
-- 4. Update staff_invitations table
-- ================================================================

-- Ensure staff_invitations only allows 'employee' role
ALTER TABLE staff_invitations DROP CONSTRAINT IF EXISTS valid_invitation_role;
ALTER TABLE staff_invitations ADD CONSTRAINT valid_invitation_role CHECK (role = 'employee');

-- Update any existing 'staff' to 'employee'
UPDATE staff_invitations SET role = 'employee' WHERE role = 'staff';

-- ================================================================
-- 5. Add RLS policies for new tables
-- ================================================================

-- Enable RLS on system_admins
ALTER TABLE system_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_invitations ENABLE ROW LEVEL SECURITY;

-- Service role can manage all system admins
CREATE POLICY "Service role can manage system_admins" ON system_admins
  FOR ALL USING (auth.role() = 'service_role');

-- Service role can manage all business invitations
CREATE POLICY "Service role can manage business_invitations" ON business_invitations
  FOR ALL USING (auth.role() = 'service_role');

-- Superadmins can read their own data
CREATE POLICY "Superadmins can read their data" ON system_admins
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- ================================================================
-- 6. Create updated_at triggers for new tables
-- ================================================================

CREATE TRIGGER update_system_admins_updated_at BEFORE UPDATE ON system_admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 7. Grant permissions
-- ================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON system_admins TO authenticated;
GRANT SELECT ON business_invitations TO authenticated;

GRANT ALL ON system_admins TO service_role;
GRANT ALL ON business_invitations TO service_role;

-- ================================================================
-- 8. Add comments for documentation
-- ================================================================

COMMENT ON TABLE system_admins IS 'Platform superadmins who can invite business admins';
COMMENT ON TABLE business_invitations IS 'Invitations sent by superadmins to potential business admins';
COMMENT ON COLUMN users.role IS 'User role: superadmin (platform), business_admin (restaurant owner), employee (staff)';

-- Success message
SELECT 'Multi-tenant authentication schema migration completed!' as message;
