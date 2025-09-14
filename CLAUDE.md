# Claude Code Configuration

## Restaurant Daily - Performance Tracking App

### Lint & Type Check Commands
```bash
npm run lint
npm run type-check
npm run build
```

### Development Commands
```bash
npm run dev           # Development server (Turbopack)
npm start             # Production server (PM2 managed)
npm run build         # Production build
npm run test          # Run Playwright tests
npm run test:ui       # Run tests with UI
npm run test:headed   # Run tests in headed mode
```

### Production Management
```bash
pm2 status            # Check PM2 processes
pm2 logs restaurant-daily  # View app logs
pm2 restart restaurant-daily  # Restart app
pm2 stop restaurant-daily     # Stop app
pm2 delete restaurant-daily   # Remove from PM2
```

### Current Deployment Setup

#### Server Information
- **Azure VM**: Ubuntu Linux (6.8.0-1034-azure)
- **Public IP**: 4.213.183.139
- **Internal IP**: 10.0.0.4
- **Domain**: restaurant-daily.mindweave.tech
- **Fallback IP**: 4.213.183.139

#### Application Stack
- **Frontend**: Next.js 15.5.3 with TypeScript
- **Database**: Supabase (PostgreSQL with real-time features)
- **Secrets Management**: HashiCorp Vault v1.20.3
- **Authentication**: WhatsApp/SMS OTP via Twilio (production ready)
- **Messaging**: Twilio WhatsApp Business API (sandbox mode)
- **Styling**: Tailwind CSS (mobile-first responsive)
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Process Manager**: PM2 (production)
- **Git Hooks**: Husky (pre-push testing)
- **Production Server**: Port 3000 (PM2 managed)

#### Nginx Configuration
- **Config File**: `/etc/nginx/sites-available/restaurant-daily`
- **Enabled**: Symlinked to `/etc/nginx/sites-enabled/`
- **Ports**: 443 (HTTPS), 80 (HTTP redirect)
- **SSL**: Let's Encrypt certificate with auto-renewal
- **Proxy**: Forwards all traffic to localhost:3000
- **Headers**: X-Forwarded-Proto, X-Forwarded-Host, X-Forwarded-Server
- **Features**: Gzip compression, proper headers, WebSocket support
- **Status**: Active with HTTPS working

#### Firewall & Security
- **UFW Status**: Active
- **Allowed Ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS via "Nginx Full")
- **SSL Certificate**: Let's Encrypt (mindweavehq@gmail.com)
- **Azure NSG**: Configured for HTTP/HTTPS traffic
- **External Access**: ✅ Working from internet with HTTPS

#### Project Structure
```
/home/grao/Projects/restaurant-daily/
├── src/
│   ├── app/
│   │   └── api/auth/ (OTP request/verify, test messaging)
│   ├── components/ (ui, auth, dashboard, cash, vouchers, payments)
│   ├── lib/
│   │   ├── messaging/ (twilio-client, phone-validator, otp-service)
│   │   ├── auth/
│   │   ├── api/
│   │   └── utils/
│   ├── store/
│   ├── types/
│   └── hooks/
├── CLAUDE.md (this file)
├── PLAN.md (project roadmap)
├── TASKS.md (task management - window size: 5)
├── AUTH_ARCHITECTURE.md (authentication system design)
├── TWILIO_INTEGRATION_PLAN.md (messaging integration guide)
├── SMS_UPGRADE_GUIDE.md (sandbox to production upgrade)
├── test-twilio-messaging.mjs (comprehensive messaging tests)
└── package.json
```

### Project Context
- Next.js React app for restaurant performance tracking
- Mobile-first responsive design (optimized for iPhone/tablets)
- Authentication: phone → WhatsApp OTP → role selection (production ready)
- Features: cash sessions, petty vouchers, electricity payments
- Role-based access (admin/team members)
- Real-time updates and mobile-friendly interface
- Secure messaging via Twilio WhatsApp Business API

### Quick Access
- **Local Development**: http://localhost:3000
- **Production Access**: https://restaurant-daily.mindweave.tech ✅ HTTPS
- **Fallback IP**: https://4.213.183.139
- **Mobile Testing**: Works on iPhone Safari with HTTPS
- **Production Server**: PM2 managed, auto-restart enabled
- **Pre-push Hooks**: Tests, lint, and build checks before push
- **SSL Status**: Valid certificate, force HTTPS redirect, CSS loading fixed

### Secrets Management & Database

#### HashiCorp Vault Configuration

##### Initial Setup (One-time)
```bash
# Start Vault in development mode
vault server -dev

# Note the Root Token from the output (format: hvs.XXXXXXXXX)
# Example output:
# Root Token: hvs.YOUR_GENERATED_TOKEN_HERE
```

