# friendly-neighborhood-valheim-server

## Copying server
The saves directory has some files. none are configured right now but if they become configure these should be passed with download but not added to the repo for possible security.

## World troubleshooting
The container seems to hold residual info. Make sure you add and overwrite the save files in `saves/worlds_local/` to include `<Server Name>` and `Dedicated` for both the `.db` and `.fwl` files. `docker system prune` seems to help a bit.


