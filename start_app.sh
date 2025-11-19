#!/bin/bash
# Wrapper for actual script in scripts/bin/
bash "$(dirname "$0")/scripts/bin/start_app.sh" "$@"
