# Claude Code Configuration

## Restaurant Daily - Performance Tracking App

### Lint & Type Check Commands
```bash
npm run lint
npm run type-check
npm run build
```

### Development Commands

#### Server Control (Using app.sh) ✅ RECOMMENDED
```bash
./app.sh start        # Start development server on port 3001
./app.sh stop         # Stop development server gracefully
./app.sh restart      # Restart development server
./app.sh status       # Check server status and resource usage
./app.sh logs         # View real-time server logs (Ctrl+C to exit)
```

#### NPM Commands
```bash
npm run dev           # Development server (Turbopack) - also: ./app.sh start
npm start             # Production server (PM2 managed)
npm run build         # Production build
npm run test          # Run Playwright tests
npm run test:ui       # Run tests with UI
npm run test:headed   # Run tests in headed mode
npm run test:report   # Generate updated TEST_REPORT.md
npm run test:full     # Run tests + generate report (complete workflow)
```

### Production Management
```bash
pm2 status            # Check PM2 processes
pm2 logs restaurant-daily  # View app logs
pm2 restart restaurant-daily  # Restart app
pm2 stop restaurant-daily     # Stop app
pm2 delete restaurant-daily   # Remove from PM2
```

### Automated Testing & Quality Gates 🤖

#### Test Report Automation ✅
- **Auto-generated** TEST_REPORT.md on each test run
- **Pre-push hooks** run tests + generate report (Husky)
- **GitHub Actions** update report on push to main
- **Real-time metrics** show current test status (14/14 passing)

#### Quality Gates Pipeline
```bash
# Pre-push workflow (Husky):
1. 🧪 Run Playwright tests (14 tests)
2. 📊 Generate TEST_REPORT.md
3. 🔍 ESLint code quality check
4. 🏗️  Production build validation
5. ✅ Push to repository (if all pass)

# GitHub Actions workflow:
1. 🔧 Setup Node.js environment
2. 📦 Install dependencies + Playwright
3. 🏗️  Build application
4. 🚀 Start production server
5. 🧪 Run full test suite
6. 📊 Auto-update TEST_REPORT.md
7. 💾 Commit updated report to main
8. 🔒 Security audit + secret scanning
```

#### Current Test Status (Live)
- **Total Tests:** 14 (Core App + Authentication)
- **Success Rate:** 100% (14/14 passing)
- **Test Duration:** ~5.3s
- **Coverage:** Homepage, Auth Flow, Mobile Responsive
- **Browsers:** Desktop Chrome, Mobile Chrome (Pixel 5)
- **Last Updated:** Auto-generated on each push

#### Test Development Workflow
```bash
# Local development
npm run test          # Quick test run
npm run test:ui       # Interactive test debugging
npm run test:headed   # Watch tests run in browser

# Report generation
npm run test:report   # Manual report update
npm run test:full     # Complete workflow (test + report)

# Pre-deployment validation
git push origin main  # Triggers full quality gate pipeline
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
- **Production Server**: Port 3001 (PM2 managed)

#### Nginx Configuration
- **Config File**: `/etc/nginx/sites-available/restaurant-daily`
- **Enabled**: Symlinked to `/etc/nginx/sites-enabled/`
- **Ports**: 443 (HTTPS), 80 (HTTP redirect)
- **SSL**: Let's Encrypt certificate with auto-renewal
- **Proxy**: Forwards all traffic to localhost:3001
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
- **Local Development**: http://localhost:3001
- **Production Access**: https://restaurant-daily.mindweave.tech ✅ HTTPS
- **Fallback IP**: https://4.213.183.139
- **Mobile Testing**: Works on iPhone Safari with HTTPS
- **Production Server**: PM2 managed, auto-restart enabled (port 3001)
- **Pre-push Hooks**: Tests, lint, and build checks before push
- **SSL Status**: Valid certificate, force HTTPS redirect, CSS loading fixed

**Note**: App uses port 3001 consistently in both dev and production. Port 3000 is reserved for Mindweave company site.

### Server Control Scripts 🎛️

The project includes convenient shell scripts for managing the development server without using npm directly.

#### Location & Files
```
scripts/app/
├── start.sh      # Start the development server
├── stop.sh       # Stop the development server gracefully
├── restart.sh    # Restart the development server
├── status.sh     # Check server status and resource usage
└── logs.sh       # View real-time server logs
```

#### Master Control Script
```bash
./app.sh [COMMAND]
```

#### Available Commands
| Command | Action | Usage |
|---------|--------|-------|
| `start` | Start server on port 3001 | `./app.sh start` |
| `stop` | Stop server gracefully | `./app.sh stop` |
| `restart` | Restart the server | `./app.sh restart` |
| `status` | Check if running + resource usage | `./app.sh status` |
| `logs` | View real-time logs (Ctrl+C to exit) | `./app.sh logs` |

#### Features
- ✅ **PID Management**: Automatically saves/tracks process ID
- ✅ **Graceful Shutdown**: 5-second graceful kill, then force kill if needed
- ✅ **Log Tracking**: Automatically logs to `.app.log` file
- ✅ **Memory Monitoring**: Shows memory usage in status
- ✅ **Multiple Start Protection**: Prevents running multiple instances
- ✅ **Clean State**: Auto-removes stale PID files

#### Examples
```bash
# Start server and check status
./app.sh start
./app.sh status

# View logs while running
./app.sh logs

# Restart server
./app.sh restart

# Stop when done
./app.sh stop
```

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
# ✅ RECOMMENDED: Save to .env.local (auto-loaded by Next.js)
echo "VAULT_ADDR=http://127.0.0.1:8200" >> .env.local
echo "VAULT_TOKEN=[GET_FROM_VAULT_OUTPUT]" >> .env.local
echo ".env.local" >> .gitignore

# For manual Vault CLI commands only (temporary session)
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[GET_FROM_VAULT_OUTPUT]'
```

