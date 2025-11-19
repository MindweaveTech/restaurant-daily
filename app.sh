#!/bin/bash

# Restaurant Daily - Application Control Script
# Usage: ./app.sh [start|stop|restart|status|logs]

set -e

COMMAND="${1:-status}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$PROJECT_ROOT/scripts/app"

case "$COMMAND" in
    start)
        bash "$SCRIPTS_DIR/start.sh"
        ;;
    stop)
        bash "$SCRIPTS_DIR/stop.sh"
        ;;
    restart)
        bash "$SCRIPTS_DIR/restart.sh"
        ;;
    status)
        bash "$SCRIPTS_DIR/status.sh"
        ;;
    logs)
        bash "$SCRIPTS_DIR/logs.sh"
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo ""
        echo "Usage: ./app.sh [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start          Start the development server on port 3001"
        echo "  stop           Stop the development server gracefully"
        echo "  restart        Restart the development server"
        echo "  status         Check server status and resource usage"
        echo "  logs           View real-time server logs"
        echo ""
        echo "Examples:"
        echo "  ./app.sh start          # Start server"
        echo "  ./app.sh status         # Check if running"
        echo "  ./app.sh logs           # View logs (Ctrl+C to exit)"
        echo "  ./app.sh restart        # Restart server"
        echo "  ./app.sh stop           # Stop server"
        exit 1
        ;;
esac
