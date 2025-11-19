#!/bin/bash
# Wrapper for actual script in scripts/bin/
bash "$(dirname "$0")/scripts/bin/logs_app.sh" "$@"
