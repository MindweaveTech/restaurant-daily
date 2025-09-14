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

### Authentication System
- Phone number input
- OTP verification
- Role selection (Admin/Team Member)
- JWT token management

### Dashboard Components
- Cash session overview
- Daily performance metrics
- Quick action buttons
- Navigation menu

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

### User Roles
- **Admin**: Full access, reporting, user management
- **Team Member**: Basic tracking, limited reports

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

### Phase 2: Authentication Frontend (CURRENT)
1. Phone number input component with validation
2. OTP verification interface (6-digit input with timer)
3. Role selection screen (Admin/Team Member)
4. JWT token management and secure storage
5. Protected routes and navigation guards
6. Supabase database schema implementation

**Backend Complete**: ✅ WhatsApp OTP, phone validation, API routes, rate limiting

### Phase 3: Core Dashboard & Navigation
1. Main dashboard layout with metrics
2. Navigation menu with role-based visibility
3. Quick action buttons and shortcuts
4. Real-time data updates
5. Mobile-friendly touch interactions

### Phase 4: Cash Session Management
1. Start/end cash session functionality
2. Opening/closing balance tracking
3. Transaction logging and categorization
4. Session reports and analytics
5. Daily/weekly/monthly summaries

### Phase 5: Voucher & Payment Tracking
1. Petty voucher creation and management
2. Expense categorization and approval workflow
3. Receipt attachment system
4. Electricity payment monitoring
5. Vendor management and due date alerts

### Phase 6: Polish & Advanced Features
1. ✅ SSL/HTTPS setup for production
2. ✅ Database migration to PostgreSQL (Supabase)
3. Real-time notifications using Supabase realtime
4. Advanced reporting and analytics
5. Mobile app version (React Native)
6. SMS fallback after Twilio account upgrade
7. Advanced security monitoring and audit logs