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

from .models import GalleryQueryParams, GalleryDataObject, GalleryLegendObject, GalleryDataObject

gallery_router = APIRouter(
    prefix='/api/gallery',
    tags=['gallery'],
)
map_router = APIRouter(
    prefix='/api/maps',
    tags=['maps'],
)

@gallery_router.get('', status_code=200)
def gallery(query: Annotated[GalleryQueryParams, Depends()]) -> ResponseObject:
    # response = find_requests(query=query)
    response = [{
      "id": "gal-001",
      "server": "valheim-main",
      "title": "Castle Complete",
      "description": "We finally finished the main hall.",
      "media_count": 3,
      "preview_url": "/api/gallery/gal-001/media/0",
      "media_urls": [
        "/api/gallery/gal-001/media/0",
        "/api/gallery/gal-001/media/1",
        "/api/gallery/gal-001/media/2"
      ],
      "created_at": "2026-07-28T20:15:00Z"
    }]
    return {
        "success": True,
        "data": response
    }

@gallery_router.post('', status_code=201)
def create_gallery(new_resource: GalleryDataObject) -> ResponseObject:
    return {
        "success": True,
        "data": new_resource
    }

@gallery_router.get('/{id}/media/{index}', status_code=200)
def gallery_item(id: str, index: int) -> ResponseObject:
    image_path = Path(IMAGES_DIR) / f"{id}.png"
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=image_path,
        media_type="image/png",
        filename=image_path.name,
    )


@map_router.get('/{server}', status_code=200)
def map(server: str) -> ResponseObject:
    # response = find_requests(query=query)
    response = {
      "server": "valheim-main",
      "description": "This community map highlights major bases, portals, resource farms, and other important locations. Updated periodically as the world evolves.",
      "last_updated": "2026-07-29T00:00:00Z",
      "image_url": "/api/maps/valheim-main/image",
      "legend": [
        { "symbol": "🏠", "label": "Main Base" },
        { "symbol": "⚔", "label": "Boss" },
        { "symbol": "🛖", "label": "Outpost" },
        { "symbol": "⛵", "label": "Harbor" },
        { "symbol": "🌾", "label": "Farm" }
      ]
    }
    return {
        "success": True,
        "data": response
    }

@gallery_router.get('/{server}/image', status_code=200)
def map_item(server: str) -> ResponseObject:
    image_path = Path(IMAGES_DIR) / f"{server}.png"
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=image_path,
        media_type="image/png",
        filename=image_path.name,
    )
