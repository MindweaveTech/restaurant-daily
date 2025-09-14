# Restaurant Daily - Staff Invitation Flow

## Overview
WhatsApp-based staff invitation system that allows restaurant admins to invite team members securely through the existing OTP messaging infrastructure.

## User Flow

### 1. Restaurant Admin Invites Staff Member

#### Admin Interface
```
Restaurant Admin Dashboard
├── Staff Management Section
├── "Add Staff Member" Button
└── Invitation Form:
    ├── Phone Number Input (with country code)
    ├── Role Selection (Staff Member)
    ├── Permissions Checkboxes (optional)
    └── Send Invitation Button
```

#### Backend Process
1. **Validation**
   - Verify admin has permission to invite staff
   - Validate phone number format (E.164)
   - Check if phone already associated with restaurant
   - Ensure invitation limits not exceeded

2. **Create Invitation Record**
   ```sql
   INSERT INTO staff_invitations (
     restaurant_id, phone, invited_by, role,
     permissions, invitation_token, expires_at
   ) VALUES (...)
   ```

3. **Send WhatsApp Invitation**
   ```
   Hi! You've been invited to join [Restaurant Name]
   on Restaurant Daily as a staff member.

   Invited by: [Admin Name]
   Restaurant: [Restaurant Name]
   Address: [Restaurant Address]

   To accept this invitation, please complete verification:
   https://restaurant-daily.mindweave.tech/invite/[token]

   This invitation expires in 48 hours.

   Restaurant Daily - Performance Tracking
   ```

### 2. Staff Member Receives Invitation

#### WhatsApp Message Content
- **Clear identification** of restaurant and admin
- **Secure invitation link** with unique token
- **Restaurant details** for verification
- **Expiration notice** to create urgency
- **Professional branding** for trust

#### Security Features
- **Unique tokens** prevent unauthorized access
- **48-hour expiration** reduces security window
- **Restaurant context** helps users verify legitimacy
- **Rate limiting** prevents invitation spam

### 3. Staff Member Accepts Invitation

#### Invitation Landing Page (`/invite/[token]`)
```
Restaurant Invitation
├── Restaurant Information Display
│   ├── Restaurant Name
│   ├── Address
│   ├── Invited by (Admin name)
│   └── Role being offered
├── Phone Verification Section
│   ├── Phone Number Display (pre-filled)
│   ├── "This is my number" confirmation
│   └── "Verify & Join" button
└── Alternative Actions
    ├── "Wrong number?" link
    └── "Decline invitation" link
```

#### Verification Process
1. **Token Validation**
   - Check token exists and not expired
   - Verify invitation status is 'pending'
   - Load restaurant and admin information

2. **Phone Verification**
   - Display the invited phone number
   - User confirms it's their number
   - Initiate standard OTP verification flow

3. **OTP Verification**
   - Send OTP via WhatsApp (reuse existing system)
   - User enters 6-digit code
   - Verify OTP using existing infrastructure

4. **Account Creation**
   ```sql
   -- Create user account
   INSERT INTO users (phone, restaurant_id, role, invited_by, status)
   VALUES (phone, restaurant_id, 'staff', admin_id, 'active');

   -- Update invitation status
   UPDATE staff_invitations
   SET status = 'accepted', accepted_at = NOW()
   WHERE invitation_token = token;
   ```

5. **Welcome Dashboard**
   - Show restaurant-specific dashboard
   - Display welcome message
   - Guide through key features

### 4. Admin Sees Updated Staff List

#### Real-time Updates
- **Live staff list** updates when invitation accepted
- **Status notifications** for invitation state changes
- **Activity feed** showing staff joining events

## Technical Implementation

### Database Schema Integration

#### staff_invitations Table
```sql
-- Links to existing tables
restaurant_id UUID → restaurants(id)
invited_by UUID → users(id)

-- Invitation management
phone VARCHAR(20) -- E.164 format
invitation_token VARCHAR(255) UNIQUE
expires_at TIMESTAMP WITH TIME ZONE
status VARCHAR(20) -- pending, accepted, expired, cancelled
```

