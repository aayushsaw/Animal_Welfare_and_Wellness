#!/bin/bash
DB_CONTAINER="aw-db"

if [ -z "$1" ]; then
  echo "Usage: ./restore-db.sh <path_to_backup_file.sql>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring database from $BACKUP_FILE..."
docker exec -i "$DB_CONTAINER" psql -U postgres -d animalwelfaredb < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Restore completed successfully."
else
  echo "Restore failed!"
  exit 1
fi
