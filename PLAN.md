# Restaurant Daily - Project Plan

## Overview
Mobile-first restaurant performance tracking app with cash management, voucher tracking, and payment monitoring.

## Architecture
- **Frontend**: Next.js 15.5.3 with React 18
- **Styling**: Tailwind CSS (mobile-first)
- **State**: Zustand state management
- **Auth**: JWT with phone/WhatsApp OTP (production ready)
- **Database**: Supabase (PostgreSQL with real-time features)
- **Secrets**: HashiCorp Vault for secure credential management
- **Messaging**: Twilio WhatsApp Business API (with SMS fallback)
- **Deployment**: Azure VM with nginx reverse proxy + PM2

## Core Features

### Authentication System ✅ OPERATIONAL
- Phone number input with international country codes and validation
- WhatsApp OTP verification via Twilio (production ready)
- Visual role selection interface (Restaurant Admin/Staff Member)
- JWT token management with restaurant context and security
- Multi-restaurant support with complete data isolation via RLS

### Restaurant Management ✅ OPERATIONAL
- Role-based authentication and onboarding flows
- Restaurant profile setup (3-step wizard with validation)
- Admin dashboard with quick action cards and management features
- Staff welcome interface with feature overview
- Restaurant-specific navigation and permissions system

### Cash Management
- Start/end cash sessions
- Opening/closing balance
- Transaction tracking
- Session reports

### Voucher Tracking
- Petty cash vouchers
- Expense categories
- Approval workflow
- Receipt attachments

### Payment Monitoring
- Electricity payment tracking
- Due date alerts
- Payment history
- Vendor management

### User Roles & Restaurant Management
- **Restaurant Admin**: Full restaurant management, staff invitation, settings
- **Staff Member**: Restaurant-specific access, daily operations (cash/vouchers)
- **Multi-restaurant Support**: Scalable architecture for restaurant chains

### Restaurant Management Features
- Restaurant profile management (name, address, Google Maps)
- Staff invitation system via WhatsApp
- Role-based permissions and feature access
- Restaurant-specific data isolation and security

## Technical Stack
- Next.js 15.5.3 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Hook Form + Zod validation
- Supabase (PostgreSQL database)
- HashiCorp Vault (secrets management)
- Twilio (WhatsApp/SMS messaging)
- PM2 (production process management)
- libphonenumber-js (phone validation)
- Date-fns
- Recharts (analytics)

## Development Phases

### Phase 1: Foundation ✅ COMPLETED
1. ✅ Project setup with Next.js 15.5.3 + TypeScript
2. ✅ Mobile-first responsive homepage with loading animation
3. ✅ Playwright testing framework (4/4 tests passing)
4. ✅ Azure VM deployment with nginx reverse proxy
5. ✅ PM2 production process management
6. ✅ Husky pre-push hooks for quality gates
7. ✅ Complete documentation and GitHub setup
8. ✅ HTTPS deployment with Let's Encrypt SSL
9. ✅ Custom domain setup (restaurant-daily.mindweave.tech)
10. ✅ CSS loading fix for HTTPS (nginx headers + next.config.js)
11. ✅ HashiCorp Vault setup for secrets management
12. ✅ Supabase database setup and Vault integration
13. ✅ Twilio WhatsApp integration (production ready)
14. ✅ Authentication architecture design
15. ✅ Complete OTP messaging system with rate limiting

### Phase 2: Authentication Frontend ✅ COMPLETED
1. ✅ Phone number input component with validation
2. ✅ OTP verification interface (6-digit input with timer)
3. ✅ JWT token management and secure storage
4. ✅ Complete authentication flow (phone → WhatsApp OTP → dashboard)
5. ✅ WhatsApp messaging integration (sandbox mode)
6. ✅ Rate limiting and security features

**Status**: Authentication system fully functional - phone input, WhatsApp OTP delivery, verification, and JWT tokens

### Phase 3: Restaurant Management System ✅ COMPLETED
1. ✅ Restaurant admin role selection interface with visual cards
2. ✅ Restaurant profile management (name, address, Google Maps, settings)
3. ✅ Role-based onboarding flows (Admin setup wizard, Staff welcome)
4. ✅ JWT token enhancement with restaurant context
5. ✅ Multi-restaurant database schema (restaurants, users, staff_invitations)
6. ✅ Row Level Security (RLS) policies for data isolation
7. ✅ Restaurant-specific route protection and permissions
8. ✅ Admin dashboard with restaurant management features
9. ✅ Hybrid secrets management (Vault-first with fallback)
10. ✅ Complete API endpoints for restaurant and user operations
11. ✅ **Supabase CLI integration** - proper migration workflow
12. ✅ **Production database deployment** - schema applied to cloud (`20250914120000_initial_schema.sql`)
13. ✅ **Database tables created** - restaurants, users, staff_invitations with RLS
14. ✅ **Vault integration enhanced** - Supabase auth token stored as `supabase_auth_token`

**Status**: Restaurant management system fully operational with production database - role selection, restaurant setup, admin dashboard, database integration, cloud deployment, and security

### Phase 4: Core Business Features (CURRENT)
1. **Staff Invitation System** - WhatsApp-based team member invitations
2. **Staff Management Dashboard** - Admin interface for team management
3. **Cash Session Management** - Start/end sessions with balance tracking
4. **Transaction Logging** - Categorization and validation systems
5. **Petty Voucher Tracking** - Expense management with approval workflow
6. **Receipt Attachment System** - Photo upload and documentation
7. **Session Reports & Analytics** - Daily/weekly performance summaries

### Phase 5: Advanced Operations & Monitoring
1. **Electricity Payment Monitoring** - Due date tracking and vendor management
2. **Advanced Reporting Dashboard** - Multi-dimensional analytics
3. **Real-time Notifications** - Supabase realtime integration
4. **Audit Logs & Compliance** - Complete activity tracking
5. **Performance Optimization** - Query optimization and caching

### Phase 6: Polish & Advanced Features
1. ✅ SSL/HTTPS setup for production
2. ✅ Database migration to PostgreSQL (Supabase)
3. Real-time notifications using Supabase realtime
4. Advanced reporting and analytics
5. Mobile app version (React Native)
6. SMS fallback after Twilio account upgrade
7. Advanced security monitoring and audit logs