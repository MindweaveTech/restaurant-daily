# Restaurant Daily 🍽️

[![App Status](https://img.shields.io/badge/Status-Live-brightgreen)](https://restaurant-daily.mindweave.tech)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen)](#)
[![Tests](https://img.shields.io/badge/Tests-14%2F14%20Passing-brightgreen)](#testing)
[![Version](https://img.shields.io/badge/Version-0.1.0-blue)](#)

> **Performance tracking app for restaurants** - Manage cash sessions, vouchers, and payments with mobile-first design.

## 🚨 Bug Reports & Issues

Found a bug? Please report it through one of these channels:
- [GitHub Issues](https://github.com/MindweaveTech/restaurant-daily/issues) - Preferred for technical issues
- Email: [gaurav18115@gmail.com](mailto:gaurav18115@gmail.com) - For urgent matters
- Include steps to reproduce, expected behavior, and screenshots if applicable

## 📊 App Health Status

| Component | Status | URL |
|-----------|--------|-----|
| **Production App** | 🟢 Live | [restaurant-daily.mindweave.tech](https://restaurant-daily.mindweave.tech) |
| **Production Server** | 🟢 PM2 Managed | http://localhost:3000 |
| **SSL Certificate** | 🟢 Active | Let's Encrypt (Auto-renewal) |
| **Database** | 🟢 PostgreSQL | Supabase with Row Level Security |
| **Tests** | 🟢 Passing | [14/14 Playwright tests](./TEST_REPORT.md) |
| **Secrets Management** | 🟢 Hybrid | Vault + Environment Fallback |
| **Nginx Proxy** | 🟢 Active | Port 443/80 → 3000 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Development Setup
```bash
# Clone the repository
git clone https://github.com/MindweaveTech/restaurant-daily.git
cd restaurant-daily

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Testing
```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed

# View detailed test report (GitHub-friendly)
cat docs/reports/DETAILED_TEST_REPORT.md

# View interactive HTML report (local only)
open docs/reports/latest-test-report/index.html
```

**📊 [View Test Summary](./TEST_REPORT.md) | [Detailed Report](./docs/reports/DETAILED_TEST_REPORT.md)**

## 🏗️ Project Architecture

### Tech Stack
- **Frontend**: Next.js 15.5.3 with TypeScript & App Router
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: JWT with WhatsApp/SMS OTP via Twilio
- **Secrets**: HashiCorp Vault + Environment fallback
- **Styling**: Tailwind CSS (mobile-first responsive design)
- **State**: Zustand for global state management
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Testing**: Playwright (14 tests across mobile + desktop)
- **Process Manager**: PM2 for production
- **Git Hooks**: Husky (pre-push validation with quality gates)
- **Deployment**: Azure VM with nginx reverse proxy

### Core Features
- 📱 **Mobile-First Design** ✅ - Optimized for phones and tablets (LIVE)
- 🔐 **Authentication System** ✅ - Phone → WhatsApp OTP → Role Selection (LIVE)
- 🏪 **Restaurant Management** ✅ - Complete setup wizard and admin dashboard (LIVE)
- 👥 **Role-Based Access** ✅ - Restaurant Admin vs Staff Member roles (LIVE)
- 🗄️ **Multi-Restaurant Support** ✅ - Scalable architecture with data isolation (LIVE)
- 🔒 **Security & Permissions** ✅ - JWT tokens with restaurant context + RLS (LIVE)
- 💰 **Cash Management** - Daily session tracking (next phase)
- 📝 **Voucher System** - Petty cash and expense tracking (next phase)
- ⚡ **Payment Monitoring** - Electricity and vendor payments (next phase)

## 📚 Project Glossary

### Key Terms

**Cash Session** - A work period where cash transactions are tracked from opening to closing balance

**Petty Voucher** - Small expense receipts that need approval and categorization

**Role-Based Access** - Different permission levels:
- **Admin**: Full access, reporting, user management
- **Team Member**: Basic tracking, limited reports

**OTP** - One-Time Password sent via SMS for authentication

**Nginx Proxy** - Web server that forwards external requests to the Next.js app

### File Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── cash/           # Cash management
│   ├── vouchers/       # Voucher tracking
│   └── payments/       # Payment monitoring
├── lib/                # Utility functions
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Playwright tests |
| `npm run test:ui` | Interactive test runner |

### PM2 Commands (Production)

| Command | Description |
|---------|-----------|
| `pm2 status` | Check running processes |
| `pm2 logs restaurant-daily` | View application logs |
| `pm2 restart restaurant-daily` | Restart the app |
| `pm2 stop restaurant-daily` | Stop the app |
| `pm2 monit` | Real-time monitoring |

## 🌐 Deployment

### Current Setup
- **Azure VM**: Ubuntu Linux (6.8.0-1034-azure)
- **Public IP**: 4.213.183.139
- **Domain**: restaurant-daily.mindweave.tech
- **Nginx Config**: `/etc/nginx/sites-available/restaurant-daily`
- **SSL**: ✅ Let's Encrypt (HTTPS with auto-renewal)
- **DNS**: A record on Namecheap pointing to Azure VM

### Production Access
- **Live App**: [restaurant-daily.mindweave.tech](https://restaurant-daily.mindweave.tech)
- **Fallback IP**: [4.213.183.139](https://4.213.183.139)
- **HTTPS**: Force redirect from HTTP with valid SSL
- **Mobile Friendly**: Works on iPhone Safari
- **Performance**: Optimized with gzip compression and caching headers

## 📝 Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and basic homepage
- [x] Mobile-responsive design
- [x] Testing framework
- [x] Deployment infrastructure
- [x] PM2 production setup
- [x] Pre-push testing hooks (Husky)

### Phase 2: Authentication ✅ COMPLETED
- [x] Phone number input component with country selection
- [x] OTP verification system via WhatsApp
- [x] JWT token management and secure authentication
- [x] Complete authentication flow (phone → OTP → dashboard)

### Phase 3: Restaurant Management ✅ COMPLETED
- [x] Role selection interface (Restaurant Admin vs Staff Member)
- [x] Restaurant setup wizard with 3-step onboarding
- [x] Admin dashboard with management features
- [x] Staff welcome and onboarding flow
- [x] Database integration with Supabase PostgreSQL
- [x] Multi-restaurant architecture with data isolation
- [x] Hybrid secrets management (Vault + fallback)

### Phase 4: Core Business Features (Current)
- [ ] Staff invitation system via WhatsApp
- [ ] Staff management dashboard
- [ ] Cash session management
- [ ] Petty voucher tracking
- [ ] Payment monitoring
- [ ] Business analytics and reporting

### Phase 5: Advanced Features (Future)
- [x] SSL/HTTPS setup ✅
- [x] Database migration (PostgreSQL) ✅
- [ ] Real-time notifications (Supabase realtime)
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] SMS fallback (Twilio upgrade)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by MindweaveTech.

---

**Built with ❤️ by [MindweaveTech](https://github.com/MindweaveTech)**

*Last updated: 2025-09-14 | Phase 3 Complete - Restaurant Management System Live*
