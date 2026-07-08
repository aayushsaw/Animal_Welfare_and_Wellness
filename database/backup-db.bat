@echo off
set DB_CONTAINER=aw-db
set BACKUP_DIR=backups
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\db_backup_%TIMESTAMP%.sql

echo Backing up database...
docker exec -t %DB_CONTAINER% pg_dump -U postgres -d animalwelfaredb > %BACKUP_FILE%

if %ERRORLEVEL% equ 0 (
    echo Backup completed successfully: %BACKUP_FILE%
) else (
    echo Backup failed!
)