**Why NOT to use ~/.zshrc:**
- Tokens change on every Vault restart
- Requires manual updates each time
- Mixes permanent config with temporary secrets
- .env.local is automatically loaded by Next.js

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
- **Current dev token**: Check Vault server output for latest token (✅ SAVE LOCALLY!)
- **Production**: Use Vault auth methods (AWS IAM, Azure AD, etc.)

##### ✅ WORKING VAULT SETUP (Current)
```bash
# Get token from Vault server output when starting:
vault server -dev
# Look for: "Root Token: hvs.XXXXXXXXXX"

# Set environment variables
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[GET_FROM_VAULT_OUTPUT]'

# Restart PM2 with Vault environment
VAULT_TOKEN='[YOUR_TOKEN]' VAULT_ADDR='http://127.0.0.1:8200' pm2 restart restaurant-daily --update-env
```

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

#### Hybrid Secrets Management
**Production**: All secrets stored in Vault for security
**Development**: Vault-first with .env.local fallback

**Current Vault Secrets**:
```bash
# Supabase credentials (production secrets)
vault kv get secret/supabase
# Contains: url, anon_key, service_role_key, database_url

# JWT secrets for authentication
vault kv get secret/jwt
# Contains: access_token_secret

# SMS/WhatsApp credentials
vault kv get secret/sms
# Contains: twilio credentials
```

**Environment Configuration**:
- **Vault-first**: System tries Vault secrets first
- **Fallback**: Uses .env.local only when Vault unavailable
- **Production**: Remove .env.local fallbacks for security

### 📱 Twilio WhatsApp Integration (Production Ready)

#### Current Status: ✅ FULLY WORKING (2025-09-14)
- **WhatsApp Number**: `+14155238886` (sandbox mode)
- **Account SID**: Stored securely in Vault `secret/sms` ✅ ACTIVE
- **Auth Token**: Stored securely in Vault `secret/sms` ✅ WORKING
- **Delivery Method**: WhatsApp-primary with SMS fallback (when upgraded)
- **Cost**: ₹0.35/message (WhatsApp), no base costs
- **Coverage**: Global (perfect for Indian restaurant market)
- **Status**: Real phone numbers receiving WhatsApp messages ✅

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
# Twilio credentials (store securely in Vault - NEVER commit actual keys!)
vault kv put secret/sms \
  provider="twilio" \
  account_sid="[YOUR_TWILIO_ACCOUNT_SID]" \
  twilio_auth_token="[YOUR_TWILIO_AUTH_TOKEN]" \
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

### 🔧 CURRENT WORKING SETUP SUMMARY (2025-09-19)

#### ✅ All Systems Operational
- **Production App**: PM2 managed, auto-restart enabled
- **Vault Server**: Development mode, all secrets configured
- **Twilio Integration**: Real WhatsApp messages working
- **Authentication Flow**: Complete phone → OTP → login
- **Database**: Supabase PostgreSQL with RLS deployed

#### Demo Users (Always Work)
```
Phone: +919876543210 → OTP: 123456 (Admin - Direct to dashboard)
Phone: +919876543211 → OTP: 654321 (Staff - Direct to staff welcome)
Phone: +14155552222 → OTP: 111111 (US Admin - Goes through role selection)
```

#### Role Selection Flow (Fixed 2025-09-19)
✅ **Working**: US demo user (+14155552222) now properly goes through role selection
✅ **Fixed**: JWT secret mismatch between verify-otp and update-role APIs
✅ **Fixed**: JWT expiresIn conflict that was causing role update failures
✅ **Enhanced**: Session validation on role selection page prevents access without valid token

#### Critical Commands for Restart
```bash
# 1. Start Vault (get new token from output)
vault server -dev
# Look for: "Root Token: hvs.XXXXXXXXXX"

# 2. Update .env.local with new token (one file to manage)
echo "VAULT_ADDR=http://127.0.0.1:8200" > .env.local
echo "VAULT_TOKEN=[PASTE_TOKEN_FROM_STEP_1]" >> .env.local

# 3. All secrets are configured in Vault ✅
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[YOUR_TOKEN]'
vault kv list secret/  # Shows: jwt, otp, sms, supabase

# 4. Restart dev server (reads .env.local automatically)
npm run dev

# 5. Or restart production with Vault environment
VAULT_TOKEN='[YOUR_TOKEN]' VAULT_ADDR='http://127.0.0.1:8200' pm2 restart restaurant-daily --update-env
```

#### 📋 Quick Setup Commands:
```bash
# Start Vault dev server
vault server -dev  # Note the Root Token from output

# Configure all secrets (replace token with actual value)
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='[YOUR_VAULT_TOKEN]'
vault kv put secret/supabase url="https://hukaqbgfmerutzhtchiu.supabase.co" anon_key="[KEY]" service_role_key="[KEY]"
vault kv put secret/jwt access_token_secret="[SECRET]"
vault kv put secret/sms provider="twilio" account_sid="[SID]" twilio_auth_token="[TOKEN]" from_number="+14155238886" whatsapp_number="whatsapp:+14155238886"
vault kv put secret/otp length="6" expiry_minutes="5" max_attempts="3" rate_limit_per_hour="3" cleanup_interval_hours="24"
```

#### Architecture Notes
- **Secrets**: Never commit to git, always use Vault
- **Tokens**: Regenerate on each Vault restart
- **Testing**: Use demo users for development
- **Production**: Real Twilio credentials in Vault only