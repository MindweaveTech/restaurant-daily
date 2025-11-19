# Restaurant Daily - Start Here 🚀

Welcome to the Restaurant Daily project! This file will help you get started quickly.

## Quick Navigation

### 📖 Documentation (Start with these)

1. **[CLAUDE.md](./CLAUDE.md)** ⭐ **START HERE FOR DEVELOPMENT**
   - Complete development setup guide
   - Environment configuration
   - Database setup
   - Server control scripts
   - Vault secrets management

2. **[README.md](./README.md)** - Project Overview
   - What is Restaurant Daily
   - Feature overview
   - Tech stack
   - Current status

3. **[PLAN.md](./PLAN.md)** - Project Roadmap
   - Development phases
   - Completed features
   - Current phase (Phase 4)
   - Future enhancements

4. **[TASKS.md](./TASKS.md)** - Active Tasks
   - Current sprint tasks
   - Task window management
   - Active development items

### 📚 Detailed Documentation

All detailed documentation is in the `docs/` directory:

```
docs/
├── PROJECT_STRUCTURE.md       ← Understanding the project structure
├── AUTH_ARCHITECTURE.md       ← Authentication system design
├── DATABASE_SCHEMA.md         ← Database tables and design
├── MIGRATION_GUIDE.md         ← Database setup and migrations
├── TWILIO_INTEGRATION_PLAN.md ← WhatsApp messaging setup
├── SMS_UPGRADE_GUIDE.md       ← Production SMS upgrade
├── APP_CONTROL.md             ← Server control scripts guide
├── DOCUMENTATION_INDEX.md     ← Complete documentation index
├── CHANGELOG.md               ← Version history
└── TEST_REPORT.md             ← Test results and coverage
```

## Getting Started

### Step 1: Setup Environment

```bash
# Install dependencies
npm install

# Check and understand the project structure
cat docs/PROJECT_STRUCTURE.md
```

### Step 2: Start the Development Server

```bash
# Start the server
./start_app.sh

# Check status
./status_app.sh

# View real-time logs (in another terminal)
./logs_app.sh
```

The server will be available at: **http://localhost:3001**

### Step 3: Understand the Code

- **Source code**: `src/`
- **Tests**: `tests/`
- **Configuration**: Root directory (next.config.ts, tsconfig.json, etc.)
- **Documentation**: `docs/`
- **Scripts**: `scripts/` (automated tasks)

### Step 4: Explore the Application

1. Open http://localhost:3001 in your browser
2. Click "Get Started Free"
3. Test with demo user: +919876543210 / OTP: 123456
4. Navigate through the authentication flow

## Common Commands

### Server Management
```bash
./start_app.sh       # Start development server
./stop_app.sh        # Stop development server
./restart_app.sh     # Restart development server
./status_app.sh      # Check server status
./logs_app.sh        # View real-time logs
```

### Development
```bash
npm run dev          # Start dev server (alternative to ./start_app.sh)
npm run build        # Build for production
npm run lint         # Check code quality
npm run test         # Run tests
npm run test:ui      # Interactive test UI
```

### Database
```bash
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema to Supabase
```

## Project Structure Overview

```
restaurant-daily/
├── src/                    # Next.js application code
├── scripts/
│   ├── bin/               # Server control scripts
│   ├── migrations/        # Database migrations
│   └── *.sh               # Helper scripts
├── tests/                 # Playwright test suite
├── docs/                  # Documentation ⭐
├── public/                # Static assets
├── supabase/              # Supabase config
└── [config files]         # next.config.ts, tsconfig.json, etc.
```

For detailed structure, see: [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)

## Key Features

✅ **Authentication**
- Phone-based login with WhatsApp OTP
- Demo users for testing
- Role-based access control

✅ **Architecture**
- Multi-restaurant support
- Row-level security
- TypeScript for type safety
- Zustand state management

✅ **Testing**
- 14+ comprehensive tests
- Playwright for E2E testing
- Mobile and desktop Chrome testing
- 100% test pass rate

✅ **Deployment**
- Azure VM production setup
- PM2 process management
- HTTPS/SSL enabled
- HashiCorp Vault for secrets

## Demo Credentials

Test the app with these demo users (no actual SMS sent):

```
Admin User:        +919876543210 → OTP: 123456
Staff User:        +919876543211 → OTP: 654321
US Admin User:     +14155552222  → OTP: 111111
```

After login, you'll go through role selection and can set up a test restaurant.

## Troubleshooting

### Server won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Try starting again
./start_app.sh
```

### Port already in use
```bash
# Find what's using port 3001
lsof -i :3001

# Stop that process
kill <PID>
```

### Need to check logs
```bash
# View real-time logs
./logs_app.sh

# Or check log file
tail -f .app.log
```

## Next Steps

1. **Review CLAUDE.md** - Complete development guide
2. **Start the server** - `./start_app.sh`
3. **Test the app** - Open http://localhost:3001
4. **Check PLAN.md** - Understand the project roadmap
5. **Review source code** - Explore `src/` directory
6. **Run tests** - `npm run test`

## Resources

- **GitHub Repo**: https://github.com/MindweaveTech/restaurant-daily
- **Live Demo**: https://restaurant-daily.mindweave.tech
- **Mindweave**: https://mindweave.tech
- **Issues**: https://github.com/MindweaveTech/restaurant-daily/issues

## Questions?

- Check [DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md) for navigation
- Review [CLAUDE.md](./CLAUDE.md) for comprehensive setup
- Check [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) for file organization

---

**Status**: ✅ Production Ready | **Tests**: 14/14 Passing | **Last Updated**: 2025-11-19
