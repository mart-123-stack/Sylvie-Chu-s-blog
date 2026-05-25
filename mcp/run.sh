#!/bin/bash
# MCP Server runner — creates SSH tunnel to remote DB, then starts MCP server
# The tunnel is automatically cleaned up when the MCP server exits.

REMOTE_HOST="47.86.212.91"
REMOTE_USER="root"
LOCAL_PORT="54333"
REMOTE_DB="postgresql://blog:blog_password@localhost:5432/blog"

cleanup() {
  if [ -n "$SSH_PID" ]; then
    kill "$SSH_PID" 2>/dev/null || true
    wait "$SSH_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Start SSH tunnel in background
ssh -L "${LOCAL_PORT}:localhost:5432" "${REMOTE_USER}@${REMOTE_HOST}" \
  -N -o StrictHostKeyChecking=no -o ExitOnForwardFailure=yes -o ConnectTimeout=5 &
SSH_PID=$!

# Wait for tunnel to be ready
for i in $(seq 1 5); do
  if nc -z 127.0.0.1 "$LOCAL_PORT" 2>/dev/null; then
    break
  fi
  sleep 1
done

if ! nc -z 127.0.0.1 "$LOCAL_PORT" 2>/dev/null; then
  echo "Failed to establish SSH tunnel to $REMOTE_HOST" >&2
  exit 1
fi

export DATABASE_URL="${REMOTE_DB/localhost:5432/127.0.0.1:${LOCAL_PORT}}"

exec node "$(dirname "$0")/dist/index.js"