##### Development Token Management
```bash
# Option 1: Save to local environment file (RECOMMENDED)
echo "VAULT_TOKEN=hvs.YOUR_VAULT_DEV_TOKEN" >> .env.local
echo ".env.local" >> .gitignore

# Option 2: Save to shell profile (persistent across sessions)
echo "export VAULT_TOKEN=hvs.YOUR_VAULT_DEV_TOKEN" >> ~/.bashrc
source ~/.bashrc

# Option 3: Set for current session only
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='hvs.YOUR_VAULT_DEV_TOKEN'
```

##### Vault Commands
```bash
vault status                    # Check Vault status
vault kv get secret/supabase   # Get Supabase secrets
vault kv get secret/jwt        # Get JWT secrets
vault kv list secret/          # List all secrets

# Test database connection (using stored credentials)
VAULT_TOKEN='your_token' node test-db-connection.mjs

# Test Twilio messaging integration
node test-twilio-messaging.mjs
```

##### 🔐 Token Security Notes
- **Development tokens** are generated each time Vault dev server starts
- **Never commit tokens** to git repositories (GitHub secret scanning will block)
- **Tokens expire** when Vault dev server stops/restarts
- **Current dev token**: `hvs.YOUR_VAULT_DEV_TOKEN` (save locally!)
- **Production**: Use Vault auth methods (AWS IAM, Azure AD, etc.)

#### Supabase Configuration
- **Project Name**: Restaurant Daily
- **Project ID**: hukaqbgfmerutzhtchiu
- **Project URL**: https://hukaqbgfmerutzhtchiu.supabase.co
- **Secrets Location**: Stored in Vault at `secret/supabase`

#### Database Schema Planning
- **Users**: Phone-based authentication with roles (admin/team)
- **Cash Sessions**: Opening/closing balance tracking
- **Petty Vouchers**: Expense tracking with categories
- **Electricity Payments**: Payment monitoring and history
- **Audit Logs**: Full activity tracking for compliance

#### Required Supabase Secrets (stored in Vault)
```bash
# Update these with your actual Supabase credentials
vault kv put secret/supabase \
  anon_key="YOUR_SUPABASE_ANON_KEY" \
  service_role_key="YOUR_SUPABASE_SERVICE_ROLE_KEY" \
  database_url="YOUR_SUPABASE_DATABASE_URL"

# JWT secrets for authentication
vault kv put secret/jwt \
  access_token_secret="YOUR_STRONG_JWT_SECRET" \
  refresh_token_secret="YOUR_STRONG_REFRESH_SECRET"
```

### 📱 Twilio WhatsApp Integration (Production Ready)

#### Current Status: ✅ WORKING
- **WhatsApp Number**: `+14155238886` (sandbox mode)
- **Account**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Delivery Method**: WhatsApp-primary with SMS fallback (when upgraded)
- **Cost**: ₹0.35/message (WhatsApp), no base costs
- **Coverage**: Global (perfect for Indian restaurant market)

#### Quick Test Commands
```bash
# Test WhatsApp OTP delivery
curl -X POST https://restaurant-daily.mindweave.tech/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+918826175074", "preferredMethod": "whatsapp"}'

# Run full integration test suite
node test-twilio-messaging.mjs

# Check Twilio connection
curl -X POST https://restaurant-daily.mindweave.tech/api/auth/test-messaging \
  -H "Content-Type: application/json" \
  -d '{"testType": "connection"}'
```

#### Vault Configuration
```bash
# Twilio credentials (stored securely in Vault)
vault kv put secret/sms \
  provider="twilio" \
  account_sid="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  twilio_auth_token="YOUR_TWILIO_AUTH_TOKEN" \
  from_number="+14155238886" \
  whatsapp_number="whatsapp:+14155238886" \
  content_sid="HXb5b62575e6e4ff6129ad7c8efe1f983e" \
  webhook_url="https://restaurant-daily.mindweave.tech/api/sms/webhook"

# OTP configuration
vault kv put secret/otp \
  length="6" \
  expiry_minutes="5" \
  max_attempts="3" \
  rate_limit_per_hour="3" \
  cleanup_interval_hours="24"
```

#### API Endpoints
- **Request OTP**: `POST /api/auth/request-otp`
- **Verify OTP**: `POST /api/auth/verify-otp`
- **Resend OTP**: `POST /api/auth/resend-otp`
- **Test Messaging**: `POST /api/auth/test-messaging`

#### SMS Upgrade Path
When ready to upgrade from sandbox to full SMS:
1. Purchase Twilio phone number (₹70-150/month)
2. Update `from_number` in Vault
3. System automatically enables SMS fallback
4. See `SMS_UPGRADE_GUIDE.md` for details

#### Integration Features
- ✅ Phone number validation (E.164 format)
- ✅ WhatsApp rich templates with branding
- ✅ Rate limiting (3 OTPs per hour)
- ✅ OTP expiration (5 minutes)
- ✅ Comprehensive error handling
- ✅ Audit logging
- ✅ Cost optimization (WhatsApp-primary)
- ✅ Production-ready security