# Server Backup Bot

Daily backup tool for game server world files. Copies listed files to timestamped backup directories, maintains manifests, and logs all operations.

## Files

- **server_backup.sh** - Main backup script. Copies files, creates manifests, and logs operations.
- **.env** - Configuration. Set `BACKUP_ROOT`, `LOG_DIR`, `ERROR_DIR`, and `PRUNE_WINDOW_DAYS`.
- **server_backup.files** - List of absolute file paths to back up (one per line). Lines starting with `#` are ignored.

## Configuration

Edit `.env`:
```
BACKUP_ROOT=/path/to/backups          # Where to save timestamped backup directories
LOG_DIR=/path/to/logs                 # Where to save run logs
ERROR_DIR=/path/to/errors             # Where to save error files for failed copies
PRUNE_WINDOW_DAYS=7                   # Days to retain daily backups (for future pruning)
```

Edit `server_backup.files`:
```
# Comment lines are ignored

/path/to/file1.db
/path/to/file2.fwl
```

## Usage

Run manually:
```bash
./server_backup.sh
```

Skip backup phase (dry run):
```bash
./server_backup.sh --skip-backup
```

Skip pruning (not yet implemented):
```bash
./server_backup.sh --skip-pruning
```

## Cron

Run daily at 4am Mountain Time (11:00 UTC):
```bash
0 11 * * * /home/acobb/friends_gaming/friendly-neighborhood-valheim-server/server_monitor/backup_bot/server_backup.sh >> /path/to/logs/cron.log 2>&1
```

## Output

**Backup directories** (`$BACKUP_ROOT/game_servers_backup_YYYY-MM-DDTHH/`):
- `manifest.yaml` - YAML file listing all files backed up, their status, and overall run status
- Copied files (same names as originals)

**Log files** (`$LOG_DIR/server_backup_YYYY-MM-DDTHH.log`):
- Timestamped log of all operations

**Error files** (`$ERROR_DIR/YYYY-MM-DDTHH_filename.yaml`):
- YAML files created only on failures (missing files, copy errors)
- Include timestamp, source, message, and `cleared` flag for tracking

## How It Works

1. Creates temp directory
2. Copies each file from `server_backup.files` into temp directory
3. Writes `manifest.yaml` with file-by-file status
4. Moves temp directory to final timestamped location
5. Logs all operations
6. Writes error files for any failures (script continues on partial failures)

## Notes

- Script uses UTC timestamps in `YYYY-MM-DDTHH` format
- Overwrites backups from the same hour (one backup per hour maximum)
- Continues processing if individual files fail (doesn't choke)
- Pruning logic not yet implemented (placeholder in script)
