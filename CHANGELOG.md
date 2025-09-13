# Changelog

All notable changes to Restaurant Daily will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Technical documentation (claude.md) with server configuration
- Project roadmap (plan.md) with phased development approach
- Task management (tasks.md) with active/completed tracking
- Test reporting with both HTML and markdown formats

---

## Upcoming Releases

### [0.2.0] - Phase 2: Authentication (Planned)
- Phone number authentication with country code support
- OTP verification system integration
- Role-based access control (Admin/Team Member)
- JWT token management and secure storage
- Protected routes and navigation guards

### [0.3.0] - Phase 3: Core Features (Planned)
- Cash session management (start/end sessions)
- Petty voucher tracking with categories
- Electricity payment monitoring
- Dashboard analytics and reporting
- Real-time data updates

### [0.4.0] - Phase 4: Advanced Features (Planned)
- PostgreSQL database migration
- Advanced reporting and analytics
- Mobile app version (React Native)
- Real-time notifications
- Multi-restaurant support

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