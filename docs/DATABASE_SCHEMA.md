# Restaurant Daily - Database Schema

## Overview
Multi-restaurant architecture with role-based access control and data isolation using Supabase PostgreSQL with Row Level Security (RLS).

## Core Tables

### 1. restaurants
Primary table for restaurant information and settings.

```sql
CREATE TABLE restaurants (
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
```

### 2. users
Enhanced user table with restaurant associations and roles.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE, -- E.164 format
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'staff', -- 'admin', 'staff'
  permissions JSONB DEFAULT '[]', -- Array of specific permissions
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, inactive
  invited_by UUID REFERENCES users(id), -- Who invited this user
  first_login TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('admin', 'staff')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'inactive')),
  CONSTRAINT admin_must_have_restaurant CHECK (
    role != 'admin' OR restaurant_id IS NOT NULL
  )
);
```

### 3. staff_invitations
Track staff invitation process and status.

```sql
CREATE TABLE staff_invitations (
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
  CONSTRAINT valid_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),

  -- Unique constraint to prevent duplicate invitations
  UNIQUE(restaurant_id, phone, status)
    WHERE status = 'pending'
);
```

### 4. auth_sessions
JWT session management with restaurant context.

```sql
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL, -- Hashed JWT token
  refresh_token_hash VARCHAR(255), -- Hashed refresh token
  device_info JSONB, -- User agent, IP, etc.
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for performance
  INDEX idx_auth_sessions_user_id (user_id),
  INDEX idx_auth_sessions_token_hash (token_hash)
);
```

### 5. otp_attempts
OTP verification tracking and rate limiting.

```sql
CREATE TABLE otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL, -- E.164 format
  otp_hash VARCHAR(255) NOT NULL, -- Hashed OTP for security
  attempts_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for rate limiting queries
  INDEX idx_otp_attempts_phone_created (phone, created_at)
);
```

### 6. audit_logs
Comprehensive activity tracking for security and compliance.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  action VARCHAR(100) NOT NULL, -- login, logout, create_voucher, etc.
  resource_type VARCHAR(50), -- user, restaurant, voucher, etc.
  resource_id UUID, -- ID of the affected resource
  details JSONB, -- Additional action details
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for querying
  INDEX idx_audit_logs_user_id (user_id),
  INDEX idx_audit_logs_restaurant_id (restaurant_id),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_logs_created_at (created_at)
);
```

## Row Level Security (RLS) Policies

### Restaurant Data Isolation
```sql
-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Restaurant admins can manage their restaurant
CREATE POLICY restaurant_admin_policy ON restaurants
  FOR ALL USING (
    phone = auth.jwt() ->> 'phone' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.phone = auth.jwt() ->> 'phone'
      AND users.role = 'admin'
      AND users.restaurant_id = restaurants.id
    )
  );

-- Users can only access their own data
CREATE POLICY users_self_policy ON users
  FOR ALL USING (phone = auth.jwt() ->> 'phone');

-- Restaurant staff can only see users from their restaurant
CREATE POLICY restaurant_users_policy ON users
  FOR SELECT USING (
    restaurant_id = (auth.jwt() ->> 'restaurant_id')::UUID
  );

-- Staff invitations restricted to restaurant
CREATE POLICY staff_invitations_policy ON staff_invitations
  FOR ALL USING (
    restaurant_id = (auth.jwt() ->> 'restaurant_id')::UUID
  );

-- Sessions belong to user
CREATE POLICY auth_sessions_policy ON auth_sessions
  FOR ALL USING (
    user_id = (auth.jwt() ->> 'user_id')::UUID
  );

-- Audit logs restricted to restaurant
CREATE POLICY audit_logs_policy ON audit_logs
  FOR ALL USING (
    restaurant_id = (auth.jwt() ->> 'restaurant_id')::UUID OR
    user_id = (auth.jwt() ->> 'user_id')::UUID
  );
```

## Future Tables (Phase 4+)

### Cash Sessions
```sql
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  opening_balance DECIMAL(10,2) NOT NULL,
  closing_balance DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'open', -- open, closed
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Petty Vouchers
```sql
CREATE TABLE petty_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Electricity Payments
```sql
CREATE TABLE electricity_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  vendor_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue
  reference_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Migration Strategy

### Phase 1: Core Tables
1. Create restaurants, users, staff_invitations tables
2. Set up RLS policies for data isolation
3. Migrate existing user data to new schema

### Phase 2: Authentication Enhancement
1. Create auth_sessions and otp_attempts tables
2. Update JWT tokens to include restaurant context
3. Implement session management

### Phase 3: Audit and Monitoring
1. Create audit_logs table
2. Implement comprehensive activity tracking
3. Set up monitoring and alerting

### Phase 4: Business Logic Tables
1. Add cash_sessions, petty_vouchers, electricity_payments
2. Implement business logic and workflows
3. Add reporting and analytics tables

## Indexes and Performance

### Primary Indexes
- All foreign keys are automatically indexed
- Phone numbers are indexed for authentication queries
- Timestamps are indexed for audit and session queries

### Additional Indexes
```sql
-- Fast restaurant lookups
CREATE INDEX idx_users_restaurant_role ON users(restaurant_id, role);

-- Staff invitation queries
CREATE INDEX idx_staff_invitations_restaurant_status ON staff_invitations(restaurant_id, status);

-- Audit log performance
CREATE INDEX idx_audit_logs_restaurant_created ON audit_logs(restaurant_id, created_at);

-- OTP rate limiting
CREATE INDEX idx_otp_attempts_phone_expires ON otp_attempts(phone, expires_at);
```

## Security Considerations

### Data Protection
- All passwords and OTPs are hashed using bcrypt or similar
- JWT tokens are properly signed and validated
- Sensitive data is encrypted at rest (Supabase default)

### Access Control
- Row Level Security ensures data isolation
- JWT tokens include restaurant context
- API endpoints validate restaurant access

### Rate Limiting
- OTP requests limited per phone number
- API endpoints have rate limiting
- Failed authentication attempts are tracked

### Audit Trail
- All user actions are logged
- IP addresses and user agents tracked
- Compliance-ready audit logs