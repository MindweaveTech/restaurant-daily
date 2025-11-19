# Changelog

All notable changes to Restaurant Daily will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-09-19

### Fixed
- 🔧 **Role Selection Authentication** - Fixed JWT secret mismatch between verify-otp and update-role APIs
- 🔒 **JWT expiresIn Conflict** - Resolved JWT signing conflict causing role update failures
- 🛡️ **Session Validation** - Added session validation to role selection page to prevent access without valid token
- 🔐 **Security Enhancement** - Removed hardcoded Vault tokens and implemented proper environment variable handling

### Added
- 🧪 **Comprehensive E2E Testing** - Added 5 new test files with 31 total test cases
  - `auth-flow-complete.spec.ts` (8 tests) - Complete authentication flows
  - `role-access-control.spec.ts` (7 tests) - Security and RBAC testing
  - `demo-auth-flow.spec.ts` (6 tests) - Demo user authentication flows
  - `restaurant-admin-flow.spec.ts` (2 tests) - Admin registration testing
  - `production-debug.spec.ts` (1 test) - Production debugging
- 🔒 **Security Testing** - Role escalation attack prevention and token tampering protection
- 📱 **Enhanced Demo System** - US demo user (+14155552222) now goes through role selection flow

### Enhanced
- 🎯 **Role Selection UX** - Better error messages and loading states
- 📊 **Test Coverage** - Comprehensive authentication, RBAC, and security testing
- 🔐 **JWT Security** - Consistent JWT secret management across all APIs

## [0.3.0] - 2025-09-17

### Added
- 🏪 **Restaurant Management System** - Complete multi-restaurant architecture
- 👤 **Role-Based Access Control** - Restaurant Admin vs Staff Member roles with proper permissions
- 🎭 **Visual Role Selection** - Enhanced role selection interface with clear UX indicators
- 🏗️ **Restaurant Setup Wizard** - 3-step restaurant profile creation with validation
- 🔑 **Enhanced JWT Tokens** - Restaurant context and role-based permissions in tokens
- 🗄️ **Production Database** - Supabase PostgreSQL with complete schema deployment
- 🛡️ **Row Level Security** - Multi-restaurant data isolation via RLS policies
- 📱 **Admin Dashboard** - Restaurant management interface with action cards
- 👥 **Staff Welcome Page** - Staff onboarding and feature overview
- 🔐 **Database Services** - Complete API layer for restaurant and user management

### Database Schema
- **restaurants table** - Restaurant profiles with settings and admin relationships
- **users table** - Enhanced with restaurant_id and role-based permissions
- **staff_invitations table** - WhatsApp-based team invitation system
- **RLS policies** - Restaurant-specific data isolation and security

### Security
- 🔒 **Restaurant Data Isolation** - Complete separation of restaurant data
- 🛡️ **Role-Based Route Protection** - JWT validation with restaurant context
- 🔐 **Vault Integration** - Enhanced secrets management with Supabase integration

## [0.2.0] - 2025-09-15

### Added
- 📞 **Phone Authentication System** - Complete WhatsApp OTP authentication
- 🌍 **International Phone Support** - Country code selection with E.164 validation
- 💬 **WhatsApp OTP Delivery** - Production-ready Twilio integration (sandbox mode)
- 🔢 **6-Digit OTP Verification** - Secure OTP input with timer and validation
- 🔐 **JWT Token Management** - Secure session management with Vault secrets
- 📱 **Mobile-First Auth UI** - Responsive authentication pages
- ⚡ **Rate Limiting** - 3 OTP requests per hour per phone number
- 🛡️ **Security Features** - Crypto-secure OTP generation, 5-minute expiry
- 🔄 **Demo User System** - Fixed OTP codes for development and testing
- 📊 **Enhanced Testing** - 14 comprehensive authentication tests

### Technical Implementation
- **OTP Service** - Crypto-secure generation with Vault configuration
- **Phone Validator** - libphonenumber-js integration for global validation
- **Twilio Client** - WhatsApp Business API integration
- **Authentication APIs** - `/api/auth/request-otp`, `/api/auth/verify-otp`, `/api/auth/resend-otp`
- **Vault Secrets** - JWT, SMS, and OTP configuration management

### Security
- 🔒 **End-to-End Encryption** - Vault-managed secrets for all credentials
- 🛡️ **Rate Limiting** - Protection against brute force attacks
- 🔐 **Secure Token Storage** - JWT with proper expiration and validation

## [0.1.0] - 2025-09-13

