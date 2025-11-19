#!/bin/bash

# Restaurant Daily - Check Server Status
# Usage: ./status_app.sh

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_ROOT/.app.pid"

echo "📊 Restaurant Daily Server Status"
echo "=================================="
echo ""

if [ ! -f "$PID_FILE" ]; then
    echo "Status: ❌ NOT RUNNING"
    exit 1
fi

PID=$(cat "$PID_FILE")

if kill -0 "$PID" 2>/dev/null; then
    echo "Status:     ✅ RUNNING"
    echo "Process ID: $PID"
    echo "Port:       3001"
    echo "URL:        http://localhost:3001"
    echo ""
    echo "Memory Usage:"
    ps aux | grep "$PID" | grep -v grep | awk '{print "  " $6 "KB"}'
    echo ""
    echo "Recent Logs:"
    if [ -f "$PROJECT_ROOT/.app.log" ]; then
        tail -5 "$PROJECT_ROOT/.app.log"
    else
        echo "  (No logs found)"
    fi
else
    echo "Status: ❌ NOT RUNNING"
    echo "Process ID in file: $PID (process not found)"
    rm -f "$PID_FILE"
    exit 1
fi
