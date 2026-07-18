from pathlib import Path
import json
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


app = FastAPI()

DATA_DIR = Path("/app/storage")


app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )

@app.get('/api/server-status')
def server_status():
    response = {
        "games": [],
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
    }

    servers = {}

    for file in DATA_DIR.glob("*.json"):
        with open(file) as f:
            server_info = json.load(f)
            if server_info['container_status'] not in ['running']:
                continue
            game_name = server_info['game_name']
            if game_name not in servers:
                servers[game_name] = []
            servers[game_name].append(server_info)

    for game, game_servers in servers.items():
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
                "container_status": server['container_status'],
                "server_status": current_status['status'],
                "healthy": True,
                "last_message": current_status['message'],
                "updated": current_status['timestamp'],
            })
        response['games'].append(game_payload)
    return response
