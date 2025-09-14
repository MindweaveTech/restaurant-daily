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
│   ├── components/ (ui, auth, dashboard, cash, vouchers, payments)
│   ├── lib/ (auth, api, utils)
│   ├── store/
│   ├── types/
│   └── hooks/
├── CLAUDE.md (this file)
├── PLAN.md (project roadmap)
├── TASKS.md (task management - window size: 5)
└── package.json
```

### Project Context
- Next.js React app for restaurant performance tracking
- Mobile-first responsive design (optimized for iPhone/tablets)
- Authentication: phone → OTP → role selection
- Features: cash sessions, petty vouchers, electricity payments
- Role-based access (admin/team members)
- Real-time updates and mobile-friendly interface

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
```bash
# Start Vault in development mode
vault server -dev

# Set environment variables
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='YOUR_VAULT_DEV_TOKEN'  # Replace with your dev token

# Vault commands
vault status                    # Check Vault status
vault kv get secret/supabase   # Get Supabase secrets
vault kv get secret/jwt        # Get JWT secrets
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