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
from common.utils import DATA_DIR, SERVERS_DIR, parse_timestamp, find_servers, find_game_servers, find_specific_server, find_game_info, REQUESTS_DIR, IMAGES_DIR

from .models import EventsQueryParams, EventDataObject

router = APIRouter(
    prefix='/api/events',
    tags=['events'],
)

@router.get('', status_code=200)
def events(query: Annotated[EventsQueryParams, Depends()]) -> ResponseObject:
    # response = find_requests(query=query)
    response = [{
      "id": "evt-001",
      "server": "valheim-main",
      "title": "Friday Boss Fight",
      "description": "Defeat The Queen together.",
      "event_date": "2026-08-14",
      "start_time": "20:00:00",
      "end_time": "22:00:00",
      "meetup_location": "Main Base Portal",
      "expanded_details": "Bring food and potions.\nGather at the portal at 8 PM.",
      "image_url": "/api/events/evt-001/image",
      "created_at": "2026-07-29T14:30:00Z"
    }]
    return {
        "success": True,
        "data": response
    }

@router.post('', status_code=201)
def create_event(new_resource: EventDataObject) -> ResponseObject:
    return {
        "success": True,
        "data": new_resource
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

