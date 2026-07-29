import os
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse, ORJSONResponse
from datetime import datetime, timezone
import json
from pathlib import Path

import logging

from common.exceptions import ServerNotFoundError
logger = logging.getLogger(__name__)


from common.models import ResponseObject

from common.utils import DATA_DIR, SERVERS_DIR, parse_timestamp, find_servers, find_game_servers, find_specific_server, find_game_info

from .models import (
    ContainerStatusEnum,
    ServerStatusEnum,
    BaseResponse,
    ServerStatusServer,
    ServerStatusGame,
    GETServerStatusResponse,
)

router = APIRouter(
    prefix='/api',
    tags=['server'],
)


@router.get('/server-status', status_code=200)
def server_status() -> ResponseObject:


    # TODO this needs to look in the servers dir for servers that do not have active
    # TODO map the outputs to the base model objects not just a dict
    games = []

    for game, game_servers in find_game_servers().items():
        game_payload = {
            "name": game,
            "image": "SERVER IIMAGE",
            "servers": [],
        }
        for server in game_servers:
            if not len(server['server_status_list']):
                continue
            current_status = server['latest_status']
            game_payload['servers'].append({
                "id": server['container_id'],
                "name": server['server_name'],
                "game": server.get('game_name', 'unknown'),
                "container_status": server['container_status'].upper(),
                "server_status": current_status['status'],
                "healthy": True,
                "last_message": current_status['message'],
                "updated": datetime.strptime(current_status['timestamp'], "%Y-%m-%dT%H:%M:%S.%fZ"),
            })
        games.append(game_payload)

    response = GETServerStatusResponse(
        last_updated=datetime.now(timezone.utc),
        games=games,
    )

    return {
        "success": True,
        "data": response
    }


@router.get('/server-info/{server_name}', status_code=200)
def server_info(server_name: str) -> ResponseObject:
    for server in os.listdir(SERVERS_DIR):
        with open(SERVERS_DIR / server) as sf:
            server_info = json.load(sf)
            if server_info['server_name'] == server_name:
                break
    else:
        raise ServerNotFoundError(f"The server named {server_name} was not found")
    server_info = find_game_info(server_name=server_name)
    server = find_specific_server(server_name=server_name)
    if server:
        container_status = server['container_status']
        display_status = server['latest_status']['status']
        latest_timestamp = server['latest_status']['timestamp']
        server_status_list = server['server_status_list']
        quick_info = {}
        """
        quick_info = {
            "world": "Hellheim_02",
            "server_version": "0.219.14",
            "modpack_version": "bepinex-5.4.23",
            "last_restart": "2026-07-27T12:00:00Z",
            "uptime_seconds": 25920,
            "max_players": 10,
            "time_zone": "UTC"
        },
        """
    else:
        logger.warning(f"The server {server_name} does not have a history of running")
        container_status = 'unknown'
        display_status = 'UNKNOWN'
        latest_timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        server_status_list = []
        quick_info = {}

    response = {
        "server_name": server_info['server_name'],
        "display_name": server_info['display_name'],
        "game": server_info['game'],
        "description": server_info['description'],
        "container_status": container_status,
        "display_status": display_status,
        "timestamp": latest_timestamp,
        "quick_info": quick_info,
        "server_status_list": server_status_list
    }
    return {
        "success": True,
        "data": response
    }

@router.get('/servers/{server_name}/news', status_code=200)
def server_news(server_name: str) -> ResponseObject:
    server_info = find_game_info(server_name=server_name)
    return {
        "success": True,
        "data": server_info['news']
    }

@router.get('/servers/{server_name}/rules', status_code=200)
def server_rules(server_name: str) -> ResponseObject:
    server_info = find_game_info(server_name=server_name)
    # response = [
    #     "Be respectful in shared areas.",
    #     "Label portal destinations clearly.",
    #     "Ask before modifying another player's build."
    # ]
    return {
        "success": True,
        "data": server_info['news']
    }

# @router.get('/servers/{server_name}/logs', status_code=200)
# def server_logs(server_name: str, limit: int = 50):
#     raise ValueError('This actually got run??')
#     response = [
#         "[19:01:21] World saved",
#         "[18:59:02] Player Maya joined",
#         "[18:43:17] Boss defeated"
#     ][:limit]
#     return {
#         "success": True,
#         "data": response
#     }
