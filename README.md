# friendly-neighborhood-valheim-server

Two Valheim dedicated servers running in Docker: **RockandStone** (normal survival) and **Hellheim** (hard mode). Both run BepInEx with a shared mod set. Managed via docker-compose with auto-backup and auto-update on a cron schedule. Long-term backups handled by `server_monitor/backup_bot/`.

---

## Setup from Scratch

1. Clone the repo.
2. Create a `.env` file in the repo root:
```
PASSWORD=<server password>
SAVES_DIR=<absolute path to saves root>    # e.g. /srv1t/game_server_backups/valheim
BACKUP_DIR=<absolute path to backups root> # e.g. /srv1t/game_server_backups/valheim
# WEBHOOK_URL=<discord webhook url>        # optional, uncomment to enable
```
3. Ensure `SAVES_DIR` and `BACKUP_DIR` directories exist on the host.
4. Start the servers:
```bash
docker compose up -d
```
5. Set up cron for long-term backups — see `server_monitor/backup_bot/README.md`.

---

## Start / Stop

```bash
# Start all servers
docker compose up -d

# Stop all servers
docker compose down

# Start a single server
docker compose up -d valheim
docker compose up -d hellheim

# View logs
docker compose logs -f valheim
docker compose logs -f hellheim
```

---

## Copying server
The saves directory has some files. none are configured right now but if they become configure these should be passed with download but not added to the repo for possible security.

## World troubleshooting
The container seems to hold residual info. Make sure you add and overwrite the save files in `saves/worlds_local/` to include `<Server Name>` and `Dedicated` for both the `.db` and `.fwl` files. `docker system prune` seems to help a bit.


