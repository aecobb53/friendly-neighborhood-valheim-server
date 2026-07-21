from pathlib import Path
import json
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


app = FastAPI()

DATA_DIR = Path("/app/storage")
SERVERS_DIR = Path("/app/servers")


app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


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

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )


@app.get('/server/{server_name}', response_class=HTMLResponse)
async def server_page(request: Request, server_name: str):
    return templates.TemplateResponse(
        request=request,
        name="server.html",
        context={"server_name": server_name},
    )

@app.get('/api/server-status')
def server_status():
    response = {
        "games": [],
        "last_updated": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }

    servers_by_name = find_servers()
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
                "updated": current_status['timestamp'],
            })
        response['games'].append(game_payload)
    return response


@app.get('/api/server-info/{server_name}')
def server_info(server_name: str):
    for fl in list(SERVERS_DIR.iterdir()):
        with open(fl) as jf:
            server_config = json.load(jf)
            if server_config['server_name'] == server_name:
                break
    else:
        raise HTTPException(status_code=404, detail="Server not found")

    response = {
        "server_name": server_name,
        "display_name": server_config['display_name'],
        "game": server_config['game'],
        "description": server_config['description'],
        "container_status": "UNKNOWN",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "server_status_list": [],
        "display_status": "UNKNOWN",
    }

    # Find server to determine status
    servers = find_servers()
    server_list = servers.get(server_name, [])

    if not server_list:
        return response

    latest_server = server_list[-1]
    response['container_status'] = latest_server.get('container_status', 'UNKNOWN')
    response['timestamp'] = latest_server.get('timestamp', 'UNKNOWN')
    response['server_status_list'] = latest_server['server_status_list']
    response['display_status'] = latest_server['server_status_list'][-1]['status'] if latest_server['server_status_list'] else "UNKNOWN"

    return response
