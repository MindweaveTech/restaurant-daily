#!/bin/bash

# Restaurant Daily - Stop Development Server
# This script stops the development server gracefully

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/.app.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "❌ No running server found (PID file not found)"
    exit 1
fi

APP_PID=$(cat "$PID_FILE")

# Check if process is running
if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "❌ Server not running (PID: $APP_PID)"
    rm -f "$PID_FILE"
    exit 1
fi

echo "🛑 Stopping Restaurant Daily server (PID: $APP_PID)..."
kill "$APP_PID"

# Wait for graceful shutdown (up to 5 seconds)
for i in {1..5}; do
    if ! kill -0 "$APP_PID" 2>/dev/null; then
        echo "✅ Server stopped gracefully"
        rm -f "$PID_FILE"
        exit 0
    fi
    sleep 1
done

# Force kill if still running
echo "⚠️  Forcing shutdown..."
kill -9 "$APP_PID" 2>/dev/null || true
rm -f "$PID_FILE"
echo "✅ Server forcefully stopped"
