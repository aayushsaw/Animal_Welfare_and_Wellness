@echo off
set DB_CONTAINER=aw-db

if "%~1"=="" (
    echo Usage: restore-db.bat ^<path_to_backup_file.sql^>
    exit /b 1
)

set BACKUP_FILE=%~1

if not exist "%BACKUP_FILE%" (
    echo Backup file not found: %BACKUP_FILE%
    exit /b 1
)

echo Restoring database from %BACKUP_FILE%...
docker exec -i %DB_CONTAINER% psql -U postgres -d animalwelfaredb < "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo Restore completed successfully.
) else (
    echo Restore failed!
)