### Added
- 🎉 **Initial Release** - Restaurant Daily performance tracking app
- 📱 **Mobile-First Homepage** - Responsive landing page with loading animation
- 🏗️ **Next.js 15.5.3 Foundation** - TypeScript, Tailwind CSS, App Router
- 🧪 **Playwright Testing** - End-to-end testing framework with 4/4 passing tests
- 🚀 **Production Deployment** - Azure VM with nginx reverse proxy
- 🔒 **HTTPS Security** - Let's Encrypt SSL certificate with auto-renewal
- 🌐 **Custom Domain** - restaurant-daily.mindweave.tech with DNS configuration
- ⚡ **PM2 Process Management** - Production-ready process monitoring
- 🛡️ **Quality Gates** - Husky pre-push hooks (tests, lint, build)
- 📚 **Comprehensive Documentation** - README, technical docs, test reports

### Technical Details
- **Frontend**: Next.js 15.5.3 with TypeScript and Tailwind CSS
- **Testing**: Playwright with mobile responsiveness and performance tests
- **Deployment**: Azure VM (Ubuntu 6.8.0-1034-azure) at IP 4.213.183.139
- **Process Manager**: PM2 with auto-restart and logging
- **Web Server**: Nginx reverse proxy with gzip compression
- **SSL**: Let's Encrypt certificate (mindweavehq@gmail.com)
- **Git Hooks**: Husky pre-push validation pipeline

### Infrastructure
- **Domain**: restaurant-daily.mindweave.tech (A record on Namecheap)
- **SSL Certificate**: Wildcard support with auto-renewal via Certbot
- **Nginx Configuration**: HTTPS redirect, proper proxy headers
- **Firewall**: UFW with ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
- **DNS**: A record pointing to Azure VM public IP

### Fixed
- 🎨 **CSS Loading on HTTPS** - Fixed mixed content issue by adding nginx proxy headers
- 📝 **Husky Deprecation Warnings** - Updated pre-push hook configuration
- 🔧 **ESLint Apostrophe Error** - Fixed unescaped apostrophe in homepage text
- 📊 **Playwright Test Failures** - Improved element selectors for mobile responsiveness

### Security
- HTTPS force redirect from HTTP
- Proper SSL certificate with valid chain
- Secure nginx proxy headers (X-Forwarded-Proto, X-Forwarded-Host)
- UFW firewall with minimal required ports

### Performance
- Mobile-first responsive design optimized for phones/tablets
- Gzip compression for static assets
- Cache headers for Next.js assets (31536000s immutable)
- PM2 clustering and auto-restart on crashes

### Documentation
- Complete README with badges, quick start, and deployment info
- Technical documentation (CLAUDE.md) with server configuration
- Project roadmap (PLAN.md) with phased development approach
- Task management (TASKS.md) with active/completed tracking
- Test reporting with both HTML and markdown formats

---

## Upcoming Releases

### [0.4.0] - Phase 4: Core Business Features (In Development)
- 👥 **Staff Invitation System** - WhatsApp-based team member invitations
- 💰 **Cash Session Management** - Start/end sessions with opening/closing balance tracking
- 📋 **Petty Voucher Tracking** - Expense management with approval workflow
- ⚡ **Real-time Dashboard Data** - Live metrics replacing placeholder data
- ⚙️ **Restaurant Settings Management** - Admin interface for restaurant profile updates

### [0.5.0] - Phase 5: Advanced Operations (Planned)
- 💡 **Electricity Payment Monitoring** - Due date tracking and vendor management
- 📊 **Advanced Reporting Dashboard** - Multi-dimensional analytics
- 🔔 **Real-time Notifications** - Supabase realtime integration
- 📜 **Audit Logs & Compliance** - Complete activity tracking
- ⚡ **Performance Optimization** - Query optimization and caching

### [0.6.0] - Phase 6: Platform Extensions (Future)
- 📱 **Mobile App Version** - React Native implementation
- 🌐 **Multi-location Support** - Restaurant chain management
- 🔗 **API Platform** - Public API for third-party integrations
- 🤖 **AI Analytics** - Automated insights and recommendations
- 🌍 **Internationalization** - Multi-language support

---

## Development Guidelines

### Version Format
- **Major** (X.0.0): Breaking changes or major feature releases
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, minor improvements

### Release Process
1. Update version in package.json
2. Update CHANGELOG.md with new features/fixes
3. Run full test suite (`npm run test`)
4. Build and validate (`npm run build`)
5. Deploy to production via PM2
6. Create GitHub release tag
7. Update documentation

### Commit Message Format
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance tasks

---

**Built with ❤️ by [MindweaveTech](https://github.com/MindweaveTech)**

*Last updated: 2025-09-13*