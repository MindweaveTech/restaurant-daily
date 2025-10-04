#!/bin/bash

# Restaurant Daily Server Management Script
# Handles start/restart/stop for both development and production modes
# Includes graceful port conflict resolution

set -e

# Configuration
DEV_PORT=3000
PROD_PORT=3000
PM2_APP_NAME="restaurant-daily"
NODE_ENV=${NODE_ENV:-development}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Get process using port
get_port_process() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | head -n1
}

# Get process details
get_process_details() {
    local pid=$1
    if [ -n "$pid" ]; then
        ps -p $pid -o pid,ppid,cmd --no-headers 2>/dev/null
    fi
}

# Kill process on port
kill_port_process() {
    local port=$1
    local force=${2:-false}

    log_info "Checking port $port..."

    if check_port $port; then
        local pid=$(get_port_process $port)
        local process_details=$(get_process_details $pid)

        log_warning "Port $port is in use by process:"
        echo "  PID: $pid"
        echo "  Details: $process_details"

        if [[ $process_details == *"node"* ]] || [[ $process_details == *"npm"* ]] || [[ $process_details == *"next"* ]]; then
            log_info "Detected Node.js process, attempting graceful shutdown..."

            if [ "$force" = true ]; then
                log_warning "Force killing process $pid..."
                kill -9 $pid 2>/dev/null || true
            else
                log_info "Sending SIGTERM to process $pid..."
                kill -TERM $pid 2>/dev/null || true

                # Wait for graceful shutdown
                for i in {1..10}; do
                    if ! check_port $port; then
                        log_success "Process gracefully stopped"
                        return 0
                    fi
                    log_info "Waiting for graceful shutdown... ($i/10)"
                    sleep 1
                done

                log_warning "Graceful shutdown timeout, force killing..."
                kill -9 $pid 2>/dev/null || true
            fi

            # Final check
            sleep 2
            if check_port $port; then
                log_error "Failed to free port $port"
                return 1
            else
                log_success "Port $port freed successfully"
                return 0
            fi
        else
            log_error "Port $port is used by non-Node.js process. Manual intervention required."
            echo "  Process details: $process_details"
            echo "  To force kill: kill -9 $pid"
            return 1
        fi
    else
        log_info "Port $port is free"
        return 0
    fi
}

# Check if PM2 is available
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 not found. Install with: npm install -g pm2"
        return 1
    fi
    return 0
}

# Check if Vault environment is set
check_vault_env() {
    if [ -z "$VAULT_TOKEN" ] || [ -z "$VAULT_ADDR" ]; then
        log_warning "Vault environment not set. App may not access production secrets."
        log_info "To set Vault environment:"
        log_info "  export VAULT_ADDR='http://127.0.0.1:8200'"
        log_info "  export VAULT_TOKEN='your_vault_token'"
    fi
}

# Start development server
start_dev() {
    log_info "Starting development server..."

    # Free port if needed
    if ! kill_port_process $DEV_PORT; then
        log_error "Cannot start dev server - port $DEV_PORT conflict"
        exit 1
    fi

    # Check dependencies
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm install
    fi

    log_info "Starting Next.js development server on port $DEV_PORT..."
    npm run dev
}

# Start production server
start_prod() {
    log_info "Starting production server..."

    # Check PM2
    if ! check_pm2; then
        exit 1
    fi

    # Check Vault environment
    check_vault_env

    # Free port if needed
    if ! kill_port_process $PROD_PORT; then
        log_error "Cannot start production server - port $PROD_PORT conflict"
        exit 1
    fi

    # Build if needed
    if [ ! -d ".next" ]; then
        log_info "Building application..."
        npm run build
    fi

    # Stop existing PM2 process
    pm2 delete $PM2_APP_NAME 2>/dev/null || true

    # Start with PM2
    log_info "Starting PM2 process: $PM2_APP_NAME"
    if [ -n "$VAULT_TOKEN" ] && [ -n "$VAULT_ADDR" ]; then
        VAULT_TOKEN="$VAULT_TOKEN" VAULT_ADDR="$VAULT_ADDR" pm2 start ecosystem.config.js --update-env
    else
        pm2 start ecosystem.config.js
    fi

    pm2 save
    log_success "Production server started successfully"
    pm2 status
}

