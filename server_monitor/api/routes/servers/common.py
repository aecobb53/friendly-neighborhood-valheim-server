from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse, ORJSONResponse
from datetime import datetime, timezone
import json
from pathlib import Path

import logging
logger = logging.getLogger(__name__)


from .models import ServiceResponse

DATA_DIR = Path("/app/storage")
STATIC_CONTENT_DIR = Path("/app/static/content")
SERVERS_DIR = STATIC_CONTENT_DIR / "servers"


def parse_timestamp(timestamp: str) -> datetime:
    try:
        return datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    except ValueError:
        return datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")

def find_servers():
    servers = {}

    for file in DATA_DIR.glob("*.json"):
        with open(file) as f:
            server_info = json.load(f)
            server_name = server_info['server_name']
            if server_name not in servers:
                servers[server_name] = []
            servers[server_name].append(server_info)

    sorted_servers = {
        key: sorted(list_of_dicts, key=lambda x: parse_timestamp(x["timestamp"]))
        for key, list_of_dicts in servers.items()
    }
    return sorted_servers

