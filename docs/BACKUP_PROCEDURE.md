# Database Backup and Disaster Recovery Procedure

This document details the procedures for backing up and restoring the PostgreSQL database (`animalwelfaredb`) in the Animal Welfare and Wellness platform.

---

## 1. Automated Scripts

We provide pre-written scripts for Windows and Linux environments located in the `database/` folder of the repository.

### Windows Environments
- **Backup Script:** `database/backup-db.bat`
- **Restore Script:** `database/restore-db.bat`

### Linux/macOS Environments
- **Backup Script:** `database/backup-db.sh`
- **Restore Script:** `database/restore-db.sh`

---

## 2. Performing a Backup

### Windows
Double-click `database/backup-db.bat` or run it from PowerShell/CMD:
```cmd
.\database\backup-db.bat
```

### Linux / macOS
Ensure the script is executable, then run it:
```bash
chmod +x database/backup-db.sh
./database/backup-db.sh
```

### Manual Command
If you prefer not to use the scripts, run this direct Docker command:
```bash
docker exec -t aw-db pg_dump -U postgres -d animalwelfaredb > backups/db_backup_manual.sql
```

*Note: All backups are saved as `.sql` text dumps in the `backups/` directory relative to the repository root.*

---

## 3. Performing a Restore (Disaster Recovery)

### Windows
Provide the path to the backup file to restore:
```cmd
.\database\restore-db.bat backups\db_backup_20260706_180000.sql
```

### Linux / macOS
Ensure the restore script is executable, then run it:
```bash
chmod +x database/restore-db.sh
./database/restore-db.sh backups/db_backup_20260706_180000.sql
```

### Manual Command
Alternatively, run the direct psql utility command inside the container:
```bash
docker exec -i aw-db psql -U postgres -d animalwelfaredb < backups/db_backup_20260706_180000.sql
```

---

## 4. Disaster Recovery Plan (DRP)

In the event of database corruption or hardware failure:
1. **Stop Application Containers:** Stop the backend container to prevent new transactions:
   ```bash
   docker compose stop backend
   ```
2. **Re-create Database Container:** If the database container is completely corrupt, tear it down:
   ```bash
   docker compose down -v db
   docker compose up -d db
   ```
3. **Execute Restore Script:** Run the restore procedure using the latest uncorrupted SQL backup in the `backups/` folder.
4. **Verify Integrity:** Connect to the database or check logs to verify that tables are seeded and schema versioning matches the Flyway migrations.
5. **Restart Application Containers:** Start the backend and frontend again:
   ```bash
   docker compose up -d
   ```
