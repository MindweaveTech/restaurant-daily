# Restaurant Daily - Server Control Guide

## Quick Start

The Restaurant Daily development server can be controlled using the `./app.sh` script instead of using npm directly.

### Basic Commands

```bash
./app.sh start          # Start the development server
./app.sh stop           # Stop the development server
./app.sh status         # Check if server is running
./app.sh logs           # View real-time server logs
./app.sh restart        # Restart the development server
```

## Usage Examples

### Start the Server
```bash
./app.sh start
```

Output:
```
🚀 Starting Restaurant Daily development server...
📍 URL: http://localhost:3001
🌐 Network: http://192.168.1.100:3001
✅ Server started (PID: 4890)
📝 Logs: tail -f /Users/grao/Projects/MindWeave/restaurant-daily/.app.log

Press Ctrl+C to stop the server
Or use: ./scripts/app/stop.sh
```

### Check Server Status
```bash
./app.sh status
```

Output:
```
📊 Restaurant Daily Server Status
==================================

Status:     ✅ RUNNING
Process ID: 4890
Port:       3001
URL:        http://localhost:3001

Memory Usage:
  61536KB

Recent Logs:
   - Network:      http://192.168.1.100:3001
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 874ms
```

### View Real-Time Logs
```bash
./app.sh logs
```

Press `Ctrl+C` to exit log viewing.

### Stop the Server
```bash
./app.sh stop
```

Output:
```
🛑 Stopping Restaurant Daily server (PID: 4890)...
✅ Server stopped gracefully
```

### Restart the Server
```bash
./app.sh restart
```

This is equivalent to running `./app.sh stop` followed by `./app.sh start`.

## Server Details

- **Port**: 3001 (consistent for dev and production)
- **Environment**: Development (Turbopack enabled for fast builds)
- **Process Management**: Custom shell scripts with PID tracking
- **Logging**: Automatic logging to `.app.log`
- **Data Files**: `.app.pid` (process ID tracking)

## Features

✅ **Graceful Shutdown** - Allows 5 seconds for clean shutdown, then forces kill if needed
✅ **PID Management** - Prevents running multiple server instances
✅ **Automatic Logging** - All output saved to `.app.log`
✅ **Memory Monitoring** - Shows memory usage in status command
✅ **Clean State** - Auto-removes stale PID files
✅ **Multiple Start Protection** - Prevents accidentally starting server twice

## File Structure

```
./app.sh                    # Main control script
scripts/app/
├── start.sh               # Start server script
├── stop.sh                # Stop server script
├── restart.sh             # Restart server script
├── status.sh              # Status check script
└── logs.sh                # Log viewing script
```

## Troubleshooting

### Server won't start
```bash
# Check if something is already running on port 3001
lsof -i :3001

# If stuck, kill the process
kill -9 <PID>

# Remove stale PID file
rm -f .app.pid

# Try starting again
./app.sh start
```

### Can't view logs
```bash
# Check if log file exists
ls -la .app.log

# Server must be running to generate logs
./app.sh status
```

### Port already in use
The server uses port 3001. If that port is in use:
```bash
# Find what's using the port
lsof -i :3001

# Kill that process if needed
kill <PID>
```

## Environment Configuration

The development server automatically loads `.env.local` for configuration:

```bash
# .env.local (example)
VAULT_ADDR=http://127.0.0.1:8200
VAULT_TOKEN=hvs.YOUR_TOKEN_HERE
```

See `CLAUDE.md` for complete configuration details.

## Related Commands

### Building and Testing

```bash
npm run build              # Build for production
npm run test               # Run test suite
npm run lint               # Check code quality
npm run type-check         # TypeScript type checking
```

### Production (PM2)

```bash
pm2 status                 # Check PM2 processes
pm2 start npm --name "restaurant-daily" -- start
pm2 stop restaurant-daily
pm2 restart restaurant-daily
```

## Git Ignored Files

These files are auto-generated and not committed:
- `.app.log` - Server logs
- `.app.pid` - Process ID tracking file

## Next Steps

1. **Start the server**: `./app.sh start`
2. **Check status**: `./app.sh status`
3. **Open browser**: http://localhost:3001
4. **View logs**: `./app.sh logs`
5. **Stop when done**: `./app.sh stop`

---

**For detailed development setup**: See `CLAUDE.md`
**For project overview**: See `README.md`
