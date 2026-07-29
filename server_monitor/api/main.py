from pathlib import Path
import json
from datetime import datetime, timezone
import random
from typing import Annotated

import yaml
from pydantic import BaseModel

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import logging
from set_logger import set_logger
set_logger()
logger = logging.getLogger(__name__)

app = FastAPI()

DATA_DIR = Path("/app/storage")
SERVERS_DIR = Path("/app/servers")

from routes.exceptions import ServerNotFoundError

from routes.servers.route import router as service_router
from routes.exception_handler import server_not_found

app.include_router(service_router)
app.add_exception_handler(ServerNotFoundError, server_not_found)


app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


class RequestsQueryParams(BaseModel):
    id: str | None = None
    server: str | None = None

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


@app.get('/api/feed', status_code=200)
@app.get('/api/feed/{page}', status_code=200)
def feed(page: str | None = None):
    response = []
    with open('static/content/feed.yaml', 'r') as file:
        data = yaml.safe_load(file)
        for _, section in data.items():
            for _, feed_item in section.items():
                response.extend(feed_item)
    random.shuffle(response)
    return {
        "success": True,
        "data": response
    }

@app.get('/api/whats-new', status_code=200)
def whats_new():
    response = [
    "New Website",
    "Valheim is coming back",
    "New Valheim server: Hellheim - More to come!"
    ]
    return {
        "success": True,
        "data": response
    }

@app.get('/api/carousel', status_code=200)
@app.get('/api/carousel/{page}', status_code=200)
def carousel(page: str | None = None):
    print(f"PAGE: {page}")
    response = [
        {
            "id": "home-1",
            "image": "/static/images/carousel/Valheim.png",
            "alt": "Community build at sunset",
            "title": "RockandStone server is back!",
            "subtitle": "Restart our journey in Valheim.",
            "href": "/servers"
        },
        {
            "id": "home-2",
            "image": "/static/images/carousel/Valheim.png",
            "alt": "Another page",
            "title": "Hellheim",
            "subtitle": "There is a new server we're considering supporting! Hardcore mode coming to you!",
            "href": "/servers"
        },  
        {
            "id": "home-3",
            "image": "/static/images/carousel/Minecraft.png",
            "alt": "Another page",
            "title": "Do we want to start a Minecraft server?",
            "subtitle": "There were some talks about this if anybody is interested.",
            "href": "/servers"
        },
        {
            "id": "home-4",
            "image": "/static/images/carousel/Windrose.png",
            "alt": "Another page",
            "title": "Windrose",
            "subtitle": "Windrose is similar to Valheim, we could look into hosting that as another game.",
            "href": "/servers"
        },

    ]
    return {
        "success": True,
        "data": response
    }





@app.get('/api/requests', status_code=200)
def requests(query: Annotated[RequestsQueryParams, Depends()]):
    response = [
        {
            "id": "req-001",
            "server": "valheim-main",
            "title": "Need stone and iron for longhouse",
            "requested_by": "Alex",
            "urgency": "Soon",
            "description": "Looking for help gathering stone and iron.\nCan trade food and potions.",
            "image": None,
            "created_at": "2026-07-27T18:00:00Z",
            "completed": False,
            "archived": False,
        },
        {
            "id": "req-001",
            "server": "valheim-main",
            "title": "Need stone and iron for longhouse",
            "requested_by": "Alex",
            "urgency": "Soon",
            "description": "I need 200 fine wood and 100 stone to the castle please!",
            "image": None,
            "created_at": "2026-07-27T18:00:00Z",
            "completed": True,
            "archived": False,
        },
    ]

    if query.id:
        response = [item for item in response if item.get("id") == query.id]

    if query.server:
        response = [item for item in response if item.get("server") == query.server]

    return {
        "success": True,
        "data": response
    }


@app.post('/api/requests', status_code=201)
def create_requests():
    print(f'POST RECEIVED')
    response = {
        "id": "req-001",
        "server": "valheim-main",
        "title": "Need stone and iron for longhouse",
        "requested_by": "Alex",
        "urgency": "Soon",
        "description": "Looking for help gathering stone and iron.\nCan trade food and potions.",
        "image": None,
        "created_at": "2026-07-27T18:00:00Z",
        "completed": False,
        "archived": False,
    }
    return {
        "success": True,
        "data": response
    }


@app.put('/api/requests/{request_id}', status_code=200)
def update_requests(request_id: str):
    print(f'PUT RECEIVED')

    response = {
        "id": "req-001",
        "server": "valheim-main",
        "title": "Need stone and iron for longhouse",
        "requested_by": "Alex",
        "urgency": "Soon",
        "description": "Looking for help gathering stone and iron.\nCan trade food and potions.",
        "image": None,
        "created_at": "2026-07-27T18:00:00Z",
        "completed": False,
        "archived": False,
    }
    return {
        "success": True,
        "data": response
    }
