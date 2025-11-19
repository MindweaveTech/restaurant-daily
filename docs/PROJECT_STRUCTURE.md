# Project Structure Guide

## Restaurant Daily - Organized File Structure

```
restaurant-daily/
├── src/                           # Source code (Next.js application)
│   ├── app/                       # App Router pages and layouts
│   │   ├── api/                   # API endpoints
│   │   ├── auth/                  # Authentication pages (phone, verify, role-selection)
│   │   ├── dashboard/             # Dashboard pages (admin, staff)
│   │   ├── staff/                 # Staff-specific pages
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Homepage
│   ├── components/                # Reusable React components
│   │   ├── ui/                    # Base UI components
│   │   ├── auth/                  # Authentication components
│   │   ├── dashboard/             # Dashboard components
│   │   ├── admin/                 # Admin-specific components
│   │   ├── cash/                  # Cash management components
│   │   ├── vouchers/              # Voucher components
│   │   └── payments/              # Payment components
│   ├── lib/                       # Utility functions and services
│   │   ├── api/                   # API utilities
│   │   ├── auth/                  # Authentication utilities
│   │   ├── database.ts            # Database service
│   │   ├── messaging/             # Twilio and OTP services
│   │   ├── secrets.ts             # Vault secret management
│   │   └── utils/                 # General utilities
│   ├── hooks/                     # Custom React hooks
│   ├── store/                     # Zustand state management
│   ├── types/                     # TypeScript type definitions
│   └── styles/                    # Global styles
│
├── scripts/                       # Helper scripts
│   ├── bin/                       # Executable scripts
│   │   ├── start_app.sh           # Start development server
│   │   ├── stop_app.sh            # Stop development server
│   │   ├── restart_app.sh         # Restart development server
│   │   ├── status_app.sh          # Check server status
│   │   └── logs_app.sh            # View server logs
│   ├── migrations/                # Database migrations
│   ├── generate-test-report.js    # Test report generation
│   ├── migrate-database.mjs       # Database migration script
│   ├── run-migrations.mjs         # Run migrations
│   ├── push-schema.mjs            # Push schema to Supabase
│   ├── setup-database.sql         # Database setup SQL
│   ├── export-env.sh              # Environment export script
│   └── server.sh                  # PM2 server script
│
├── tests/                         # Test files and test utilities
│   ├── app.spec.ts                # Homepage and app tests
│   ├── auth-flow-complete.spec.ts # Complete authentication flow tests
│   ├── demo-auth-flow.spec.ts     # Demo user authentication tests
│   ├── existing-admin-login.spec.ts # Existing admin login tests
│   ├── phone-auth.spec.ts         # Phone input authentication tests
│   ├── production-debug.spec.ts   # Production debugging tests
│   ├── restaurant-admin-flow.spec.ts # Restaurant admin registration tests
│   ├── role-access-control.spec.ts # Role-based access control tests
│   ├── fixtures/                  # Test fixtures and mock data
│   ├── test-db-connection.mjs     # Database connection test
│   └── test-twilio-messaging.mjs  # Twilio messaging test
│
├── docs/                          # Documentation
│   ├── README.md                  # Main project overview
│   ├── CLAUDE.md                  # Complete development setup ⭐ START HERE
│   ├── PLAN.md                    # Project roadmap and phases
│   ├── TASKS.md                   # Active task management
│   ├── CHANGELOG.md               # Version history
│   ├── AUTH_ARCHITECTURE.md       # Authentication system design
│   ├── DATABASE_SCHEMA.md         # Database tables and relationships
│   ├── MIGRATION_GUIDE.md         # Database migration procedures
│   ├── TWILIO_INTEGRATION_PLAN.md # WhatsApp messaging setup
│   ├── SMS_UPGRADE_GUIDE.md       # Twilio sandbox to production
│   ├── APP_CONTROL.md             # Server control scripts guide
│   ├── DOCUMENTATION_INDEX.md     # Documentation navigation
│   ├── PROJECT_STRUCTURE.md       # This file
│   └── reports/                   # Test reports and metrics
│
├── public/                        # Static assets
│   ├── logo.png                   # Restaurant Daily logo
│   └── *.svg                      # SVG assets
│
├── supabase/                      # Supabase configuration
│   └── migrations/                # Supabase migrations
│
├── database/                      # Database files
│   └── _chat.txt                  # Chat/notes file
│
├── logs/                          # Application logs
│   ├── combined.log               # Combined logs
│   └── error.log                  # Error logs
│
├── Configuration Files (Root)     # Must be in root for Next.js
│   ├── next.config.js             # Next.js configuration
│   ├── next.config.ts             # Next.js TypeScript config
│   ├── tsconfig.json              # TypeScript configuration
│   ├── eslint.config.mjs          # ESLint configuration
│   ├── playwright.config.ts       # Playwright test configuration
│   ├── postcss.config.mjs         # PostCSS configuration
│   ├── package.json               # NPM dependencies
│   ├── ecosystem.config.js        # PM2 ecosystem config
│   └── next-env.d.ts              # Next.js environment types
│
├── Server Control Scripts (Root)  # Quick access
│   ├── start_app.sh               # Start server (wrapper)
│   ├── stop_app.sh                # Stop server (wrapper)
│   ├── restart_app.sh             # Restart server (wrapper)
│   ├── status_app.sh              # Check status (wrapper)
│   └── logs_app.sh                # View logs (wrapper)
│
├── Auto-Generated Files           # Git ignored
│   ├── .app.pid                   # Process ID tracking
│   ├── .app.log                   # Server logs
│   ├── .next/                     # Next.js build output
│   └── node_modules/              # Dependencies
│
└── Version Control
    ├── .git/                      # Git repository
    ├── .gitignore                 # Git ignore rules
    ├── LICENSE                    # Project license
    └── .github/                   # GitHub actions
        └── workflows/             # CI/CD workflows

```

