import os
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse, ORJSONResponse
from datetime import datetime, timezone
import json
from pathlib import Path

import logging

from common.exceptions import ServerNotFoundError
logger = logging.getLogger(__name__)


from .models import ServiceResponse
# from common.models import ResponseObject

from common.utils import DATA_DIR, SERVERS_DIR, parse_timestamp, find_servers

router = APIRouter(
    prefix='/api',
    tags=['server'],
)


@router.get('/server-status', status_code=200)
def server_status() -> ServiceResponse:
    response = {
        "last_updated": datetime.now(timezone.utc),
        "games": [],
    }

    servers_by_name = find_servers()
    logger.debug(f"Found {len(servers_by_name)} unique servers.")
    latest_servers = [server_list[-1] for server_list in servers_by_name.values() if server_list]
    games = {}

    for latest_server in latest_servers:
        game_name = latest_server.get('game_name', 'Unknown')
        if game_name not in games:
            games[game_name] = []
        games[game_name].append(latest_server)

    for game, game_servers in games.items():
        game_payload = {
            "name": game,
            "image": "SERVER IIMAGE",
            "servers": [],
        }
        for server in game_servers:
            if not len(server['server_status_list']):
                continue
            current_status = server['server_status_list'][-1]
            game_payload['servers'].append({
                "id": server['container_id'],
                "name": server['server_name'],
                "game": server.get('game_name', 'unknown'),
                "container_status": server['container_status'],
                "server_status": current_status['status'],
                "healthy": True,
                "last_message": current_status['message'],
                "updated": datetime.strptime(current_status['timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ"),
            })
        response['games'].append(game_payload)

    return {
        "success": True,
        "data": response
    }


@router.get('/server-info/{server_name}', status_code=200)
def server_info(server_name: str):
    response = {}
    for server in os.listdir(SERVERS_DIR):
        with open(SERVERS_DIR / server) as sf:
            server_info = json.load(sf)
            if server_info['server_name'] == server_name:
                break
    else:
        raise ServerNotFoundError(f"The server named {server_name} was not found")
    print(f"Found server info for {server_name}: {server_info}")
    response = {
        "server_name": "valheim-main",
        "display_name": "Hellheim",
        "game": "Valheim",
        "description": "Long-term cooperative world focused on exploration and builds.",
        "container_status": "running",
        "display_status": "ONLINE",
        "timestamp": "2026-07-27T19:12:00Z",
        "quick_info": {
            "world": "Hellheim_02",
            "server_version": "0.219.14",
            "modpack_version": "bepinex-5.4.23",
            "last_restart": "2026-07-27T12:00:00Z",
            "uptime_seconds": 25920,
            "max_players": 10,
            "time_zone": "UTC"
        },
        "server_status_list": [
            {
                "status": "ONLINE",
                "message": "Server started successfully",
                "timestamp": "2026-07-27T12:00:12Z"
            },
            {
                "status": "ONLINE",
                "message": "World save complete",
                "timestamp": "2026-07-27T18:45:03Z"
            }
        ]
    }
    return {
        "success": True,
        "data": response
    }

@router.get('/servers/{server_name}/news', status_code=200)
def server_news(server_name: str):
    response = [
        {
            "id": "news-901",
            "text": "New mountain outpost completed near spawn.",
            "timestamp": "2026-07-27T17:30:00Z"
        },
        {
            "id": "news-902",
            "text": "Moder raid planned for Friday night.",
            "timestamp": "2026-07-27T18:10:00Z"
        }
    ]
    return {
        "success": True,
        "data": response
    }

@router.get('/servers/{server_name}/rules', status_code=200)
def server_rules(server_name: str):
    response = [
        "Be respectful in shared areas.",
        "Label portal destinations clearly.",
        "Ask before modifying another player's build."
    ]
    return {
        "success": True,
        "data": response
    }

@router.get('/servers/{server_name}/logs', status_code=200)
def server_logs(server_name: str, limit: int = 50):
    response = [
        "[19:01:21] World saved",
        "[18:59:02] Player Maya joined",
        "[18:43:17] Boss defeated"
    ][:limit]
    return {
        "success": True,
        "data": response
    }
