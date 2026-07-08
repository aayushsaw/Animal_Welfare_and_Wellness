#!/bin/bash
DB_CONTAINER="aw-db"
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

echo "Backing up database..."
docker exec -t "$DB_CONTAINER" pg_dump -U postgres -d animalwelfaredb > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_FILE"
else
  echo "Backup failed!"
  exit 1
fi