# Stop servers
stop_servers() {
    log_info "Stopping all servers..."

    # Stop PM2 process
    if check_pm2; then
        pm2 delete $PM2_APP_NAME 2>/dev/null || true
        log_info "Stopped PM2 process: $PM2_APP_NAME"
    fi

    # Free ports
    kill_port_process $DEV_PORT true
    kill_port_process $PROD_PORT true

    log_success "All servers stopped"
}

# Restart function
restart_server() {
    local mode=${1:-auto}

    log_info "Restarting server in $mode mode..."

    if [ "$mode" = "dev" ]; then
        stop_servers
        sleep 2
        start_dev
    elif [ "$mode" = "prod" ]; then
        stop_servers
        sleep 2
        start_prod
    else
        # Auto-detect mode
        if check_pm2 && pm2 list | grep -q $PM2_APP_NAME; then
            log_info "Detected production mode (PM2 process found)"
            restart_server "prod"
        else
            log_info "No PM2 process found, restarting in development mode"
            restart_server "dev"
        fi
    fi
}

# Status check
status_check() {
    log_info "Server status check..."

    echo
    echo "=== Port Status ==="
    if check_port $DEV_PORT; then
        local pid=$(get_port_process $DEV_PORT)
        local details=$(get_process_details $pid)
        echo "Port $DEV_PORT: IN USE (PID: $pid)"
        echo "  Process: $details"
    else
        echo "Port $DEV_PORT: FREE"
    fi

    echo
    echo "=== PM2 Status ==="
    if check_pm2; then
        pm2 status
    else
        echo "PM2 not available"
    fi

    echo
    echo "=== Environment ==="
    echo "NODE_ENV: ${NODE_ENV}"
    echo "VAULT_ADDR: ${VAULT_ADDR:-'Not set'}"
    echo "VAULT_TOKEN: ${VAULT_TOKEN:+'Set (hidden)'}"

    echo
    echo "=== Application Health ==="
    if check_port $PROD_PORT; then
        echo "Production server: RUNNING on port $PROD_PORT"
        curl -s -o /dev/null -w "HTTP Response: %{http_code}\n" http://localhost:$PROD_PORT/ || echo "HTTP check failed"
    else
        echo "Production server: NOT RUNNING"
    fi
}

# Show usage
show_usage() {
    echo "Restaurant Daily Server Management Script"
    echo
    echo "Usage: $0 [COMMAND] [MODE]"
    echo
    echo "Commands:"
    echo "  start [dev|prod]     Start server (auto-detects mode if not specified)"
    echo "  stop                 Stop all servers"
    echo "  restart [dev|prod]   Restart server (auto-detects mode if not specified)"
    echo "  status               Show server status"
    echo "  kill-port <port>     Force kill process using specified port"
    echo "  help                 Show this help"
    echo
    echo "Examples:"
    echo "  $0 start dev         # Start development server"
    echo "  $0 start prod        # Start production server with PM2"
    echo "  $0 restart           # Auto-detect and restart"
    echo "  $0 stop              # Stop all servers"
    echo "  $0 kill-port 3000    # Force kill process on port 3000"
    echo "  $0 status            # Check server status"
    echo
    echo "Environment Variables:"
    echo "  VAULT_TOKEN          # Vault authentication token"
    echo "  VAULT_ADDR           # Vault server address"
    echo "  NODE_ENV             # Node environment (development/production)"
}

# Main command handler
case "${1:-help}" in
    "start")
        case "${2:-auto}" in
            "dev")
                start_dev
                ;;
            "prod")
                start_prod
                ;;
            "auto"|*)
                if [ "$NODE_ENV" = "production" ]; then
                    start_prod
                else
                    start_dev
                fi
                ;;
        esac
        ;;
    "stop")
        stop_servers
        ;;
    "restart")
        restart_server "${2:-auto}"
        ;;
    "status")
        status_check
        ;;
    "kill-port")
        if [ -n "$2" ]; then
            kill_port_process "$2" true
        else
            log_error "Port number required. Usage: $0 kill-port <port>"
            exit 1
        fi
        ;;
    "help"|*)
        show_usage
        ;;
esac