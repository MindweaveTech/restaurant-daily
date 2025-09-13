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
npm run dev
npm start
npm run build
npm run test          # Run Playwright tests
npm run test:ui       # Run tests with UI
npm run test:headed   # Run tests in headed mode
```

### Current Deployment Setup

#### Server Information
- **Azure VM**: Ubuntu Linux (6.8.0-1034-azure)
- **Public IP**: 4.213.183.139
- **Internal IP**: 10.0.0.4
- **Access URL**: http://4.213.183.139

#### Application Stack
- **Frontend**: Next.js 15.5.3 with TypeScript
- **Styling**: Tailwind CSS (mobile-first responsive)
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Development Server**: Port 3000 (localhost only)

#### Nginx Configuration
- **Config File**: `/etc/nginx/sites-available/restaurant-daily`
- **Enabled**: Symlinked to `/etc/nginx/sites-enabled/`
- **Port**: 80 (HTTP)
- **Proxy**: Forwards all traffic to localhost:3000
- **Features**: Gzip compression, proper headers, WebSocket support
- **Status**: Active and running

#### Firewall & Security
- **UFW Status**: Active
- **Allowed Ports**: 22 (SSH), 80 (HTTP via "Nginx Full")
- **Azure NSG**: Configured for HTTP traffic
- **External Access**: ✅ Working from internet

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
├── claude.md (this file)
├── plan.md (project roadmap)
├── tasks.md (task management - window size: 5)
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
- **Production Access**: http://4.213.183.139
- **Mobile Testing**: Works on iPhone Safari
- **Development Server**: Always running in background (ID: adf563)