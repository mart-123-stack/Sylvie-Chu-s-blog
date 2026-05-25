#!/bin/bash
# Database backup script for blog PostgreSQL

set -e

RETENTION=${1:-30}
BACKUP_DIR="/opt/blog/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/blog_db_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"
cd /opt/blog

echo "[$(date +%Y-%m-%d\ %H:%M:%S)] Starting backup..."

docker compose exec -T db pg_dump \
  --username=blog \
  --dbname=blog \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date +%Y-%m-%d\ %H:%M:%S)] Backup saved: $BACKUP_FILE ($BACKUP_SIZE)"

find "$BACKUP_DIR" -name "blog_db_*.sql.gz" -mtime +$RETENTION -delete
echo "[$(date +%Y-%m-%d\ %H:%M:%S)] Cleaned up backups older than ${RETENTION} days"
