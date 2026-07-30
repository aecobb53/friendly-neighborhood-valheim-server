import os
import re
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import HTMLResponse, ORJSONResponse, FileResponse
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Annotated

import logging

from common.exceptions import ServerNotFoundError
logger = logging.getLogger(__name__)


from common.models import ResponseObject
from common.utils import DATA_DIR, SERVERS_DIR, parse_timestamp, find_servers, find_game_servers, find_specific_server, find_game_info, IMAGES_DIR, EVENTS_DIR

from .models import EventsQueryParams, EventDataObject

router = APIRouter(
    prefix='/api/events',
    tags=['events'],
)

@router.get('', status_code=200)
def events(query: Annotated[EventsQueryParams, Depends()]) -> ResponseObject:
    response = []
    for fl in EVENTS_DIR.glob("*.json"):
        with open(fl, "r") as f:
            data = json.load(f)
            response.append(data)
    return {
        "success": True,
        "data": response
    }

@router.post('', status_code=201)
def create_event(new_event: EventDataObject) -> ResponseObject:
    server = find_specific_server(server_name=new_event.server)
    if not server:
        raise ServerNotFoundError(f"The server {new_event['server']} does not exist")
    logger.info(f"Creating Event")
    evt_id_number = 0
    for request_fl in EVENTS_DIR.glob("evt-*.json"):
        match = re.match(r".*evt-(\d+)\.json", str(request_fl))
        evt_id_number = max(evt_id_number, int(match.group(1)))
    evt_id_number += 1
    evt_id = f"evt-{evt_id_number:03d}"
    new_event.id = evt_id

    with open(EVENTS_DIR / f"{evt_id}.json", 'w') as jf:
        jf.write(json.dumps(new_event.to_json, indent=4))

    return {
        "success": True,
        "data": new_event
    }

@router.get('/{id}/image', status_code=200)
def event_image(id: str) -> ResponseObject:
    image_path = Path(IMAGES_DIR) / f"{id}.png"
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=image_path,
        media_type="image/png",
        filename=image_path.name,
    )