#### Enhanced users Table
```sql
-- New fields for invitation tracking
invited_by UUID REFERENCES users(id)
status VARCHAR(20) DEFAULT 'pending' -- pending, active, inactive
```

### API Endpoints

#### Admin Operations
```typescript
POST /api/admin/invite-staff
{
  phone: "+918826175074",
  role: "staff",
  permissions?: ["cash_sessions", "vouchers"]
}

GET /api/admin/staff-invitations
// Returns list of pending/accepted invitations

DELETE /api/admin/staff-invitations/:id
// Cancel pending invitation
```

#### Staff Operations
```typescript
GET /api/invite/:token
// Validate invitation token and return details

POST /api/invite/:token/accept
{
  confirmPhone: true
}
// Start OTP verification process

POST /api/invite/:token/verify
{
  otp: "123456"
}
// Complete invitation acceptance
```

### WhatsApp Message Templates

#### Invitation Message
```javascript
const invitationTemplate = {
  contentSid: "HX[content_template_id]", // Twilio approved template
  contentVariables: JSON.stringify({
    1: restaurantName,      // Restaurant name
    2: adminName,           // Admin who invited
    3: restaurantAddress,   // Restaurant address
    4: invitationLink,      // Secure invitation URL
    5: expirationTime       // "48 hours"
  })
};
```

#### Reminder Message (24 hours before expiry)
```javascript
const reminderTemplate = {
  contentSid: "HX[reminder_template_id]",
  contentVariables: JSON.stringify({
    1: restaurantName,
    2: invitationLink,
    3: "24 hours" // Time remaining
  })
};
```

### Security Considerations

#### Token Security
- **Cryptographically secure tokens** (256-bit random)
- **Limited lifetime** (48 hours maximum)
- **Single use tokens** (invalidated after acceptance)
- **Rate limiting** on invitation creation

#### Access Control
- **Admin verification** before sending invitations
- **Phone number ownership** verified via OTP
- **Restaurant association** enforced in database
- **RLS policies** prevent cross-restaurant access

#### Fraud Prevention
- **Invitation limits** per restaurant per day
- **Duplicate prevention** for same phone/restaurant
- **Audit logging** for all invitation activities
- **Abuse monitoring** and automatic blocking

## User Experience Considerations

### Mobile-First Design
- **Large touch targets** for phone screens
- **Clear visual hierarchy** for invitation details
- **Progressive disclosure** of information
- **Offline-friendly** invitation landing pages

### Error Handling
- **Expired invitation** → Clear message with admin contact
- **Invalid token** → Redirect to homepage with explanation
- **Network errors** → Retry mechanisms and offline storage
- **Wrong phone** → Easy way to contact admin

### Accessibility
- **Screen reader support** for all invitation content
- **High contrast** text and buttons
- **Keyboard navigation** support
- **Multiple language support** (future enhancement)

## Monitoring and Analytics

### Key Metrics
- **Invitation sent rate** (per restaurant/admin)
- **Acceptance rate** (% of invitations accepted)
- **Time to acceptance** (average acceptance delay)
- **Expiration rate** (% of invitations that expire)

### Audit Events
```typescript
// Logged to audit_logs table
{
  action: "staff_invitation_sent",
  resource_type: "staff_invitation",
  resource_id: invitation.id,
  details: {
    invited_phone: phone,
    restaurant_id: restaurant.id,
    role: "staff"
  }
}
```

### Error Monitoring
- **Failed WhatsApp deliveries** → Admin notification
- **High expiration rates** → Admin dashboard alert
- **Token manipulation attempts** → Security alerts
- **Rate limit violations** → Automatic blocking

## Future Enhancements

### Advanced Features
- **Bulk invitations** with CSV upload
- **Custom invitation messages** per restaurant
- **Multi-language templates** for diverse staff
- **SMS fallback** for WhatsApp delivery failures

### Integration Options
- **Calendar integration** for onboarding schedules
- **Training module links** in invitation messages
- **HR system integration** for employee records
- **Payroll system connections** for staff management

### Analytics Dashboard
- **Invitation funnel analysis** (sent → opened → accepted)
- **Staff onboarding metrics** by restaurant
- **Admin performance tracking** (invitation success rates)
- **Geographic analysis** of staff locations