## Directory Purpose Guide

### `src/` - Application Code
Contains all Next.js application source code organized by feature.

### `scripts/` - Automation & Utilities
Scripts for database migrations, server management, and testing.
- `bin/` contains executable control scripts
- Root scripts handle deployment and database operations

### `tests/` - Test Suite
Playwright end-to-end tests organized by feature area.
- 8+ test files with 70+ test cases
- Desktop and mobile Chrome testing
- Integration with CI/CD pipeline

### `docs/` - Documentation
Comprehensive project documentation:
- **CLAUDE.md** - Primary development guide (start here)
- **PLAN.md** - Project roadmap and phases
- **TASKS.md** - Current sprint tasks
- Architecture and integration guides
- Deployment and migration procedures

### `public/` - Static Assets
Logo, favicons, and other static resources served directly.

### Root Files
Configuration files that Next.js requires to be in the root:
- `next.config.*` - Next.js configuration
- `tsconfig.json` - TypeScript settings
- `package.json` - Dependencies and scripts

## How to Navigate

### For Development
1. Start with `docs/CLAUDE.md` for setup
2. Use `./start_app.sh` to run the development server
3. Check `docs/PLAN.md` for what to work on
4. Review `docs/TASKS.md` for current sprint tasks

### For Understanding Architecture
1. `docs/README.md` - Project overview
2. `docs/AUTH_ARCHITECTURE.md` - Authentication system
3. `docs/DATABASE_SCHEMA.md` - Data model
4. `docs/TWILIO_INTEGRATION_PLAN.md` - Messaging setup

### For Testing
1. `tests/` - All test files
2. `docs/TEST_REPORT.md` - Current test status
3. Run `npm run test` to execute tests

### For Deployment
1. `docs/MIGRATION_GUIDE.md` - Database setup
2. `docs/SMS_UPGRADE_GUIDE.md` - Twilio production setup
3. `scripts/` - Deployment scripts

## File Organization Principles

✅ **Organized by**:
- **Functional area** (auth, dashboard, cash, etc.)
- **File type** (components, services, utilities)
- **Purpose** (source code, tests, documentation, scripts)

✅ **Easy to find** - Related files grouped together
✅ **Scalable** - Easy to add new features
✅ **Standard** - Follows Next.js/React conventions
✅ **Clean** - Auto-generated files git-ignored

## Quick Commands

```bash
# Server Control
./start_app.sh          # Start server
./stop_app.sh           # Stop server
./status_app.sh         # Check status
./logs_app.sh           # View logs

# Development
npm run dev             # Start dev server (alternative)
npm run build           # Production build
npm run lint            # Code quality check

# Testing
npm run test            # Run all tests
npm run test:ui         # Interactive test UI
npm run test:headed     # Watch tests in browser

# Database
npm run db:migrate      # Run migrations
npm run db:push         # Push to Supabase
```

## Recent Organization (2025-11-19)

✅ Moved 13+ documentation files to `docs/`
✅ Moved control scripts to `scripts/bin/` with root wrappers
✅ Moved test utilities to `tests/`
✅ Created proper directory structure
✅ Kept configuration files in root (required by Next.js)

---

**Last Updated**: 2025-11-19
**Status**: Fully Organized and Ready for Development
