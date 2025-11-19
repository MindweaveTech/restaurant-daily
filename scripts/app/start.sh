#!/bin/bash

# Restaurant Daily - Start Development Server
# This script starts the development server on port 3001

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/.app.pid"

# Check if server is already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "❌ Server already running (PID: $OLD_PID)"
        echo "Use './scripts/app/stop.sh' to stop it first"
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

echo "🚀 Starting Restaurant Daily development server..."
echo "📍 URL: http://localhost:3001"
echo "🌐 Network: http://$(hostname -I | awk '{print $1}'):3001"

cd "$PROJECT_ROOT"

# Start the dev server in background and capture PID
PORT=3001 npm run dev > .app.log 2>&1 &
APP_PID=$!

# Save PID
echo "$APP_PID" > "$PID_FILE"

echo "✅ Server started (PID: $APP_PID)"
echo "📝 Logs: tail -f $PROJECT_ROOT/.app.log"
echo ""
echo "Press Ctrl+C to stop the server"
echo "Or use: ./scripts/app/stop.sh"
