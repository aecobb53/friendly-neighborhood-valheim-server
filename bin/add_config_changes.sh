#!/usr/bin/env bash

SERVERS=(
    main
    hell
)

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

SERVERS=(main hell)

for server in "${SERVERS[@]}"; do
    echo "Adding ${server} server files to branch"
    git add "$ROOT_DIR/$server/server/BepInEx/config"*.cfg
    git add "$ROOT_DIR/$server/server/BepInEx/config/Seasonality/Tweaks"*.yml
done

