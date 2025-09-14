-- Restaurant Daily Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  google_maps_link TEXT,
  phone VARCHAR(20) NOT NULL UNIQUE, -- Admin's phone (E.164 format)
  logo_url TEXT,
  settings JSONB DEFAULT '{}', -- Restaurant-specific settings
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE, -- E.164 format
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'staff', -- 'admin', 'staff'
  permissions JSONB DEFAULT '[]', -- Array of specific permissions
  status VARCHAR(20) DEFAULT 'active', -- pending, active, inactive
  invited_by UUID REFERENCES users(id), -- Who invited this user
  first_login TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('admin', 'staff')),
  CONSTRAINT valid_user_status CHECK (status IN ('pending', 'active', 'inactive')),
  CONSTRAINT admin_must_have_restaurant CHECK (
    role != 'admin' OR restaurant_id IS NOT NULL
  )
);

-- 3. Create staff_invitations table
CREATE TABLE IF NOT EXISTS staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL, -- E.164 format
  invited_by UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  permissions JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired, cancelled
  invitation_token VARCHAR(255) UNIQUE, -- For secure invitation links
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_invitation_role CHECK (role IN ('staff')), -- Only staff can be invited
  CONSTRAINT valid_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- 4. Create unique constraint for pending invitations
-- (Prevent duplicate pending invitations for same phone/restaurant)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_invitations
ON staff_invitations (restaurant_id, phone)
WHERE status = 'pending';

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_restaurant_role ON users(restaurant_id, role);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_restaurants_phone ON restaurants(phone);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_restaurant_status ON staff_invitations(restaurant_id, status);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies

-- Allow service role to manage all data (for API operations)
CREATE POLICY "Service role can manage all restaurants" ON restaurants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all staff invitations" ON staff_invitations
  FOR ALL USING (auth.role() = 'service_role');

-- Restaurant admins can read their own restaurant
CREATE POLICY "Restaurant admins can read their restaurant" ON restaurants
  FOR SELECT USING (
    phone = auth.jwt() ->> 'phone'
  );

-- Users can read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (phone = auth.jwt() ->> 'phone');

-- Restaurant staff can read other users in their restaurant
CREATE POLICY "Restaurant staff can read restaurant users" ON users
  FOR SELECT USING (
    restaurant_id::text = auth.jwt() ->> 'restaurant_id'
  );

-- Staff invitations are visible to restaurant members
CREATE POLICY "Restaurant members can read invitations" ON staff_invitations
  FOR SELECT USING (
    restaurant_id::text = auth.jwt() ->> 'restaurant_id'
  );

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON restaurants TO authenticated;
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON staff_invitations TO authenticated;

-- Grant all permissions to service role (for API operations)
GRANT ALL ON restaurants TO service_role;
GRANT ALL ON users TO service_role;
GRANT ALL ON staff_invitations TO service_role;

-- Success message
SELECT 'Database setup completed successfully!' as message;