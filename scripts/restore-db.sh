#!/bin/bash
# Database restore script for blog PostgreSQL
# Usage: ./restore-db.sh <backup_file>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Available backups:"
  ls -1 /opt/blog/backups/*.sql.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: File not found: $BACKUP_FILE"
  exit 1
fi

cd /opt/blog

echo "[$(date)] Restoring from: $BACKUP_FILE"
gunzip -c "$BACKUP_FILE" | docker compose exec -T db psql --username=blog --dbname=blog
echo "[$(date)] Restore complete"
