#!/bin/bash

# Restaurant Daily - View Server Logs
# This script shows real-time server logs

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_FILE="$PROJECT_ROOT/.app.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Log file not found: $LOG_FILE"
    echo "Make sure the server is running with: ./scripts/app/start.sh"
    exit 1
fi

echo "📝 Restaurant Daily Server Logs"
echo "=============================="
echo "Press Ctrl+C to exit"
echo ""

tail -f "$LOG_FILE"
